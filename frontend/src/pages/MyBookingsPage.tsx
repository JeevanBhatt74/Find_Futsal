import { Link } from 'react-router-dom'
import { Calendar, Clock, MapPin, Award, ArrowLeft, ChevronRight, Play } from 'lucide-react'
import { format } from 'date-fns'

const MOCK_PAST_BOOKINGS = [
  {
    id: 'B-8802',
    venueName: 'Velodrome Futsal Arena',
    location: 'Lalitpur, Nepal',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    time: '6:00 PM - 7:00 PM',
    cost: 'Rs. 1,500',
    status: 'Completed',
    teamSize: '5v5 Match',
  },
  {
    id: 'B-7401',
    venueName: 'The Royal Turf',
    location: 'Kathmandu, Nepal',
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    time: '8:00 AM - 9:00 AM',
    cost: 'Rs. 1,200',
    status: 'Completed',
    teamSize: '6v6 Match',
  }
]

export default function MyBookingsPage() {
  return (
    <div className="page-container py-10 max-w-4xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-1.5 text-cool-grey hover:text-slate-text text-sm font-semibold mb-6 no-underline">
        <ArrowLeft size={16} />
        Back to Home
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-bold text-slate-text mb-2">My Futsal Bookings</h1>
          <p className="body-regular">Check your active reservations, game history, and match achievements.</p>
        </div>
        
        {/* Quick Stats Grid */}
        <div className="flex gap-4">
          <div className="card px-4 py-3 bg-white border border-gray-100 flex items-center gap-3 shadow-xs rounded-[8px]">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <p className="text-[11px] font-bold text-cool-grey uppercase tracking-wider">Matches Played</p>
              <h4 className="text-[16px] font-bold text-slate-text mt-0.5">Active History</h4>
            </div>
          </div>
          <div className="card px-4 py-3 bg-white border border-gray-100 flex items-center gap-3 shadow-xs rounded-[8px]">
            <div className="w-10 h-10 rounded-full bg-alert-success-bg text-alert-success-text flex items-center justify-center">
              <Award size={18} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-cool-grey uppercase tracking-wider">Player Level</p>
              <h4 className="text-[16px] font-bold text-slate-text mt-0.5">Amateur Semi-Pro</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Active bookings label */}
        <h3 className="text-[18px] font-bold text-slate-text border-b border-gray-100 pb-3">Booking Performance Summary</h3>

        {MOCK_PAST_BOOKINGS.length === 0 ? (
          <div className="card p-10 text-center bg-white border border-gray-100">
            <Award size={40} className="text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-slate-text mb-2">No bookings found</h4>
            <p className="body-regular mb-6">You haven't booked any slots yet. Start your first match today!</p>
            <Link to="/venues" className="btn-primary no-underline inline-block">Book a Court</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {MOCK_PAST_BOOKINGS.map((booking) => (
              <div key={booking.id} className="card p-5 bg-white border border-gray-100 hover:border-primary-hover shadow-sm transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-[8px]">
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-[8px] bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Play size={20} fill="currentColor" className="ml-0.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-[16px] font-bold text-slate-text">{booking.venueName}</h4>
                      <span className="badge badge-available !text-[10px] uppercase font-bold px-2 py-0.5">{booking.teamSize}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-cool-grey mt-2">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar size={12} className="text-primary" /> {format(booking.date, 'MMMM dd, yyyy')}
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Clock size={12} className="text-primary" /> {booking.time}
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin size={12} className="text-primary" /> {booking.location}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-5 border-t border-gray-50 md:border-t-0 pt-3 md:pt-0">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-cool-grey uppercase tracking-wider">Amount Paid</p>
                    <h4 className="text-[16px] font-bold text-primary">{booking.cost}</h4>
                  </div>
                  <span className="px-3 py-1 rounded-[8px] bg-alert-success-bg text-alert-success-text text-xs font-semibold">
                    {booking.status}
                  </span>
                  <ChevronRight size={18} className="text-gray-300 hidden md:block" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
