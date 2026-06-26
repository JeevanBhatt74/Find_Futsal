import { Router, Request, Response, NextFunction } from 'express';
import { protect } from '../middleware/auth';
import Booking, { PaymentStatus } from '../models/Booking';
import Slot, { BookingStatus as SlotBookingStatus } from '../models/Slot';
import { AppError } from '../middleware/errorHandler';
import { sendBookingConfirmation } from '../utils/emailService';

const router = Router();

/**
 * @route   POST /api/v1/payments/khalti/verify
 * @desc    Verify mock Khalti payment and update booking & slot status
 * @access  Protected
 */
router.post('/khalti/verify', protect, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { bookingId, transactionId, amount } = req.body;

    if (!bookingId || !transactionId) {
      return next(new AppError('Booking ID and Transaction ID are required for verification.', 400));
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return next(new AppError('Booking not found.', 404));
    }

    // Verify the booking belongs to the current user
    if (booking.userId.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      return next(new AppError('You do not have permission to verify this booking.', 403));
    }

    // Update booking status
    booking.paymentStatus = PaymentStatus.COMPLETED;
    booking.paymentRef = 'KHALTI';
    booking.transactionId = transactionId;
    await booking.save();

    // Update slot status to BOOKED
    const slot = await Slot.findById(booking.slotId);
    if (slot) {
      slot.status = SlotBookingStatus.BOOKED;
      await slot.save();
    }

    // Trigger mock email notification
    sendBookingConfirmation(
      req.user?.email || 'user@example.com',
      req.user?.fullName || 'User',
      {
        venueName: 'Venue', // Would normally populate this
        id: booking._id,
        date: slot?.startTime || new Date(),
        cost: booking.totalCost
      }
    );

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully. Slot is now booked.',
      data: booking
    });
  } catch (error) {
    next(error);
  }
});

export default router;
