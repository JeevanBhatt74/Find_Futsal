import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Venue, VenueFilters, PaginatedResponse } from '@/types'

export function useVenues(filters: VenueFilters = {}, page = 1, limit = 10) {
  return useQuery({
    queryKey: ['venues', filters, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams()
      
      if (filters.search) params.append('search', filters.search)
      if (filters.city) params.append('city', filters.city)
      if (filters.minRating) params.append('minRating', String(filters.minRating))
      if (filters.maxPrice) params.append('maxPrice', String(filters.maxPrice))
      
      if (filters.amenities && filters.amenities.length > 0) {
        params.append('amenities', filters.amenities.join(','))
      }
      
      params.append('page', String(page))
      params.append('limit', String(limit))

      const response = await api.get<PaginatedResponse<Venue>>(`/venues?${params.toString()}`)
      return response.data
    },
    placeholderData: (previousData) => previousData, // keep previous data while fetching new pages
    staleTime: 2 * 60 * 1000, // 2 minutes as requested in main.tsx
  })
}

export function useVenueDetail(venueId?: string) {
  return useQuery({
    queryKey: ['venue', venueId],
    queryFn: async () => {
      if (!venueId) throw new Error('venueId is required')
      const response = await api.get<{ success: boolean; data: Venue }>(`/venues/${venueId}`)
      return response.data.data
    },
    enabled: !!venueId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
