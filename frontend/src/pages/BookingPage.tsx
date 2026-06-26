import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Clock, MapPin, CreditCard, AlertCircle, ChevronRight } from 'lucide-react'
import { useBookingStore, useAuthStore } from '@/store'
import { useBookingMutations } from '@/hooks/useBooking'
import LockCountdownTimer from '@/components/slots/LockCountdownTimer'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import clsx from 'clsx'

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

  const [showKhalti, setShowKhalti] = useState(false)
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'khalti' | 'mobile_banking'>('khalti')
  const [playerCount, setPlayerCount] = useState('10 (5-a-side)')

  const handleConfirm = async () => {
    if (!formData.name || !formData.phone) {
      toast.error('Please enter your contact name and phone number.')
      return
    }

    const nepalPhoneRegex = /^(\+977|977)?[9][678]\d{8}$/
    if (!nepalPhoneRegex.test(formData.phone)) {
      toast.error('Please enter a valid Nepali contact phone number (e.g. 98XXXXXXXX).')
      return
    }

    try {
      // Step 1: Create booking with pending status
      const response = await confirmBookingMutation.mutateAsync({
        slotId: selectedSlot._id,
        fullName: formData.name,
        phone: formData.phone,
        notes: formData.notes || undefined,
      })
      
      setCreatedBookingId(response.data._id)
      setShowKhalti(true) // Trigger Khalti Mock Popup
    } catch (error: any) {
      const errMsg = error.response?.data?.message ?? 'Could not initiate booking. Your hold might have expired.'
      toast.error(errMsg)
    }
  }

  const handleKhaltiSuccess = async () => {
    try {
      // Simulate network request for the dummy payment
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setShowKhalti(false)
      setBookingStep('success')
      toast.success('Payment successful! Booking confirmed.')
    } catch (error) {
      toast.error('Payment verification failed. Please contact support.')
    }
  }

  const isProcessing = confirmBookingMutation.isPending

  if (bookingStep === 'success') {
    const durationMins = Math.round((new Date(selectedSlot.endTime).getTime() - new Date(selectedSlot.startTime).getTime()) / 60000)
    const bookingRef = createdBookingId ? `FF-${createdBookingId.slice(-6).toUpperCase()}` : 'FF-8291-ZX'
    
    return (
      <div className="flex items-center justify-center px-margin py-xxl animate-scale-in w-full">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-lg">
          
          {/* Success Hero Section */}
          <div className="md:col-span-12 flex flex-col items-center text-center mb-md">
            <div className="w-24 h-24 bg-secondary-container rounded-full flex items-center justify-center mb-lg pulse-lime">
              <span className="material-symbols-outlined text-[48px] text-on-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
            <h1 className="font-h1 text-h1 text-primary mb-xs">Booking Confirmed!</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
              Get your gear ready. Your court is locked in and ready for kickoff.
            </p>
          </div>

          {/* Main Confirmation Card */}
          <div className="md:col-span-7 bg-surface-container-lowest rounded-xl border border-outline-variant p-xl shadow-sm text-left">
            <div className="flex justify-between items-start mb-xl">
              <div>
                <span className="font-label-bold text-label-bold text-primary uppercase tracking-wider">Booking Reference</span>
                <h2 className="font-h2 text-h2 mt-xs">{bookingRef}</h2>
              </div>
              <div className="bg-secondary-fixed text-on-secondary-fixed font-label-bold px-md py-xs rounded-full">
                PAID
              </div>
            </div>

            <div className="space-y-lg">
              <div className="flex gap-md items-center">
                <div className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined">sports_soccer</span>
                </div>
                <div>
                  <p className="font-label-bold text-label-bold text-on-surface-variant">Court</p>
                  <p className="font-body-md text-body-md font-bold">{selectedVenue.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-lg">
                <div className="flex gap-md items-center">
                  <div className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined">calendar_today</span>
                  </div>
                  <div>
                    <p className="font-label-bold text-label-bold text-on-surface-variant">Date</p>
                    <p className="font-body-md text-body-md font-bold">
                      {format(new Date(selectedSlot.startTime), 'EEEE, MMM d')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-md items-center">
                  <div className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined">schedule</span>
                  </div>
                  <div>
                    <p className="font-label-bold text-label-bold text-on-surface-variant">Time</p>
                    <p className="font-body-md text-body-md font-bold">
                      {format(new Date(selectedSlot.startTime), 'HH:mm')} - {format(new Date(selectedSlot.endTime), 'HH:mm')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-lg">
                <div className="flex gap-md items-center">
                  <div className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined">timer</span>
                  </div>
                  <div>
                    <p className="font-label-bold text-label-bold text-on-surface-variant">Duration</p>
                    <p className="font-body-md text-body-md font-bold">{durationMins} Minutes</p>
                  </div>
                </div>
                <div className="flex gap-md items-center">
                  <div className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                  <div>
                    <p className="font-label-bold text-label-bold text-on-surface-variant">Amount Paid</p>
                    <p className="font-body-md text-body-md font-bold">NPR 500</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-xl pt-lg border-t border-outline-variant flex items-start gap-md bg-primary-container/5 p-md rounded-lg">
              <span className="material-symbols-outlined text-primary shrink-0">notifications_active</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant text-left">
                <strong>Notice:</strong> You'll receive a push notification 1 hour before your game to ensure you and your team are ready.
              </p>
            </div>
          </div>

          {/* Side Actions & Map */}
          <div className="md:col-span-5 flex flex-col gap-lg text-left">
            {/* Location Card */}
            <div className="bg-surface-container rounded-xl overflow-hidden border border-outline-variant h-48 relative">
              <img 
                alt={`${selectedVenue.name} Location`} 
                className="w-full h-full object-cover grayscale-[20%]" 
                src={selectedVenue.images?.[0] || "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop"} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-md">
                <p className="text-white font-label-bold flex items-center gap-xs">
                  <span className="material-symbols-outlined text-sm shrink-0">location_on</span>
                  {selectedVenue.name}, {selectedVenue.location.city}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-md">
              <button className="w-full bg-secondary-container text-on-secondary-fixed py-md rounded-lg font-button text-button flex items-center justify-center gap-md hover:shadow-lg transition-all border-2 border-transparent">
                <span className="material-symbols-outlined shrink-0">calendar_add_on</span>
                Add to Calendar
              </button>
              <button onClick={() => navigate('/bookings')} className="w-full bg-white text-primary py-md rounded-lg font-button text-button flex items-center justify-center gap-md hover:bg-surface-container transition-all border-2 border-primary">
                <span className="material-symbols-outlined shrink-0">receipt_long</span>
                View Booking
              </button>
              <button onClick={() => { resetBooking(); navigate('/') }} className="w-full bg-primary text-on-primary py-md rounded-lg font-button text-button flex items-center justify-center gap-md hover:bg-primary-container transition-all shadow-md">
                <span className="material-symbols-outlined shrink-0">search</span>
                Book Another Court
              </button>
            </div>

            {/* Support Ticket */}
            <div className="mt-auto p-md border border-dashed border-outline rounded-lg flex items-center justify-between bg-surface-container-low/50">
              <div>
                <p className="font-label-bold text-label-bold text-on-surface">Need help?</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Modify or cancel booking</p>
              </div>
              <span className="material-symbols-outlined text-primary shrink-0">help</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const durationMins = Math.round((new Date(selectedSlot.endTime).getTime() - new Date(selectedSlot.startTime).getTime()) / 60000)

  return (
    <div className="max-w-7xl mx-auto px-margin py-xl lg:py-xxl w-full animate-fade-in">
      <div className="mb-xl">
        <h1 className="font-h1 text-h1 text-primary mb-xs">Review & Pay</h1>
        <p className="text-body-lg text-on-surface-variant">Confirm your squad and lock in the court.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-start">
        {/* Left Column: Form & Payment */}
        <div className="lg:col-span-7 space-y-xl">
          {/* Real-time Slot Expiry Countdown Timer */}
          <LockCountdownTimer />

          {/* Player Details Form */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
            <div className="flex items-center gap-base mb-lg">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>person</span>
              <h2 className="font-h3 text-h3 text-on-surface">Player Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="flex flex-col gap-xs">
                <label className="font-label-bold text-label-bold text-on-surface-variant">Full Name</label>
                <input 
                  className="border border-outline-variant rounded-lg px-md py-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none text-body-md" 
                  placeholder="e.g. Birat Thapa" 
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-bold text-label-bold text-on-surface-variant">Phone Number</label>
                <input 
                  className="border border-outline-variant rounded-lg px-md py-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none text-body-md" 
                  placeholder="+977 980 000 0000" 
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-bold text-label-bold text-on-surface-variant">Team Name (Optional)</label>
                <input 
                  className="border border-outline-variant rounded-lg px-md py-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none text-body-md" 
                  placeholder="e.g. Kathmandu Elites" 
                  type="text"
                  value={formData.notes}
                  onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-bold text-label-bold text-on-surface-variant">Player Count</label>
                <select 
                  className="border border-outline-variant rounded-lg px-md py-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none text-body-md bg-white"
                  value={playerCount}
                  onChange={e => setPlayerCount(e.target.value)}
                >
                  <option>10 (5-a-side)</option>
                  <option>12 (6-a-side)</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </section>

          {/* Payment Methods */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg relative overflow-hidden">
            {/* Warning Toast */}
            <div className="mb-lg bg-error-container text-on-error-container px-md py-sm rounded-lg flex items-start gap-sm border border-error/20">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>warning</span>
              <p className="text-body-sm font-semibold mt-0.5">Deposit Required: Pay Rs. 500 now via integrated wallet to prevent instant slot drop.</p>
            </div>
            <div className="flex items-center gap-base mb-lg">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>account_balance_wallet</span>
              <h2 className="font-h3 text-h3 text-on-surface">Payment Method</h2>
            </div>
            {/* Local Options Tabs */}
            <div className="grid grid-cols-2 gap-md">
              <button 
                onClick={() => setPaymentMethod('khalti')}
                className={clsx(
                  "flex flex-col items-center justify-center p-md rounded-lg transition-all group",
                  paymentMethod === 'khalti' 
                    ? "border-2 border-primary bg-primary-container/10"
                    : "border border-outline-variant hover:border-primary"
                )}
              >
                <div className="w-12 h-12 bg-[#5C2D91] rounded-full flex items-center justify-center mb-xs overflow-hidden">
                  <span className="text-white font-bold text-xs uppercase">Khalti</span>
                </div>
                <span className={clsx("font-label-bold text-label-bold", paymentMethod === 'khalti' ? "text-primary" : "text-on-surface-variant group-hover:text-primary")}>Khalti</span>
              </button>
              
              <button 
                onClick={() => setPaymentMethod('mobile_banking')}
                className={clsx(
                  "flex flex-col items-center justify-center p-md rounded-lg transition-all group",
                  paymentMethod === 'mobile_banking' 
                    ? "border-2 border-primary bg-primary-container/10"
                    : "border border-outline-variant hover:border-primary"
                )}
              >
                <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center mb-xs overflow-hidden">
                  <span className="material-symbols-outlined text-white text-[24px]">account_balance</span>
                </div>
                <span className={clsx("font-label-bold text-label-bold", paymentMethod === 'mobile_banking' ? "text-primary" : "text-on-surface-variant group-hover:text-primary")}>Mobile Banking</span>
              </button>
            </div>
          </section>
        </div>

        {/* Right Column: Summary & Breakdown */}
        <aside className="lg:col-span-5 space-y-md sticky top-28">
          {/* Booking Summary Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="relative h-48 w-full">
              <img 
                alt={selectedVenue.name} 
                className="w-full h-full object-cover grayscale-[20%]" 
                src={selectedVenue.images[0]?.url || "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop"} 
              />
              <div className="absolute top-md right-md">
                <span className="bg-secondary-fixed text-on-secondary-fixed px-sm py-1 rounded-full font-label-bold text-[10px] uppercase tracking-wider flex items-center gap-xs">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  Selected Court
                </span>
              </div>
            </div>
            <div className="p-lg">
              <h3 className="font-h3 text-h3 text-on-surface mb-base">{selectedVenue.name}</h3>
              <div className="space-y-sm text-body-md text-on-surface-variant">
                <div className="flex items-center gap-base">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>calendar_today</span>
                  <span>{format(new Date(selectedSlot.startTime), 'EEEE, MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-base">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>schedule</span>
                  <span>{format(new Date(selectedSlot.startTime), 'hh:mm a')} — {format(new Date(selectedSlot.endTime), 'hh:mm a')} ({durationMins} min)</span>
                </div>
                <div className="flex items-center gap-base">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>location_on</span>
                  <span>{selectedVenue.location.address}, {selectedVenue.location.city}</span>
                </div>
              </div>
              <hr className="my-lg border-outline-variant" />
              <div className="space-y-sm">
                <div className="flex justify-between text-body-md">
                  <span className="text-on-surface-variant">Booking Fee ({durationMins} min)</span>
                  <span className="font-semibold">Rs. {selectedSlot.baseCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-body-md">
                  <span className="text-on-surface-variant">Platform Service Fee</span>
                  <span className="font-semibold">Rs. 0</span>
                </div>
                <div className="flex justify-between text-body-md pt-base border-t border-dashed border-outline-variant">
                  <span className="text-on-surface font-bold">Total Amount</span>
                  <span className="text-primary font-bold text-body-lg">Rs. {selectedSlot.baseCost.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-xl bg-surface-container-high rounded-lg p-md flex items-start gap-md">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>info</span>
                <div className="flex flex-col gap-xs">
                  <span className="font-label-bold text-label-bold text-on-surface">Deposit Required</span>
                  <p className="text-body-sm text-on-surface-variant leading-tight">Pay Rs. 500 now to secure your slot. Balance is payable at the venue.</p>
                </div>
              </div>
              
              <button 
                onClick={handleConfirm}
                disabled={isProcessing}
                className="w-full bg-secondary-fixed text-on-secondary-fixed mt-xl py-md rounded-lg font-h3 text-h3 flex items-center justify-center gap-md hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="w-5 h-5 border-2 border-on-secondary-fixed/30 border-t-on-secondary-fixed rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <>
                    Confirm & Pay Rs. 500
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>

              <div className="mt-lg flex items-center justify-center gap-lg">
                <div className="flex items-center gap-xs opacity-60">
                  <span className="material-symbols-outlined text-body-sm" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                  <span className="text-[10px] font-label-bold uppercase">SSL Secure</span>
                </div>
                <div className="flex items-center gap-xs opacity-60">
                  <span className="material-symbols-outlined text-body-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                  <span className="text-[10px] font-label-bold uppercase">Verified Partner</span>
                </div>
              </div>
            </div>
          </div>
          {/* Assistance Card */}
          <div className="bg-primary-container p-lg rounded-xl flex items-center justify-between text-on-primary-container">
            <div className="space-y-1">
              <p className="font-label-bold text-label-bold">Need help with payment?</p>
              <p className="text-body-sm opacity-80">Our support team is active 24/7.</p>
            </div>
            <button className="bg-white/10 hover:bg-white/20 p-base rounded-full transition-all">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>support_agent</span>
            </button>
          </div>
        </aside>
      </div>

      {/* ── Mock Khalti / Mobile Banking Popup ─────────────────────────── */}
      {showKhalti && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm animate-scale-in flex flex-col items-center">
            {paymentMethod === 'khalti' ? (
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <span className="text-purple-700 font-bold text-xl">K</span>
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-emerald-600 text-3xl">account_balance</span>
              </div>
            )}
            <h3 className="text-xl font-bold text-slate-text mb-2">Pay via {paymentMethod === 'khalti' ? 'Khalti' : 'Mobile Banking'}</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              You are about to pay <strong>NPR 500</strong> for your booking deposit. This is a mock payment gateway.
            </p>
            <div className="w-full flex flex-col gap-3">
              <button 
                onClick={handleKhaltiSuccess}
                className={clsx(
                  "w-full py-3 rounded-lg text-white font-medium transition-colors",
                  paymentMethod === 'khalti' ? "bg-[#5C2D91] hover:bg-[#4a2474]" : "bg-emerald-600 hover:bg-emerald-700"
                )}
              >
                Simulate Payment Success
              </button>
              <button 
                onClick={() => setShowKhalti(false)}
                className="w-full py-3 rounded-lg bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
