import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import Venue, { Amenity } from '../models/Venue';
import { AppError } from '../middleware/errorHandler';
import { protect } from '../middleware/auth';

const router = Router();

// ─── Validators ───────────────────────────────────────────────────────────────

const createVenueValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Venue name is required.')
    .isLength({ min: 3, max: 120 })
    .withMessage('Venue name must be between 3 and 120 characters.'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters.'),
  body('location.address')
    .trim()
    .notEmpty()
    .withMessage('Address is required.'),
  body('location.city')
    .trim()
    .notEmpty()
    .withMessage('City is required.'),
  body('location.district')
    .trim()
    .notEmpty()
    .withMessage('District is required.'),
  body('location.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90.'),
  body('location.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180.'),
  body('location.googleMapsUrl')
    .optional()
    .trim(),
  body('images')
    .optional()
    .isArray({ max: 10 })
    .withMessage('A venue cannot exceed 10 images.'),
  body('images.*.url')
    .trim()
    .notEmpty()
    .withMessage('Image URL is required.'),
  body('images.*.altText')
    .optional()
    .trim(),
  body('images.*.isPrimary')
    .optional()
    .isBoolean(),
  body('amenities')
    .optional()
    .isArray()
    .withMessage('Amenities must be provided as an array.'),
  body('amenities.*')
    .isIn(Object.values(Amenity))
    .withMessage('Invalid amenity specified.'),
  body('contactPhone')
    .trim()
    .notEmpty()
    .withMessage('Contact phone is required.')
    .matches(/^(\+977|977)?[9][678]\d{8}$/)
    .withMessage('Contact phone must be a valid Nepali phone number.'),
  body('contactEmail')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address.')
    .normalizeEmail(),
  body('pricePerHour')
    .notEmpty()
    .withMessage('Price per hour is required.')
    .isFloat({ min: 0 })
    .withMessage('Price per hour must be a non-negative number.'),
  body('currency')
    .optional()
    .isIn(['NPR', 'USD'])
    .withMessage('Currency must be NPR or USD.'),
];

// ─── Route Handlers ───────────────────────────────────────────────────────────

/**
 * @route   GET /api/v1/venues
 * @desc    Get all active venues with pagination and filtering
 * @access  Public
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { city, amenities, minRating, maxPrice, search, page = 1, limit = 10 } = req.query;

      // Build MongoDB Query Filter Object
      const filter: any = { isActive: true };

      // 1) Filter by City
      if (city) {
        filter['location.city'] = { $regex: new RegExp(String(city), 'i') };
      }

      // 2) Filter by Amenities (Matches all selected amenities)
      if (amenities) {
        const amenitiesList = Array.isArray(amenities)
          ? (amenities as string[])
          : String(amenities).split(',').map(a => a.trim());
        
        if (amenitiesList.length > 0) {
          filter.amenities = { $all: amenitiesList };
        }
      }

      // 3) Filter by Minimum Rating
      if (minRating) {
        filter.rating = { $gte: Number(minRating) };
      }

      // 4) Filter by Max Hourly Price
      if (maxPrice) {
        filter.pricePerHour = { $lte: Number(maxPrice) };
      }

      // 5) Full Text / RegEx Search
      if (search) {
        const searchStr = String(search).trim();
        filter.$or = [
          { name: { $regex: new RegExp(searchStr, 'i') } },
          { 'location.city': { $regex: new RegExp(searchStr, 'i') } },
          { 'location.address': { $regex: new RegExp(searchStr, 'i') } },
        ];
      }

      // 6) Pagination Settings
      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.max(1, Number(limit));
      const skipNum = (pageNum - 1) * limitNum;

      // Execute queries
      const total = await Venue.countDocuments(filter);
      const venues = await Venue.find(filter)
        .sort({ rating: -1, createdAt: -1 })
        .skip(skipNum)
        .limit(limitNum);

      const totalPages = Math.ceil(total / limitNum);

      res.status(200).json({
        success: true,
        data: venues,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/venues/:id
 * @desc    Get detailed view of a single venue by ID
 * @access  Public
 */
router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const venue = await Venue.findById(req.params.id);
      if (!venue || !venue.isActive) {
        return next(new AppError('No active venue found with the provided ID.', 404));
      }

      res.status(200).json({
        success: true,
        data: venue,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/v1/venues
 * @desc    Create a new venue (protected, owner-only / active users)
 * @access  Protected
 */
router.post(
  '/',
  protect,
  createVenueValidation,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Validate request parameters
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

    try {
      const {
        name,
        description,
        location,
        images,
        amenities,
        contactPhone,
        contactEmail,
        pricePerHour,
        currency,
      } = req.body;

      // Check if user is authenticated (added by protect middleware)
      if (!req.user) {
        return next(new AppError('Not authorized.', 401));
      }

      // Create new venue associated with req.user._id
      const venue = await Venue.create({
        name,
        description,
        location,
        images,
        amenities,
        contactPhone,
        contactEmail,
        pricePerHour,
        currency,
        ownerId: req.user._id,
        isActive: true,
      });

      res.status(201).json({
        success: true,
        message: 'Futsal venue registered successfully!',
        data: venue,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
