import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import Slot, { BookingStatus as SlotStatus } from '../models/Slot';
import Booking, { BookingStatus } from '../models/Booking';
import { AppError } from '../middleware/errorHandler';
import { protect } from '../middleware/auth';

const router = Router();

// ─── Validators ───────────────────────────────────────────────────────────────

const createBookingValidation = [
  body('slotId')
    .trim()
    .notEmpty()
    .withMessage('slotId is required.'),
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required.')
    .isLength({ min: 2, max: 80 })
    .withMessage('Full name must be between 2 and 80 characters.'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required.')
    .matches(/^(\+977|977)?[9][678]\d{8}$/)
    .withMessage('Must be a valid Nepali phone number (+977 9XXXXXXXXX format).'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters.'),
];

// ─── Route Handlers ───────────────────────────────────────────────────────────

/**
 * @route   GET /api/v1/bookings/my
 * @desc    Get all bookings for the logged-in user
 * @access  Protected
 */
router.get(
  '/my',
  protect,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(new AppError('Not authorized.', 401));
      }

      const bookings = await Booking.find({ userId: req.user._id })
        .populate('venueId', 'name location images')
        .populate('slotId', 'startTime endTime')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/v1/bookings
 * @desc    Confirm booking from a held slot lock
 * @access  Protected
 */
router.post(
  '/',
  protect,
  createBookingValidation,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Validate request inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        status: 'validation_error',
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
      return;
    }

    const { slotId, notes } = req.body;

    try {
      if (!req.user) {
        return next(new AppError('Not authorized.', 401));
      }

      // 1) Find the slot
      const slot = await Slot.findById(slotId);
      if (!slot) {
        return next(new AppError('Selected slot not found.', 404));
      }

      // 2) Verify slot is currently Locked
      if (slot.status !== SlotStatus.LOCKED) {
        return next(
          new AppError(
            'This slot is not currently held. You must lock the slot first before confirming booking.',
            400
          )
        );
      }

      // 3) Verify the lock belongs to the current user
      if (slot.lockedByUserId?.toString() !== req.user._id.toString()) {
        return next(
          new AppError('You do not own the hold session on this slot.', 403)
        );
      }

      // 4) Verify the lock session is still active
      if (slot.isLockExpired) {
        return next(
          new AppError(
            'Your 5-minute hold session on this slot has expired. Please select the slot again.',
            400
          )
        );
      }

      // 5) Create the Booking document
      const booking = await Booking.create({
        venueId: slot.venueId,
        slotId: slot._id,
        userId: req.user._id,
        totalCost: slot.baseCost,
        currency: slot.currency,
        status: BookingStatus.CONFIRMED,
        paymentRef: 'CASH_OR_COUNTER',
        notes,
      });

      // 6) Atomically update the Slot status to Booked
      slot.status = SlotStatus.BOOKED;
      slot.bookingId = booking._id;
      // Clear held locks metadata
      slot.lockedByUserId = null;
      slot.lockTimestamp = null;
      await slot.save();

      res.status(201).json({
        success: true,
        message: 'Futsal court booking confirmed successfully!',
        data: {
          booking,
          slot: slot.toJSON({ virtuals: true }),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
