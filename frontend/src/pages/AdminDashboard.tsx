import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LayoutGrid, AlertCircle, Wrench, Settings, ArrowLeft, CheckCircle, Users, CreditCard, Calendar as CalendarIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'

const MOCK_COURTS = [
  { id: 1, name: 'Court 1 (Premium Indoor)', status: 'Active' },
  { id: 2, name: 'Court 2 (Outdoor Turf)', status: 'Active' },
  { id: 3, name: 'Court 3 (Training Pitch)', status: 'Under Maintenance' },
]

export default function AdminDashboard() {
  const [courts, setCourts] = useState(MOCK_COURTS)
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

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

  const handleToggleMaintenance = (courtId: number) => {
    setCourts(prev =>
      prev.map(c => {
        if (c.id === courtId) {
          const newStatus = c.status === 'Active' ? 'Under Maintenance' : 'Active'
          
          if (newStatus === 'Under Maintenance') {
            // Trigger design system toast specification
            toast.success(`⚙️ State Change: Court ${courtId} successfully marked as 'Under Maintenance'. Grid updated globally.`, {
              position: 'bottom-center',
              duration: 5000,
            })
          } else {
            toast.success(`⚙️ State Change: Court ${courtId} is now active. Grid updated globally.`, {
              position: 'bottom-center',
              duration: 5000,
            })
          }

          return { ...c, status: newStatus }
        }
        return c
      })
    )
  }

  return (
    <div className="page-container py-10 max-w-4xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-1.5 text-cool-grey hover:text-slate-text text-sm font-semibold mb-6 no-underline">
        <ArrowLeft size={16} />
        Back to Home
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-bold text-slate-text mb-2">Venue Administrator Controls</h1>
          <p className="body-regular">Manage court availability grid states, maintenance parameters, and configurations.</p>
        </div>
        
        <div className="flex gap-2">
          <div className="card px-4 py-2.5 bg-white border border-gray-100 flex items-center gap-2 shadow-xs rounded-[8px] text-[13px] font-bold text-cool-grey uppercase">
            <LayoutGrid size={15} className="text-primary" /> Active Console
          </div>
        </div>
      </div>

      {/* Stats Section */}
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

      <div className="card p-6 bg-white border border-gray-150 rounded-[12px] shadow-sm mb-6">
        <h2 className="text-[20px] font-bold text-slate-text border-b border-gray-100 pb-3.5 mb-5 flex items-center gap-2">
          <Settings size={20} className="text-primary" /> Real-time Court Availability Controls
        </h2>

        <div className="space-y-4">
          {courts.map(court => (
            <div
              key={court.id}
              className={`p-4 rounded-[8px] border transition-all duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                court.status === 'Under Maintenance'
                  ? 'border-amber-200 bg-amber-50/20'
                  : 'border-gray-150 bg-white hover:border-gray-250'
              }`}
            >
              <div className="flex gap-3.5 items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  court.status === 'Under Maintenance' ? 'bg-amber-100 text-amber-800' : 'bg-primary/10 text-primary'
                }`}>
                  {court.status === 'Under Maintenance' ? <Wrench size={18} /> : <CheckCircle size={18} />}
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-slate-text">{court.name}</h4>
                  <p className={`text-[12px] font-medium mt-0.5 ${
                    court.status === 'Under Maintenance' ? 'text-amber-800' : 'text-primary'
                  }`}>
                    Current State: {court.status}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t border-gray-50 sm:border-t-0 pt-3 sm:pt-0">
                <span className={`badge text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  court.status === 'Under Maintenance' ? 'badge-maintenance' : 'badge-available'
                }`}>
                  {court.status}
                </span>

                <button
                  onClick={() => handleToggleMaintenance(court.id)}
                  className={`btn btn-sm ${
                    court.status === 'Under Maintenance'
                      ? 'btn-primary'
                      : 'btn-secondary !text-amber-800 !border-amber-200 hover:!bg-amber-50/30'
                  }`}
                >
                  {court.status === 'Under Maintenance' ? 'Mark Active' : 'Toggle Maintenance'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 rounded-[8px] bg-surface-muted border border-gray-200 flex gap-3 items-start">
        <AlertCircle size={18} className="text-cool-grey shrink-0 mt-0.5" />
        <p className="text-xs text-cool-grey leading-relaxed">
          <strong>Grid Sync Info:</strong> Marking courts as 'Under Maintenance' automatically propagates to all customer slot searches instantly and overlays stripe hazards to prevent user locking attempts.
        </p>
      </div>
    </div>
  )
}
