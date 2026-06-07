import { Link } from 'react-router-dom'
import { ArrowLeft, Scale } from 'lucide-react'

export default function TermsPage() {
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
            <Scale size={24} />
          </div>
          <div>
            <h1 className="text-[28px] font-bold text-slate-text font-display">Terms of Service</h1>
            <p className="text-xs text-cool-grey font-semibold mt-0.5">Last updated: June 06, 2026</p>
          </div>
        </div>

        <div className="prose prose-sm max-w-none space-y-6 text-sm text-slate-text leading-relaxed">
          <section>
            <h3 className="text-[16px] font-bold text-slate-text mb-2">1. Booking Agreement</h3>
            <p className="text-cool-grey">
              By reserving a futsal court slot via the FindFutsal booking platform, you confirm your compliance with these Terms. You verify that all profile details (such as your contact phone number) are accurate and valid.
            </p>
          </section>

          <section>
            <h3 className="text-[16px] font-bold text-slate-text mb-2">2. Slot Locking & Expiration Rules</h3>
            <p className="text-cool-grey">
              Selecting an available futsal slot triggers an atomic 5-minute hold to let you review details and pay. If you do not submit the booking form before the hold countdown reaches zero:
            </p>
            <ul className="list-disc list-inside pl-4 mt-2 text-cool-grey space-y-1">
              <li>The hold is marked as expired.</li>
              <li>The slot status is updated to 'Available' globally.</li>
              <li>Other customers can lock and book the slot.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-[16px] font-bold text-slate-text mb-2">3. Payments & Cancellations</h3>
            <p className="text-cool-grey">
              Payments are handled either as a deposit via integrated digital wallets or as cash at the venue's check-in counter. Cancellations made within 24 hours of the match start time are subject to non-refundable deposit penalties at the discretion of the venue partners.
            </p>
          </section>

          <section>
            <h3 className="text-[16px] font-bold text-slate-text mb-2">4. Disclaimers & Venue Liability</h3>
            <p className="text-cool-grey">
              FindFutsal acts as an intermediary search engine. The venue partner is solely responsible for maintaining court safety parameters, lighting facilities, and addressing any bodily injuries incurred during playing hours.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
