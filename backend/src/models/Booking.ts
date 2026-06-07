import { Schema, model, Document } from 'mongoose';

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum BookingStatus {
  PENDING   = 'Pending',
  CONFIRMED = 'Confirmed',
  CANCELLED = 'Cancelled',
}

export enum PaymentStatus {
  PENDING   = 'Pending',
  COMPLETED = 'Completed',
  FAILED    = 'Failed',
  REFUNDED  = 'Refunded',
}

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IBooking extends Document {
  venueId: Schema.Types.ObjectId;
  slotId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  totalCost: number;
  currency: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentRef?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const bookingSchema = new Schema<IBooking>(
  {
    venueId: {
      type: Schema.Types.ObjectId,
      ref: 'Venue',
      required: [true, 'Booking must be associated with a venue.'],
    },

    slotId: {
      type: Schema.Types.ObjectId,
      ref: 'Slot',
      required: [true, 'Booking must be associated with a specific slot.'],
      unique: true, // A slot can only have one booking document
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booking must be associated with a user.'],
    },

    totalCost: {
      type: Number,
      required: [true, 'Total cost is required.'],
      min: [0, 'Total cost cannot be negative.'],
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
      default: BookingStatus.CONFIRMED,
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: {
        values: Object.values(PaymentStatus),
        message: '"{VALUE}" is not a valid payment status.',
      },
      default: PaymentStatus.PENDING,
      required: true,
    },

    paymentRef: {
      type: String,
      trim: true,
      default: 'CASH_OR_COUNTER',
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters.'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ venueId: 1, createdAt: -1 });
bookingSchema.index({ notes: 'text' }); // Allow admins to search booking notes

// ─── Model ────────────────────────────────────────────────────────────────────
const Booking = model<IBooking>('Booking', bookingSchema);

export default Booking;
