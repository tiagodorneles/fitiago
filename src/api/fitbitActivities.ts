import { useQuery } from '@pinia/colada'

import {
  FITBIT_API_CONFIG,
  fitbitApiRequest,
} from './config'
import type {
  FitbitActivityLogListParams,
  FitbitActivityLogListResponse,
} from './types'

// Get Fitbit activity log list
export const useFitbitActivityLogList = (
  accessToken: string,
  params: FitbitActivityLogListParams,
  userId: string = FITBIT_API_CONFIG.USER_ID,
) => {
  // Validate required parameters
  if (!params.beforeDate && !params.afterDate) {
    throw new Error('Either beforeDate or afterDate must be specified')
  }

  if (params.beforeDate && params.afterDate) {
    throw new Error('Only one of beforeDate or afterDate should be specified')
  }

  if (params.afterDate && params.sort !== 'asc') {
    throw new Error('Use sort=asc when using afterDate')
  }

  if (params.beforeDate && params.sort !== 'desc') {
    throw new Error('Use sort=desc when using beforeDate')
  }

  if (params.limit > 100) {
    throw new Error('Maximum limit is 100')
  }

  // Build query parameters
  const queryParams = new URLSearchParams()

  if (params.beforeDate) {
    queryParams.set('beforeDate', params.beforeDate)
  }

  if (params.afterDate) {
    queryParams.set('afterDate', params.afterDate)
  }

  queryParams.set('sort', params.sort)
  queryParams.set('limit', String(params.limit))
  queryParams.set('offset', String(params.offset || 0))

  const queryString = queryParams.toString()
  const endpoint = `/1/user/${userId}/activities/list.json?${queryString}`

  return useQuery({
    key: () => ['fitbit', 'activities', 'list', userId, params],
    query: () => fitbitApiRequest<FitbitActivityLogListResponse>(endpoint, accessToken),
  })
}

// Helper function to get activities after a specific date
export const useFitbitActivitiesAfterDate = (
  accessToken: string,
  afterDate: string,
  limit: number = 20,
  userId: string = FITBIT_API_CONFIG.USER_ID,
) => {
  return useFitbitActivityLogList(
    accessToken,
    {
      afterDate,
      sort: 'asc',
      limit,
      offset: 0,
    },
    userId,
  )
}

// Helper function to get activities before a specific date
export const useFitbitActivitiesBeforeDate = (
  accessToken: string,
  beforeDate: string,
  limit: number = 20,
  userId: string = FITBIT_API_CONFIG.USER_ID,
) => {
  return useFitbitActivityLogList(
    accessToken,
    {
      beforeDate,
      sort: 'desc',
      limit,
      offset: 0,
    },
    userId,
  )
}

// Helper function to get recent activities (last 30 days)
export const useFitbitRecentActivities = (
  accessToken: string,
  limit: number = 20,
  userId: string = FITBIT_API_CONFIG.USER_ID,
) => {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const afterDate = thirtyDaysAgo.toISOString().split('T')[0] // Format: yyyy-MM-dd

  return useFitbitActivitiesAfterDate(accessToken, afterDate, limit, userId)
}

// Raw API function for making direct requests (useful for pagination)
export const fetchFitbitActivityLogList = async (
  accessToken: string,
  params: FitbitActivityLogListParams,
  userId: string = FITBIT_API_CONFIG.USER_ID,
): Promise<FitbitActivityLogListResponse> => {
  // Validate required parameters
  if (!params.beforeDate && !params.afterDate) {
    throw new Error('Either beforeDate or afterDate must be specified')
  }

  if (params.beforeDate && params.afterDate) {
    throw new Error('Only one of beforeDate or afterDate should be specified')
  }

  if (params.afterDate && params.sort !== 'asc') {
    throw new Error('Use sort=asc when using afterDate')
  }

  if (params.beforeDate && params.sort !== 'desc') {
    throw new Error('Use sort=desc when using beforeDate')
  }

  if (params.limit > 100) {
    throw new Error('Maximum limit is 100')
  }

  // Build query parameters
  const queryParams = new URLSearchParams()

  if (params.beforeDate) {
    queryParams.set('beforeDate', params.beforeDate)
  }

  if (params.afterDate) {
    queryParams.set('afterDate', params.afterDate)
  }

  queryParams.set('sort', params.sort)
  queryParams.set('limit', String(params.limit))
  queryParams.set('offset', String(params.offset || 0))

  const queryString = queryParams.toString()
  const endpoint = `/1/user/${userId}/activities/list.json?${queryString}`

  return fitbitApiRequest<FitbitActivityLogListResponse>(endpoint, accessToken)
}
