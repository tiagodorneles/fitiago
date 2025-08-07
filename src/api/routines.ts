import {
  useMutation,
  useQuery,
  useQueryCache,
} from '@pinia/colada'

import { apiRequest } from './config'
import type {
  CreateRoutineRequest,
  PaginatedResponse,
  PaginationParams,
  Routine,
  UpdateRoutineRequest,
} from './types'

// Get paginated list of routines
export const useRoutines = (params: PaginationParams = {}) => {
  const queryString = new URLSearchParams({
    page: String(params.page || 1),
    page_size: String(params.page_size || 10),
  }).toString()

  return useQuery({
    key: () => ['routines', params],
    query: () => apiRequest<PaginatedResponse<Routine>>(`/v1/routines?${queryString}`),
  })
}

// Get a single routine by ID
export const useRoutine = (routineId: string) => {
  return useQuery({
    key: () => ['routine', routineId],
    query: () => apiRequest<Routine>(`/v1/routines/${routineId}`),
  })
}

// Create a new routine
export const useCreateRoutine = () => {
  const queryCache = useQueryCache()

  return useMutation({
    mutation: (data: CreateRoutineRequest) =>
      apiRequest<Routine>('/v1/routines', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      // Invalidate routines queries to refetch data
      queryCache.invalidateQueries({ key: ['routines'] })
    },
  })
}

// Update an existing routine
export const useUpdateRoutine = () => {
  const queryCache = useQueryCache()

  return useMutation({
    mutation: ({ routineId, data }: { routineId: string; data: UpdateRoutineRequest }) =>
      apiRequest<Routine>(`/v1/routines/${routineId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, { routineId }) => {
      // Invalidate specific routine and routines list
      queryCache.invalidateQueries({ key: ['routine', routineId] })
      queryCache.invalidateQueries({ key: ['routines'] })
    },
  })
}
