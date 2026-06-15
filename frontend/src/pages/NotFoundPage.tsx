import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="page-container py-32 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-6">
        <Zap size={30} className="text-emerald-500" />
      </div>
      <h1 className="text-7xl font-display font-extrabold text-gray-100 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-slate-text mb-3">Page Not Found</h2>
      <p className="text-gray-400 max-w-sm mx-auto mb-8">
        Looks like this page doesn't exist. Let's get you back to the pitch.
      </p>
      <Link to="/" className="btn-primary btn-lg no-underline">
        Back to Home
      </Link>
    </div>
  )
}
