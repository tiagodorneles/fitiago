import {
  useMutation,
  useQuery,
  useQueryCache,
} from '@pinia/colada'

import { apiRequest } from './config'
import type {
  CreateWorkoutRequest,
  PaginatedResponse,
  PaginationParams,
  UpdateWorkoutRequest,
  Workout,
  WorkoutEvent,
  WorkoutEventsParams,
} from './types'

// Get paginated list of workouts
export const useWorkouts = (params: PaginationParams = {}) => {
  const queryString = new URLSearchParams({
    page: String(params.page || 1),
    page_size: String(params.page_size || 10),
  }).toString()

  return useQuery({
    key: () => ['workouts', params],
    query: () => apiRequest<PaginatedResponse<Workout>>(`/v1/workouts?${queryString}`),
  })
}

// Get a single workout by ID
export const useWorkout = (workoutId: string) => {
  return useQuery({
    key: () => ['workout', workoutId],
    query: () => apiRequest<Workout>(`/v1/workouts/${workoutId}`),
  })
}

// Get total number of workouts
export const useWorkoutsCount = () => {
  return useQuery({
    key: () => ['workouts', 'count'],
    query: () => apiRequest<{ count: number }>('/v1/workouts/count'),
  })
}

// Get workout events (updates/deletes since a date)
export const useWorkoutEvents = (params: WorkoutEventsParams = {}) => {
  const queryString = new URLSearchParams({
    page: String(params.page || 1),
    page_size: String(params.page_size || 10),
    ...(params.since && { since: params.since }),
  }).toString()

  return useQuery({
    key: () => ['workouts', 'events', params],
    query: () => apiRequest<PaginatedResponse<WorkoutEvent>>(`/v1/workouts/events?${queryString}`),
  })
}

// Create a new workout
export const useCreateWorkout = () => {
  const queryCache = useQueryCache()

  return useMutation({
    mutation: (data: CreateWorkoutRequest) =>
      apiRequest<Workout>('/v1/workouts', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      // Invalidate workouts queries to refetch data
      queryCache.invalidateQueries({ key: ['workouts'] })
    },
  })
}

// Update an existing workout
export const useUpdateWorkout = () => {
  const queryCache = useQueryCache()

  return useMutation({
    mutation: ({ workoutId, data }: { workoutId: string; data: UpdateWorkoutRequest }) =>
      apiRequest<Workout>(`/v1/workouts/${workoutId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, { workoutId }) => {
      // Invalidate specific workout and workouts list
      queryCache.invalidateQueries({ key: ['workout', workoutId] })
      queryCache.invalidateQueries({ key: ['workouts'] })
    },
  })
}
