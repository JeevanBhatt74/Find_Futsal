import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, SlidersHorizontal, MapPin, Star, Wifi } from 'lucide-react'
import type { Venue, Amenity } from '@/types'
import { useVenues } from '@/hooks/useVenues'
import clsx from 'clsx'

const AMENITY_OPTIONS: Amenity[] = ['Showers', 'Parking', 'Pro Turf', 'Air Con', 'Floodlights', 'Cafeteria']

function VenueCard({ venue }: { venue: Venue }) {
  const primaryImage = venue.images.find(i => i.isPrimary) ?? venue.images[0]
  return (
    <Link to={`/venues/${venue._id}`} className="card-hover no-underline group block">
      <div className="relative overflow-hidden rounded-t-lg h-48">
        <img
          src={primaryImage?.url ?? 'https://images.unsplash.com/photo-1562552052-d1a41db7f90b?w=600&q=80'}
          alt={venue.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <span className="badge-available shadow-sm">Available</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16
                        bg-gradient-to-t from-black/40 to-transparent" />
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-slate-text group-hover:text-emerald-600 transition-colors">
            {venue.name}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star size={13} className="text-amber-400" fill="currentColor" />
            <span className="text-sm font-medium text-slate-text">{venue.rating}</span>
            <span className="text-xs text-gray-400">({venue.totalReviews})</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-gray-400 text-sm mb-3">
          <MapPin size={13} />
          <span>{venue.location.address}, {venue.location.city}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {venue.amenities.slice(0, 3).map(a => (
            <span key={a} className="px-2 py-0.5 text-xs rounded-full bg-surface text-gray-500 border border-gray-100">
              {a}
            </span>
          ))}
          {venue.amenities.length > 3 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-surface text-gray-400">
              +{venue.amenities.length - 3}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-slate-text">NPR {venue.pricePerHour.toLocaleString()}</span>
            <span className="text-xs text-gray-400 ml-1">/ hr</span>
          </div>
          <span className="btn-primary btn-sm">Book Now</span>
        </div>
      </div>
    </Link>
  )
}

function VenueCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton h-48 rounded-none rounded-t-lg" />
      <div className="p-5 flex flex-col gap-3">
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="flex gap-2">
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-5 w-16 rounded-full" />
        </div>
        <div className="skeleton h-9 w-24 rounded-md self-end" />
      </div>
    </div>
  )
}

export default function VenuesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [selectedAmenities, setSelectedAmenities] = useState<Amenity[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Fetch live venues list using React Query
  const { data: response, isLoading } = useVenues({
    search: search.trim() !== '' ? search : undefined,
    amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
  })

  const venues = response?.data ?? []

  const toggleAmenity = (a: Amenity) => {
    setSelectedAmenities(prev =>
      prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
    )
  }

  return (
    <div className="page-container py-10">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-slate-text mb-1">Find Futsal Courts</h1>
        <p className="text-gray-500">Real-time availability across Nepal</p>
      </div>

      {/* ── Search & Filter Bar ──────────────────────────────────────────── */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="venue-search"
            type="text"
            placeholder="Search by venue name or city…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={clsx('btn-secondary gap-2', showFilters && '!border-emerald-400 !text-emerald-600')}
          aria-expanded={showFilters}
        >
          <SlidersHorizontal size={15} />
          Filters
          {selectedAmenities.length > 0 && (
            <span className="ml-0.5 w-5 h-5 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center">
              {selectedAmenities.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Amenity Filters ──────────────────────────────────────────────── */}
      {showFilters && (
        <div className="card p-5 mb-6 animate-slide-down">
          <p className="text-sm font-medium text-slate-text mb-3">Filter by Amenities</p>
          <div className="flex flex-wrap gap-2">
            {AMENITY_OPTIONS.map(a => (
              <button
                key={a}
                onClick={() => toggleAmenity(a)}
                className={clsx(
                  'px-3.5 py-1.5 rounded-full text-sm border transition-all duration-150',
                  selectedAmenities.includes(a)
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-canvas text-slate-text border-gray-200 hover:border-emerald-300'
                )}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Results Count ────────────────────────────────────────────────── */}
      <p className="text-sm text-gray-400 mb-6">
        {isLoading ? 'Loading…' : `${venues.length} venue${venues.length !== 1 ? 's' : ''} found`}
      </p>

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? [...Array(6)].map((_, i) => <VenueCardSkeleton key={i} />)
          : venues.map(v => <VenueCard key={v._id} venue={v} />)
        }
      </div>

      {!isLoading && venues.length === 0 && (
        <div className="text-center py-20">
          <Wifi size={40} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">No venues match your search.</p>
          <p className="text-sm text-gray-300 mt-1">Try clearing filters or searching another city.</p>
          <button onClick={() => { setSearch(''); setSelectedAmenities([]) }} className="btn-primary mt-6">
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}
