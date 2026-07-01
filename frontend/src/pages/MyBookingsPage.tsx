import { useState } from 'react'
import { useSubmitReview } from '@/hooks/useReviews'
import { useMyBookings } from '@/hooks/useBooking'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState('Upcoming')
  
  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const { mutateAsync: submitReview, isPending: isSubmitting } = useSubmitReview()
  const { data: rawBookings = [], isLoading } = useMyBookings()

  const handleReviewSubmit = async () => {
    try {
      await submitReview({
        venueId: selectedBooking.venueId._id,
        bookingId: selectedBooking._id,
        rating,
        comment
      })
      toast.success('Review submitted successfully!')
      setReviewModalOpen(false)
      setComment('')
      setRating(5)
    } catch (err) {
      toast.error('Failed to submit review.')
    }
  }

  const now = new Date()
  const sortedBookings = [...rawBookings].sort((a, b) => new Date(a.slotId.startTime).getTime() - new Date(b.slotId.startTime).getTime())
  
  const upcomingBookings = sortedBookings.filter(b => b.status === 'Confirmed' && new Date(b.slotId.endTime) > now)
  const pastBookings = sortedBookings.filter(b => b.status === 'Confirmed' && new Date(b.slotId.endTime) <= now).reverse()
  const cancelledBookings = sortedBookings.filter(b => b.status === 'Cancelled')

  const UPCOMING_BOOKING = upcomingBookings.length > 0 ? upcomingBookings[0] : null

  // Calculate Stats
  const totalBookingsCount = rawBookings.length
  const totalSpent = rawBookings.filter(b => b.status === 'Confirmed').reduce((acc, curr) => acc + curr.totalCost, 0)
  
  // Find favorite venue
  const venueCounts = rawBookings.reduce((acc: any, b) => {
    if (b.status === 'Confirmed') {
      acc[b.venueId.name] = (acc[b.venueId.name] || 0) + 1
    }
    return acc
  }, {})
  const favoriteVenue = Object.entries(venueCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'N/A'

  return (
    <main className="max-w-7xl mx-auto px-margin py-xl lg:grid lg:grid-cols-12 lg:gap-xl">
      {/* Stats Sidebar */}
      <aside className="lg:col-span-4 mb-xl lg:mb-0 space-y-md">
        <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant">
          <h2 className="font-h3 text-h3 text-primary mb-lg">Performance Stats</h2>
          <div className="space-y-md">
            {/* Stat Card 1 */}
            <div className="flex items-center p-md bg-surface-container-low rounded-lg border border-outline-variant/30">
              <div className="w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center mr-md shadow-sm">
                <span className="material-symbols-outlined" data-icon="sports_soccer">sports_soccer</span>
              </div>
              <div>
                <p className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider text-[10px]">Total Bookings</p>
                <p className="font-h3 text-h3 text-on-surface">{totalBookingsCount} Sessions</p>
              </div>
            </div>
            {/* Stat Card 2 */}
            <div className="flex items-center p-md bg-surface-container-low rounded-lg border border-outline-variant/30">
              <div className="w-12 h-12 bg-secondary text-on-secondary rounded-full flex items-center justify-center mr-md shadow-sm">
                <span className="material-symbols-outlined" data-icon="payments">payments</span>
              </div>
              <div>
                <p className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider text-[10px]">Total Spent</p>
                <p className="font-h3 text-h3 text-on-surface">Rs. {totalSpent.toLocaleString()}</p>
              </div>
            </div>
            {/* Stat Card 3 */}
            <div className="flex items-center p-md bg-surface-container-low rounded-lg border border-outline-variant/30">
              <div className="w-12 h-12 bg-tertiary text-on-tertiary rounded-full flex items-center justify-center mr-md shadow-sm">
                <span className="material-symbols-outlined" data-icon="star">star</span>
              </div>
              <div>
                <p className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider text-[10px]">Favorite Venue</p>
                <p className="font-h3 text-h3 text-on-surface line-clamp-1">{favoriteVenue}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-xl p-md bg-primary text-on-primary rounded-lg border border-primary">
            <p className="font-body-sm text-body-sm mb-xs opacity-90">Current Level</p>
            <p className="font-h3 text-h3 mb-md">Amateur Athlete</p>
            <div className="w-full bg-on-primary/20 h-2 rounded-full overflow-hidden">
              <div className="bg-secondary-fixed h-full" style={{ width: `${Math.min(100, (totalBookingsCount / 5) * 100)}%` }}></div>
            </div>
            <p className="font-label-bold text-label-bold mt-sm text-right">{Math.max(0, 5 - totalBookingsCount)} more sessions to Semi-Pro</p>
          </div>
        </div>
      </aside>

      {/* Main Dashboard Content */}
      <section className="lg:col-span-8">
        <div className="flex flex-col gap-lg">
          {/* Header & Tabs */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-md border-b border-outline-variant pb-base">
            <div>
              <h1 className="font-h1 text-h1 text-primary">My Bookings</h1>
              <p className="font-body-md text-on-surface-variant">Manage your upcoming and past court sessions.</p>
            </div>
            <div className="flex gap-md overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setActiveTab('Upcoming')}
                className={`font-label-bold text-label-bold px-lg py-sm whitespace-nowrap transition-colors ${activeTab === 'Upcoming' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}
              >Upcoming</button>
              <button 
                onClick={() => setActiveTab('Past')}
                className={`font-label-bold text-label-bold px-lg py-sm whitespace-nowrap transition-colors ${activeTab === 'Past' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}
              >Past</button>
              <button 
                onClick={() => setActiveTab('Cancelled')}
                className={`font-label-bold text-label-bold px-lg py-sm whitespace-nowrap transition-colors ${activeTab === 'Cancelled' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}
              >Cancelled</button>
            </div>
          </div>

          {isLoading ? (
            <div className="py-xxl text-center">
              <p className="font-body-md text-outline">Loading bookings...</p>
            </div>
          ) : (
            <>
              {activeTab === 'Upcoming' && (
                <>
                  {UPCOMING_BOOKING ? (
                    <div className="bg-surface-container-lowest border-2 border-secondary-fixed rounded-xl overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-md transition-shadow">
                      <div className="md:w-64 h-48 md:h-auto overflow-hidden relative bg-surface-container-high">
                        <img className="w-full h-full object-cover" src={UPCOMING_BOOKING.venueId.images[0]?.url || "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop"} alt={UPCOMING_BOOKING.venueId.name} />
                        <div className="absolute top-md left-md">
                          <span className="bg-secondary-fixed text-on-secondary-fixed font-label-bold text-label-bold px-md py-xs rounded-full flex items-center gap-xs shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            {UPCOMING_BOOKING.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 p-lg flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-sm">
                            <h3 className="font-h3 text-h3 text-on-surface">{UPCOMING_BOOKING.venueId.name}</h3>
                            <p className="font-h3 text-h3 text-primary">Rs. {UPCOMING_BOOKING.totalCost}</p>
                          </div>
                          <div className="space-y-xs mb-lg">
                            <div className="flex items-center gap-sm text-on-surface-variant">
                              <span className="material-symbols-outlined text-[18px]" data-icon="calendar_today">calendar_today</span>
                              <span className="font-body-md">{format(new Date(UPCOMING_BOOKING.slotId.startTime), 'EEEE, MMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-sm text-on-surface-variant">
                              <span className="material-symbols-outlined text-[18px]" data-icon="schedule">schedule</span>
                              <span className="font-body-md">{format(new Date(UPCOMING_BOOKING.slotId.startTime), 'HH:mm')} - {format(new Date(UPCOMING_BOOKING.slotId.endTime), 'HH:mm')}</span>
                            </div>
                            <div className="flex items-center gap-sm text-on-surface-variant">
                              <span className="material-symbols-outlined text-[18px]" data-icon="location_on">location_on</span>
                              <span className="font-body-md">{UPCOMING_BOOKING.venueId.location?.address}, {UPCOMING_BOOKING.venueId.location?.city}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-md">
                          <button className="bg-primary text-on-primary font-button text-button px-lg py-md rounded-lg flex items-center gap-sm flex-1 justify-center md:flex-none hover:opacity-90 transition-opacity">
                            <span className="material-symbols-outlined text-[20px]" data-icon="directions">directions</span>
                            Get Directions
                          </button>
                          <button className="border-2 border-outline text-on-surface-variant hover:border-error hover:text-error font-button text-button px-lg py-md rounded-lg flex-1 justify-center md:flex-none transition-colors">
                            Cancel Session
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-xxl text-center opacity-60">
                      <span className="material-symbols-outlined text-4xl mb-2" data-icon="calendar_today">calendar_today</span>
                      <p className="font-body-md">You have no upcoming bookings.</p>
                    </div>
                  )}

                  {upcomingBookings.length > 1 && (
                    <div className="mt-lg">
                      <h2 className="font-h3 text-h3 text-on-surface-variant opacity-60 mb-md">Other Upcoming Bookings</h2>
                      <div className="flex flex-col gap-4">
                        {upcomingBookings.slice(1).map((booking) => (
                          <div key={booking._id} className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-all">
                            <div className="md:w-48 h-32 md:h-auto overflow-hidden relative bg-surface-container-high">
                              <img className="w-full h-full object-cover" src={booking.venueId.images[0]?.url || "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop"} alt={booking.venueId.name} />
                            </div>
                            <div className="flex-1 p-md flex flex-col md:flex-row justify-between items-center gap-md">
                              <div className="w-full md:w-auto text-left">
                                <h4 className="font-label-bold text-label-bold text-on-surface">{booking.venueId.name}</h4>
                                <p className="font-body-sm text-body-sm text-on-surface-variant">{format(new Date(booking.slotId.startTime), 'EEEE, MMM d, HH:mm')}</p>
                                <p className="font-label-bold text-label-bold text-secondary mt-xs flex items-center gap-xs">
                                  <span className="material-symbols-outlined text-[14px]" data-icon="check_circle">check_circle</span>
                                  {booking.status}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'Past' && (
                <>
                  {pastBookings.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {pastBookings.map((booking) => (
                        <div key={booking._id} className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden flex flex-col md:flex-row opacity-80 grayscale-[0.2] hover:grayscale-0 hover:opacity-100 transition-all">
                          <div className="md:w-48 h-32 md:h-auto overflow-hidden relative bg-surface-container-high">
                            <img className="w-full h-full object-cover" src={booking.venueId.images[0]?.url || "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop"} alt={booking.venueId.name} />
                          </div>
                          <div className="flex-1 p-md flex flex-col md:flex-row justify-between items-center gap-md">
                            <div className="w-full md:w-auto text-left">
                              <h4 className="font-label-bold text-label-bold text-on-surface">{booking.venueId.name}</h4>
                              <p className="font-body-sm text-body-sm text-on-surface-variant">{format(new Date(booking.slotId.startTime), 'EEEE, MMM d, HH:mm')}</p>
                              <p className="font-label-bold text-label-bold text-secondary mt-xs flex items-center gap-xs">
                                <span className="material-symbols-outlined text-[14px]" data-icon="history">history</span>
                                Completed
                              </p>
                            </div>
                            <div className="flex gap-sm w-full md:w-auto">
                              <button className="bg-secondary-container text-on-secondary-container hover:brightness-95 transition-all font-button text-button px-md py-sm rounded-lg flex-1 md:flex-none">Rebook</button>
                              <button 
                                onClick={() => { setSelectedBooking(booking); setReviewModalOpen(true); }}
                                className="bg-surface-container-highest text-on-surface-variant hover:text-primary transition-colors font-button text-button px-md py-sm rounded-lg flex-1 md:flex-none border border-outline-variant"
                              >
                                Leave Review
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-xxl text-center opacity-60">
                      <span className="material-symbols-outlined text-4xl mb-2" data-icon="history">history</span>
                      <p className="font-body-md">You have no past bookings.</p>
                    </div>
                  )}
                </>
              )}
              
              {activeTab === 'Cancelled' && (
                <>
                  {cancelledBookings.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {cancelledBookings.map((booking) => (
                        <div key={booking._id} className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden flex flex-col md:flex-row opacity-60 grayscale transition-all">
                          <div className="md:w-48 h-32 md:h-auto overflow-hidden relative bg-surface-container-high">
                            <img className="w-full h-full object-cover" src={booking.venueId.images[0]?.url || "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop"} alt={booking.venueId.name} />
                          </div>
                          <div className="flex-1 p-md flex flex-col md:flex-row justify-between items-center gap-md">
                            <div className="w-full md:w-auto text-left">
                              <h4 className="font-label-bold text-label-bold text-on-surface">{booking.venueId.name}</h4>
                              <p className="font-body-sm text-body-sm text-on-surface-variant">{format(new Date(booking.slotId.startTime), 'EEEE, MMM d, HH:mm')}</p>
                              <p className="font-label-bold text-label-bold text-error mt-xs flex items-center gap-xs">
                                <span className="material-symbols-outlined text-[14px]" data-icon="cancel">cancel</span>
                                Cancelled
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-xxl text-center opacity-60">
                      <span className="material-symbols-outlined text-4xl mb-2" data-icon="block">block</span>
                      <p className="font-body-md">No cancelled bookings found.</p>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </section>

      {/* Review Modal */}
      {reviewModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in px-4">
          <div className="bg-surface rounded-xl shadow-2xl p-6 w-full max-w-sm animate-scale-in border border-outline-variant">
            <h3 className="font-h3 text-h3 text-on-surface mb-2">Leave a Review</h3>
            <p className="font-body-sm text-on-surface-variant mb-6">Rate your experience at {selectedBooking.venueId.name}</p>
            
            <div className="mb-4">
              <label className="font-label-bold text-label-bold text-on-surface mb-2 block">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)}>
                    <span 
                      className={`material-symbols-outlined text-3xl ${star <= rating ? "text-tertiary" : "text-outline-variant"}`}
                      style={{ fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0" }}
                    >star</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="font-label-bold text-label-bold text-on-surface mb-2 block">Comment</label>
              <textarea 
                rows={3} 
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 font-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="How was the turf and facilities?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setReviewModalOpen(false)} className="border-2 border-outline-variant text-on-surface-variant font-button text-button px-md py-sm rounded-lg w-full hover:bg-surface-container-high transition-colors">Cancel</button>
              <button 
                onClick={handleReviewSubmit} 
                disabled={isSubmitting}
                className="bg-primary text-on-primary font-button text-button px-md py-sm rounded-lg w-full hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
