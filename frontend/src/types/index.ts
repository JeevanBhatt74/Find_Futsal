// ─── Venue Types ──────────────────────────────────────────────────────────────

export type Amenity =
  | 'Showers'
  | 'Parking'
  | 'Pro Turf'
  | 'Air Con'
  | 'Changing Rooms'
  | 'Floodlights'
  | 'Cafeteria'

export interface VenueLocation {
  address: string
  city: string
  district: string
  latitude?: number
  longitude?: number
  googleMapsUrl?: string
}

export interface VenueImage {
  url: string
  altText?: string
  isPrimary: boolean
}

export interface Venue {
  _id: string
  name: string
  description?: string
  location: VenueLocation
  images: VenueImage[]
  rating: number
  totalReviews: number
  amenities: Amenity[]
  contactPhone: string
  contactEmail?: string
  pricePerHour: number
  currency: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ─── Slot Types ───────────────────────────────────────────────────────────────

export type BookingStatus = 'Available' | 'Locked' | 'Booked' | 'Maintenance'

export interface Slot {
  _id: string
  venueId: string
  startTime: string
  endTime: string
  baseCost: number
  currency: string
  status: BookingStatus
  lockedByUserId?: string | null
  lockTimestamp?: string | null
  lockDurationMinutes: number
  lockExpiresAt?: string | null
  isLockExpired?: boolean
}

// ─── User Types ───────────────────────────────────────────────────────────────

export interface User {
  _id: string
  fullName: string
  phone: string
  email: string
  profileImage?: string
  bio?: string
  isVerified: boolean
  isActive: boolean
  createdAt: string
  role?: string
}

// ─── API Response Shapes ──────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// ─── Filter / Query Types ─────────────────────────────────────────────────────

export interface VenueFilters {
  city?: string
  amenities?: Amenity[]
  minRating?: number
  maxPrice?: number
  search?: string
}
