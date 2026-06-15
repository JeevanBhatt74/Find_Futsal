import { Link } from 'react-router-dom'
import { Zap, MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#111827] text-gray-400 mt-auto">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* ── Brand ──────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2 w-fit no-underline group">
              <div className="w-8 h-8 bg-emerald-500 rounded-md flex items-center justify-center
                              group-hover:shadow-glow transition-shadow duration-300">
                <Zap size={18} className="text-white" fill="white" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                Find<span className="text-emerald-400">Futsal</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              Nepal's fastest futsal court booking platform. From search to confirmation in under 60 seconds.
            </p>
            <div className="flex gap-3 pt-1">
              {[Instagram, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-md bg-white/5 flex items-center justify-center
                                               hover:bg-emerald-500 hover:text-white text-gray-400
                                               transition-all duration-200 no-underline">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* ── Quick Links ────────────────────────────────────────────── */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="flex flex-col gap-2.5">
              {[
                { label: 'Find Courts', to: '/venues' },
                { label: 'How It Works', to: '/#how-it-works' },
                { label: 'List Your Venue', to: '/list-venue' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm hover:text-emerald-400 transition-colors no-underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact ────────────────────────────────────────────────── */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="flex flex-col gap-3">
              {[
                { icon: MapPin, text: 'Kathmandu, Nepal' },
                { icon: Phone, text: '+977 98XXXXXXXX' },
                { icon: Mail,  text: 'hello@findfutsal.com.np' },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2.5 text-sm">
                  <Icon size={14} className="text-emerald-400 shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom Bar ────────────────────────────────────────────────── */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row
                        items-center justify-between gap-3 text-xs">
          <p>© {new Date().getFullYear()} FindFutsal. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-emerald-400 transition-colors no-underline">Privacy</Link>
            <Link to="/terms"   className="hover:text-emerald-400 transition-colors no-underline">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
