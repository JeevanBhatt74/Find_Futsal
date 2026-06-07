import { Schema, model, Document } from 'mongoose';

// ─── Enums ────────────────────────────────────────────────────────────────────

/**
 * BookingStatus — deterministic state machine for slot lifecycle:
 *
 *  Available ──► Locked ──► Booked
 *      ▲            │
 *      └────────────┘ (lock expired / released)
 *
 *  Maintenance is an admin-controlled override state.
 */
export enum BookingStatus {
  AVAILABLE    = 'Available',
  LOCKED       = 'Locked',
  BOOKED       = 'Booked',
  MAINTENANCE  = 'Maintenance',
}

// ─── Interface ────────────────────────────────────────────────────────────────

export interface ISlot extends Document {
  venueId: Schema.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  baseCost: number;
  currency: string;
  status: BookingStatus;
  /** Populated when status is 'Locked' or 'Booked' */
  lockedByUserId?: Schema.Types.ObjectId | null;
  /** ISO timestamp when the lock was acquired — used for TTL expiry */
  lockTimestamp?: Date | null;
  /** Duration in minutes the lock remains valid before auto-expiry */
  lockDurationMinutes: number;
  /** The confirmed booking document reference (set when status = 'Booked') */
  bookingId?: Schema.Types.ObjectId | null;
  /** Reason for maintenance if status is 'Maintenance' */
  maintenanceReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const slotSchema = new Schema<ISlot>(
  {
    venueId: {
      type: Schema.Types.ObjectId,
      ref: 'Venue',
      required: [true, 'Slot must be associated with a venue.'],
      index: true,
    },

    startTime: {
      type: Date,
      required: [true, 'Slot start time is required.'],
    },

    endTime: {
      type: Date,
      required: [true, 'Slot end time is required.'],
    },

    baseCost: {
      type: Number,
      required: [true, 'Base cost is required.'],
      min: [0, 'Base cost cannot be negative.'],
    },

    currency: {
      type: String,
      default: 'NPR',
      uppercase: true,
      enum: ['NPR', 'USD'],
    },

    status: {
      type: String,
      enum: {
        values: Object.values(BookingStatus),
        message: '"{VALUE}" is not a valid booking status.',
      },
      default: BookingStatus.AVAILABLE,
      required: true,
    },

    lockedByUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    lockTimestamp: {
      type: Date,
      default: null,
    },

    /**
     * Lock TTL: 10 minutes is the standard window giving users enough
     * time to complete payment without holding slots indefinitely.
     */
    lockDurationMinutes: {
      type: Number,
      default: 10,
      min: [1, 'Lock duration must be at least 1 minute.'],
      max: [30, 'Lock duration cannot exceed 30 minutes.'],
    },

    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },

    maintenanceReason: {
      type: String,
      trim: true,
      default: null,
      maxlength: [200, 'Maintenance reason cannot exceed 200 characters.'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Validation: endTime must be after startTime ───────────────────────────────
slotSchema.pre('validate', function (next) {
  if (this.endTime <= this.startTime) {
    this.invalidate(
      'endTime',
      'Slot end time must be strictly after start time.',
      this.endTime
    );
  }
  next();
});

// ─── Virtual: isLockExpired ───────────────────────────────────────────────────
slotSchema.virtual('isLockExpired').get(function (this: ISlot): boolean {
  if (this.status !== BookingStatus.LOCKED || !this.lockTimestamp) return false;
  const expiry = new Date(
    this.lockTimestamp.getTime() + this.lockDurationMinutes * 60 * 1000
  );
  return new Date() > expiry;
});

// ─── Virtual: durationInMinutes ───────────────────────────────────────────────
slotSchema.virtual('durationInMinutes').get(function (this: ISlot): number {
  if (!this.startTime || !this.endTime) return 0;
  return Math.round((this.endTime.getTime() - this.startTime.getTime()) / 60000);
});

// ─── Virtual: lockExpiresAt ───────────────────────────────────────────────────
slotSchema.virtual('lockExpiresAt').get(function (this: ISlot): Date | null {
  if (!this.lockTimestamp) return null;
  return new Date(
    this.lockTimestamp.getTime() + this.lockDurationMinutes * 60 * 1000
  );
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
// Primary query pattern: "find all available slots for venue X on date Y"
slotSchema.index({ venueId: 1, startTime: 1, status: 1 });

// For cleanup jobs: find all expired locks efficiently
slotSchema.index({ status: 1, lockTimestamp: 1 });

// For user booking history
slotSchema.index({ lockedByUserId: 1 });

// ─── Model ────────────────────────────────────────────────────────────────────
const Slot = model<ISlot>('Slot', slotSchema);

export default Slot;
