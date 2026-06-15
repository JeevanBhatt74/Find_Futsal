import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=60'
]

export default function ProfilePage() {
  const { user, clearAuth, updateUser } = useAuthStore()
  const navigate = useNavigate()

  // ── States ──
  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [email] = useState(user?.email ?? '')
  const [profileImage, setProfileImage] = useState(user?.profileImage ?? '')
  const [gameReminders, setGameReminders] = useState(user?.gameReminders ?? true)
  const [exclusiveOffers, setExclusiveOffers] = useState(user?.exclusiveOffers ?? true)
  const [bookingAlerts, setBookingAlerts] = useState(user?.bookingAlerts ?? false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Avatar selector state
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)
  const [tempProfileImage, setTempProfileImage] = useState(user?.profileImage ?? '')

  // ── Payment Methods States ──
  const [defaultMethod, setDefaultMethod] = useState<'khalti' | 'banking' | null>('khalti')
  const [isKhaltiConnected, setIsKhaltiConnected] = useState(true)
  const [khaltiPhone, setKhaltiPhone] = useState('9841******')
  const [isBankConnected, setIsBankConnected] = useState(true)
  const [bankName, setBankName] = useState('Nabil Bank')
  const [bankAccount, setBankAccount] = useState('•••• 4421')

  // Modals for linking
  const [isKhaltiModalOpen, setIsKhaltiModalOpen] = useState(false)
  const [isBankModalOpen, setIsBankModalOpen] = useState(false)

  // Input states for modals
  const [khaltiInputPhone, setKhaltiInputPhone] = useState('')
  const [khaltiOtp, setKhaltiOtp] = useState('')
  const [isOtpStep, setIsOtpStep] = useState(false)

  const [bankInputName, setBankInputName] = useState('Nabil Bank')
  const [bankInputAcc, setBankInputAcc] = useState('')

  const handleSetDefault = (method: 'khalti' | 'banking') => {
    if (method === 'khalti' && !isKhaltiConnected) {
      toast.error('Please connect your Khalti Wallet first.')
      return
    }
    if (method === 'banking' && !isBankConnected) {
      toast.error('Please connect your Mobile Banking account first.')
      return
    }
    setDefaultMethod(method)
    toast.success(`💳 Default payment method set to ${method === 'khalti' ? 'Khalti Wallet' : 'Mobile Banking'}.`, {
      position: 'bottom-center'
    })
  }

  const handleDisconnectKhalti = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsKhaltiConnected(false)
    if (defaultMethod === 'khalti') {
      setDefaultMethod(isBankConnected ? 'banking' : null)
    }
    toast.success('Disconnected Khalti Wallet.', { position: 'bottom-center' })
  }

  const handleDisconnectBank = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsBankConnected(false)
    if (defaultMethod === 'banking') {
      setDefaultMethod(isKhaltiConnected ? 'khalti' : null)
    }
    toast.success('Disconnected Mobile Banking account.', { position: 'bottom-center' })
  }

  const handleOpenLinkModal = (method: 'khalti' | 'banking') => {
    if (method === 'khalti') {
      setKhaltiInputPhone('')
      setKhaltiOtp('')
      setIsOtpStep(false)
      setIsKhaltiModalOpen(true)
    } else {
      setBankInputAcc('')
      setBankInputName('Nabil Bank')
      setIsBankModalOpen(true)
    }
  }

  const handleSendKhaltiOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (!khaltiInputPhone.startsWith('9') || khaltiInputPhone.length !== 10) {
      toast.error('Please enter a valid 10-digit Nepalese phone number.')
      return
    }
    setIsOtpStep(true)
    toast.success('OTP verification code sent to ' + khaltiInputPhone, {
      position: 'bottom-center'
    })
  }

  const handleVerifyKhalti = (e: React.FormEvent) => {
    e.preventDefault()
    if (khaltiOtp.length < 4) {
      toast.error('Please enter the verification code.')
      return
    }
    setIsKhaltiConnected(true)
    const masked = khaltiInputPhone.substring(0, 4) + '******'
    setKhaltiPhone(masked)
    setIsKhaltiModalOpen(false)
    if (!defaultMethod) {
      setDefaultMethod('khalti')
    }
    toast.success('🚀 Khalti Wallet connected successfully!', { position: 'bottom-center' })
  }

  const handleVerifyBank = (e: React.FormEvent) => {
    e.preventDefault()
    if (bankInputAcc.length < 8) {
      toast.error('Please enter a valid bank account or mobile number.')
      return
    }
    setIsBankConnected(true)
    setBankName(bankInputName)
    const masked = '•••• ' + bankInputAcc.slice(-4)
    setBankAccount(masked)
    setIsBankModalOpen(false)
    if (!defaultMethod) {
      setDefaultMethod('banking')
    }
    toast.success(`🚀 Connected Mobile Banking (${bankInputName}) successfully!`, { position: 'bottom-center' })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await api.put('/auth/profile', {
        fullName,
        phone,
        profileImage,
        gameReminders,
        exclusiveOffers,
        bookingAlerts
      })
      
      updateUser(response.data.data)
      setShowSuccess(true)
      toast.success("✅ Profile changes saved successfully.", {
        position: 'bottom-center',
        duration: 4000,
      })
      setTimeout(() => setShowSuccess(false), 4000)
    } catch (err: any) {
      const errMsg = err.response?.data?.message ?? 'Could not save profile changes.'
      toast.error(errMsg, { position: 'bottom-center' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDiscard = () => {
    setFullName(user?.fullName ?? '')
    setPhone(user?.phone ?? '')
    setProfileImage(user?.profileImage ?? '')
    setGameReminders(user?.gameReminders ?? true)
    setExclusiveOffers(user?.exclusiveOffers ?? true)
    setBookingAlerts(user?.bookingAlerts ?? false)
    toast.success("Changes discarded.", {
      position: 'bottom-center'
    })
  }

  const handleAvatarUpload = () => {
    setTempProfileImage(profileImage)
    setIsAvatarModalOpen(true)
  }

  const handleSaveAvatar = () => {
    setProfileImage(tempProfileImage)
    setIsAvatarModalOpen(false)
    toast.success('📷 Photo applied. Click "Save Profile" to submit.', {
      position: 'bottom-center'
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 256
        const MAX_HEIGHT = 256
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          // Get compressed data URL (jpeg quality 0.75)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75)
          setTempProfileImage(compressedDataUrl)
          toast.success('📷 Image optimized and loaded successfully.', {
            position: 'bottom-center'
          })
        }
      }
      img.onerror = () => {
        toast.error('Could not load image file.')
      }
      img.src = event.target?.result as string
    }
    reader.onerror = () => {
      toast.error('Could not read image file.')
    }
    reader.readAsDataURL(file)
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
  const avatarUrl = profileImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuDhjXdNFTkKUFGghLDd0PCWsvyqeiNO4n-MCXzUk9WDoNrENYbZfQ82KXppBpDm1cirVHKuALvDfGjoN2nHUT-32loErLwzkGWcxIOZMU6pUDeXrrkQ-3XNjmBskfWLSXxrx6R8geIeTbszVAOvPMHD-WcgVKTDzThG-n7VQ4lQEMUHBYnkFNK69FzKrJKX2zmQh8HS_RJ3HY-H7psVOLKuiG8mTce29tYr7FBxhqtsjney0fPi-f5izIejTS8Uze-u_bOetJT9K14"

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
            <div className="w-32 h-32 rounded-xl border-4 border-emerald-500 overflow-hidden bg-surface shadow-md">
              <img 
                className="w-full h-full object-cover" 
                alt="User Profile" 
                src={avatarUrl}
              />
            </div>
            <button 
              onClick={handleAvatarUpload}
              className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-sm rounded-lg shadow-lg hover:scale-110 active:scale-95 transition-all outline-none"
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
                  <span className="px-md py-xs bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full text-label-bold font-label-bold uppercase">Venue Owner</span>
                  <span className="px-md py-xs bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full text-label-bold font-label-bold uppercase">Verified Operator</span>
                </>
              ) : (
                <>
                  <span className="px-md py-xs bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full text-label-bold font-label-bold uppercase">5-A-Side Pro</span>
                  <span className="px-md py-xs bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full text-label-bold font-label-bold uppercase">Premium Member</span>
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
              <span className="material-symbols-outlined text-emerald-500">edit_square</span>
              <h2 className="font-h3 text-h3">Edit Profile</h2>
            </div>
            
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="flex flex-col gap-xs">
                <label className="font-label-bold text-label-bold text-on-surface">FULL NAME</label>
                <input 
                  className="p-md rounded-lg border border-outline-variant focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-on-surface bg-surface-container-low" 
                  type="text" 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col gap-xs">
                <label className="font-label-bold text-label-bold text-on-surface">PHONE NUMBER</label>
                <input 
                  className="p-md rounded-lg border border-outline-variant focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-on-surface bg-surface-container-low" 
                  type="tel" 
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col gap-xs md:col-span-2">
                <label className="font-label-bold text-label-bold text-on-surface">EMAIL ADDRESS</label>
                <input 
                  className="p-md rounded-lg border border-outline-variant focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-on-surface bg-surface-container-low opacity-60 cursor-not-allowed" 
                  type="email" 
                  disabled
                  value={email}
                />
              </div>
              
              <div className="md:col-span-2 flex flex-col items-end gap-md pt-md relative">
                <div className="flex gap-md">
                  <button 
                    onClick={handleDiscard}
                    className="px-xl py-md font-button text-button text-emerald-500 border-2 border-emerald-500 rounded-lg hover:bg-emerald-50 transition-colors outline-none" 
                    type="button"
                  >
                    Discard Changes
                  </button>
                  <button 
                    className="px-xl py-md font-button text-button bg-emerald-500 text-white border-2 border-transparent rounded-lg hover:bg-emerald-600 active:scale-95 transition-all shadow-md outline-none" 
                    type="submit"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
                
                {/* Success Banner */}
                {showSuccess && (
                  <div className="mt-md w-full bg-emerald-50 border border-emerald-500 text-emerald-600 px-md py-sm rounded-lg flex items-center gap-sm animate-fade-in">
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
                <span className="material-symbols-outlined text-emerald-500">payments</span>
                <h2 className="font-h3 text-h3">Payment Methods</h2>
              </div>
              <button 
                type="button"
                onClick={() => {
                  if (!isKhaltiConnected) {
                    handleOpenLinkModal('khalti')
                  } else if (!isBankConnected) {
                    handleOpenLinkModal('banking')
                  } else {
                    toast.success('All payment options are already connected.')
                  }
                }}
                className="text-emerald-500 font-label-bold text-label-bold flex items-center gap-xs hover:underline outline-none"
              >
                <span className="material-symbols-outlined text-[18px]">add</span> Add New
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              {/* Khalti Wallet */}
              {isKhaltiConnected ? (
                <div 
                  onClick={() => handleSetDefault('khalti')}
                  className={clsx(
                    "p-md rounded-xl transition-all flex items-center gap-md cursor-pointer select-none",
                    defaultMethod === 'khalti' 
                      ? "border-2 border-emerald-500 bg-emerald-50/30" 
                      : "border border-outline-variant hover:border-emerald-500 hover:bg-surface-container-low"
                  )}
                >
                  <div className="bg-white p-sm rounded-lg shadow-sm w-12 h-10 flex items-center justify-center overflow-hidden border border-outline-variant">
                    <img src="/khalti_logo.png" alt="Khalti Logo" className="h-6 w-auto object-contain" />
                  </div>
                  <div className="flex-1">
                    <p className="font-label-bold text-label-bold text-on-surface">Khalti Wallet</p>
                    <p className="text-body-sm text-on-surface-variant">Linked: {khaltiPhone}</p>
                  </div>
                  <div className="flex items-center gap-sm">
                    {defaultMethod === 'khalti' ? (
                      <div className="px-sm py-xs bg-emerald-500 text-white text-[10px] font-bold rounded uppercase">Default</div>
                    ) : (
                      <span className="text-xs text-on-surface-variant hover:text-emerald-500 font-semibold transition-colors">Set Default</span>
                    )}
                    <button 
                      onClick={handleDisconnectKhalti}
                      className="material-symbols-outlined text-outline hover:text-error transition-colors p-xs hover:bg-surface-variant rounded-lg outline-none"
                      title="Disconnect Khalti Wallet"
                      type="button"
                    >
                      delete
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenLinkModal('khalti')}
                  className="p-md rounded-xl border border-dashed border-outline hover:border-emerald-500 hover:bg-emerald-50/10 transition-all flex flex-col items-center justify-center gap-xs text-on-surface-variant text-center w-full min-h-[72px] cursor-pointer"
                >
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-emerald-500">add_circle</span>
                    <span className="font-label-bold text-emerald-500">Link Khalti Wallet</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant/80">Connect your Nepal Khalti Digital Wallet</p>
                </button>
              )}
              
              {/* Mobile Banking */}
              {isBankConnected ? (
                <div 
                  onClick={() => handleSetDefault('banking')}
                  className={clsx(
                    "p-md rounded-xl transition-all flex items-center gap-md cursor-pointer select-none",
                    defaultMethod === 'banking' 
                      ? "border-2 border-emerald-500 bg-emerald-50/30" 
                      : "border border-outline-variant hover:border-emerald-500 hover:bg-surface-container-low"
                  )}
                >
                  <div className="bg-white p-sm rounded-lg shadow-sm w-12 h-10 flex items-center justify-center overflow-hidden border border-outline-variant text-emerald-500">
                    <span className="material-symbols-outlined text-[24px]">account_balance</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-label-bold text-label-bold text-on-surface">Mobile Banking</p>
                    <p className="text-body-sm text-on-surface-variant">{bankName} ({bankAccount})</p>
                  </div>
                  <div className="flex items-center gap-sm">
                    {defaultMethod === 'banking' ? (
                      <div className="px-sm py-xs bg-emerald-500 text-white text-[10px] font-bold rounded uppercase">Default</div>
                    ) : (
                      <span className="text-xs text-on-surface-variant hover:text-emerald-500 font-semibold transition-colors">Set Default</span>
                    )}
                    <button 
                      onClick={handleDisconnectBank}
                      className="material-symbols-outlined text-outline hover:text-error transition-colors p-xs hover:bg-surface-variant rounded-lg outline-none"
                      title="Disconnect Bank Account"
                      type="button"
                    >
                      delete
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenLinkModal('banking')}
                  className="p-md rounded-xl border border-dashed border-outline hover:border-emerald-500 hover:bg-emerald-50/10 transition-all flex flex-col items-center justify-center gap-xs text-on-surface-variant text-center w-full min-h-[72px] cursor-pointer"
                >
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-emerald-500">add_circle</span>
                    <span className="font-label-bold text-emerald-500">Link Mobile Banking</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant/80">Link Nabil Bank, NIC Asia, Global IME, etc.</p>
                </button>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Settings & Actions */}
        <div className="space-y-lg">
          
          {/* Notification Toggles */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
            <div className="flex items-center gap-sm mb-lg">
              <span className="material-symbols-outlined text-emerald-500">notifications_active</span>
              <h2 className="font-h3 text-h3">Notifications</h2>
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
                    gameReminders ? "bg-emerald-500 justify-end" : "bg-surface-variant justify-start"
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
                    exclusiveOffers ? "bg-emerald-500 justify-end" : "bg-surface-variant justify-start"
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
                    bookingAlerts ? "bg-emerald-500 justify-end" : "bg-surface-variant justify-start"
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
              <span className="material-symbols-outlined text-emerald-500">security</span>
              <h2 className="font-h3 text-h3">Security</h2>
            </div>
            
            <div className="space-y-sm">
              <button 
                onClick={() => handleActionSimulate('Change Password')}
                className="w-full flex items-center justify-between p-md rounded-lg hover:bg-surface-container transition-colors text-on-surface text-left outline-none"
                type="button"
              >
                <span className="font-label-bold">Change Password</span>
                <span className="material-symbols-outlined text-emerald-500">chevron_right</span>
              </button>
              <button 
                onClick={() => handleActionSimulate('Two-Factor Auth')}
                className="w-full flex items-center justify-between p-md rounded-lg hover:bg-surface-container transition-colors text-on-surface text-left outline-none"
                type="button"
              >
                <span className="font-label-bold">Two-Factor Auth</span>
                <span className="material-symbols-outlined text-emerald-500">chevron_right</span>
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

      {/* ── Avatar Selection Popup Modal ── */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-canvas rounded-[12px] border border-outline-variant shadow-modal max-w-md w-full mx-4 p-6 relative animate-scale-in">
            {/* Close button */}
            <button
              onClick={() => setIsAvatarModalOpen(false)}
              className="absolute top-4 right-4 text-cool-grey hover:text-slate-text p-1 hover:bg-surface-muted rounded-full transition-colors text-[24px] leading-none"
            >
              &times;
            </button>

            <h3 className="text-[20px] font-bold text-slate-text mb-4">Choose Profile Picture</h3>
            
            <p className="body-regular mb-4">Select one of our preset player avatars:</p>
            
            {/* Preset Avatars Grid */}
            <div className="grid grid-cols-4 gap-md mb-5">
              {PRESET_AVATARS.map((url, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setTempProfileImage(url)}
                  className={clsx(
                    "w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer",
                    tempProfileImage === url ? "border-emerald-500 scale-95 shadow-sm" : "border-transparent opacity-70 hover:opacity-100"
                  )}
                >
                  <img src={url} alt={`Preset ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Local Image Upload */}
            <div className="flex flex-col gap-xs mb-5">
              <label className="font-label-bold text-label-bold text-on-surface">OR UPLOAD LOCAL IMAGE</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-outline-variant border-dashed rounded-xl hover:border-emerald-500 transition-colors bg-surface-container-low relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="avatar-file-upload"
                />
                <div className="space-y-2 text-center pointer-events-none flex flex-col items-center">
                  {tempProfileImage && !PRESET_AVATARS.includes(tempProfileImage) ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-sm mb-1">
                      <img src={tempProfileImage} alt="Uploaded preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-white text-[20px]">edit</span>
                      </div>
                    </div>
                  ) : (
                    <span className="material-symbols-outlined text-[36px] text-outline group-hover:text-emerald-500 transition-colors">
                      upload_file
                    </span>
                  )}
                  <div className="flex text-body-sm text-on-surface-variant justify-center font-medium">
                    <span className="text-emerald-500 hover:underline">Upload a file</span>
                    <span className="pl-1">or drag and drop</span>
                  </div>
                  <p className="text-body-xs text-on-surface-variant/80">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsAvatarModalOpen(false)}
                className="btn-secondary w-1/3"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAvatar}
                className="btn-primary w-2/3"
                type="button"
              >
                Apply Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Link Khalti Modal ── */}
      {isKhaltiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-canvas rounded-[12px] border border-outline-variant shadow-modal max-w-md w-full mx-4 p-6 relative animate-scale-in">
            <button
              onClick={() => setIsKhaltiModalOpen(false)}
              className="absolute top-4 right-4 text-cool-grey hover:text-slate-text p-1 hover:bg-surface-muted rounded-full transition-colors text-[24px] leading-none"
            >
              &times;
            </button>

            <div className="flex items-center gap-sm mb-4">
              <img src="/khalti_logo.png" alt="Khalti Logo" className="h-7 w-auto object-contain" />
              <h3 className="text-[20px] font-bold text-slate-text">Link Khalti Wallet</h3>
            </div>

            {!isOtpStep ? (
              <form onSubmit={handleSendKhaltiOtp} className="space-y-4">
                <p className="text-body-sm text-on-surface-variant">
                  Enter your 10-digit Khalti mobile number to connect your wallet for quick, one-click booking payments.
                </p>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-bold text-label-bold text-on-surface">KHALTI MOBILE NUMBER</label>
                  <input
                    className="p-md rounded-lg border border-outline-variant focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-on-surface bg-surface-container-low"
                    type="tel"
                    placeholder="98XXXXXXXX"
                    required
                    maxLength={10}
                    value={khaltiInputPhone}
                    onChange={(e) => setKhaltiInputPhone(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setIsKhaltiModalOpen(false)}
                    className="btn-secondary w-1/3 font-medium cursor-pointer"
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="px-xl py-md font-button text-button bg-emerald-500 text-white border border-transparent rounded-lg hover:bg-emerald-600 active:scale-95 transition-all shadow-md outline-none w-2/3 cursor-pointer"
                    type="submit"
                  >
                    Send OTP Code
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyKhalti} className="space-y-4">
                <p className="text-body-sm text-on-surface-variant">
                  A verification code has been sent to <span className="font-semibold text-on-surface">{khaltiInputPhone}</span>. Enter the 4-digit code to connect.
                </p>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-bold text-label-bold text-on-surface">ENTER 4-DIGIT OTP</label>
                  <input
                    className="p-md rounded-lg border border-outline-variant focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-center tracking-widest text-lg font-bold outline-none transition-all text-on-surface bg-surface-container-low"
                    type="text"
                    placeholder="••••"
                    required
                    maxLength={4}
                    value={khaltiOtp}
                    onChange={(e) => setKhaltiOtp(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setIsOtpStep(false)}
                    className="btn-secondary w-1/3 font-medium cursor-pointer"
                    type="button"
                  >
                    Back
                  </button>
                  <button
                    className="px-xl py-md font-button text-button bg-emerald-500 text-white border border-transparent rounded-lg hover:bg-emerald-600 active:scale-95 transition-all shadow-md outline-none w-2/3 cursor-pointer"
                    type="submit"
                  >
                    Verify & Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Link Mobile Banking Modal ── */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-canvas rounded-[12px] border border-outline-variant shadow-modal max-w-md w-full mx-4 p-6 relative animate-scale-in">
            <button
              onClick={() => setIsBankModalOpen(false)}
              className="absolute top-4 right-4 text-cool-grey hover:text-slate-text p-1 hover:bg-surface-muted rounded-full transition-colors text-[24px] leading-none"
            >
              &times;
            </button>

            <div className="flex items-center gap-sm mb-4">
              <span className="material-symbols-outlined text-emerald-500 text-[28px]">account_balance</span>
              <h3 className="text-[20px] font-bold text-slate-text">Link Mobile Banking</h3>
            </div>

            <form onSubmit={handleVerifyBank} className="space-y-4">
              <p className="text-body-sm text-on-surface-variant">
                Select your preferred Nepali bank and enter your account or mobile number to link direct banking payments.
              </p>

              <div className="flex flex-col gap-xs">
                <label className="font-label-bold text-label-bold text-on-surface">SELECT NEPALESE BANK</label>
                <select
                  className="p-md rounded-lg border border-outline-variant focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-on-surface bg-surface-container-low"
                  value={bankInputName}
                  onChange={(e) => setBankInputName(e.target.value)}
                >
                  <option value="Nabil Bank">Nabil Bank</option>
                  <option value="Global IME Bank">Global IME Bank</option>
                  <option value="Nepal Investment Mega Bank">Nepal Investment Mega Bank</option>
                  <option value="Prabhu Bank">Prabhu Bank</option>
                  <option value="NIC Asia Bank">NIC Asia Bank</option>
                  <option value="Himalayan Bank">Himalayan Bank</option>
                  <option value="Everest Bank">Everest Bank</option>
                </select>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-bold text-label-bold text-on-surface">MOBILE / ACCOUNT NUMBER</label>
                <input
                  className="p-md rounded-lg border border-outline-variant focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-on-surface bg-surface-container-low"
                  type="text"
                  placeholder="98XXXXXXXX or Account ID"
                  required
                  value={bankInputAcc}
                  onChange={(e) => setBankInputAcc(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsBankModalOpen(false)}
                  className="btn-secondary w-1/3 font-medium cursor-pointer"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="px-xl py-md font-button text-button bg-emerald-500 text-white border border-transparent rounded-lg hover:bg-emerald-600 active:scale-95 transition-all shadow-md outline-none w-2/3 cursor-pointer"
                  type="submit"
                >
                  Link Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
