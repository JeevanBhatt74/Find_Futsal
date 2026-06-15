import { Schema, model, Document } from 'mongoose';

// ─── Enums & Sub-types ────────────────────────────────────────────────────────

export enum Amenity {
  SHOWERS   = 'Showers',
  PARKING   = 'Parking',
  PRO_TURF  = 'Pro Turf',
  AIR_CON   = 'Air Con',
  CHANGING_ROOMS = 'Changing Rooms',
  FLOODLIGHTS    = 'Floodlights',
  CAFETERIA      = 'Cafeteria',
}

export interface ILocation {
  address: string;
  city: string;
  district: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
}

export interface IVenueImage {
  url: string;
  altText?: string;
  isPrimary: boolean;
}

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IVenue extends Document {
  name: string;
  description?: string;
  location: ILocation;
  images: IVenueImage[];
  rating: number;
  totalReviews: number;
  amenities: Amenity[];
  contactPhone: string;
  contactEmail?: string;
  pricePerHour: number;
  currency: string;
  surfaceType: string; // E.g., 'Artificial Turf', 'Indoor Wood', 'Natural Grass'
  cancellationPolicy: string; // E.g., 'Flexible', 'Strict'
  isActive: boolean;
  ownerId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Sub-Schemas ──────────────────────────────────────────────────────────────

const locationSchema = new Schema<ILocation>(
  {
    address: {
      type: String,
      required: [true, 'Venue address is required.'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required.'],
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'District is required.'],
      trim: true,
    },
    latitude: {
      type: Number,
      min: [-90, 'Latitude must be between -90 and 90.'],
      max: [90, 'Latitude must be between -90 and 90.'],
    },
    longitude: {
      type: Number,
      min: [-180, 'Longitude must be between -180 and 180.'],
      max: [180, 'Longitude must be between -180 and 180.'],
    },
    googleMapsUrl: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const venueImageSchema = new Schema<IVenueImage>(
  {
    url: {
      type: String,
      required: [true, 'Image URL is required.'],
      trim: true,
    },
    altText: {
      type: String,
      trim: true,
      default: '',
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

// ─── Schema ───────────────────────────────────────────────────────────────────

const venueSchema = new Schema<IVenue>(
  {
    name: {
      type: String,
      required: [true, 'Venue name is required.'],
      trim: true,
      minlength: [3, 'Venue name must be at least 3 characters.'],
      maxlength: [120, 'Venue name cannot exceed 120 characters.'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters.'],
    },

    location: {
      type: locationSchema,
      required: [true, 'Location details are required.'],
    },

    images: {
      type: [venueImageSchema],
      default: [],
      validate: {
        validator: (images: IVenueImage[]) => images.length <= 10,
        message: 'A venue cannot have more than 10 images.',
      },
    },

    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0.'],
      max: [5, 'Rating cannot exceed 5.'],
    },

    totalReviews: {
      type: Number,
      default: 0,
      min: [0, 'Total reviews cannot be negative.'],
    },

    amenities: {
      type: [String],
      enum: {
        values: Object.values(Amenity),
        message: '"{VALUE}" is not a recognized amenity.',
      },
      default: [],
    },

    contactPhone: {
      type: String,
      required: [true, 'Contact phone is required.'],
      trim: true,
      validate: {
        validator: (v: string): boolean =>
          /^(\+977|977)?[9][678]\d{8}$/.test(v),
        message: 'Contact phone must be a valid Nepali number.',
      },
    },

    contactEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },

    pricePerHour: {
      type: Number,
      required: [true, 'Base price per hour is required.'],
      min: [0, 'Price cannot be negative.'],
    },

    currency: {
      type: String,
      default: 'NPR',
      uppercase: true,
      enum: ['NPR', 'USD'],
    },

    surfaceType: {
      type: String,
      enum: ['Artificial Turf', 'Natural Grass', 'Indoor Wood', 'Concrete'],
      default: 'Artificial Turf',
    },

    cancellationPolicy: {
      type: String,
      enum: ['Flexible', 'Moderate', 'Strict'],
      default: 'Flexible',
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Venue must have an owner.'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
venueSchema.index({ name: 'text', 'location.city': 'text' }); // Full-text search
venueSchema.index({ 'location.city': 1 });
venueSchema.index({ rating: -1 });
venueSchema.index({ isActive: 1 });
venueSchema.index({ ownerId: 1 });

// ─── Model ────────────────────────────────────────────────────────────────────
const Venue = model<IVenue>('Venue', venueSchema);

export default Venue;
