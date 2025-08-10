# Fitbit API Integration

This document explains how to use the Fitbit Activity Log List API integration in this project.

## Overview

The Fitbit API integration allows you to fetch a user's activity log entries using the [Fitbit Web API](https://dev.fitbit.com/build/reference/web-api/activity/get-activity-log-list/).

## Configuration

The integration is configured for user ID `BTQQND` by default, but you can specify a different user ID when calling the functions.

## Authentication

**Important**: You need a valid Fitbit access token to use these APIs. The token should be obtained through the Fitbit OAuth 2.0 flow. This integration does not handle authentication - you need to implement that separately.

## Available Functions

### Composables (for Vue components)

1. **`useFitbitActivityLogList(accessToken, params, userId?)`**
   - Main function for fetching activity logs with custom parameters
   - Returns a reactive query object with loading states and data

2. **`useFitbitActivitiesAfterDate(accessToken, afterDate, limit?, userId?)`**
   - Convenience function to get activities after a specific date
   - Uses ascending sort order

3. **`useFitbitActivitiesBeforeDate(accessToken, beforeDate, limit?, userId?)`**
   - Convenience function to get activities before a specific date
   - Uses descending sort order

4. **`useFitbitRecentActivities(accessToken, limit?, userId?)`**
   - Get activities from the last 30 days
   - Uses ascending sort order

### Raw API Functions

1. **`fetchFitbitActivityLogList(accessToken, params, userId?)`**
   - Direct API call that returns a Promise
   - Useful for server-side operations or manual pagination

## Parameters

### FitbitActivityLogListParams

```typescript
interface FitbitActivityLogListParams {
  beforeDate?: string // Format: yyyy-MM-ddTHH:mm:ss or yyyy-MM-dd
  afterDate?: string // Format: yyyy-MM-ddTHH:mm:ss or yyyy-MM-dd
  sort: 'asc' | 'desc' // Use 'asc' with afterDate, 'desc' with beforeDate
  limit: number // Maximum 100
  offset?: number // Currently only 0 is supported
}
```

### Rules

- Either `beforeDate` OR `afterDate` must be specified (not both)
- When using `afterDate`, use `sort: 'asc'`
- When using `beforeDate`, use `sort: 'desc'`
- Maximum limit is 100 entries per request
- Offset parameter only supports 0 (use pagination links instead)

## Response Data

The API returns detailed activity information including:

- Activity name and type
- Duration and calories burned
- Steps taken (if applicable)
- Heart rate zones and active zone minutes
- Distance and pace (for tracked exercises)
- Activity levels (sedentary, light, moderate, vigorous)

## Example Usage

```typescript
import { useFitbitRecentActivities } from '@/api'

// In a Vue component
const {
  data: activities,
  isLoading,
  error,
} = useFitbitRecentActivities(
  'your-access-token-here',
  20, // limit to 20 activities
)

// Access the data
if (activities.value) {
  console.log('Activities:', activities.value.activities)
  console.log('Pagination:', activities.value.pagination)
}
```

## Pagination

The Fitbit API provides pagination through `next` and `previous` URLs in the response. The offset parameter is not fully supported, so use the provided pagination links for navigating through results.

## Error Handling

The functions include validation for:

- Required parameters (beforeDate or afterDate)
- Sort order validation
- Limit validation (max 100)
- Parameter combination validation

All API errors are thrown as Error objects with descriptive messages.

## Rate Limits

Be aware of Fitbit's rate limits:

- Check response headers for rate limit information
- Implement appropriate retry logic if needed
- The API returns rate limit headers: `fitbit-rate-limit-*`

## Data Types

All response data is fully typed with TypeScript interfaces. See `src/api/types.ts` for complete type definitions including:

- `FitbitActivity` - Individual activity data
- `FitbitActivityLogListResponse` - Complete API response
- `FitbitActivityPagination` - Pagination information
- And more detailed interfaces for activity levels, heart rate zones, etc.

## Next Steps

To complete the integration, you'll need to:

1. Implement Fitbit OAuth 2.0 authentication flow
2. Store and manage access tokens securely
3. Handle token refresh when needed
4. Add error handling for authentication failures
5. Consider implementing webhook subscriptions for real-time updates

## References

- [Fitbit Web API Documentation](https://dev.fitbit.com/build/reference/web-api/)
- [Fitbit Activity Log List API](https://dev.fitbit.com/build/reference/web-api/activity/get-activity-log-list/)
- [Fitbit OAuth 2.0](https://dev.fitbit.com/build/reference/web-api/authorization/)
