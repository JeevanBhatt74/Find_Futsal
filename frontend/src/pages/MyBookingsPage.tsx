import { useState } from 'react'
import { useSubmitReview } from '@/hooks/useReviews'
import toast from 'react-hot-toast'

const UPCOMING_BOOKING = {
  id: 'B-9900',
  venueName: 'The Arena Pro — Court 1',
  location: 'Downtown Sports District, BLK 4',
  date: 'Saturday, Oct 24, 2024',
  time: '19:00 - 20:30 (90 mins)',
  cost: '$60.00',
  status: 'Confirmed',
  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRTS6HF39EfFcgXSbyUW8MSoWh1PSqbJclMzJ05j9kVe_8MgoY5kf25lS4AhxUm5GrsGQgms1bua1lcBvVa3mCG3LRcdaTYTb2iQQAmJ3MuGa3qXXW-JkgVMAsMDvvR4YYgYZfUuvZ5wESaCXcBzNnV0-OHx8JeKV4aAaOP6P-0eq5aX-5Op8IyjpmU0Isn2GMO40zNcYVZlokxjomh5xF8z7-HPPf3fT4xH2A4R8VYyfkauStZm6mnNpKO5dlYTvhPWeQcDXNDD8'
}

const MOCK_PAST_BOOKINGS = [
  {
    id: 'B-8802',
    venueId: '66779fdfa6f7b134d4a8e23a',
    venueName: 'Westside Community Court',
    timeStr: 'Sunday, Oct 18 • 10:00 AM',
    status: 'Completed',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_O_D5lqMa92iuDg1nGSUjw6yJEnxfCQ5jt1p0ypuH4Lo04DnbMeb8IPswKeo1ASJw3hcvb29N2zDQlmpt8bTrRacIKvHBG3N6l5Mn9-zLN2eP1Muu_ChbS6ztzawCHgFtj2RP8NQ6zb3LvA8_dlX40rl02pdKkI3GL3-B1OkFqwctZXGcY54KDkOo47VGGWHh203rAlXpHVyD7I1DzoiXqZWY1HqPE-VLXjOQFjMYt2_BCbcKyg-sef_cYXioGgAR5qeRoWb6kWs'
  },
  {
    id: 'B-7401',
    venueId: '66779fdfa6f7b134d4a8e23b',
    venueName: 'Skyway Rooftop Pitch',
    timeStr: 'Wednesday, Oct 14 • 20:00 PM',
    status: 'Completed',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_DX1rVgZs8ewehnodA4KxdXrrENrCMsa8yhYAt48FjaoKoFlBxOhfascvt0Xl7sOpcc4ZoY_mIbm0uG-_hGo-PA-OjetSL-_Ju06yrZx1Hc8MWPvkESofXpTcDxJWwqoFb9FB13J--uwJPKGTQPJ-YmZ_5MUu34m2ySjKUv_sm-EAAmWKvMumEDvQw1u_K_NhQ_gd2hZN_MpQVaP_99-YPIcOt---sWlMyfQ5xRzqClSleuzMYGK5UL0t4RHd-4q5kLP_I8O4JbE'
  }
]

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState('Upcoming')
  
  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const { mutateAsync: submitReview, isPending: isSubmitting } = useSubmitReview()

  const handleReviewSubmit = async () => {
    try {
      await submitReview({
        venueId: selectedBooking.venueId,
        bookingId: selectedBooking.id,
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
                <p className="font-h3 text-h3 text-on-surface">24 Sessions</p>
              </div>
            </div>
            {/* Stat Card 2 */}
            <div className="flex items-center p-md bg-surface-container-low rounded-lg border border-outline-variant/30">
              <div className="w-12 h-12 bg-secondary text-on-secondary rounded-full flex items-center justify-center mr-md shadow-sm">
                <span className="material-symbols-outlined" data-icon="payments">payments</span>
              </div>
              <div>
                <p className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider text-[10px]">Total Spent</p>
                <p className="font-h3 text-h3 text-on-surface">$1,420.00</p>
              </div>
            </div>
            {/* Stat Card 3 */}
            <div className="flex items-center p-md bg-surface-container-low rounded-lg border border-outline-variant/30">
              <div className="w-12 h-12 bg-tertiary text-on-tertiary rounded-full flex items-center justify-center mr-md shadow-sm">
                <span className="material-symbols-outlined" data-icon="star">star</span>
              </div>
              <div>
                <p className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider text-[10px]">Favorite Venue</p>
                <p className="font-h3 text-h3 text-on-surface">The Arena Pro</p>
              </div>
            </div>
          </div>
          
          <div className="mt-xl p-md bg-primary text-on-primary rounded-lg border border-primary">
            <p className="font-body-sm text-body-sm mb-xs opacity-90">Current Level</p>
            <p className="font-h3 text-h3 mb-md">Semi-Pro Athlete</p>
            <div className="w-full bg-on-primary/20 h-2 rounded-full overflow-hidden">
              <div className="bg-secondary-fixed h-full w-[75%]"></div>
            </div>
            <p className="font-label-bold text-label-bold mt-sm text-right">3 more sessions to Pro</p>
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

          {activeTab === 'Upcoming' && (
            <>
              {/* Upcoming Card */}
              <div className="bg-surface-container-lowest border-2 border-secondary-fixed rounded-xl overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-md transition-shadow">
                <div className="md:w-64 h-48 md:h-auto overflow-hidden relative">
                  <img className="w-full h-full object-cover" src={UPCOMING_BOOKING.image} alt={UPCOMING_BOOKING.venueName} />
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
                      <h3 className="font-h3 text-h3 text-on-surface">{UPCOMING_BOOKING.venueName}</h3>
                      <p className="font-h3 text-h3 text-primary">{UPCOMING_BOOKING.cost}</p>
                    </div>
                    <div className="space-y-xs mb-lg">
                      <div className="flex items-center gap-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px]" data-icon="calendar_today">calendar_today</span>
                        <span className="font-body-md">{UPCOMING_BOOKING.date}</span>
                      </div>
                      <div className="flex items-center gap-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px]" data-icon="schedule">schedule</span>
                        <span className="font-body-md">{UPCOMING_BOOKING.time}</span>
                      </div>
                      <div className="flex items-center gap-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px]" data-icon="location_on">location_on</span>
                        <span className="font-body-md">{UPCOMING_BOOKING.location}</span>
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
            </>
          )}

          {(activeTab === 'Upcoming' || activeTab === 'Past') && (
            <>
              {/* Recent History Section */}
              <div className="mt-lg">
                <h2 className="font-h3 text-h3 text-on-surface-variant opacity-60">{activeTab === 'Past' ? 'All History' : 'Recent History'}</h2>
              </div>
              
              {/* Past Cards */}
              <div className="flex flex-col gap-4">
                {MOCK_PAST_BOOKINGS.map((booking) => (
                  <div key={booking.id} className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden flex flex-col md:flex-row opacity-80 grayscale-[0.2] hover:grayscale-0 hover:opacity-100 transition-all">
                    <div className="md:w-48 h-32 md:h-auto overflow-hidden relative">
                      <img className="w-full h-full object-cover" src={booking.image} alt={booking.venueName} />
                    </div>
                    <div className="flex-1 p-md flex flex-col md:flex-row justify-between items-center gap-md">
                      <div className="w-full md:w-auto text-left">
                        <h4 className="font-label-bold text-label-bold text-on-surface">{booking.venueName}</h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{booking.timeStr}</p>
                        <p className="font-label-bold text-label-bold text-secondary mt-xs flex items-center gap-xs">
                          <span className="material-symbols-outlined text-[14px]" data-icon="check_circle">check_circle</span>
                          {booking.status}
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
            </>
          )}
          
          {activeTab === 'Cancelled' && (
            <div className="py-xxl text-center opacity-60">
               <span className="material-symbols-outlined text-4xl mb-2" data-icon="block">block</span>
               <p className="font-body-md">No cancelled bookings found.</p>
            </div>
          )}
        </div>
      </section>

      {/* Review Modal */}
      {reviewModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in px-4">
          <div className="bg-surface rounded-xl shadow-2xl p-6 w-full max-w-sm animate-scale-in border border-outline-variant">
            <h3 className="font-h3 text-h3 text-on-surface mb-2">Leave a Review</h3>
            <p className="font-body-sm text-on-surface-variant mb-6">Rate your experience at {selectedBooking.venueName}</p>
            
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
