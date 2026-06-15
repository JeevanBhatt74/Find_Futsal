import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, AlertTriangle } from 'lucide-react'
import { useBookingStore } from '@/store'
import { useBookingMutations } from '@/hooks/useBooking'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function LockCountdownTimer() {
  const navigate = useNavigate()
  const { selectedSlot, resetBooking } = useBookingStore()
  const { releaseLockMutation } = useBookingMutations()

  if (!selectedSlot) return null

  // Calculate expiration time left in milliseconds
  const lockTime = selectedSlot.lockTimestamp ? new Date(selectedSlot.lockTimestamp).getTime() : Date.now()
  const durationMs = (selectedSlot.lockDurationMinutes || 10) * 60 * 1000
  const expiryTime = lockTime + durationMs

  const calculateTimeLeft = () => Math.max(0, Math.floor((expiryTime - Date.now()) / 1000))

  const [secondsLeft, setSecondsLeft] = useState(calculateTimeLeft())

  useEffect(() => {
    // Sync initial state just in case of component mounts delays
    setSecondsLeft(calculateTimeLeft())
  }, [selectedSlot])

  useEffect(() => {
    if (secondsLeft <= 0) {
      handleExpiry()
      return
    }

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft()
      setSecondsLeft(remaining)

      if (remaining <= 0) {
        clearInterval(timer)
        handleExpiry()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [secondsLeft])

  const handleExpiry = async () => {
    toast.error('Your reservation has expired! The slot has been released.', { id: 'lock-expiry-toast' })
    try {
      // Call background release lock mutation
      await releaseLockMutation.mutateAsync(selectedSlot._id)
    } catch (error) {
      console.error('Failed to release lock on expiration:', error)
    } finally {
      const venueId = selectedSlot.venueId
      resetBooking()
      navigate(`/venues/${venueId}`)
    }
  }

  // Formatting MM:SS
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  // Progress Bar percentage calculation
  const totalSeconds = (selectedSlot.lockDurationMinutes || 10) * 60
  const progressPercent = (secondsLeft / totalSeconds) * 100

  const isUrgent = secondsLeft < 120 // less than 2 minutes

  return (
    <div className={clsx(
      'card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-colors duration-300 border-l-4 shadow-sm mb-6',
      isUrgent
        ? 'border-red-500 bg-red-50/50 border-l-red-500 text-red-700'
        : 'border-amber-500 bg-amber-50/50 border-l-amber-500 text-amber-700'
    )}>
      <div className="flex items-center gap-2">
        {isUrgent ? (
          <AlertTriangle size={18} className="text-red-500 shrink-0 animate-bounce" />
        ) : (
          <Clock size={18} className="text-amber-500 shrink-0" />
        )}
        <div className="text-sm font-medium">
          {isUrgent ? (
            <span><strong>Urgent:</strong> Reservation expiring. Complete booking immediately to secure your court.</span>
          ) : (
            <span>We have locked this court slot for you while you fill out your checkout details.</span>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:items-end gap-1.5 min-w-[120px] shrink-0">
        <div className="text-lg font-bold font-display tracking-wider flex items-center justify-between sm:justify-end gap-2">
          <span className="text-xs text-gray-400 font-normal">TIME REMAINING:</span>
          <span>{timeString}</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
          <div
            className={clsx(
              'h-full rounded-full transition-all duration-1000 ease-linear',
              isUrgent ? 'bg-red-500' : 'bg-amber-500'
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  )
}
