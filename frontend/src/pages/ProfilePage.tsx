import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function ProfilePage() {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  // ── States ──
  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [email] = useState(user?.email ?? '')
  const [gameReminders, setGameReminders] = useState(true)
  const [exclusiveOffers, setExclusiveOffers] = useState(true)
  const [bookingAlerts, setBookingAlerts] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // Simulate saving profile data
    setTimeout(() => {
      setIsSaving(false)
      setShowSuccess(true)
      toast.success("✅ Profile changes saved successfully.", {
        position: 'bottom-center',
        duration: 4000,
      })
      // Hide the inline success message after 4 seconds
      setTimeout(() => setShowSuccess(false), 4000)
    }, 800)
  }

  const handleDiscard = () => {
    setFullName(user?.fullName ?? '')
    setPhone(user?.phone ?? '')
    toast.success("Changes discarded.", {
      position: 'bottom-center'
    })
  }

  const handleAvatarUpload = () => {
    toast.success('📷 Profile photo upload simulated successfully!', {
      position: 'bottom-center'
    })
  }

  const handleLogout = () => {
    clearAuth()
    toast.success('Logged out successfully.')
    navigate('/')
  }

  const handleActionSimulate = (actionName: string) => {
    toast.success(`🛡️ ${actionName} feature simulated in this prototype.`, {
      position: 'bottom-center'
    })
  }

  // Get default avatar or user profile image
  const avatarUrl = user?.profileImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuB1GdiPaXW9NFxkq-7CCoGzMgaOcHqALtRnhFvJcHDEvqU2o3GkhnWWvkJuyJfPecHs5JSvracA6k4qMwb69O2C6RFuK-5JnUiI8e4xaTtCaF5hllU2zE7paoB7lzHUy6aPy0O2N52o-E0PdvT5pwAOvFErIy55D_x_Fy5cHNsyG_4OhXSBD_4tBbqGZOzntodjgB-K1wFE2d_1HwzOyag_Nx2gIfTGkmjZF6PS1nxoq3v5Cy4tjekJ6DaJWb4E_gjTGPYM_8KZSjs"

  return (
    <main className="max-w-7xl mx-auto px-margin py-xl min-h-screen">
      
      {/* User Profile Hero Section */}
      <div className="relative overflow-hidden bg-primary-container rounded-xl p-xl mb-xl text-white">
        <div 
          className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none" 
          style={{
            backgroundImage: 'radial-gradient(#10b981 0.5px, transparent 0.5px)',
            backgroundSize: '24px 24px'
          }}
        />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-lg">
          <div className="relative">
            <div className="w-32 h-32 rounded-xl border-4 border-emerald-accent overflow-hidden bg-surface shadow-md">
              <img 
                className="w-full h-full object-cover" 
                alt="User Profile" 
                src={avatarUrl}
              />
            </div>
            <button 
              onClick={handleAvatarUpload}
              className="absolute -bottom-2 -right-2 bg-emerald-accent text-white p-sm rounded-lg shadow-lg hover:scale-110 active:scale-95 transition-all outline-none"
            >
              <span className="material-symbols-outlined text-[20px] block">photo_camera</span>
            </button>
          </div>
          <div className="text-center md:text-left">
            <h1 className="font-h1 text-h1 text-white uppercase leading-none mb-1">
              {fullName || 'Alex Mercer'}
            </h1>
            <p className="font-body-lg text-body-lg opacity-90">
              {email || 'alex.mercer@pro-athlete.com'}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-sm mt-sm">
              {user?.role === 'admin' ? (
                <>
                  <span className="px-md py-xs bg-emerald-accent/20 border border-emerald-accent/30 text-emerald-accent rounded-full text-label-bold font-label-bold uppercase">Venue Owner</span>
                  <span className="px-md py-xs bg-emerald-accent/20 border border-emerald-accent/30 text-emerald-accent rounded-full text-label-bold font-label-bold uppercase">Verified Operator</span>
                </>
              ) : (
                <>
                  <span className="px-md py-xs bg-emerald-accent/20 border border-emerald-accent/30 text-emerald-accent rounded-full text-label-bold font-label-bold uppercase">5-A-Side Pro</span>
                  <span className="px-md py-xs bg-emerald-accent/20 border border-emerald-accent/30 text-emerald-accent rounded-full text-label-bold font-label-bold uppercase">Premium Member</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        
        {/* Left Column: Forms */}
        <div className="lg:col-span-2 space-y-lg">
          
          {/* Edit Profile Section */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
            <div className="flex items-center gap-sm mb-lg">
              <span className="material-symbols-outlined text-emerald-accent">edit_square</span>
              <h2 className="font-h3 text-h3">Edit Profile</h2>
            </div>
            
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="flex flex-col gap-xs">
                <label className="font-label-bold text-label-bold text-on-surface">FULL NAME</label>
                <input 
                  className="p-md rounded-lg border border-outline-variant focus:border-emerald-accent focus:ring-1 focus:ring-emerald-accent outline-none transition-all text-on-surface bg-surface-container-low" 
                  type="text" 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col gap-xs">
                <label className="font-label-bold text-label-bold text-on-surface">PHONE NUMBER</label>
                <input 
                  className="p-md rounded-lg border border-outline-variant focus:border-emerald-accent focus:ring-1 focus:ring-emerald-accent outline-none transition-all text-on-surface bg-surface-container-low" 
                  type="tel" 
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col gap-xs md:col-span-2">
                <label className="font-label-bold text-label-bold text-on-surface">EMAIL ADDRESS</label>
                <input 
                  className="p-md rounded-lg border border-outline-variant focus:border-emerald-accent focus:ring-1 focus:ring-emerald-accent outline-none transition-all text-on-surface bg-surface-container-low opacity-60 cursor-not-allowed" 
                  type="email" 
                  disabled
                  value={email}
                />
              </div>
              
              <div className="md:col-span-2 flex flex-col items-end gap-md pt-md relative">
                <div className="flex gap-md">
                  <button 
                    onClick={handleDiscard}
                    className="px-xl py-md font-button text-button text-emerald-accent border-2 border-emerald-accent rounded-lg hover:bg-surface-container transition-colors outline-none" 
                    type="button"
                  >
                    Discard Changes
                  </button>
                  <button 
                    className="px-xl py-md font-button text-button bg-emerald-accent text-white rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-md outline-none" 
                    type="submit"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
                
                {/* Success Banner */}
                {showSuccess && (
                  <div className="mt-md w-full bg-emerald-accent/10 border border-emerald-accent text-emerald-accent px-md py-sm rounded-lg flex items-center gap-sm animate-fade-in">
                    <span className="text-sm font-medium">✅ Profile changes saved successfully.</span>
                  </div>
                )}
              </div>
            </form>
          </section>

          {/* Payment Methods Section */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
            <div className="flex items-center justify-between mb-lg">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-emerald-accent">payments</span>
                <h2 className="font-h3 text-h3">Payment Methods</h2>
              </div>
              <button 
                type="button"
                onClick={() => handleActionSimulate('Add Payment Method')}
                className="text-emerald-accent font-label-bold text-label-bold flex items-center gap-xs hover:underline outline-none"
              >
                <span className="material-symbols-outlined text-[18px]">add</span> Add New
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              {/* Card 1 */}
              <div className="p-md rounded-xl border-2 border-emerald-accent bg-emerald-accent/5 flex items-center gap-md">
                <div className="bg-white p-sm rounded-lg shadow-sm">
                  <span className="material-symbols-outlined text-emerald-accent block">credit_card</span>
                </div>
                <div className="flex-1">
                  <p className="font-label-bold text-label-bold text-on-surface">•••• •••• •••• 4421</p>
                  <p className="text-body-sm text-on-surface-variant">Expires 09/26</p>
                </div>
                <div className="px-sm py-xs bg-emerald-accent text-white text-[10px] font-bold rounded uppercase">Default</div>
              </div>
              
              {/* Card 2 */}
              <div className="p-md rounded-xl border border-outline-variant hover:border-emerald-accent transition-colors flex items-center gap-md">
                <div className="bg-white p-sm rounded-lg shadow-sm">
                  <span className="material-symbols-outlined text-outline block">credit_card</span>
                </div>
                <div className="flex-1">
                  <p className="font-label-bold text-label-bold text-on-surface">•••• •••• •••• 8890</p>
                  <p className="text-body-sm text-on-surface-variant">Expires 12/25</p>
                </div>
                <button 
                  onClick={() => handleActionSimulate('Delete Card')}
                  className="material-symbols-outlined text-outline hover:text-error transition-colors outline-none"
                  type="button"
                >
                  delete
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Settings & Actions */}
        <div className="space-y-lg">
          
          {/* Notification Toggles */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
            <div className="flex items-center gap-sm mb-lg">
              <span className="material-symbols-outlined text-emerald-accent">notifications_active</span>
              <h2 class="font-h3 text-h3">Notifications</h2>
            </div>
            
            <div className="space-y-md">
              <div className="flex items-center justify-between py-sm">
                <div>
                  <p className="font-label-bold text-label-bold text-on-surface">Game Reminders</p>
                  <p className="text-body-sm text-on-surface-variant">Get notified 1h before booking</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setGameReminders(!gameReminders)}
                  className={clsx(
                    "w-12 h-6 rounded-full relative flex items-center px-1 transition-colors duration-200 outline-none",
                    gameReminders ? "bg-emerald-accent justify-end" : "bg-surface-variant justify-start"
                  )}
                >
                  <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                </button>
              </div>
              
              <div className="flex items-center justify-between py-sm border-t border-outline-variant">
                <div>
                  <p className="font-label-bold text-label-bold text-on-surface">Exclusive Offers</p>
                  <p className="text-body-sm text-on-surface-variant">Discounts and new court alerts</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setExclusiveOffers(!exclusiveOffers)}
                  className={clsx(
                    "w-12 h-6 rounded-full relative flex items-center px-1 transition-colors duration-200 outline-none",
                    exclusiveOffers ? "bg-emerald-accent justify-end" : "bg-surface-variant justify-start"
                  )}
                >
                  <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                </button>
              </div>
              
              <div className="flex items-center justify-between py-sm border-t border-outline-variant">
                <div>
                  <p className="font-label-bold text-label-bold text-on-surface">Booking Alerts</p>
                  <p className="text-body-sm text-on-surface-variant">Confirmations and changes</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setBookingAlerts(!bookingAlerts)}
                  className={clsx(
                    "w-12 h-6 rounded-full relative flex items-center px-1 transition-colors duration-200 outline-none",
                    bookingAlerts ? "bg-emerald-accent justify-end" : "bg-surface-variant justify-start"
                  )}
                >
                  <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                </button>
              </div>
            </div>
          </section>

          {/* Support & Security Card */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
            <div className="flex items-center gap-sm mb-lg">
              <span className="material-symbols-outlined text-emerald-accent">security</span>
              <h2 className="font-h3 text-h3">Security</h2>
            </div>
            
            <div className="space-y-sm">
              <button 
                onClick={() => handleActionSimulate('Change Password')}
                className="w-full flex items-center justify-between p-md rounded-lg hover:bg-surface-container transition-colors text-on-surface text-left outline-none"
                type="button"
              >
                <span className="font-label-bold">Change Password</span>
                <span className="material-symbols-outlined text-emerald-accent">chevron_right</span>
              </button>
              <button 
                onClick={() => handleActionSimulate('Two-Factor Auth')}
                className="w-full flex items-center justify-between p-md rounded-lg hover:bg-surface-container transition-colors text-on-surface text-left outline-none"
                type="button"
              >
                <span className="font-label-bold">Two-Factor Auth</span>
                <span className="material-symbols-outlined text-emerald-accent">chevron_right</span>
              </button>
              <button 
                onClick={() => handleActionSimulate('Delete Account')}
                className="w-full flex items-center justify-between p-md rounded-lg hover:bg-surface-container transition-colors group text-left outline-none"
                type="button"
              >
                <span className="font-label-bold text-error">Delete Account</span>
                <span className="material-symbols-outlined text-error group-hover:scale-110 transition-transform">delete_forever</span>
              </button>
            </div>
          </section>

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="w-full py-md bg-error text-on-error rounded-xl font-h3 text-h3 flex items-center justify-center gap-md hover:brightness-110 active:scale-[0.98] transition-all shadow-md outline-none border-none cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>

      </div>
    </main>
  )
}
