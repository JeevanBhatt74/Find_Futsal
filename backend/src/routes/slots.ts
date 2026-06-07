import { Router, Request, Response, NextFunction } from 'express';
import Slot, { BookingStatus } from '../models/Slot';
import { AppError } from '../middleware/errorHandler';
import { protect } from '../middleware/auth';

const router = Router();

// ─── Route Handlers ───────────────────────────────────────────────────────────

/**
 * @route   GET /api/v1/slots
 * @desc    Get all slots for a venue on a given date (formatted YYYY-MM-DD)
 * @access  Public
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { venueId, date } = req.query;

      if (!venueId) {
        return next(new AppError('venueId is a required query parameter.', 400));
      }

      if (!date) {
        return next(new AppError('date (YYYY-MM-DD format) is a required query parameter.', 400));
      }

      // Parse the date string into start and end of that day in local time
      const dateStr = String(date);
      const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
      const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

      if (isNaN(startOfDay.getTime())) {
        return next(new AppError('Invalid date format. Please use YYYY-MM-DD.', 400));
      }

      // Query slots
      const slots = await Slot.find({
        venueId,
        startTime: { $gte: startOfDay, $lte: endOfDay },
      }).sort({ startTime: 1 });

      // Transform slots: if status is Locked and lock is expired, treat it as Available
      const parsedSlots = slots.map((slot) => {
        const slotObj = slot.toJSON({ virtuals: true });
        
        if (slotObj.status === BookingStatus.LOCKED && slot.isLockExpired) {
          slotObj.status = BookingStatus.AVAILABLE;
          slotObj.lockedByUserId = null;
          slotObj.lockTimestamp = null;
        }
        
        return slotObj;
      });

      res.status(200).json({
        success: true,
        data: parsedSlots,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/v1/slots/:id/lock
 * @desc    Acquire a 10-minute hold/lock on a specific available slot
 * @access  Protected
 */
router.post(
  '/:id/lock',
  protect,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const slotId = req.params.id;

      if (!req.user) {
        return next(new AppError('Not authorized.', 401));
      }

      // 1) Fetch slot
      const slot = await Slot.findById(slotId);
      if (!slot) {
        return next(new AppError('Slot not found.', 404));
      }

      // 2) Check if slot is Booked or Maintenance
      if (slot.status === BookingStatus.BOOKED) {
        return next(new AppError('This slot is already booked and unavailable.', 409));
      }
      if (slot.status === BookingStatus.MAINTENANCE) {
        return next(new AppError('This slot is currently under maintenance.', 409));
      }

      // 3) Check if slot is locked by someone else and lock is active
      if (slot.status === BookingStatus.LOCKED) {
        // If locked by the CURRENT user, just renew their lock
        if (slot.lockedByUserId?.toString() === req.user._id.toString()) {
          slot.lockTimestamp = new Date();
          await slot.save();
          res.status(200).json({
            success: true,
            message: 'Lock renewed successfully.',
            data: slot.toJSON({ virtuals: true }),
          });
          return;
        }

        const isExpired = slot.isLockExpired; // Virtual field
        if (!isExpired) {
          res.status(409).json({
            success: false,
            status: 'slot_locked',
            message: 'This slot is currently held by another booking session. Please try again in a few minutes.',
          });
          return;
        }
      }

      // 4) Atomically lock the slot using Optimistic Concurrency to prevent race conditions
      // Matches the slot ID AND its previous status and lockTimestamp to make sure it hasn't changed since read.
      const now = new Date();
      const updatedSlot = await Slot.findOneAndUpdate(
        {
          _id: slotId,
          status: slot.status,
          lockTimestamp: slot.lockTimestamp,
        },
        {
          $set: {
            status: BookingStatus.LOCKED,
            lockedByUserId: req.user._id,
            lockTimestamp: now,
          },
        },
        { new: true }
      );

      if (!updatedSlot) {
        return next(
          new AppError(
            'The slot was modified by another transaction. Please check availability and try again.',
            409
          )
        );
      }

      res.status(200).json({
        success: true,
        message: 'Slot locked successfully for 10 minutes.',
        data: updatedSlot.toJSON({ virtuals: true }),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   DELETE /api/v1/slots/:id/lock
 * @desc    Release a held lock on a slot
 * @access  Protected
 */
router.delete(
  '/:id/lock',
  protect,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const slotId = req.params.id;

      if (!req.user) {
        return next(new AppError('Not authorized.', 401));
      }

      const slot = await Slot.findById(slotId);
      if (!slot) {
        return next(new AppError('Slot not found.', 404));
      }

      // If already available, do nothing
      if (slot.status === BookingStatus.AVAILABLE) {
        res.status(200).json({
          success: true,
          message: 'Slot is already available.',
          data: slot.toJSON({ virtuals: true }),
        });
        return;
      }

      // Check if locked by the requesting user
      if (
        slot.status === BookingStatus.LOCKED &&
        slot.lockedByUserId?.toString() !== req.user._id.toString()
      ) {
        return next(
          new AppError('You do not have permission to release this lock.', 403)
        );
      }

      // Reset slot to Available
      slot.status = BookingStatus.AVAILABLE;
      slot.lockedByUserId = null;
      slot.lockTimestamp = null;
      await slot.save();

      res.status(200).json({
        success: true,
        message: 'Lock released successfully. Slot is now available.',
        data: slot.toJSON({ virtuals: true }),
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
