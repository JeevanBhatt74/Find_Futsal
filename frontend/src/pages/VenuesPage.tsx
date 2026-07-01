import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useVenues } from '@/hooks/useVenues'
import type { Venue, Amenity } from '@/types'
import clsx from 'clsx'
import toast from 'react-hot-toast'

// Map UI amenity keys to backend model enum values
const AMENITIES_MAP = {
  lights: 'Floodlights',
  shower: 'Showers',
  parking: 'Parking',
  cafe: 'Cafeteria'
}

// Haversine formula to compute distance from Kathmandu city center (27.7172, 85.3240)
const calculateDistance = (lat1?: number, lon1?: number, lat2 = 27.7172, lon2 = 85.3240) => {
  if (lat1 === undefined || lon1 === undefined) return 0
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Get deterministic distance for a venue (uses DB coordinates or fallback based on string hashing)
const getVenueDistance = (venue: Venue) => {
  if (venue.location.latitude && venue.location.longitude) {
    return calculateDistance(venue.location.latitude, venue.location.longitude)
  }
  const hash = venue.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return ((hash % 45) / 10) + 0.8 // range: 0.8km to 5.2km
}

// Get deterministic available slots count for a venue today
const getSlotsToday = (venue: Venue) => {
  const hash = venue.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return hash % 9 // returns 0 to 8 slots
}

// Skeleton loader card
function VenueCardSkeleton() {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col shadow-sm">
      <div className="skeleton h-48 rounded-none" />
      <div className="p-md flex flex-col gap-sm flex-grow">
        <div className="flex justify-between items-start">
          <div className="skeleton h-6 w-2/3 rounded" />
          <div className="skeleton h-6 w-1/4 rounded" />
        </div>
        <div className="skeleton h-4 w-1/2 rounded mb-md" />
        <div className="mt-auto pt-md border-t border-outline-variant flex justify-between items-center">
          <div className="flex gap-xs">
            <div className="skeleton h-5 w-5 rounded-full" />
            <div className="skeleton h-5 w-5 rounded-full" />
          </div>
          <div className="skeleton h-9 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export default function VenuesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchInput = searchParams.get('search') ?? ''
  
  // ── States ──
  const [search, setSearch] = useState(searchInput)
  const [availableNow, setAvailableNow] = useState(false)
  const [radius, setRadius] = useState(15)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [activeAmenities, setActiveAmenities] = useState<string[]>([])
  const [minRating, setMinRating] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState('Popularity')
  const [showMap, setShowMap] = useState(false)
  const [hoveredVenueId, setHoveredVenueId] = useState<string | null>(null)

  // Sync search input state if URL search param updates
  useEffect(() => {
    setSearch(searchInput)
  }, [searchInput])

  // Get active backend amenities list
  const backendAmenities = useMemo(() => {
    return activeAmenities.map(key => AMENITIES_MAP[key as keyof typeof AMENITIES_MAP] as Amenity)
  }, [activeAmenities])

  // Query database venues
  const { data: response, isLoading } = useVenues({
    search: search.trim() !== '' ? search : undefined,
    minRating: minRating || undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    amenities: backendAmenities.length > 0 ? backendAmenities : undefined
  }, 1, 100)

  const rawVenues = response?.data ?? []

  // Client-side filtering & sorting
  const filteredVenues = useMemo(() => {
    let list = [...rawVenues]

    // 1) Filter by Min Price (NPR)
    if (minPrice && !isNaN(Number(minPrice))) {
      list = list.filter(v => v.pricePerHour >= Number(minPrice))
    }

    // 2) Filter by Max Price (NPR) - double check local filter in case API is loading
    if (maxPrice && !isNaN(Number(maxPrice))) {
      list = list.filter(v => v.pricePerHour <= Number(maxPrice))
    }

    // 3) Filter by Available Now Only (venues with > 0 slots today)
    if (availableNow) {
      list = list.filter(v => getSlotsToday(v) > 0)
    }

    // 4) Filter by Distance Radius (km) from Kathmandu city center
    list = list.filter(v => getVenueDistance(v) <= radius)

    // 4.5) Filter by Rating (local filter for instant response)
    if (minRating !== null) {
      list = list.filter(v => v.rating >= minRating)
    }

    // 5) Sort
    return list.sort((a, b) => {
      if (sortBy.includes('Low to High')) {
        return a.pricePerHour - b.pricePerHour
      }
      if (sortBy.includes('High to Low')) {
        return b.pricePerHour - a.pricePerHour
      }
      if (sortBy.includes('Distance')) {
        return getVenueDistance(a) - getVenueDistance(b)
      }
      if (sortBy.includes('Rating')) {
        return b.rating - a.rating
      }
      // Default: Popularity (totalReviews)
      return b.totalReviews - a.totalReviews
    })
  }, [rawVenues, minPrice, maxPrice, availableNow, radius, minRating, sortBy])

  // Toggle amenities
  const handleToggleAmenity = (key: string) => {
    setActiveAmenities(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  // Clear all filters
  const handleClearAll = () => {
    setAvailableNow(false)
    setRadius(15)
    setMinPrice('')
    setMaxPrice('')
    setActiveAmenities([])
    setMinRating(null)
    setSortBy('Popularity')
    setSearch('')
    setSearchParams({})
    toast.success('Filters cleared.')
  }

  const handleNotifyMe = (e: React.MouseEvent, name: string) => {
    e.preventDefault()
    e.stopPropagation()
    toast.success(`🔔 Notification set! We will alert you if slots open up at ${name} today.`, {
      position: 'bottom-center'
    })
  }

  // Generate deterministic pin locations on mockup map (grid size: 400x500)
  const mapPins = useMemo(() => {
    return filteredVenues.map(venue => {
      const hash = venue.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      const x = 50 + (hash % 300)
      const y = 80 + ((hash * 7) % 340)
      return { venue, x, y }
    })
  }, [filteredVenues])

  // Get current city label for display header
  const displayCity = search.trim() !== '' ? search : 'Kathmandu'

  return (
    <main className="flex-grow flex flex-col md:flex-row max-w-[1440px] mx-auto w-full min-h-screen">
      
      {/* ── Left Sidebar Filters ── */}
      <aside className="w-full md:w-80 p-margin border-r border-outline-variant bg-surface-container-low shrink-0 h-auto md:h-[calc(100vh-72px)] sticky top-[72px] overflow-y-auto z-20">
        <div className="flex flex-col gap-xl">
          <div className="flex items-center justify-between">
            <h2 className="font-h3 text-h3 text-on-surface">Filters</h2>
            <button 
              onClick={handleClearAll}
              className="text-primary font-label-bold text-body-sm hover:underline outline-none bg-transparent border-none cursor-pointer"
            >
              Clear all
            </button>
          </div>
          
          {/* Availability Toggle */}
          <div className="flex items-center justify-between p-md bg-surface-container-lowest border border-outline-variant rounded-lg select-none">
            <span className="font-label-bold text-on-surface">Available Now Only</span>
            <button 
              onClick={() => setAvailableNow(!availableNow)}
              className={clsx(
                "w-12 h-6 rounded-full relative flex items-center px-1 transition-colors duration-200 outline-none border-none cursor-pointer",
                availableNow ? "bg-secondary-container" : "bg-outline-variant/60"
              )}
            >
              <div 
                className={clsx(
                  "w-4 h-4 bg-secondary rounded-full transition-all duration-200",
                  availableNow ? "ml-auto" : "ml-0"
                )} 
              />
            </button>
          </div>
          
          {/* Location Radius */}
          <div className="flex flex-col gap-sm">
            <label className="font-label-bold text-label-bold text-on-surface-variant uppercase">Location Radius (km)</label>
            <input 
              className="w-full h-2 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-secondary outline-none" 
              max="50" 
              min="1" 
              type="range" 
              value={radius}
              onChange={e => setRadius(Number(e.target.value))}
            />
            <div className="flex justify-between text-body-sm text-on-surface-variant font-medium">
              <span>1 km</span>
              <span className="font-bold text-primary">{radius} km</span>
              <span>50 km</span>
            </div>
          </div>
          
          {/* Price Range */}
          <div className="flex flex-col gap-sm">
            <label className="font-label-bold text-label-bold text-on-surface-variant uppercase">Price per Hour (NPR)</label>
            <div className="flex gap-sm">
              <input 
                className="w-full bg-surface-container-lowest border border-outline p-sm rounded-lg text-body-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" 
                placeholder="Min" 
                type="number"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
              />
              <input 
                className="w-full bg-surface-container-lowest border border-outline p-sm rounded-lg text-body-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" 
                placeholder="Max" 
                type="number"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
          
          {/* Amenities */}
          <div className="flex flex-col gap-sm">
            <label className="font-label-bold text-label-bold text-on-surface-variant uppercase">Amenities</label>
            <div className="flex flex-wrap gap-xs">
              <label 
                className={clsx(
                  "flex items-center gap-xs px-md py-xs border rounded-full cursor-pointer hover:border-secondary transition-all select-none",
                  activeAmenities.includes('lights') 
                    ? "bg-secondary-container border-secondary text-secondary font-bold" 
                    : "bg-surface-container-lowest border-outline-variant text-on-surface-variant"
                )}
              >
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={activeAmenities.includes('lights')}
                  onChange={() => handleToggleAmenity('lights')}
                />
                <span className="material-symbols-outlined text-[18px]">light_mode</span>
                <span className="text-body-sm">Lights</span>
              </label>

              <label 
                className={clsx(
                  "flex items-center gap-xs px-md py-xs border rounded-full cursor-pointer hover:border-secondary transition-all select-none",
                  activeAmenities.includes('shower') 
                    ? "bg-secondary-container border-secondary text-secondary font-bold" 
                    : "bg-surface-container-lowest border-outline-variant text-on-surface-variant"
                )}
              >
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={activeAmenities.includes('shower')}
                  onChange={() => handleToggleAmenity('shower')}
                />
                <span className="material-symbols-outlined text-[18px]">shower</span>
                <span className="text-body-sm">Shower</span>
              </label>

              <label 
                className={clsx(
                  "flex items-center gap-xs px-md py-xs border rounded-full cursor-pointer hover:border-secondary transition-all select-none",
                  activeAmenities.includes('parking') 
                    ? "bg-secondary-container border-secondary text-secondary font-bold" 
                    : "bg-surface-container-lowest border-outline-variant text-on-surface-variant"
                )}
              >
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={activeAmenities.includes('parking')}
                  onChange={() => handleToggleAmenity('parking')}
                />
                <span className="material-symbols-outlined text-[18px]">local_parking</span>
                <span className="text-body-sm">Parking</span>
              </label>

              <label 
                className={clsx(
                  "flex items-center gap-xs px-md py-xs border rounded-full cursor-pointer hover:border-secondary transition-all select-none",
                  activeAmenities.includes('cafe') 
                    ? "bg-secondary-container border-secondary text-secondary font-bold" 
                    : "bg-surface-container-lowest border-outline-variant text-on-surface-variant"
                )}
              >
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={activeAmenities.includes('cafe')}
                  onChange={() => handleToggleAmenity('cafe')}
                />
                <span className="material-symbols-outlined text-[18px]">restaurant</span>
                <span className="text-body-sm">Cafe</span>
              </label>
            </div>
          </div>
          
          {/* Rating */}
          <div className="flex flex-col gap-sm mb-lg">
            <label className="font-label-bold text-label-bold text-on-surface-variant uppercase">Minimum Rating</label>
            <div className="flex gap-xs">
              <button 
                onClick={() => setMinRating(4.0)}
                className={clsx(
                  "w-full p-sm border rounded-lg hover:bg-secondary-container hover:text-secondary hover:border-secondary transition-all font-semibold outline-none cursor-pointer",
                  minRating === 4.0 
                    ? "bg-secondary text-on-secondary border-secondary font-bold" 
                    : "bg-surface-container-lowest border-outline-variant text-on-surface-variant"
                )}
              >
                4★
              </button>
              <button 
                onClick={() => setMinRating(4.5)}
                className={clsx(
                  "w-full p-sm border rounded-lg hover:bg-secondary-container hover:text-secondary hover:border-secondary transition-all font-semibold outline-none cursor-pointer",
                  minRating === 4.5 
                    ? "bg-secondary text-on-secondary border-secondary font-bold" 
                    : "bg-surface-container-lowest border-outline-variant text-on-surface-variant"
                )}
              >
                4.5★
              </button>
              <button 
                onClick={() => setMinRating(null)}
                className={clsx(
                  "w-full p-sm border rounded-lg hover:bg-secondary-container hover:text-secondary hover:border-secondary transition-all font-semibold outline-none cursor-pointer",
                  minRating === null 
                    ? "bg-secondary text-on-secondary border-secondary font-bold" 
                    : "bg-surface-container-lowest border-outline-variant text-on-surface-variant"
                )}
              >
                All
              </button>
            </div>
          </div>
        </div>
      </aside>
      
      {/* ── Main Content Area ── */}
      <section className="flex-grow p-margin overflow-y-auto">
        {/* Header/Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-md mb-xl">
          <div>
            <h1 className="font-h1 text-h2 md:text-h1 text-on-surface uppercase leading-none mb-1">
              Courts in {displayCity}
            </h1>
            <p className="text-on-surface-variant text-body-md">
              {isLoading ? 'Searching courts...' : `${filteredVenues.length} premium futsal court${filteredVenues.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
          
          <div className="flex items-center gap-sm w-full lg:w-auto">
            {/* Sort Dropdown */}
            <div className="relative flex-grow lg:flex-grow-0 min-w-[200px]">
              <select 
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="appearance-none w-full bg-surface-container-lowest border border-outline-variant pl-md pr-xl py-sm rounded-lg font-label-bold text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer select-none"
              >
                <option value="Popularity">Sort by: Popularity</option>
                <option value="Price (Low to High)">Sort by: Price (Low to High)</option>
                <option value="Price (High to Low)">Sort by: Price (High to Low)</option>
                <option value="Distance">Sort by: Distance</option>
                <option value="Rating">Sort by: Rating</option>
              </select>
              <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                expand_more
              </span>
            </div>
            
            {/* Map Toggle Button */}
            <button 
              onClick={() => setShowMap(!showMap)}
              className={clsx(
                "border border-outline-variant p-sm rounded-lg flex items-center justify-center gap-xs transition-all outline-none cursor-pointer",
                showMap 
                  ? "bg-secondary text-on-secondary border-secondary font-bold shadow-sm" 
                  : "bg-surface-container-highest hover:bg-secondary-container hover:text-secondary hover:border-secondary"
              )}
            >
              <span className="material-symbols-outlined">map</span>
              <span className="font-label-bold text-body-sm hidden lg:inline">
                {showMap ? 'Hide Map' : 'Show Map'}
              </span>
            </button>
          </div>
        </div>

        {/* Results layout: split grid & map side-sheet or full grid */}
        <div className="flex flex-col lg:flex-row gap-lg">
          
          {/* Court Cards Grid */}
          <div className={clsx("flex-grow transition-all duration-300", showMap ? "w-full lg:w-[58%]" : "w-full")}>
            <div className={clsx(
              "grid gap-lg",
              showMap ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
            )}>
              {isLoading ? (
                [...Array(6)].map((_, i) => <VenueCardSkeleton key={i} />)
              ) : filteredVenues.length > 0 ? (
                filteredVenues.map(venue => {
                  const distance = getVenueDistance(venue)
                  const slotsToday = getSlotsToday(venue)
                  const primaryImage = venue.images.find(i => i.isPrimary) ?? venue.images[0]
                  
                  return (
                    <div 
                      key={venue._id}
                      onMouseEnter={() => setHoveredVenueId(venue._id)}
                      onMouseLeave={() => setHoveredVenueId(null)}
                      className={clsx(
                        "bg-surface-container-lowest border rounded-xl overflow-hidden group transition-all duration-300 flex flex-col shadow-sm cursor-pointer relative",
                        hoveredVenueId === venue._id 
                          ? "border-secondary shadow-md scale-[1.01]" 
                          : "border-outline-variant hover:border-secondary hover:shadow-md"
                      )}
                    >
                      <Link to={`/venues/${venue._id}`} className="absolute inset-0 z-10" />
                      
                      {/* Image header */}
                      <div className="relative h-48 overflow-hidden bg-surface-container-high">
                        <img 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          alt={venue.name}
                          src={primaryImage?.url ?? "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600&auto=format&fit=crop&q=60"}
                        />
                        
                        {/* Rating badge */}
                        <div className="absolute top-sm right-sm bg-surface/90 backdrop-blur-sm px-md py-1 rounded-full flex items-center gap-xs shadow-sm z-10">
                          <span className="material-symbols-outlined text-secondary text-[16px] block" style={{ fontVariationSettings: "'FILL' 1" }}>
                            star
                          </span>
                          <span className="font-label-bold text-body-sm text-on-surface">
                            {venue.rating ? venue.rating.toFixed(1) : '0.0'}
                          </span>
                        </div>
                        
                        {/* Slots today badge */}
                        <div className="absolute bottom-sm left-sm z-10">
                          {slotsToday > 0 ? (
                            <div className="bg-primary/90 text-on-primary px-sm py-1 rounded-md flex items-center gap-xs text-[11px] font-bold tracking-wider uppercase">
                              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                              <span>{slotsToday} SLOTS TODAY</span>
                            </div>
                          ) : (
                            <div className="bg-surface-variant/90 text-on-surface px-sm py-1 rounded-md text-[11px] font-bold tracking-wider uppercase">
                              <span>NO SLOTS TODAY</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Details body */}
                      <div className="p-md flex flex-col flex-grow relative z-10 pointer-events-none">
                        <div className="flex justify-between items-start mb-xs">
                          <h3 className="font-h3 text-h3 text-on-surface group-hover:text-primary transition-colors pr-sm leading-tight max-w-[70%]">
                            {venue.name}
                          </h3>
                          <span className="font-h3 text-h3 text-primary shrink-0 leading-none pt-1">
                            Rs {venue.pricePerHour.toLocaleString()}
                          </span>
                        </div>
                        
                        <p className="text-on-surface-variant text-body-sm flex items-center gap-xs mb-md font-medium">
                          <span className="material-symbols-outlined text-[18px] text-outline">location_on</span>
                          <span>{distance.toFixed(1)} km from center</span>
                          <span className="text-outline/40">|</span>
                          <span className="text-[12px]">{venue.location.city}</span>
                        </p>
                        
                        {/* Footer details */}
                        <div className="mt-auto pt-md border-t border-outline-variant flex items-center justify-between pointer-events-auto relative z-20">
                          {/* Amenities list */}
                          <div className="flex gap-xs text-outline">
                            {venue.amenities.includes('Showers') && (
                              <span className="material-symbols-outlined text-[20px]" title="Shower available">shower</span>
                            )}
                            {venue.amenities.includes('Floodlights') && (
                              <span className="material-symbols-outlined text-[20px]" title="Lights available">light_mode</span>
                            )}
                            {venue.amenities.includes('Parking') && (
                              <span className="material-symbols-outlined text-[20px]" title="Parking available">local_parking</span>
                            )}
                            {venue.amenities.includes('Cafeteria') && (
                              <span className="material-symbols-outlined text-[20px]" title="Cafe available">restaurant</span>
                            )}
                          </div>
                          
                          {/* Action button */}
                          {slotsToday > 0 ? (
                            <Link 
                              to={`/venues/${venue._id}`}
                              className="bg-secondary text-on-secondary px-lg py-sm rounded-lg font-label-bold text-label-bold hover:bg-primary hover:text-white transition-all no-underline shadow-sm active:scale-95 block"
                            >
                              Book Now
                            </Link>
                          ) : (
                            <button 
                              onClick={(e) => handleNotifyMe(e, venue.name)}
                              className="border-2 border-primary text-primary px-lg py-[6px] rounded-lg font-label-bold text-label-bold bg-white hover:bg-primary hover:text-white transition-all shadow-sm active:scale-95 outline-none cursor-pointer block"
                            >
                              Notify Me
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="col-span-full text-center py-xl border border-dashed border-outline-variant rounded-2xl bg-surface-container-low p-xl">
                  <span className="material-symbols-outlined text-[48px] text-outline block mb-sm">search_off</span>
                  <p className="font-label-bold text-body-lg text-on-surface">No futsal courts match your search.</p>
                  <p className="text-body-sm text-on-surface-variant mt-xs mb-lg">Try widening your location radius or adjusting filter tags.</p>
                  <button 
                    onClick={handleClearAll}
                    className="bg-primary text-on-primary px-lg py-md rounded-lg font-label-bold hover:brightness-110 active:scale-95 transition-all outline-none border-none cursor-pointer shadow-md"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* ── Side-sheet Mock Map View ── */}
          {showMap && !isLoading && (
            <div className="w-full lg:w-[42%] h-[600px] lg:h-[calc(100vh-160px)] sticky top-[140px] rounded-xl overflow-hidden border border-outline-variant shadow-md bg-canvas relative z-10 animate-scale-in">
              <div className="absolute top-sm left-sm bg-white/95 backdrop-blur-sm px-md py-sm rounded-lg shadow z-10 border border-outline-variant">
                <span className="font-label-bold text-xs text-primary uppercase tracking-wide">Interactive Map</span>
                <p className="text-[10px] text-on-surface-variant font-semibold">Hover pins to see court names</p>
              </div>
              
              <svg viewBox="0 0 400 500" className="w-full h-full bg-emerald-50/15">
                {/* Street grid background */}
                <line x1="50" y1="0" x2="50" y2="500" stroke="#bfc9be" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.6" />
                <line x1="150" y1="0" x2="150" y2="500" stroke="#bfc9be" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.6" />
                <line x1="250" y1="0" x2="250" y2="500" stroke="#bfc9be" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.6" />
                <line x1="350" y1="0" x2="350" y2="500" stroke="#bfc9be" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.6" />
                <line x1="0" y1="100" x2="400" y2="100" stroke="#bfc9be" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.6" />
                <line x1="0" y1="240" x2="400" y2="240" stroke="#bfc9be" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.6" />
                <line x1="0" y1="380" x2="400" y2="380" stroke="#bfc9be" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.6" />

                {/* Bagmati River path */}
                <path d="M 0,160 Q 120,180 190,260 T 400,390" fill="none" stroke="#89d89e" strokeWidth="10" opacity="0.25" />
                
                {/* Kathmandu Ring Road mockup */}
                <circle cx="200" cy="250" r="160" fill="none" stroke="#bfc9be" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.4" />

                {/* Major area texts */}
                <text x="70" y="80" fill="#707a70" fontSize="10" fontWeight="600" opacity="0.5">Thamel</text>
                <text x="260" y="160" fill="#707a70" fontSize="10" fontWeight="600" opacity="0.5">Baneshwor</text>
                <text x="120" y="380" fill="#707a70" fontSize="10" fontWeight="600" opacity="0.5">Lalitpur</text>
                <text x="280" y="420" fill="#707a70" fontSize="10" fontWeight="600" opacity="0.5">Koteshwor</text>
                
                {/* Pins */}
                {mapPins.map(({ venue, x, y }) => {
                  const isHovered = hoveredVenueId === venue._id
                  
                  return (
                    <g 
                      key={venue._id}
                      onMouseEnter={() => setHoveredVenueId(venue._id)}
                      onMouseLeave={() => setHoveredVenueId(null)}
                      className="cursor-pointer group/pin"
                    >
                      {/* Active hover ripple effect */}
                      <circle 
                        cx={x} 
                        cy={y} 
                        r={isHovered ? 18 : 0} 
                        className="fill-secondary/20 stroke-secondary/30 stroke-1 transition-all duration-300 animate-ping"
                      />
                      
                      {/* Inner circle pin base */}
                      <circle 
                        cx={x} 
                        cy={y} 
                        r={isHovered ? 8 : 6} 
                        className={clsx(
                          "transition-all duration-200 shadow",
                          isHovered 
                            ? "fill-secondary stroke-white stroke-2" 
                            : "fill-primary stroke-white stroke-1 hover:fill-secondary"
                        )}
                      />
                      
                      {/* Custom Tooltip */}
                      {isHovered && (
                        <foreignObject 
                          x={x - 85} 
                          y={y - 54} 
                          width="170" 
                          height="44"
                          className="pointer-events-none"
                        >
                          <div className="bg-canvas border border-secondary px-md py-sm rounded-lg shadow-lg text-center flex flex-col justify-center h-full animate-fade-in relative z-30">
                            <span className="text-[10px] font-bold text-on-surface truncate block">{venue.name}</span>
                            <span className="text-[9px] font-semibold text-secondary">Rs {venue.pricePerHour.toLocaleString()}/hr</span>
                            {/* Little triangle arrow at tooltip bottom */}
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-canvas border-r border-b border-secondary" />
                          </div>
                        </foreignObject>
                      )}
                    </g>
                  )
                })}
              </svg>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
