import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuthStore } from '@/store'
import Logo from './Logo'
import clsx from 'clsx'

const navLinks = [
  { label: 'Find Courts', to: '/venues' },
  { label: 'My Bookings', to: '/bookings' },
  { label: 'Support', to: '/#help' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()

  return (
    <header className="bg-surface border-b border-outline-variant w-full max-w-full sticky top-0 z-50 transition-all duration-300">
      <nav aria-label="Main navigation">
        <div className="flex justify-between items-center md:grid md:grid-cols-3 md:items-center w-full px-margin py-base h-16">

          {/* ── Logo ────────────────────────────────────────────────────── */}
          <div className="flex justify-start">
            <Link
              to="/"
              className="no-underline block h-10"
              aria-label="FindFutsal home"
            >
              <Logo height={38} />
            </Link>
          </div>

          {/* ── Desktop Nav ──────────────────────────────────────────────── */}
          <div className="hidden md:flex items-center justify-center gap-lg">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  clsx(
                    'font-label-bold text-label-bold transition-colors duration-150 no-underline pb-1',
                    isActive
                      ? 'text-primary'
                      : 'text-on-surface-variant hover:text-primary'
                  )
                }
                style={({ isActive }) =>
                  isActive ? { borderBottom: '2px solid #005129' } : {}
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* ── Desktop Auth ─────────────────────────────────────────────── */}
          <div className="hidden md:flex items-center justify-end gap-md">
            {isAuthenticated ? (
              <>
                <Link
                  to="/list-venue"
                  className="hidden lg:block font-label-bold text-label-bold text-on-surface-variant hover:text-primary transition-colors no-underline"
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
                  className="hidden lg:block font-label-bold text-label-bold text-on-surface-variant px-md py-sm hover:text-primary transition-colors no-underline"
                >
                  Join as Partner
                </Link>
                <Link
                  to="/login"
                  className="bg-secondary-fixed text-on-secondary-fixed font-button text-button px-lg py-sm rounded-lg hover:opacity-90 transition-all active:scale-95 no-underline"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile Toggle ────────────────────────────────────────────── */}
          <button
            className="md:hidden p-2 rounded-md text-on-surface-variant hover:bg-surface-variant/30 transition-all outline-none"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* ── Mobile Menu ──────────────────────────────────────────────────── */}
        {isOpen && (
          <div className="md:hidden border-t border-outline-variant px-margin py-4 flex flex-col gap-1 animate-slide-down bg-surface">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    'px-4 py-2.5 rounded-lg text-sm font-bold no-underline transition-all',
                    isActive 
                      ? 'bg-emerald-50 text-primary' 
                      : 'text-on-surface-variant hover:bg-surface-variant/30'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="pt-3 border-t border-outline-variant mt-2 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-on-surface-variant hover:bg-surface-variant/30 no-underline transition-all"
                  >
                    Profile & Settings
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/login"    
                    onClick={() => setIsOpen(false)} 
                    className="bg-secondary-fixed text-on-secondary-fixed text-center py-2.5 rounded-lg font-button text-button hover:opacity-90 transition-all no-underline"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
