import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import Logo from '@/components/layout/Logo'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Redirect to booking checkout if user was redirected from there, else go home
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.')
      toast.error('Please enter both email and password.')
      return
    }

    setIsLoading(true)

    try {
      const response = await api.post('/auth/login', { email, password })
      const { user, token } = response.data.data
      
      setAuth(user, token)
      toast.success('Welcome back to FindFutsal!')
      if (user.role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.message ?? 'Invalid email address or password.'
      setErrorMsg(errMsg)
      toast.error(errMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialClick = (platform: string) => {
    toast.error(`${platform} authentication is not enabled in this prototype.`)
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-gutter overflow-x-hidden relative"
      style={{
        backgroundColor: '#f7faf3',
        backgroundImage: 'radial-gradient(#bfc9be 0.5px, transparent 0.5px)',
        backgroundSize: '24px 24px'
      }}
    >
      {/* Decorative Background Elements */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] opacity-[0.03] rounded-full blur-[120px] pointer-events-none" style={{ background: 'linear-gradient(135deg, #1a6b3c 0%, #005129 100%)' }} />
      <div className="fixed bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-secondary-container opacity-[0.05] rounded-full blur-[100px] pointer-events-none" />

      <main className="w-full max-w-[480px] z-10">
        {/* Brand Logo Container */}
        <div className="flex justify-center mb-xl">
          <Logo height={48} showText={true} />
        </div>

        {/* Login Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-md p-xl md:p-xxl">
          <div className="text-center mb-xl">
            <h1 className="font-h2 text-h2 text-primary mb-xs">Welcome Back</h1>
            <p className="font-body-md text-on-surface-variant">Access your bookings and court manager.</p>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-md mb-xl">
            <button 
              type="button"
              onClick={() => handleSocialClick('Google')}
              className="flex items-center justify-center gap-sm bg-white border border-outline-variant hover:bg-surface-variant/20 transition-all py-sm px-md rounded-lg font-label-bold text-on-surface active:scale-95 duration-150"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              Google
            </button>
            <button 
              type="button"
              onClick={() => handleSocialClick('Facebook')}
              className="flex items-center justify-center gap-sm bg-white border border-outline-variant hover:bg-surface-variant/20 transition-all py-sm px-md rounded-lg font-label-bold text-on-surface active:scale-95 duration-150"
            >
              <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
              </svg>
              Facebook
            </button>
          </div>

          <div className="relative mb-xl">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant"></div>
            </div>
            <div className="relative flex justify-center text-label-bold">
              <span className="bg-surface-container-lowest px-md text-on-surface-variant font-label-bold uppercase text-[10px] tracking-widest">Or login with email</span>
            </div>
          </div>

          {/* Form Error Banner */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-error-container text-on-error-container text-xs font-semibold animate-fade-in flex gap-2 items-center border border-error/15">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-lg">
            <div>
              <label className="block font-label-bold text-label-bold mb-xs text-on-surface" htmlFor="email">Email Address</label>
              <input 
                className="w-full px-md py-sm rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/40" 
                id="email" 
                name="email" 
                placeholder="coach@proclub.com" 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-xs">
                <label className="block font-label-bold text-label-bold text-on-surface" htmlFor="password">Password</label>
                <Link className="text-body-sm font-label-bold text-primary hover:underline transition-all no-underline" to="/forgot-password">Forgot Password?</Link>
              </div>
              <div className="relative">
                <input 
                  className="w-full px-md py-sm rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/40 pr-10" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary focus:outline-none flex items-center justify-center" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-sm">
              <input className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary" id="remember" type="checkbox"/>
              <label className="font-body-sm text-on-surface-variant select-none" htmlFor="remember">Stay signed in for 30 days</label>
            </div>
            
            <button 
              className="w-full bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed hover:shadow-lg transition-all duration-200 py-md rounded-lg font-button text-button shadow-sm active:scale-[0.98] mt-base flex items-center justify-center gap-2" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-on-secondary-container/30 border-t-on-secondary-container rounded-full animate-spin" />
                  <span>Signing In…</span>
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="mt-xl pt-lg border-t border-outline-variant text-center">
            <p className="font-body-md text-on-surface-variant">
              Don't have an account?{' '}
              <Link className="text-primary font-label-bold hover:underline transition-colors no-underline" to="/register">Sign Up</Link>
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-lg flex justify-center gap-lg text-body-sm text-on-surface-variant">
          <Link className="hover:text-primary transition-colors no-underline" to="/#help">Help Center</Link>
          <Link className="hover:text-primary transition-colors no-underline" to="/privacy">Privacy Policy</Link>
          <Link className="hover:text-primary transition-colors no-underline" to="/terms">Terms</Link>
        </div>
      </main>
    </div>
  )
}
