import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Slot, ApiResponse } from '@/types'

export function useBookingMutations() {
  const queryClient = useQueryClient()

  // 1) Lock Slot Mutation
  const lockSlotMutation = useMutation({
    mutationFn: async (slotId: string) => {
      const response = await api.post<ApiResponse<Slot>>(`/slots/${slotId}/lock`)
      return response.data.data
    },
    onSuccess: (data) => {
      // Invalidate queries to trigger an immediate refetch of slots
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['slots', data.venueId] })
      }
    },
  })

  // 2) Release Lock Mutation
  const releaseLockMutation = useMutation({
    mutationFn: async (slotId: string) => {
      const response = await api.delete<ApiResponse<Slot>>(`/slots/${slotId}/lock`)
      return response.data.data
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['slots', data.venueId] })
      }
    },
  })

  // 3) Confirm Booking Mutation
  const confirmBookingMutation = useMutation({
    mutationFn: async (bookingDetails: {
      slotId: string
      fullName: string
      phone: string
      notes?: string
    }) => {
      const response = await api.post<ApiResponse<any>>('/bookings', bookingDetails)
      return response.data
    },
    onSuccess: (data) => {
      // Clear specific cache query paths upon successfully booked court
      queryClient.invalidateQueries({ queryKey: ['slots'] })
      queryClient.invalidateQueries({ queryKey: ['venues'] })
    },
  })

  return {
    lockSlotMutation,
    releaseLockMutation,
    confirmBookingMutation,
  }
}
