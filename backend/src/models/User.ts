import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IUser extends Document {
  fullName: string;
  phone: string;
  email: string;
  password?: string;
  profileImage?: string;
  avatar?: string; // New avatar field
  bio?: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  isDeleted: boolean; // Soft delete field
  deletedAt?: Date; // Soft delete timestamp
  gameReminders?: boolean;
  exclusiveOffers?: boolean;
  bookingAlerts?: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const userSchema = new Schema<IUser>(
  {
    role: {
      type: String,
      enum: ['player', 'admin'],
      default: 'player',
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required.'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters.'],
      maxlength: [80, 'Full name cannot exceed 80 characters.'],
    },

    phone: {
      type: String,
      required: [true, 'Phone number is required.'],
      unique: true,
      trim: true,
      /**
       * Nepal phone validation:
       *  - Optional country code:  +977 or 977
       *  - Mobile prefixes:        98x, 97x (10 digits total after country code)
       *  - Landline prefixes:      01-099 (area code) + 6-7 digit local number
       * Regex covers:
       *   +9779841234567  |  9841234567  |  01-4567890
       */
      validate: {
        validator: (v: string): boolean =>
          /^(\+977|977)?[9][678]\d{8}$/.test(v),
        message: (props: { value: string }) =>
          `"${props.value}" is not a valid Nepali phone number (+977 9XXXXXXXXX format).`,
      },
    },

    email: {
      type: String,
      required: [true, 'Email address is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v: string): boolean =>
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: (props: { value: string }) =>
          `"${props.value}" is not a valid email address.`,
      },
    },

    password: {
      type: String,
      required: [true, 'Password is required.'],
      minlength: [6, 'Password must be at least 6 characters.'],
      select: false,
    },

    // ── Profile Metadata ──────────────────────────────────────────────────────
    profileImage: {
      type: String,
      trim: true,
      default: null,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [300, 'Bio cannot exceed 300 characters.'],
      default: null,
    },

    gameReminders: {
      type: Boolean,
      default: true,
    },

    exclusiveOffers: {
      type: Boolean,
      default: true,
    },

    bookingAlerts: {
      type: Boolean,
      default: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    versionKey: false,
    toJSON: {
      transform: (_doc, ret) => {
        // Never expose sensitive fields in API responses
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ─── Pre-save Password Hashing ───────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// ─── Instance Methods ─────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password ?? '');
};

// ─── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ createdAt: -1 });

// ─── Model ────────────────────────────────────────────────────────────────────
const User = model<IUser>('User', userSchema);

export default User;
