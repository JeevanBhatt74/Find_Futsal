import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Slot, Venue } from '@/types'

// ─── Auth Store ───────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        localStorage.setItem('ff_token', token)
        set({ user, token, isAuthenticated: true })
      },

      clearAuth: () => {
        localStorage.removeItem('ff_token')
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    { name: 'ff-auth' }
  )
)

// ─── Booking Store (ephemeral UI state) ───────────────────────────────────────

interface BookingState {
  selectedVenue: Venue | null
  selectedSlot: Slot | null
  bookingStep: 'select-slot' | 'confirm' | 'success'
  setSelectedVenue: (venue: Venue | null) => void
  setSelectedSlot: (slot: Slot | null) => void
  setBookingStep: (step: BookingState['bookingStep']) => void
  resetBooking: () => void
}

export const useBookingStore = create<BookingState>()((set) => ({
  selectedVenue: null,
  selectedSlot: null,
  bookingStep: 'select-slot',

  setSelectedVenue: (venue) => set({ selectedVenue: venue }),
  setSelectedSlot:  (slot)  => set({ selectedSlot: slot }),
  setBookingStep:   (step)  => set({ bookingStep: step }),

  resetBooking: () =>
    set({ selectedVenue: null, selectedSlot: null, bookingStep: 'select-slot' }),
}))
