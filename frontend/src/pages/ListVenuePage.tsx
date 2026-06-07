import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LayoutGrid, CheckCircle2, ArrowLeft, Building2, MapPin, Phone, Mail, BadgeCent, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Amenity } from '@/types'

const CITIES = ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Biratnagar']
const AMENITIES_LIST: Amenity[] = ['Showers', 'Parking', 'Pro Turf', 'Air Con', 'Changing Rooms', 'Floodlights', 'Cafeteria']

export default function ListVenuePage() {
  const navigate = useNavigate()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Form states
  const [venueName, setVenueName] = useState('')
  const [city, setCity] = useState(CITIES[0])
  const [address, setAddress] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [pricePerHour, setPricePerHour] = useState('')
  const [courtType, setCourtType] = useState('Indoor')
  const [courtSize, setCourtSize] = useState('5v5')
  const [selectedAmenities, setSelectedAmenities] = useState<Amenity[]>([])
  const [description, setDescription] = useState('')

  const handleToggleAmenity = (a: Amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!venueName || !address || !contactPhone || !pricePerHour) {
      toast.error('Please fill in all required fields.')
      return
    }

    const phoneRegex = /^(\+977|977)?[9][678]\d{8}$/
    const genericPhoneRegex = /^\+?[0-9\s\-()]{7,15}$/
    if (!phoneRegex.test(contactPhone) && !genericPhoneRegex.test(contactPhone)) {
      toast.error('Please enter a valid phone number.')
      return
    }

    setIsLoading(true)

    try {
      // Simulate network request to persist venue listing draft
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsSubmitted(true)
      toast.success('Your listing request has been registered!')
    } catch (err: any) {
      toast.error('Failed to submit listing. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="page-container py-10 max-w-4xl mx-auto animate-fade-in">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-cool-grey hover:text-slate-text text-sm font-semibold mb-6 no-underline"
      >
        <ArrowLeft size={16} />
        Back to Home
      </Link>

      {!isSubmitted ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left panel: Info/Benefits */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="card p-6 bg-[#022c22] text-white rounded-[12px] border border-emerald-800 shadow-sm relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl" />
              <Building2 className="text-[#84CC16] mb-4" size={36} />
              <h2 className="text-[22px] font-bold text-white mb-3 leading-tight font-display">
                Partner with FindFutsal
              </h2>
              <p className="text-xs text-gray-200 leading-relaxed font-medium mb-4">
                List your courts on Nepal's premium booking network and fill off-peak hours effortlessly.
              </p>
              <ul className="space-y-3 text-xs text-gray-300 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#84CC16]" /> Maximize court utilization
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#84CC16]" /> Dynamic pricing & lock states
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#84CC16]" /> Automatic WhatsApp details
                </li>
              </ul>
            </div>

            <div className="card p-5 bg-white border border-gray-150 rounded-[12px] shadow-sm flex items-start gap-3">
              <ShieldAlert size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-cool-grey leading-relaxed font-medium">
                All submissions undergo verification by our operations team. You will be requested to present valid business registration documents upon onboarding.
              </p>
            </div>
          </div>

          {/* Right panel: Listing Form */}
          <div className="lg:col-span-2">
            <div className="card p-6 sm:p-8 bg-white border border-gray-150 rounded-[12px] shadow-sm">
              <h1 className="text-[26px] font-bold text-slate-text mb-1 font-display">List Your Venue</h1>
              <p className="text-xs text-cool-grey font-semibold mb-6">
                Tell us about your futsal facilities to create your venue page.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Section 1: Core Details */}
                <div>
                  <h3 className="text-[15px] font-bold text-slate-text border-b border-gray-100 pb-2 mb-4 uppercase tracking-wider text-[11px] text-emerald-600">
                    1. Facility Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="floating-label-group !mb-0">
                      <input
                        id="venue-name"
                        type="text"
                        required
                        className="floating-input"
                        placeholder="Venue Name"
                        value={venueName}
                        onChange={(e) => setVenueName(e.target.value)}
                      />
                      <label htmlFor="venue-name" className="floating-label">Venue Name *</label>
                    </div>

                    <div className="relative">
                      <select
                        id="venue-city"
                        className="input h-[46px] pt-1.5 focus:border-primary"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      >
                        {CITIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <label htmlFor="venue-city" className="absolute left-3 -top-2 bg-white px-1 text-[10px] text-gray-400 font-bold uppercase">City *</label>
                    </div>
                  </div>

                  <div className="floating-label-group mt-4 !mb-0">
                    <input
                      id="venue-address"
                      type="text"
                      required
                      className="floating-input"
                      placeholder="Complete Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                    <label htmlFor="venue-address" className="floating-label">Complete Address *</label>
                  </div>
                </div>

                {/* Section 2: Court Configuration */}
                <div>
                  <h3 className="text-[15px] font-bold text-slate-text border-b border-gray-100 pb-2 mb-4 uppercase tracking-wider text-[11px] text-emerald-600">
                    2. Court Configurations
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="floating-label-group !mb-0 col-span-1">
                      <input
                        id="venue-price"
                        type="number"
                        required
                        min="0"
                        className="floating-input"
                        placeholder="Price Per Hour"
                        value={pricePerHour}
                        onChange={(e) => setPricePerHour(e.target.value)}
                      />
                      <label htmlFor="venue-price" className="floating-label">Price / Hour *</label>
                    </div>

                    <div className="relative col-span-1">
                      <select
                        id="venue-court-type"
                        className="input h-[46px] pt-1.5 focus:border-primary"
                        value={courtType}
                        onChange={(e) => setCourtType(e.target.value)}
                      >
                        <option value="Indoor">Indoor Premium</option>
                        <option value="Outdoor">Outdoor Turf</option>
                        <option value="Both">Both Available</option>
                      </select>
                      <label htmlFor="venue-court-type" className="absolute left-3 -top-2 bg-white px-1 text-[10px] text-gray-400 font-bold uppercase">Type</label>
                    </div>

                    <div className="relative col-span-1">
                      <select
                        id="venue-court-size"
                        className="input h-[46px] pt-1.5 focus:border-primary"
                        value={courtSize}
                        onChange={(e) => setCourtSize(e.target.value)}
                      >
                        <option value="5v5">5v5 Standard</option>
                        <option value="6v6">6v6 Match</option>
                        <option value="7v7">7v7 Large</option>
                      </select>
                      <label htmlFor="venue-court-size" className="absolute left-3 -top-2 bg-white px-1 text-[10px] text-gray-400 font-bold uppercase">Size</label>
                    </div>
                  </div>
                </div>

                {/* Section 3: Contact */}
                <div>
                  <h3 className="text-[15px] font-bold text-slate-text border-b border-gray-100 pb-2 mb-4 uppercase tracking-wider text-[11px] text-emerald-600">
                    3. Contact Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="floating-label-group !mb-0">
                      <input
                        id="venue-phone"
                        type="tel"
                        required
                        className="floating-input"
                        placeholder="Contact Phone"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                      />
                      <label htmlFor="venue-phone" className="floating-label">Contact Phone *</label>
                    </div>

                    <div className="floating-label-group !mb-0">
                      <input
                        id="venue-email"
                        type="email"
                        className="floating-input"
                        placeholder="Contact Email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                      />
                      <label htmlFor="venue-email" className="floating-label">Contact Email (optional)</label>
                    </div>
                  </div>
                </div>

                {/* Section 4: Amenities Checklist */}
                <div>
                  <h3 className="text-[15px] font-bold text-slate-text border-b border-gray-100 pb-2 mb-3 uppercase tracking-wider text-[11px] text-emerald-600">
                    4. Amenities & Services
                  </h3>
                  <p className="text-[11px] text-cool-grey font-semibold mb-3">Check all that apply to your courts:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {AMENITIES_LIST.map((a) => {
                      const isChecked = selectedAmenities.includes(a)
                      return (
                        <button
                          key={a}
                          type="button"
                          onClick={() => handleToggleAmenity(a)}
                          className={`flex items-center gap-2 px-3 py-2 border rounded-[8px] text-xs font-bold text-left transition-all duration-150 ${
                            isChecked
                              ? 'bg-emerald-50 text-emerald-600 border-primary-hover ring-2 ring-primary/10'
                              : 'bg-canvas text-slate-text border-gray-200 hover:border-emerald-300'
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 border rounded flex items-center justify-center shrink-0 ${
                            isChecked ? 'bg-primary border-primary text-white' : 'border-gray-300 bg-white'
                          }`}>
                            {isChecked && (
                              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          {a}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Section 5: Description */}
                <div className="floating-label-group h-24">
                  <textarea
                    id="venue-description"
                    className="floating-input h-full resize-none pt-3"
                    placeholder="Short Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <label htmlFor="venue-description" className="floating-label">Short Description / Pitch Rules</label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full btn-lg mt-4 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Registering Court…
                    </span>
                  ) : (
                    'Submit Listing Request'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="page-container py-16 max-w-xl mx-auto text-center animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-text mb-3">Request Registered!</h1>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
            Thank you for listing your venue, <strong>{venueName}</strong>! Our verification team will review your pitch specifications and reach out within 24 hours.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/')} className="btn-primary">
              Go Home
            </button>
            <button onClick={() => setIsSubmitted(false)} className="btn-secondary">
              List Another Court
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
