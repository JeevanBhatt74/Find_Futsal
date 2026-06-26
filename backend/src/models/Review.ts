import { Schema, model, Document } from 'mongoose';

export interface IReview extends Document {
  venueId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  bookingId?: Schema.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    venueId: {
      type: Schema.Types.ObjectId,
      ref: 'Venue',
      required: [true, 'Review must belong to a venue.'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required.'],
      min: [1, 'Rating must be at least 1.'],
      max: [5, 'Rating cannot exceed 5.'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters.'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

reviewSchema.index({ venueId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1 });

const Review = model<IReview>('Review', reviewSchema);

export default Review;
