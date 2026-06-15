import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { protect } from '../middleware/auth';

const router = Router();

// ─── Token Helper ─────────────────────────────────────────────────────────────

const generateToken = (id: string): string => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET ?? 'super_secret_session_key_for_find_futsal_web_app_development_2026',
    {
      expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    }
  );
};

// ─── Validators ───────────────────────────────────────────────────────────────

const registerValidation = [
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
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required.')
    .isEmail()
    .withMessage('Must be a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters.'),
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required.')
    .isEmail()
    .withMessage('Must be a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required.'),
];

const updateProfileValidation = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('Full name must be between 2 and 80 characters.'),
  body('phone')
    .optional()
    .trim()
    .matches(/^(\+977|977)?[9][678]\d{8}$/)
    .withMessage('Must be a valid Nepali phone number (+977 9XXXXXXXXX format).'),
  body('profileImage')
    .optional()
    .trim()
    .custom((value) => {
      if (!value) return true;
      if (value.startsWith('data:image/')) return true;
      try {
        new URL(value);
        return true;
      } catch (err) {
        throw new Error('Must be a valid image URL or base64 image.');
      }
    }),
  body('gameReminders')
    .optional()
    .isBoolean()
    .withMessage('gameReminders must be a boolean.'),
  body('exclusiveOffers')
    .optional()
    .isBoolean()
    .withMessage('exclusiveOffers must be a boolean.'),
  body('bookingAlerts')
    .optional()
    .isBoolean()
    .withMessage('bookingAlerts must be a boolean.'),
];

// ─── Route Handlers ───────────────────────────────────────────────────────────

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  registerValidation,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Validate request body
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

    const { fullName, phone, email, password, bio, role } = req.body;

    try {
      // Check if email or phone already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { phone }],
      });

      if (existingUser) {
        if (existingUser.email === email) {
          return next(new AppError('A user with this email address already exists.', 409));
        }
        if (existingUser.phone === phone) {
          return next(new AppError('A user with this phone number already exists.', 409));
        }
      }

      // Create new user
      const user = await User.create({
        fullName,
        phone,
        email,
        password,
        bio,
        role: role === 'venueowner' ? 'admin' : 'player',
      });

      // Generate JWT
      const token = generateToken(user._id.toString());

      // Sanitize user object to exclude password (managed natively in Model toJSON, but explicitly doing it here as well)
      const userJSON = user.toJSON();
      delete userJSON.password;

      res.status(201).json({
        success: true,
        message: 'Account registered successfully!',
        data: {
          user: userJSON,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login existing user
 * @access  Public
 */
router.post(
  '/login',
  loginValidation,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const { email, password } = req.body;

    try {
      // Find user and explicitly select the password field
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return next(new AppError('Invalid email address or password.', 401));
      }

      // Verify active state
      if (!user.isActive) {
        return next(new AppError('This account has been deactivated. Please contact support.', 403));
      }

      // Compare passwords
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return next(new AppError('Invalid email address or password.', 401));
      }

      // Generate JWT
      const token = generateToken(user._id.toString());

      const userJSON = user.toJSON();
      delete userJSON.password;

      res.status(200).json({
        success: true,
        message: 'Logged in successfully!',
        data: {
          user: userJSON,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Protected
 */
router.get(
  '/me',
  protect,
  async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({
      success: true,
      data: req.user,
    });
  }
);

/**
 * @route   PUT /api/v1/auth/profile
 * @desc    Update current user profile
 * @access  Protected
 */
router.put(
  '/profile',
  protect,
  updateProfileValidation,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      if (!req.user) {
        return next(new AppError('Not authorized.', 401));
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return next(new AppError('User not found.', 404));
      }

      const { fullName, phone, profileImage, gameReminders, exclusiveOffers, bookingAlerts } = req.body;

      if (fullName) user.fullName = fullName;
      
      if (phone) {
        const existingPhone = await User.findOne({ phone, _id: { $ne: user._id } });
        if (existingPhone) {
          return next(new AppError('A user with this phone number already exists.', 409));
        }
        user.phone = phone;
      }

      if (profileImage !== undefined) {
        user.profileImage = profileImage;
      }

      if (gameReminders !== undefined) {
        user.gameReminders = gameReminders;
      }

      if (exclusiveOffers !== undefined) {
        user.exclusiveOffers = exclusiveOffers;
      }

      if (bookingAlerts !== undefined) {
        user.bookingAlerts = bookingAlerts;
      }

      await user.save();

      const userJSON = user.toJSON();
      delete userJSON.password;

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully!',
        data: userJSON,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
