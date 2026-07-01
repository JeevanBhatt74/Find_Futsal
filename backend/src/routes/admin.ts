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

// Apply protect and requireAdmin to all routes in this file
router.use(protect);
router.use(requireAdmin);

/**
 * @route   GET /api/v1/admin/stats
 * @desc    Get aggregated stats for admin dashboard
 * @access  Protected (Admin only)
 */
router.get('/stats', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

// ─── Venue Management ────────────────────────────────────────────────────────

/**
 * @route   GET /api/v1/admin/venues
 * @desc    Get all venues (including inactive ones)
 */
router.get('/venues', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const venues = await Venue.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: venues });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/admin/venues
 * @desc    Create a new venue (Admin override)
 */
router.post('/venues', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const venueData = req.body;
    // Set ownerId to admin if not provided
    if (!venueData.ownerId) {
      venueData.ownerId = req.user?._id;
    }
    const venue = await Venue.create(venueData);
    res.status(201).json({ success: true, data: venue });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/v1/admin/venues/:id
 * @desc    Update a venue (Admin override)
 */
router.put('/venues/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const venue = await Venue.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!venue) return next(new AppError('Venue not found', 404));
    res.status(200).json({ success: true, data: venue });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/v1/admin/venues/:id
 * @desc    Delete a venue
 */
router.delete('/venues/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const venue = await Venue.findByIdAndDelete(req.params.id);
    if (!venue) return next(new AppError('Venue not found', 404));
    res.status(200).json({ success: true, message: 'Venue deleted' });
  } catch (error) {
    next(error);
  }
});

// ─── Booking Management ──────────────────────────────────────────────────────

/**
 * @route   GET /api/v1/admin/bookings
 * @desc    Get all bookings with optional date filtering
 */
router.get('/bookings', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { date } = req.query;
    let filter: any = {};

    if (date) {
      const startOfDay = new Date(date as string);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date as string);
      endOfDay.setHours(23, 59, 59, 999);
      
      // Filter based on createdAt or maybe slot date if we populated slot.
      // For simplicity, let's filter by createdAt
      filter.createdAt = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    const bookings = await Booking.find(filter)
      .populate('userId', 'fullName email phone')
      .populate('venueId', 'name')
      .populate('slotId', 'startTime endTime')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/v1/admin/bookings/:id/status
 * @desc    Manually override booking status
 */
router.put('/bookings/:id/status', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, paymentStatus } = req.body;
    
    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const booking = await Booking.findByIdAndUpdate(req.params.id, updateData, { new: true });
    
    if (!booking) return next(new AppError('Booking not found', 404));

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
});

export default router;
