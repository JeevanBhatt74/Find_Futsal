import { useState, useEffect } from 'react'
import { Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { LayoutGrid, Settings, ArrowLeft, Users, CreditCard, Calendar as CalendarIcon, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import AdminVenueManagement from '@/components/admin/AdminVenueManagement'
import AdminBookingManagement from '@/components/admin/AdminBookingManagement'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  // Determine active tab from URL path
  const currentPath = location.pathname
  const activeTab = currentPath === '/admin/venues' ? 'venues' :
                    currentPath === '/admin/bookings' ? 'bookings' : 'overview'

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats')
        setStats(response.data.data)
      } catch (err) {
        toast.error('Failed to load admin stats')
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="page-container py-10 max-w-5xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-1.5 text-cool-grey hover:text-slate-text text-sm font-semibold mb-6 no-underline">
        <ArrowLeft size={16} />
        Back to Home
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-bold text-slate-text mb-2">Admin Dashboard</h1>
          <p className="body-regular">Manage venues, bookings, and view platform analytics.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 space-x-6">
        <button 
          onClick={() => navigate('/admin')}
          className={`pb-3 font-semibold text-sm transition-colors relative ${activeTab === 'overview' ? 'text-primary' : 'text-cool-grey hover:text-slate-text'}`}
        >
          <div className="flex items-center gap-2"><LayoutGrid size={16} /> Overview</div>
          {activeTab === 'overview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
        </button>
        <button 
          onClick={() => navigate('/admin/venues')}
          className={`pb-3 font-semibold text-sm transition-colors relative ${activeTab === 'venues' ? 'text-primary' : 'text-cool-grey hover:text-slate-text'}`}
        >
          <div className="flex items-center gap-2"><MapPin size={16} /> Venues</div>
          {activeTab === 'venues' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
        </button>
        <button 
          onClick={() => navigate('/admin/bookings')}
          className={`pb-3 font-semibold text-sm transition-colors relative ${activeTab === 'bookings' ? 'text-primary' : 'text-cool-grey hover:text-slate-text'}`}
        >
          <div className="flex items-center gap-2"><CalendarIcon size={16} /> Bookings</div>
          {activeTab === 'bookings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
        </button>
      </div>

      {/* Main Content Area */}
      <div>
        <Routes>
          <Route path="/" element={
            <div className="animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="card p-4 bg-white border border-gray-150 rounded-[12px] shadow-sm flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-cool-grey font-bold text-xs uppercase tracking-wider">
                    <Users size={16} /> Total Users
                  </div>
                  <h3 className="text-2xl font-bold text-slate-text">{isLoading ? '...' : stats?.metrics?.totalUsers || 0}</h3>
                </div>
                <div className="card p-4 bg-white border border-gray-150 rounded-[12px] shadow-sm flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-cool-grey font-bold text-xs uppercase tracking-wider">
                    <CalendarIcon size={16} /> Total Bookings
                  </div>
                  <h3 className="text-2xl font-bold text-slate-text">{isLoading ? '...' : stats?.metrics?.totalBookings || 0}</h3>
                </div>
                <div className="card p-4 bg-white border border-gray-150 rounded-[12px] shadow-sm flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-cool-grey font-bold text-xs uppercase tracking-wider">
                    <LayoutGrid size={16} /> Active Venues
                  </div>
                  <h3 className="text-2xl font-bold text-slate-text">{isLoading ? '...' : stats?.metrics?.totalVenues || 0}</h3>
                </div>
                <div className="card p-4 bg-white border border-gray-150 rounded-[12px] shadow-sm flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                    <CreditCard size={16} /> Revenue
                  </div>
                  <h3 className="text-2xl font-bold text-primary">Rs. {isLoading ? '...' : (stats?.metrics?.totalRevenue || 0).toLocaleString()}</h3>
                </div>
              </div>

              {stats?.recentUsers && stats.recentUsers.length > 0 && (
                <div className="card p-6 bg-white border border-gray-150 rounded-[12px] shadow-sm mb-6">
                  <h2 className="text-[18px] font-bold text-slate-text border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                    <Settings size={18} className="text-primary" /> Recent Signups
                  </h2>
                  <div className="space-y-3">
                    {stats.recentUsers.map((u: any) => (
                      <div key={u._id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-[8px] transition-colors border border-transparent hover:border-gray-100">
                        <div>
                          <div className="font-bold text-slate-text text-sm">{u.fullName}</div>
                          <div className="text-xs text-cool-grey">{u.email}</div>
                        </div>
                        <div className="text-xs font-semibold text-cool-grey bg-gray-100 px-2 py-1 rounded">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          } />
          <Route path="/venues" element={<AdminVenueManagement />} />
          <Route path="/bookings" element={<AdminBookingManagement />} />
        </Routes>
      </div>
    </div>
  )
}
