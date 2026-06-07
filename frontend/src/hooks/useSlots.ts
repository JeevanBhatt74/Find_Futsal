import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Slot } from '@/types'

export function useSlots(venueId?: string, date?: string) {
  return useQuery({
    queryKey: ['slots', venueId, date],
    queryFn: async () => {
      if (!venueId || !date) throw new Error('venueId and date are required')
      
      const response = await api.get<{ success: boolean; data: Slot[] }>(
        `/slots?venueId=${venueId}&date=${date}`
      )
      return response.data.data
    },
    enabled: !!venueId && !!date,
    // Real-time polling configuration:
    refetchInterval: 15000, // Refetch every 15 seconds to sync lock/booked states
    refetchIntervalInBackground: true, // Keep polling when window is out of focus
  })
}
