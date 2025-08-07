import {
  useMutation,
  useQuery,
  useQueryCache,
} from '@pinia/colada'

import { apiRequest } from './config'
import type {
  CreateRoutineFolderRequest,
  PaginatedResponse,
  PaginationParams,
  RoutineFolder,
} from './types'

// Get paginated list of routine folders
export const useRoutineFolders = (params: PaginationParams = {}) => {
  const queryString = new URLSearchParams({
    page: String(params.page || 1),
    page_size: String(params.page_size || 10),
  }).toString()

  return useQuery({
    key: () => ['routineFolders', params],
    query: () => apiRequest<PaginatedResponse<RoutineFolder>>(`/v1/routine_folders?${queryString}`),
  })
}

// Get a single routine folder by ID
export const useRoutineFolder = (folderId: string) => {
  return useQuery({
    key: () => ['routineFolder', folderId],
    query: () => apiRequest<RoutineFolder>(`/v1/routine_folders/${folderId}`),
  })
}

// Create a new routine folder
export const useCreateRoutineFolder = () => {
  const queryCache = useQueryCache()

  return useMutation({
    mutation: (data: CreateRoutineFolderRequest) =>
      apiRequest<RoutineFolder>('/v1/routine_folders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      // Invalidate routine folders queries to refetch data
      queryCache.invalidateQueries({ key: ['routineFolders'] })
    },
  })
}
