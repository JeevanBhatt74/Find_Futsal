import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth';
import Review from '../models/Review';
import Venue from '../models/Venue';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const reviewValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5.'),
  body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters.'),
  body('venueId').notEmpty().withMessage('Venue ID is required.'),
  body('bookingId').optional().isString(),
];

/**
 * @route   POST /api/v1/reviews
 * @desc    Submit a review for a venue
 * @access  Protected
 */
router.post('/', protect, reviewValidation, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, message: errors.array()[0].msg });
    return;
  }

  const { venueId, bookingId, rating, comment } = req.body;
  const userId = req.user?._id;

  try {
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return next(new AppError('Venue not found.', 404));
    }

    const review = await Review.create({
      venueId,
      userId,
      bookingId,
      rating,
      comment,
    });

    // Update Venue stats
    const allReviews = await Review.find({ venueId });
    const totalReviews = allReviews.length;
    const avgRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews;

    venue.totalReviews = totalReviews;
    venue.rating = Number(avgRating.toFixed(1));
    await venue.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      data: review,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/reviews/:venueId
 * @desc    Get all reviews for a venue
 * @access  Public
 */
router.get('/:venueId', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reviews = await Review.find({ venueId: req.params.venueId })
      .populate('userId', 'fullName profileImage avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
