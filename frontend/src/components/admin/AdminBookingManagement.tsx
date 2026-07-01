import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Filter, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function AdminBookingManagement() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [dateFilter]);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const url = dateFilter ? `/admin/bookings?date=${dateFilter}` : '/admin/bookings';
      const res = await api.get(url);
      setBookings(res.data.data);
    } catch (err) {
      toast.error('Failed to fetch bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverride = async (id: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to mark this booking as ${newStatus}?`)) return;
    try {
      await api.put(`/admin/bookings/${id}/status`, { status: newStatus });
      toast.success(`Booking ${newStatus} successfully`);
      fetchBookings();
    } catch (err) {
      toast.error('Failed to override booking status');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-text">Booking Management</h2>
        <div className="flex gap-2 items-center">
          <Filter size={16} className="text-cool-grey" />
          <input 
            type="date" 
            className="input h-9 text-sm"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
          />
          {dateFilter && (
            <button onClick={() => setDateFilter('')} className="text-xs text-primary font-semibold hover:underline">
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="card bg-white border border-gray-200 rounded-[12px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-cool-grey font-semibold">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Venue</th>
                <th className="px-4 py-3">Slot</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No bookings found for the selected criteria.</td></tr>
              ) : (
                bookings.map(booking => (
                  <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-text">{booking.userId?.fullName || 'Unknown User'}</div>
                      <div className="text-xs text-cool-grey">{booking.userId?.phone}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-text">{booking.venueId?.name || 'Unknown Venue'}</td>
                    <td className="px-4 py-3 text-cool-grey">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon size={12} />
                        {booking.slotId ? new Date(booking.slotId.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${
                        booking.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                        booking.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {booking.status !== 'Confirmed' && (
                        <button onClick={() => handleOverride(booking._id, 'Confirmed')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 transition-colors bg-white rounded shadow-sm border border-emerald-200">
                          <CheckCircle size={14} />
                        </button>
                      )}
                      {booking.status !== 'Cancelled' && (
                        <button onClick={() => handleOverride(booking._id, 'Cancelled')} className="p-1.5 text-red-600 hover:bg-red-50 transition-colors bg-white rounded shadow-sm border border-red-200">
                          <XCircle size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
