import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import Logo from '@/components/layout/Logo'

const FEATURED_COURTS = [
  {
    id: 'court-1',
    name: 'Dhuku Futsal Hub',
    location: 'Baluwatar',
    distance: '1.2 km from center',
    rating: 4.9,
    price: 'Rs 1,800/hr',
    slotsToday: 6,
    badge: { text: 'LIVE AVAILABILITY', position: 'right', style: 'bg-secondary-fixed text-on-secondary-fixed' },
    amenities: ['Floodlights', 'Showers', 'Parking', 'Cafeteria'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDutFiPUSROLDIm2hymA2PDe8Loo8YXD2EjTbFvLg5w4SnsXjJNrprc6v_yWSjMwcgx1XqoJ8RagldzlymShbmDepQBw6RwzHaqDI8Mb2hjWEqjTOnSgXCVw_xR-DyhCblo1nsoGBfOOlt0KAkDnTEBo7BjPDOfeBTLgjk678p4IR7feHtxVccy_MEUc9R_7GU7l4veRm4JASlV86-zlmCEboWNOmnPbjdatj_jrdqb-FzaGDRGamVRC8zYU0DGrYnvLpT_0dJpHZs',
  },
  {
    id: 'court-2',
    name: 'Shantinagar Futsal',
    location: 'Shantinagar',
    distance: '2.5 km from center',
    rating: 4.7,
    price: 'Rs 1,500/hr',
    slotsToday: 2,
    badge: null,
    amenities: ['Floodlights', 'Parking', 'Cafeteria'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHYAwbuuNT8wCGl_u7n38Tf2Tfh3hQe0fXkkT78_ZBDNGk1cwSG_8wdOtqFeeezanXLouEaO0Abyrqy6_HsZtffYEYE21sDi0wgGe6MznjTw4-acuk8TtvqMVKDyWBmx6MfSBUgFUABdC2Sq-C2vN_3npanw5I2Y9TR7-rgKKA-rD_b1bYcozoACwITATkLQSSyPuHIzR0fz98BNF6dj-6QQL0V7dLY-sxlrDzMVbjdj1KQrZPW3fw5zEjoCZjSIq_MN1HpE3GFj8',
  },
  {
    id: 'court-3',
    name: 'Field Futsal',
    location: 'Sanepa',
    distance: '4.8 km from center',
    rating: 4.8,
    price: 'Rs 2,000/hr',
    slotsToday: 0,
    badge: { text: 'PRO TURF', position: 'left', style: 'bg-primary-container text-on-primary-container' },
    amenities: ['Showers', 'Parking', 'Cafeteria'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfy8T51ixMd3CiaU9mwVb38Zf8nR3tZYKxkrpYotgnroSmKb_gEc-9O_WDpRtbEs4gbucjBbzlpy9IycOdEiKNApCHkh7cpONIhKoUh4_qhETMYtuTkOW0aHwKgq7AkBCdCn7grWY6LSQEDtrGMVuJcKmb8m_ym8mbkofY4OvDMrP0D5JEv2SATqCh2cMDBlD1DyfpLqbGhNlBzXP4jt9VIpJ8xno8GheWCpDJcM6ZspuN0HFlbVZHPiiE8E2CHu_ORJXRuiY_SQ8',
  },
]

export default function HomePage() {
  const navigate = useNavigate()
  const { isAuthenticated, user, clearAuth } = useAuthStore()

  // Search state
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [timeSlot, setTimeSlot] = useState('06:00 AM - 07:00 AM')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (location.trim()) params.set('search', location.trim())
    if (date) params.set('date', date)
    navigate(`/venues?${params.toString()}`)
  }

  return (
    <div className="bg-background text-on-surface font-body-md selection:bg-secondary-fixed selection:text-on-secondary-fixed">

      {/* ══════════════════════════════════════════════════════════════════════
          TOP NAVIGATION
          ══════════════════════════════════════════════════════════════════════ */}
      <header className="bg-surface border-b border-outline-variant flex justify-between items-center md:grid md:grid-cols-3 md:items-center w-full px-margin py-base max-w-full sticky top-0 z-50">
        <div className="flex justify-start">
          <Link to="/" className="block h-10" style={{ textDecoration: 'none' }}>
            <Logo height={38} />
          </Link>
        </div>

        <nav className="hidden md:flex justify-center gap-lg">
          <a
            className="font-label-bold text-label-bold text-primary pb-1 hover:text-primary transition-colors"
            href="#search-section"
            style={{ textDecoration: 'none', borderBottom: '2px solid #005129' }}
          >
            Find Courts
          </a>
          <Link
            className="font-label-bold text-label-bold text-on-surface-variant hover:text-primary transition-colors"
            to={isAuthenticated ? '/bookings' : '/login'}
            style={{ textDecoration: 'none' }}
          >
            My Bookings
          </Link>
          <a
            className="font-label-bold text-label-bold text-on-surface-variant hover:text-primary transition-colors"
            href="#help"
            style={{ textDecoration: 'none' }}
          >
            Support
          </a>
        </nav>

        <div className="flex items-center justify-end gap-md">
          {isAuthenticated ? (
            <>
              <Link
                to="/list-venue"
                className="hidden lg:block font-label-bold text-label-bold text-on-surface-variant px-md py-sm hover:text-primary transition-colors"
                style={{ textDecoration: 'none' }}
              >
                Join as Partner
              </Link>
              <Link
                to="/profile"
                className="w-10 h-10 rounded-full border-2 border-emerald-500 overflow-hidden hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-sm"
                title="Profile & Settings"
              >
                <img
                  alt="User Profile"
                  className="w-full h-full object-cover"
                  src={user?.profileImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuDhjXdNFTkKUFGghLDd0PCWsvyqeiNO4n-MCXzUk9WDoNrENYbZfQ82KXppBpDm1cirVHKuALvDfGjoN2nHUT-32loErLwzkGWcxIOZMU6pUDeXrrkQ-3XNjmBskfWLSXxrx6R8geIeTbszVAOvPMHD-WcgVKTDzThG-n7VQ4lQEMUHBYnkFNK69FzKrJKX2zmQh8HS_RJ3HY-H7psVOLKuiG8mTce29tYr7FBxhqtsjney0fPi-f5izIejTS8Uze-u_bOetJT9K14"}
                />
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/list-venue"
                className="hidden lg:block font-label-bold text-label-bold text-on-surface-variant px-md py-sm hover:text-primary transition-colors"
                style={{ textDecoration: 'none' }}
              >
                Join as Partner
              </Link>
              <Link
                to="/login"
                className="bg-secondary-fixed text-on-secondary-fixed font-button text-button px-lg py-sm rounded-lg hover:opacity-90 transition-all active:scale-95 animate-fade-in"
                style={{ textDecoration: 'none' }}
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </header>

      <main>
        {/* ══════════════════════════════════════════════════════════════════════
            HERO SECTION
            ══════════════════════════════════════════════════════════════════════ */}
        <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              className="w-full h-full object-cover"
              style={{ filter: 'brightness(0.5)' }}
              alt="Premium indoor futsal court"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkhcX3Q5qx2qvPZ5OYyVbsdCMKx9OnIhrDD_xsyJqfpbLrrZ6wFMVdtojqQo6SCOu8LA_rXTpt--It8ZQE-UkLoytMND7sONTSBDoxZtARGR8TWrAF3vfGSP4Ym4eU9ai6HHc167qJSflaMUxlswaqE4vveiuhDczhc8-9-xdpW_89MgCbvbHdjgPq54KSDdImuLtGMWvngnfprSYwcG9P0V01mERtgpw7tmc97diw3HjJ7nSixYjFG8uVaNq4MwEFo9FZBLE1RMs"
            />
          </div>
          <div className="relative z-10 text-center px-margin max-w-4xl mx-auto">
            <h1 className="font-h1 text-h1 text-white mb-md" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
              Book Your Court. <span className="text-secondary-fixed">Play Instantly.</span>
            </h1>
            <p className="font-body-lg text-body-lg text-white/90 mb-xl max-w-2xl mx-auto">
              Skip the phone calls. Access real-time availability for the best futsal courts in the city. Your match starts here.
            </p>
            <div className="flex flex-wrap justify-center gap-md">
              <a
                className="bg-secondary-fixed text-on-secondary-fixed font-button text-button px-xl py-md rounded-lg flex items-center gap-sm shadow-xl hover:scale-105 transition-transform active:scale-95"
                href="#search-section"
                style={{ textDecoration: 'none' }}
              >
                <span className="material-symbols-outlined">search</span>
                Find a Court
              </a>
              <Link
                className="backdrop-blur-md text-white font-button text-button px-xl py-md rounded-lg hover:bg-white hover:text-primary transition-all active:scale-95"
                to={isAuthenticated ? '/bookings' : '/login'}
                style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.1)', border: '2px solid white' }}
              >
                View My Bookings
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            SEARCH SECTION (overlapping hero)
            ══════════════════════════════════════════════════════════════════════ */}
        <section className="relative z-20 px-margin" style={{ marginTop: '-64px' }} id="search-section">
          <form
            onSubmit={handleSearch}
            className="max-w-6xl mx-auto bg-surface-container-lowest border border-outline-variant p-md lg:p-lg rounded-xl shadow-md grid grid-cols-1 md:grid-cols-4 gap-md items-end"
          >
            {/* Location */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="font-label-bold text-label-bold text-on-surface-variant" style={{ display: 'block' }}>LOCATION</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline">location_on</span>
                <input
                  className="w-full pl-xl pr-sm py-sm rounded-lg border border-outline-variant font-body-md bg-surface text-on-surface"
                  style={{ outline: 'none' }}
                  placeholder="Where do you play?"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
            {/* Date */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="font-label-bold text-label-bold text-on-surface-variant" style={{ display: 'block' }}>DATE</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline">calendar_today</span>
                <input
                  className="w-full pl-xl pr-sm py-sm rounded-lg border border-outline-variant font-body-md bg-surface text-on-surface"
                  style={{ outline: 'none' }}
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
            {/* Time Slot */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="font-label-bold text-label-bold text-on-surface-variant" style={{ display: 'block' }}>TIME SLOT</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline">schedule</span>
                <select
                  className="w-full pl-xl pr-sm py-sm rounded-lg border border-outline-variant font-body-md bg-surface text-on-surface appearance-none"
                  style={{ outline: 'none' }}
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                >
                  <option>06:00 AM - 07:00 AM</option>
                  <option>07:00 AM - 08:00 AM</option>
                  <option>08:00 AM - 09:00 AM</option>
                  <option>09:00 AM - 10:00 AM</option>
                  <option>10:00 AM - 11:00 AM</option>
                  <option>11:00 AM - 12:00 PM</option>
                  <option>12:00 PM - 01:00 PM</option>
                  <option>01:00 PM - 02:00 PM</option>
                  <option>02:00 PM - 03:00 PM</option>
                  <option>03:00 PM - 04:00 PM</option>
                  <option>04:00 PM - 05:00 PM</option>
                  <option>05:00 PM - 06:00 PM</option>
                  <option>06:00 PM - 07:00 PM</option>
                  <option>07:00 PM - 08:00 PM</option>
                  <option>08:00 PM - 09:00 PM</option>
                  <option>09:00 PM - 10:00 PM</option>
                  <option>10:00 PM - 11:00 PM</option>
                </select>
              </div>
            </div>
            {/* Search Button */}
            <button
              type="submit"
              className="bg-primary text-on-primary font-button text-button rounded-lg hover:bg-primary-container transition-colors flex items-center justify-center gap-sm"
              style={{ height: '48px', border: 'none' }}
            >
              <span className="material-symbols-outlined">search</span>
              Search
            </button>
          </form>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            TRUST BADGES
            ══════════════════════════════════════════════════════════════════════ */}
        <section className="py-xl px-margin border-b border-outline-variant">
          <div className="max-w-6xl mx-auto flex flex-wrap justify-around gap-lg" style={{ opacity: 0.6 }}>
            {[
              { icon: 'verified', label: 'Verified Courts' },
              { icon: 'lock', label: 'Secure Payments' },
              { icon: 'bolt', label: 'Instant Confirmation' },
              { icon: 'support_agent', label: '24/7 Player Support' },
            ].map((badge) => (
              <div key={badge.icon} className="flex items-center gap-sm">
                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {badge.icon}
                </span>
                <span className="font-label-bold" style={{ textTransform: 'uppercase' }}>{badge.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            HOW IT WORKS
            ══════════════════════════════════════════════════════════════════════ */}
        <section className="py-xxl px-margin bg-surface-container-low">
          <div className="max-w-6xl mx-auto text-center mb-xl">
            <h2 className="font-h1 text-h1 text-primary">How It Works</h2>
            <div className="bg-secondary-fixed mx-auto mt-sm" style={{ width: '64px', height: '4px' }} />
          </div>
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-xl">
            {[
              { icon: 'search', step: '1. Search', desc: 'Enter your location and preferred time. Browse through hundreds of premium futsal facilities with live availability.' },
              { icon: 'event_available', step: '2. Book', desc: 'Select your slot and pay securely via our platform. Receive an instant booking confirmation via email and SMS.' },
              { icon: 'sports_soccer', step: '3. Play', desc: 'Show up at the court, show your digital booking pass, and enjoy the game. No hassle, just pure performance.' },
            ].map((item) => (
              <div key={item.step} className="bg-surface p-xl rounded-lg border border-outline-variant hover:border-primary-container transition-all group">
                <div className="flex items-center justify-center mb-lg group-hover:bg-secondary-fixed transition-colors bg-surface-container-high" style={{ width: '64px', height: '64px', borderRadius: '9999px' }}>
                  <span className="material-symbols-outlined text-3xl text-primary group-hover:text-on-secondary-fixed">{item.icon}</span>
                </div>
                <h3 className="font-h3 text-h3 mb-sm">{item.step}</h3>
                <p className="text-on-surface-variant font-body-md">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            FEATURED COURTS
            ══════════════════════════════════════════════════════════════════════ */}
        <section className="py-xxl px-margin">
          <div className="max-w-6xl mx-auto flex justify-between items-end mb-xl">
            <div>
              <h2 className="font-h1 text-h1 text-on-surface">Top-Rated Courts</h2>
              <p className="text-on-surface-variant font-body-md">Hand-picked premium venues with professional surfaces.</p>
            </div>
            <Link
              to="/venues"
              className="font-label-bold text-primary flex items-center gap-xs hover:underline"
              style={{ textDecoration: 'none' }}
            >
              View all courts
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="max-w-6xl mx-auto flex overflow-x-auto pb-lg gap-lg snap-x no-scrollbar">
            {FEATURED_COURTS.map((court) => (
              <div 
                key={court.id} 
                className="bg-surface-container-lowest border border-outline-variant hover:border-secondary rounded-xl overflow-hidden group transition-all duration-300 flex flex-col shadow-sm hover:shadow-md snap-start relative" 
                style={{ minWidth: '340px' }}
              >
                <Link to="/venues" className="absolute inset-0 z-0" />
                
                {/* Image Header */}
                <div className="relative h-48 overflow-hidden bg-surface-container-high">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={court.image}
                    alt={court.name}
                  />
                  
                  {/* Rating Badge */}
                  <div className="absolute top-sm right-sm bg-surface/90 backdrop-blur-sm px-md py-1 rounded-full flex items-center gap-xs shadow-sm z-10">
                    <span className="material-symbols-outlined text-secondary text-[16px] block" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                    <span className="font-label-bold text-body-sm text-on-surface">
                      {court.rating ? court.rating.toFixed(1) : '0.0'}
                    </span>
                  </div>

                  {/* Slots Badge */}
                  <div className="absolute bottom-sm left-sm z-10">
                    {court.slotsToday > 0 ? (
                      <div className="bg-primary/90 text-on-primary px-sm py-1 rounded-md flex items-center gap-xs text-[11px] font-bold tracking-wider uppercase shadow-sm">
                        <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                        <span>{court.slotsToday} SLOTS TODAY</span>
                      </div>
                    ) : (
                      <div className="bg-surface-variant/90 text-on-surface px-sm py-1 rounded-md text-[11px] font-bold tracking-wider uppercase shadow-sm">
                        <span>NO SLOTS TODAY</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-md flex flex-col flex-grow relative z-10 pointer-events-none">
                  <div className="flex justify-between items-start mb-xs">
                    <h4 className="font-h3 text-h3 text-on-surface group-hover:text-primary transition-colors pr-sm leading-tight max-w-[70%]">
                      {court.name}
                    </h4>
                    <span className="font-h3 text-h3 text-primary shrink-0 leading-none pt-1">
                      {court.price}
                    </span>
                  </div>
                  
                  <p className="text-on-surface-variant text-body-sm flex items-center gap-xs mb-md font-medium">
                    <span className="material-symbols-outlined text-[18px] text-outline">location_on</span>
                    <span>{court.distance}</span>
                    <span className="text-outline/40">|</span>
                    <span className="text-[12px]">Kathmandu</span>
                  </p>

                  {/* Footer details */}
                  <div className="mt-auto pt-md border-t border-outline-variant flex items-center justify-between pointer-events-auto">
                    {/* Amenities list */}
                    <div className="flex gap-xs text-outline">
                      {court.amenities.includes('Showers') && (
                        <span className="material-symbols-outlined text-[20px]" title="Shower available">shower</span>
                      )}
                      {court.amenities.includes('Floodlights') && (
                        <span className="material-symbols-outlined text-[20px]" title="Lights available">light_mode</span>
                      )}
                      {court.amenities.includes('Parking') && (
                        <span className="material-symbols-outlined text-[20px]" title="Parking available">local_parking</span>
                      )}
                      {court.amenities.includes('Cafeteria') && (
                        <span className="material-symbols-outlined text-[20px]" title="Cafe available">restaurant</span>
                      )}
                    </div>
                    
                    {/* Action button */}
                    {court.slotsToday > 0 ? (
                      <Link 
                        to="/venues"
                        className="bg-secondary text-on-secondary px-lg py-sm rounded-lg font-label-bold text-label-bold hover:bg-primary hover:text-white transition-all no-underline shadow-sm active:scale-95 block"
                      >
                        Book Now
                      </Link>
                    ) : (
                      <Link 
                        to="/venues"
                        className="border-2 border-primary text-primary px-lg py-[6px] rounded-lg font-label-bold text-label-bold bg-white hover:bg-primary hover:text-white transition-all shadow-sm active:scale-95 no-underline block"
                      >
                        Notify Me
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            CTA — OWN A COURT
            ══════════════════════════════════════════════════════════════════════ */}
        <section className="py-xxl px-margin">
          <div className="max-w-6xl mx-auto bg-primary-container rounded-lg p-xl lg:p-xxl flex flex-col lg:flex-row items-center gap-xl relative overflow-hidden shadow-2xl">
            {/* Decorative blurs */}
            <div className="absolute rounded-full" style={{ right: '-80px', bottom: '-80px', width: '320px', height: '320px', background: 'rgba(183,246,76,0.2)', filter: 'blur(48px)' }} />
            <div className="absolute rounded-full" style={{ left: '-80px', top: '-80px', width: '320px', height: '320px', background: 'rgba(154,233,174,0.1)', filter: 'blur(48px)' }} />

            {/* Text */}
            <div className="relative z-10 lg:w-2/3">
              <h2 className="font-h1 text-h1 text-on-primary-container mb-md" style={{ lineHeight: '1.1' }}>
                Own a Court?<br />Join the Network.
              </h2>
              <p className="font-body-lg text-body-lg mb-lg" style={{ color: 'rgba(154,233,174,0.8)' }}>
                Streamline your operations, eliminate double bookings, and reach thousands of players instantly with our partner management dashboard.
              </p>
              <Link
                to="/list-venue"
                className="bg-secondary-fixed text-on-secondary-fixed font-button text-button px-xl py-md rounded-lg shadow-lg hover:opacity-90 transition-all active:scale-95"
                style={{ textDecoration: 'none', display: 'inline-block' }}
              >
                Register Your Venue
              </Link>
            </div>

            {/* Revenue card */}
            <div className="relative z-10 lg:w-1/3 flex justify-center w-full">
              <div className="p-lg rounded-lg shadow-xl w-full" style={{ maxWidth: '280px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <div className="flex items-center gap-md mb-md">
                  <div className="bg-secondary-fixed flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '9999px' }}>
                    <span className="material-symbols-outlined text-on-secondary-fixed">trending_up</span>
                  </div>
                  <div>
                    <div className="text-white font-label-bold" style={{ fontSize: '12px' }}>REVENUE GROWTH</div>
                    <div className="text-white font-h3 text-h3">+140%</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[75, 50, 83].map((w, i) => (
                    <div key={i} className="overflow-hidden" style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.2)', borderRadius: '9999px' }}>
                      <div className="bg-secondary-fixed h-full" style={{ width: `${w}%`, borderRadius: '9999px' }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ══════════════════════════════════════════════════════════════════════
          FOOTER
          ══════════════════════════════════════════════════════════════════════ */}
      <footer className="bg-on-surface w-full py-xxl px-margin grid grid-cols-1 md:grid-cols-2 gap-lg mt-xxl" id="help">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ height: '48px' }}>
            <Logo height={44} variant="light" />
          </div>
          <p className="font-body-sm text-body-sm text-surface-variant" style={{ maxWidth: '384px' }}>
            © 2024 FindFutsal. All rights reserved. High-performance booking for high-performance players.
          </p>
          <div className="flex gap-md">
            {['public', 'alternate_email', 'share'].map((icon) => (
              <a
                key={icon}
                className="border border-outline flex items-center justify-center text-surface hover:border-secondary-fixed hover:text-secondary-fixed transition-colors"
                href="#"
                style={{ width: '40px', height: '40px', borderRadius: '9999px', textDecoration: 'none' }}
              >
                <span className="material-symbols-outlined">{icon}</span>
              </a>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-md">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 className="font-label-bold text-label-bold text-surface" style={{ textTransform: 'uppercase' }}>Company</h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Terms of Service', to: '/terms' },
                { label: 'Privacy Policy', to: '/privacy' },
                { label: 'Court Partnership', to: '/list-venue' },
                { label: 'Contact Us', to: '#help' },
              ].map((link) => (
                <Link key={link.label} className="font-body-sm text-body-sm text-surface-variant hover:text-secondary-fixed transition-colors" to={link.to} style={{ textDecoration: 'none' }}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 className="font-label-bold text-label-bold text-surface" style={{ textTransform: 'uppercase' }}>Support</h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Help Center', 'FAQ', 'Refund Policy'].map((label) => (
                <a key={label} className="font-body-sm text-body-sm text-surface-variant hover:text-secondary-fixed transition-colors" href="#" style={{ textDecoration: 'none' }}>
                  {label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </footer>

      {/* ══════════════════════════════════════════════════════════════════════
          MOBILE BOTTOM NAV
          ══════════════════════════════════════════════════════════════════════ */}
      <nav
        className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-gutter py-sm border-t border-outline-variant shadow-md"
        style={{ background: 'rgba(247,250,243,0.9)', backdropFilter: 'blur(12px)' }}
      >
        <a href="#search-section" className="flex flex-col items-center justify-center text-primary" style={{ textDecoration: 'none', fontWeight: 700 }}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
          <span className="font-label-bold text-body-sm">Explore</span>
        </a>
        <Link to={isAuthenticated ? '/bookings' : '/login'} className="flex flex-col items-center justify-center text-on-surface-variant" style={{ textDecoration: 'none' }}>
          <span className="material-symbols-outlined">confirmation_number</span>
          <span className="font-label-bold text-body-sm">Bookings</span>
        </Link>
        <Link to="/venues" className="flex flex-col items-center justify-center text-on-surface-variant" style={{ textDecoration: 'none' }}>
          <span className="material-symbols-outlined">favorite</span>
          <span className="font-label-bold text-body-sm">Saved</span>
        </Link>
        <Link to={isAuthenticated ? '/profile' : '/login'} className="flex flex-col items-center justify-center text-on-surface-variant" style={{ textDecoration: 'none' }}>
          <span className="material-symbols-outlined">person</span>
          <span className="font-label-bold text-body-sm">Profile</span>
        </Link>
      </nav>

    </div>
  )
}
