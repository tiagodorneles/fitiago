import {
  useMutation,
  useQuery,
  useQueryCache,
} from '@pinia/colada'

import { apiRequest } from './config'
import type { WebhookSubscription } from './types'

// Get current webhook subscription
export const useWebhookSubscription = () => {
  return useQuery({
    key: () => ['webhook', 'subscription'],
    query: () => apiRequest<WebhookSubscription>('/v1/webhook-subscription'),
  })
}

// Create a new webhook subscription
export const useCreateWebhookSubscription = () => {
  const queryCache = useQueryCache()

  return useMutation({
    mutation: (data: WebhookSubscription) =>
      apiRequest<WebhookSubscription>('/v1/webhook-subscription', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      // Invalidate webhook subscription query to refetch data
      queryCache.invalidateQueries({ key: ['webhook', 'subscription'] })
    },
  })
}

// Delete webhook subscription
export const useDeleteWebhookSubscription = () => {
  const queryCache = useQueryCache()

  return useMutation({
    mutation: () =>
      apiRequest<void>('/v1/webhook-subscription', {
        method: 'DELETE',
      }),
    onSuccess: () => {
      // Invalidate webhook subscription query to refetch data
      queryCache.invalidateQueries({ key: ['webhook', 'subscription'] })
    },
  })
}
