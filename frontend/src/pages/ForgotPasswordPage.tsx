import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!email) {
      setErrorMsg('Please enter your email address.')
      toast.error('Please enter your email address.')
      return
    }

    setIsLoading(true)

    try {
      // Simulate network request for password recovery
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsSubmitted(true)
      toast.success('Recovery link sent successfully!')
    } catch (err: any) {
      setErrorMsg('Failed to send recovery email. Please try again.')
      toast.error('Failed to send recovery email.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="page-container flex items-center justify-center min-h-[80vh] py-12 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-72 h-72 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md card glass p-8 shadow-2xl relative z-10 border border-white/10 backdrop-blur-md">
        {!isSubmitted ? (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary mb-3 border border-primary/20">
                <Mail size={28} />
              </div>
              <h1 className="text-2xl font-display font-bold text-slate-text">Reset Password</h1>
              <p className="text-sm text-gray-400 mt-1">Enter your email and we'll send you recovery steps</p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-[8px] bg-alert-danger-bg border border-red-200 text-alert-danger-text text-xs font-semibold animate-fade-in flex gap-2 items-center">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Email Address */}
              <div className="floating-label-group">
                <input
                  id="forgot-email"
                  type="email"
                  required
                  className="floating-input"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <label htmlFor="forgot-email" className="floating-label">Email Address</label>
              </div>

              {/* Submit Action */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full btn-lg mt-2 disabled:opacity-50 disabled:pointer-events-none group"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending Link…
                  </span>
                ) : (
                  <>
                    <span>Send Recovery Link</span>
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="divider !my-6 text-gray-300" />

            <div className="text-center text-sm text-gray-500">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-cool-grey hover:text-slate-text font-semibold no-underline"
              >
                <ArrowLeft size={14} />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-4 animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={36} className="text-emerald-500" />
            </div>
            <h1 className="text-2xl font-display font-bold text-slate-text mb-2">Check Your Email</h1>
            <p className="text-sm text-gray-400 max-w-sm mx-auto mb-8 leading-relaxed">
              We have sent a password recovery link to <strong className="text-slate-text">{email}</strong>. Please check your inbox and spam folders.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary w-full btn-lg"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
