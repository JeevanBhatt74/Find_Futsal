import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  MapPin, Star, Phone, Clock, ChevronLeft, Calendar, AlertCircle,
  ShowerHead, Car, Leaf, Wind, Zap, Coffee, CheckCircle2
} from 'lucide-react'
import type { Slot } from '@/types'
import { useBookingStore, useAuthStore } from '@/store'
import { useVenueDetail } from '@/hooks/useVenues'
import { useSlots } from '@/hooks/useSlots'
import { useBookingMutations } from '@/hooks/useBooking'
import { useReviews } from '@/hooks/useReviews'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import clsx from 'clsx'

// ── Amenity icon map ─────────────────────────────────────────────────────────
const amenityIcons: Record<string, React.ElementType> = {
  'Showers': ShowerHead,
  'Parking': Car,
  'Pro Turf': Leaf,
  'Air Con': Wind,
  'Floodlights': Zap,
  'Cafeteria': Coffee,
}

const STATUS_STYLES: Record<string, string> = {
  Available:   'cell-available',
  Locked:      'cell-taken opacity-85',
  Booked:      'cell-taken opacity-60',
  Maintenance: 'cell-maintenance',
}

export default function VenueDetailPage() {
  const { venueId } = useParams()
  const navigate = useNavigate()
  const { setSelectedVenue, setSelectedSlot } = useBookingStore()
  const { isAuthenticated } = useAuthStore()

  // ── States ──
  const [activeImage, setActiveImage] = useState(0)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))

  // ── Live API Hooks ──
  const { data: venue, isLoading: isVenueLoading } = useVenueDetail(venueId)
  const { data: slots = [], isLoading: isSlotsLoading } = useSlots(venueId, selectedDate)
  const { data: reviews = [] } = useReviews(venueId)
  const { lockSlotMutation } = useBookingMutations()

  const handleSlotSelect = (slot: Slot) => {
    if (slot.status !== 'Available') return
    setSelectedSlotId(slot._id)
    setIsModalOpen(true) // Open popup details modal!
  }

  const handleBookNow = async () => {
    const slot = slots.find(s => s._id === selectedSlotId)
    if (!slot || !venue) return

    if (!isAuthenticated) {
      toast.error('You must be signed in to book a court.')
      // Store select items so booking continues after redirecting back
      setSelectedVenue(venue)
      setSelectedSlot(slot)
      navigate('/login', { state: { from: { pathname: `/venues/${venueId}/book` } } })
      return
    }

    try {
      // Attempt to atomically lock the slot on the backend
      const lockedSlot = await lockSlotMutation.mutateAsync(slot._id)
      if (lockedSlot) {
        setSelectedVenue(venue)
        setSelectedSlot(lockedSlot)
        setIsModalOpen(false)
        // Sticky floating success toast in bottom-right zone
        toast.success("⚡ Slot locked for 5 minutes! Complete checkout to finalize.", {
          position: 'bottom-right',
          duration: 7000,
        })
        navigate(`/venues/${venue._id}/book`)
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.message ?? 'Could not lock slot. It might be booked or held by another user.'
      toast.error(errMsg)
    }
  }

  // ── Skeletons loaders ──
  if (isVenueLoading || !venue) {
    return (
      <div className="page-container py-10 max-w-7xl mx-auto flex flex-col gap-6">
        <div className="skeleton h-5 w-32 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="skeleton h-80 rounded-xl" />
            <div className="card p-6 flex flex-col gap-4">
              <div className="skeleton h-8 w-3/4 rounded" />
              <div className="skeleton h-5 w-1/2 rounded" />
              <div className="skeleton h-24 w-full rounded" />
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="card p-6 flex flex-col gap-4">
              <div className="skeleton h-6 w-1/2 rounded" />
              <div className="skeleton h-10 w-full rounded" />
              <div className="skeleton h-32 w-full rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container py-10">
      {/* ── Back ──────────────────────────────────────────────────────────── */}
      <Link to="/venues" className="inline-flex items-center gap-1.5 text-sm text-gray-500
                                     hover:text-emerald-600 mb-6 no-underline group font-medium">
        <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to Venues
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* ── Left: Images + Info ──────────────────────────────────────── */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Image Gallery */}
          <div className="rounded-xl overflow-hidden shadow-md">
            <img
              src={venue.images[activeImage]?.url ?? 'https://images.unsplash.com/photo-1562552052-d1a41db7f90b?w=800&q=80'}
              alt={venue.name}
              className="w-full h-72 sm:h-96 object-cover transition-all duration-500"
            />
            {venue.images.length > 1 && (
              <div className="flex gap-2 mt-2 p-1 bg-surface rounded-lg">
                {venue.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={clsx(
                      'w-20 h-14 rounded-md overflow-hidden border-2 transition-all duration-200 shrink-0',
                      activeImage === i ? 'border-emerald-500 scale-95 shadow-sm' : 'border-transparent opacity-60 hover:opacity-90'
                    )}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Venue Info */}
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-2xl font-display font-bold text-slate-text">{venue.name}</h1>
              <div className="flex items-center gap-1.5 shrink-0 px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
                <Star size={14} className="text-amber-400" fill="currentColor" />
                <span className="font-semibold text-sm text-slate-text">{venue.rating}</span>
                <span className="text-xs text-gray-400">({venue.totalReviews})</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
              <MapPin size={14} className="text-emerald-500 shrink-0" />
              {venue.location.address}, {venue.location.city}
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-5">{venue.description}</p>

            {/* Amenities */}
            <div>
              <h4 className="text-sm font-semibold text-slate-text mb-3">Amenities</h4>
              <div className="flex flex-wrap gap-3">
                {venue.amenities.map(a => {
                  const Icon = amenityIcons[a] ?? CheckCircle2
                  return (
                    <div key={a} className="flex items-center gap-2 px-3 py-2 rounded-md bg-surface text-sm">
                      <Icon size={14} className="text-emerald-500" />
                      <span className="text-slate-text font-medium">{a}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Contact */}
            <div className="mt-5 pt-5 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-500 font-medium mb-6">
              <Phone size={14} className="text-emerald-500" />
              {venue.contactPhone}
            </div>

            {/* Reviews */}
            <div className="mt-5 pt-5 border-t border-gray-100">
              <h4 className="text-lg font-semibold text-slate-text mb-4">Reviews ({reviews.length})</h4>
              {reviews.length === 0 ? (
                <p className="text-sm text-gray-400">No reviews yet.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {reviews.map((r) => (
                    <div key={r._id} className="p-4 bg-surface-muted rounded-lg flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs uppercase">
                            {r.userId.profileImage ? <img src={r.userId.profileImage} className="w-full h-full rounded-full object-cover" /> : r.userId.fullName[0]}
                          </div>
                          <span className="font-semibold text-sm text-slate-text">{r.userId.fullName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-amber-400" fill="currentColor" />
                          <span className="text-sm font-bold text-slate-text">{r.rating}</span>
                        </div>
                      </div>
                      {r.comment && <p className="text-sm text-gray-500 mt-1">{r.comment}</p>}
                      <span className="text-xs text-gray-400">{format(new Date(r.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: Slot Selector ─────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="card p-6 sticky top-24 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-semibold text-slate-text">Select a Time Slot</h2>
            </div>
            <p className="text-sm text-gray-400 mb-5">
              <span className="font-semibold text-emerald-600 text-base">NPR {venue.pricePerHour.toLocaleString()}</span> / hour
            </p>

            {/* Date Selector */}
            <div className="mb-5">
              <label htmlFor="slot-date-select" className="label text-xs uppercase tracking-wider font-semibold text-gray-400 flex items-center gap-1.5 mb-2">
                <Calendar size={13} className="text-emerald-500" />
                Select Date
              </label>
              <input
                id="slot-date-select"
                type="date"
                className="input focus:border-emerald-500 focus:ring-emerald-500/20"
                min={format(new Date(), 'yyyy-MM-dd')}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value)
                  setSelectedSlotId(null) // Reset selection
                }}
              />
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mb-4 text-xs text-gray-400 font-medium border-t border-gray-50 pt-4">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-300" />Available</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-100 border border-amber-300" />Locked</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-100 border border-red-300" />Booked</span>
            </div>

            {/* Slots Loading State */}
            {isSlotsLoading ? (
              <div className="flex flex-col gap-2">
                {[...Array(4)].map((_, idx) => (
                  <div key={idx} className="skeleton h-12 w-full rounded-md" />
                ))}
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-8 bg-surface rounded-lg">
                <AlertCircle size={24} className="text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400">No time slots generated for this date.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto scrollbar-thin pr-1">
                {slots.map(slot => (
                  <button
                    key={slot._id}
                    onClick={() => handleSlotSelect(slot)}
                    disabled={slot.status !== 'Available'}
                    className={clsx(
                      'w-full text-left px-4 py-3 border transition-all duration-150',
                      selectedSlotId === slot._id && slot.status === 'Available' ? 'cell-selected' : STATUS_STYLES[slot.status]
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock size={13} className={
                          slot.status === 'Available' ? 'text-primary' :
                          slot.status === 'Locked'    ? 'text-alert-warning-text' : 'text-alert-danger-text'
                        } />
                        <span className="text-[14px] font-medium text-slate-text">
                          {format(new Date(slot.startTime), 'h:mm a')} – {format(new Date(slot.endTime), 'h:mm a')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {slot.status === 'Available' && (
                          <span className="text-[13px] font-bold text-primary">Rs. {slot.baseCost}</span>
                        )}
                        <span className={clsx('badge text-[11px] px-2 py-0.5 font-medium rounded-full', {
                          'badge-available':   slot.status === 'Available',
                          'badge-locked':      slot.status === 'Locked',
                          'badge-booked':      slot.status === 'Booked',
                          'badge-maintenance': slot.status === 'Maintenance',
                        })}>
                          {slot.status === 'Maintenance' ? 'Under Maintenance' : slot.status === 'Locked' ? 'Locked' : slot.status === 'Booked' ? 'Taken' : slot.status}
                        </span>
                      </div>
                    </div>
                    {selectedSlotId === slot._id && slot.status === 'Available' && (
                      <div className="mt-1.5 flex items-center gap-1 text-[12px] text-emerald-600 font-semibold">
                        <CheckCircle2 size={11} />
                        Selected (Tap 'Book Now' below to finalize)
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                if (selectedSlotId) setIsModalOpen(true)
              }}
              disabled={!selectedSlotId}
              className="btn-primary w-full mt-5 btn-lg disabled:opacity-40 disabled:pointer-events-none"
            >
              {selectedSlotId ? 'Book Selected Slot' : 'Select a Slot'}
            </button>
            <p className="text-xs text-center text-gray-400 mt-3 font-medium">
              🔒 Tapping slot triggers checkout preview and locks slot
            </p>
          </div>
        </div>
      </div>

      {/* ── Pricing & Booking Popup Modal ── */}
      {isModalOpen && selectedSlotId && slots.find(s => s._id === selectedSlotId) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-canvas rounded-[12px] border border-gray-100 shadow-modal max-w-md w-full mx-4 p-6 relative animate-scale-in">
            {/* Close button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-cool-grey hover:text-slate-text p-1 hover:bg-surface-muted rounded-full transition-colors text-[24px] leading-none"
            >
              &times;
            </button>

            <h3 className="text-[20px] font-bold text-slate-text mb-2">Confirm Slot Details</h3>
            <p className="body-regular mb-4">Review the selected futsal slot details before proceeding to pay.</p>

            <div className="space-y-3 p-4 bg-surface-muted rounded-[8px] mb-5">
              <div className="flex justify-between text-[14px]">
                <span className="font-medium text-cool-grey">Venue</span>
                <span className="font-bold text-slate-text">{venue.name}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="font-medium text-cool-grey">Date</span>
                <span className="font-bold text-slate-text">{format(new Date(selectedDate), 'MMMM dd, yyyy')}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="font-medium text-cool-grey">Time Slot</span>
                <span className="font-bold text-primary">
                  {format(new Date(slots.find(s => s._id === selectedSlotId)!.startTime), 'h:mm a')} – {format(new Date(slots.find(s => s._id === selectedSlotId)!.endTime), 'h:mm a')}
                </span>
              </div>
              <div className="border-t border-gray-200 my-2 pt-2 flex justify-between text-base">
                <span className="font-bold text-slate-text">Total Pricing</span>
                <span className="font-extrabold text-[18px] text-primary">Rs. {slots.find(s => s._id === selectedSlotId)!.baseCost}</span>
              </div>
            </div>

            <div className="p-3 bg-alert-warning-bg rounded-[8px] mb-5 flex gap-2.5 items-start">
              <AlertCircle size={18} className="text-alert-warning-text shrink-0 mt-0.5" />
              <p className="text-xs text-alert-warning-text leading-relaxed">
                <strong>Slot Hold Notice:</strong> ⚡ Clicking 'Book & Pay' will hold this slot for 5 minutes. Complete your checkout to finalize the booking!
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn-secondary w-1/3"
              >
                Cancel
              </button>
              <button
                onClick={handleBookNow}
                disabled={lockSlotMutation.isPending}
                className="btn-primary w-2/3 flex items-center justify-center gap-2"
              >
                {lockSlotMutation.isPending ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : null}
                Book & Pay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
