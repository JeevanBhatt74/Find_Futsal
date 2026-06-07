import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import Logo from '@/components/layout/Logo'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  
  // ── States ──
  const [role, setRole] = useState<'Player' | 'VenueOwner'>('Player')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName || !email || !phone || !password || !confirmPassword) {
      toast.error('All fields are required.')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    if (fullName.length < 2) {
      toast.error('Full name must be at least 2 characters.')
      return
    }

    // Nepali or standard phone check
    const nepalPhoneRegex = /^(\+977|977)?[9][678]\d{8}$/
    const genericPhoneRegex = /^\+?[0-9\s\-()]{7,15}$/
    if (!nepalPhoneRegex.test(phone) && !genericPhoneRegex.test(phone)) {
      toast.error('Please enter a valid contact phone number.')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }

    setIsLoading(true)

    try {
      const response = await api.post('/auth/register', {
        fullName,
        email,
        phone,
        password,
        role: role === 'VenueOwner' ? 'venueowner' : 'player',
      })
      
      const { user, token } = response.data.data
      setAuth(user, token)
      
      toast.success('Account created successfully! Welcome to FindFutsal.')
      if (user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.message ?? 'Registration failed. Please try again.'
      toast.error(errMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialClick = (platform: string) => {
    toast.error(`${platform} authentication is not enabled in this prototype.`)
  }

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-surface">
      {/* Left Side: Visual Storytelling */}
      <section className="hidden md:flex md:w-1/2 lg:w-3/5 relative overflow-hidden bg-primary">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Futsal Action" 
            className="w-full h-full object-cover grayscale opacity-50" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDs0Ka7wLp-wGUiy4yI-dYmDxFxK2Ca9Z-_9bGnpc_h7wFIgHhgAZhyREr-wo2MJYE2Ke6NIB5xmaKXIQ54u8GToE2S3PSOHYJEDwVDPp-5KcRz9aY_FW56XJ9uqQyQgTzzhQFflblyHENYCCKdlXAexIfy9gVCQaqWOe8ioxSWjrUoWy_I8FfKZRJLwlrki6iZPm1aYA8LIjKIyCCiVLfMQwXTmDb2Rh5tHkz2BRn9ad-R8ZtIy79l9GdaKJ4YSHYh_d_Mxg5AT4c"
          />
          <div 
            className="absolute inset-0 mix-blend-multiply" 
            style={{ 
              background: 'linear-gradient(135deg, rgba(0, 81, 41, 0.9) 0%, rgba(26, 107, 60, 0.7) 100%)' 
            }}
          />
        </div>
        
        {/* Content Overlay */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-xxl text-white min-h-[600px]">
          <div>
            <h1 className="font-h1 text-h1 text-secondary-fixed max-w-md uppercase tracking-tight leading-none mb-4">
              Dominate the Court.
            </h1>
            <p className="font-body-lg text-body-lg text-primary-fixed mt-md max-w-sm">
              Join the fastest-growing futsal community and book top-tier courts in seconds.
            </p>
          </div>
          
          <div className="space-y-lg my-auto">
            <div className="flex items-center gap-md">
              <div className="w-12 h-12 rounded-full bg-secondary-fixed/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-secondary-fixed">bolt</span>
              </div>
              <div>
                <p className="font-label-bold text-label-bold text-white">Instant Booking</p>
                <p className="font-body-sm text-body-sm text-surface-variant">Real-time availability for all local courts.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-md">
              <div className="w-12 h-12 rounded-full bg-secondary-fixed/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-secondary-fixed">groups</span>
              </div>
              <div>
                <p className="font-label-bold text-label-bold text-white">Team Management</p>
                <p className="font-body-sm text-body-sm text-surface-variant">Coordinate matches and splits with ease.</p>
              </div>
            </div>
          </div>
          
          <div className="font-body-sm text-primary-fixed-dim/60">
            © 2024 FindFutsal. High-performance booking for high-performance players.
          </div>
        </div>
      </section>

      {/* Right Side: Signup Form */}
      <section className="w-full md:w-1/2 lg:w-2/5 bg-surface-container-lowest flex items-center justify-center p-gutter md:p-xxl">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-xl flex justify-center md:justify-start">
            <Logo height={42} showText={true} />
          </div>
          
          {/* Header */}
          <div className="mb-xl">
            <h2 className="font-h2 text-h2 text-primary">Get Started</h2>
            <p className="font-body-md text-on-surface-variant">Create your account to start playing or managing.</p>
          </div>
          
          {/* Role Selection */}
          <div className="mb-lg">
            <label className="font-label-bold text-label-bold block mb-xs">I AM A...</label>
            <div className="grid grid-cols-2 p-1 bg-surface-container rounded-lg gap-1 border border-outline-variant/30">
              <button
                type="button"
                className={clsx(
                  'role-toggle py-sm px-md rounded-lg font-label-bold text-label-bold transition-all outline-none',
                  role === 'Player'
                    ? 'bg-secondary-fixed text-on-secondary-fixed shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-variant/50'
                )}
                id="role-player"
                onClick={() => setRole('Player')}
              >
                Player
              </button>
              <button
                type="button"
                className={clsx(
                  'role-toggle py-sm px-md rounded-lg font-label-bold text-label-bold transition-all outline-none',
                  role === 'VenueOwner'
                    ? 'bg-secondary-fixed text-on-secondary-fixed shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-variant/50'
                )}
                id="role-owner"
                onClick={() => setRole('VenueOwner')}
              >
                Venue Owner
              </button>
            </div>
          </div>
          
          {/* Form */}
          <form className="space-y-md" onSubmit={handleSubmit}>
            <div>
              <label className="font-label-bold text-label-bold block mb-xs" htmlFor="full-name">Full Name</label>
              <input
                className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-surface text-on-surface placeholder:text-on-surface-variant/40"
                id="full-name"
                placeholder="John Doe"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div>
                <label className="font-label-bold text-label-bold block mb-xs" htmlFor="email">Email Address</label>
                <input
                  className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-surface text-on-surface placeholder:text-on-surface-variant/40"
                  id="email"
                  placeholder="john@example.com"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="font-label-bold text-label-bold block mb-xs" htmlFor="phone">Phone Number</label>
                <input
                  className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-surface text-on-surface placeholder:text-on-surface-variant/40"
                  id="phone"
                  placeholder="+1 (555) 000-0000"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div>
                <label className="font-label-bold text-label-bold block mb-xs" htmlFor="password">Password</label>
                <input
                  className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-surface text-on-surface placeholder:text-on-surface-variant/40"
                  id="password"
                  placeholder="••••••••"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="font-label-bold text-label-bold block mb-xs" htmlFor="confirm-password">Confirm Password</label>
                <input
                  className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-surface text-on-surface placeholder:text-on-surface-variant/40"
                  id="confirm-password"
                  placeholder="••••••••"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            
            <div className="pt-sm">
              <button
                className="w-full bg-primary text-white font-button text-button py-md rounded-lg shadow-md hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : 'Create Account'}
              </button>
            </div>
          </form>
          
          {/* Divider */}
          <div className="relative my-xl text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant"></div>
            </div>
            <span className="relative px-md bg-surface-container-lowest font-body-sm text-on-surface-variant uppercase tracking-wider">Or continue with</span>
          </div>
          
          {/* Social Auth */}
          <div className="grid grid-cols-2 gap-md">
            <button 
              type="button"
              onClick={() => handleSocialClick('Google')}
              className="flex items-center justify-center gap-sm px-md py-sm rounded-lg border border-outline-variant hover:bg-surface active:scale-95 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              <span className="font-label-bold text-label-bold text-on-surface">Google</span>
            </button>
            <button 
              type="button"
              onClick={() => handleSocialClick('Facebook')}
              className="flex items-center justify-center gap-sm px-md py-sm rounded-lg border border-outline-variant hover:bg-surface active:scale-95 transition-all"
            >
              <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
              </svg>
              <span className="font-label-bold text-label-bold text-on-surface">Facebook</span>
            </button>
          </div>
          
          {/* Navigation Footer */}
          <div className="mt-xxl text-center">
            <p className="font-body-sm text-on-surface-variant">
              Already have an account?{' '}
              <Link className="font-label-bold text-primary hover:underline transition-all" to="/login">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
