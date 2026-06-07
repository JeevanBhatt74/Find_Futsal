import { Link } from 'react-router-dom'
import { ArrowLeft, Shield } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="page-container py-10 max-w-3xl mx-auto animate-fade-in">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-cool-grey hover:text-slate-text text-sm font-semibold mb-6 no-underline"
      >
        <ArrowLeft size={16} />
        Back to Home
      </Link>

      <div className="card p-6 sm:p-10 bg-white border border-gray-150 rounded-[12px] shadow-sm">
        <div className="flex items-center gap-3.5 border-b border-gray-100 pb-5 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-[28px] font-bold text-slate-text font-display">Privacy Policy</h1>
            <p className="text-xs text-cool-grey font-semibold mt-0.5">Last updated: June 06, 2026</p>
          </div>
        </div>

        <div className="prose prose-sm max-w-none space-y-6 text-sm text-slate-text leading-relaxed">
          <section>
            <h3 className="text-[16px] font-bold text-slate-text mb-2">1. Information We Collect</h3>
            <p className="text-cool-grey">
              We collect information you provide directly to us, such as when you create an account, search for venues, lock slots, or make a booking payment. This details include:
            </p>
            <ul className="list-disc list-inside pl-4 mt-2 text-cool-grey space-y-1">
              <li>Contact credentials (e.g. name, email address, phone number).</li>
              <li>Futsal slot bookings and transaction history logs.</li>
              <li>Technical analytics data (IP address, device characteristics, operating systems).</li>
            </ul>
          </section>

          <section>
            <h3 className="text-[16px] font-bold text-slate-text mb-2">2. How We Use Your Information</h3>
            <p className="text-cool-grey">
              We process and leverage your profile datasets to keep the booking system functional, reliable, and secure. We use this information to:
            </p>
            <ul className="list-disc list-inside pl-4 mt-2 text-cool-grey space-y-1">
              <li>Process and confirm your futsal court slots instantly.</li>
              <li>Send transaction logs, status locks, and WhatsApp notifications.</li>
              <li>Validate contact parameters to prevent double-booking attempts and malicious lock holds.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-[16px] font-bold text-slate-text mb-2">3. Data Security</h3>
            <p className="text-cool-grey">
              We implement industry-standard cryptographic keys, security groups, and encryption strategies (SSL/TLS protocol rules) to secure your profiles against unauthorized leakage, modification, or destruction. We do not sell or lease user lists to advertising agencies.
            </p>
          </section>

          <section>
            <h3 className="text-[16px] font-bold text-slate-text mb-2">4. Your Data Rights</h3>
            <p className="text-cool-grey">
              You are entitled to retrieve, modify, or command the complete deletion of your personal details and account parameters by contacting our administration support desk at <a href="mailto:privacy@findfutsal.com.np" className="text-primary hover:underline">privacy@findfutsal.com.np</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
