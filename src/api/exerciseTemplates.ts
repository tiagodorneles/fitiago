import { useQuery } from '@pinia/colada'

import { apiRequest } from './config'
import type {
  ExerciseTemplate,
  PaginatedResponse,
  PaginationParams,
} from './types'

// Get paginated list of exercise templates
export const useExerciseTemplates = (params: PaginationParams = {}) => {
  const queryString = new URLSearchParams({
    page: String(params.page || 1),
    page_size: String(params.page_size || 10),
  }).toString()

  return useQuery({
    key: () => ['exerciseTemplates', params],
    query: () =>
      apiRequest<PaginatedResponse<ExerciseTemplate>>(`/v1/exercise_templates?${queryString}`),
  })
}

// Get a single exercise template by ID
export const useExerciseTemplate = (exerciseTemplateId: string) => {
  return useQuery({
    key: () => ['exerciseTemplate', exerciseTemplateId],
    query: () => apiRequest<ExerciseTemplate>(`/v1/exercise_templates/${exerciseTemplateId}`),
  })
}
