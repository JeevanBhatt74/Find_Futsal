import { Router, Request, Response, NextFunction } from 'express';
import { protect } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import User from '../models/User';
import Booking from '../models/Booking';
import Venue from '../models/Venue';

const router = Router();

// Middleware to restrict to admins
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return next(new AppError('Access denied. Admin only.', 403));
  }
  next();
};

/**
 * @route   GET /api/v1/admin/stats
 * @desc    Get aggregated stats for admin dashboard
 * @access  Protected (Admin only)
 */
router.get('/stats', protect, requireAdmin, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments({ role: 'player' });
    const totalBookings = await Booking.countDocuments();
    const totalVenues = await Venue.countDocuments();

    // Calculate total revenue (sum of baseCost for confirmed/completed bookings)
    const bookings = await Booking.find({ paymentStatus: 'Completed' });
    const totalRevenue = bookings.reduce((acc, curr) => acc + curr.totalCost, 0);

    // Get recent users
    const recentUsers = await User.find({ role: 'player' })
      .select('fullName email phone createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalUsers,
          totalBookings,
          totalVenues,
          totalRevenue
        },
        recentUsers
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
