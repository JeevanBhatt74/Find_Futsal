import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export interface Review {
  _id: string;
  venueId: string;
  userId: {
    _id: string;
    fullName: string;
    profileImage?: string;
    avatar?: string;
  };
  bookingId?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export function useReviews(venueId?: string) {
  return useQuery({
    queryKey: ['reviews', venueId],
    queryFn: async () => {
      if (!venueId) return []
      const response = await api.get<{ success: boolean; data: Review[] }>(`/reviews/${venueId}`)
      return response.data.data
    },
    enabled: !!venueId,
  })
}

export function useSubmitReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reviewData: { venueId: string; bookingId?: string; rating: number; comment?: string }) => {
      const response = await api.post<{ success: boolean; data: Review }>('/reviews', reviewData)
      return response.data.data
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['reviews', data.venueId] })
        queryClient.invalidateQueries({ queryKey: ['venue', data.venueId] })
      }
    },
  })
}
