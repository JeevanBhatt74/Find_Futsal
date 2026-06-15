import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Clock, MapPin, CreditCard, AlertCircle, ChevronRight } from 'lucide-react'
import { useBookingStore, useAuthStore } from '@/store'
import { useBookingMutations } from '@/hooks/useBooking'
import LockCountdownTimer from '@/components/slots/LockCountdownTimer'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const STEPS = ['Confirm Slot', 'Payment', 'Confirmation']

export default function BookingPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { selectedVenue, selectedSlot, bookingStep, setBookingStep, resetBooking } = useBookingStore()
  const { confirmBookingMutation } = useBookingMutations()
  
  // Prefill details with signed-in user credentials for seamless UX
  const [formData, setFormData] = useState({
    name: user?.fullName ?? '',
    phone: user?.phone ?? '',
    notes: '',
  })

  if (!selectedVenue || !selectedSlot) {
    return (
      <div className="page-container py-20 text-center animate-scale-in">
        <AlertCircle size={40} className="text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-text mb-2">No slot selected</h2>
        <p className="text-gray-400 mb-6">Please select a venue and time slot before booking.</p>
        <button onClick={() => navigate('/venues')} className="btn-primary">Browse Venues</button>
      </div>
    )
  }

  const handleConfirm = async () => {
    if (!formData.name || !formData.phone) {
      toast.error('Please enter your contact name and phone number.')
      return
    }

    // Nepal phone validation
    const nepalPhoneRegex = /^(\+977|977)?[9][678]\d{8}$/
    if (!nepalPhoneRegex.test(formData.phone)) {
      toast.error('Please enter a valid Nepali contact phone number (e.g. 98XXXXXXXX).')
      return
    }

    try {
      await confirmBookingMutation.mutateAsync({
        slotId: selectedSlot._id,
        fullName: formData.name,
        phone: formData.phone,
        notes: formData.notes || undefined,
      })
      
      setBookingStep('success')
      toast.success('Booking confirmed! Check your phone for details.')
    } catch (error: any) {
      const errMsg = error.response?.data?.message ?? 'Could not confirm booking. Your hold might have expired.'
      toast.error(errMsg)
    }
  }

  const isProcessing = confirmBookingMutation.isPending

  if (bookingStep === 'success') {
    return (
      <div className="page-container py-20 max-w-xl mx-auto text-center animate-scale-in">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6 animate-bounce-soft">
          <CheckCircle2 size={40} className="text-emerald-500" />
        </div>
        <h1 className="text-3xl font-display font-bold text-slate-text mb-3">Booking Confirmed!</h1>
        <p className="text-gray-500 mb-8">
          Your slot at <strong>{selectedVenue.name}</strong> is secured.
          A confirmation details slip has been registered for <strong>{formData.phone}</strong>.
        </p>
        <div className="card p-5 text-left mb-8 shadow-md">
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center gap-3 text-slate-text">
              <MapPin size={15} className="text-emerald-500 shrink-0" />
              <span>{selectedVenue.location.address}, {selectedVenue.location.city}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-text">
              <Clock size={15} className="text-emerald-500 shrink-0" />
              <span>
                {format(new Date(selectedSlot.startTime), 'EEEE, MMM d · h:mm a')} –{' '}
                {format(new Date(selectedSlot.endTime), 'h:mm a')}
              </span>
            </div>
            <div className="flex items-center gap-3 text-slate-text">
              <CreditCard size={15} className="text-emerald-500 shrink-0" />
              <span>NPR {selectedSlot.baseCost.toLocaleString()} paid (Pay at Counter)</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={() => { resetBooking(); navigate('/venues') }} className="btn-primary">
            Book Another Court
          </button>
          <button onClick={() => { resetBooking(); navigate('/') }} className="btn-secondary">
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container py-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-display font-bold text-slate-text mb-2">Complete Your Booking</h1>
      
      {/* ── Real-time Slot Expiry Countdown Timer ── */}
      <LockCountdownTimer />

      {/* ⚠️ Persistent Warning Banner */}
      <div className="mb-6 p-4 rounded-[8px] bg-alert-warning-bg border border-amber-200 flex gap-3 items-start animate-fade-in shadow-sm">
        <AlertCircle size={20} className="text-alert-warning-text shrink-0 mt-0.5" />
        <div>
          <h4 className="text-[14px] font-bold text-alert-warning-text mb-0.5">⚠️ Deposit Required</h4>
          <p className="text-xs text-alert-warning-text leading-relaxed font-medium">
            Pay Rs. 500 now via integrated wallet to prevent instant slot drop. The remaining amount can be paid at the counter.
          </p>
        </div>
      </div>

      {/* ── Step Indicator ──────────────────────────────────────────────── */}
      <div className="flex items-center mb-10">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300 ${
                i === 0 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${i === 0 ? 'font-medium text-slate-text' : 'text-gray-400'}`}>
                {step}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <ChevronRight size={16} className="text-gray-200 mx-2 flex-1 sm:flex-none" />
            )}
          </div>
        ))}
      </div>

      {/* ── Booking Summary ──────────────────────────────────────────────── */}
      <div className="card p-5 mb-6 border-l-4 border-l-primary shadow-sm bg-white">
        <h2 className="font-semibold text-slate-text mb-3">Booking Summary</h2>
        <div className="flex flex-col gap-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Venue</span>
            <span className="font-medium text-slate-text">{selectedVenue.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Location</span>
            <span className="text-slate-text">{selectedVenue.location.city}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Date & Time</span>
            <span className="text-slate-text">
              {format(new Date(selectedSlot.startTime), 'MMM d, h:mm a')} –{' '}
              {format(new Date(selectedSlot.endTime), 'h:mm a')}
            </span>
          </div>
          <div className="divider !my-2" />
          <div className="flex justify-between font-semibold text-base">
            <span className="text-slate-text">Total</span>
            <span className="text-primary font-bold">NPR {selectedSlot.baseCost.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* ── Contact Form ─────────────────────────────────────────────────── */}
      <div className="card p-6 mb-6 shadow-sm bg-white">
        <h2 className="font-semibold text-slate-text mb-6">Your Contact Details</h2>
        <div className="flex flex-col gap-5">
          <div className="floating-label-group">
            <input
              id="booking-name"
              type="text"
              className="floating-input"
              placeholder="Full Name"
              value={formData.name}
              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
              required
            />
            <label htmlFor="booking-name" className="floating-label">Full Name *</label>
          </div>
          
          <div className="floating-label-group">
            <input
              id="booking-phone"
              type="tel"
              className="floating-input"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
              required
            />
            <label htmlFor="booking-phone" className="floating-label">Phone Number * (+977)</label>
          </div>

          <div className="floating-label-group">
            <textarea
              id="booking-notes"
              rows={3}
              className="floating-input resize-none h-24"
              placeholder="Special Requests"
              value={formData.notes}
              onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
            />
            <label htmlFor="booking-notes" className="floating-label">Special Requests (optional)</label>
          </div>
        </div>
      </div>

      {/* ── Action Buttons ────────────────────────────────────────────────── */}
      <div className="flex gap-3">
        <button onClick={() => navigate(-1)} className="btn-secondary flex-1" disabled={isProcessing}>
          Back
        </button>
        <button
          onClick={handleConfirm}
          disabled={isProcessing}
          className="btn-primary flex-1 btn-lg"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2 justify-center">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Securing Booking…
            </span>
          ) : (
            <>
              <CreditCard size={17} />
              Confirm Booking
            </>
          )}
        </button>
      </div>
      <p className="text-xs text-center text-gray-400 mt-4 font-medium">
        By confirming, you agree to our <a href="/terms" className="text-emerald-600 hover:underline">Terms of Service</a> and cancellation policy.
      </p>
    </div>
  )
}
