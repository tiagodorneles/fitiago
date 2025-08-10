// Example usage of Fitbit API integration
// This file demonstrates how to use the Fitbit Activity Log List API

import {
  fetchFitbitActivityLogList,
  useFitbitActivitiesAfterDate,
  useFitbitActivitiesBeforeDate,
  useFitbitActivityLogList,
  useFitbitRecentActivities,
} from '@/api'

// Example: Using the composable to get activities after a specific date
export function useExampleFitbitActivities() {
  // You would need to provide a valid Fitbit access token
  // This is just an example - in a real app, you'd get this from OAuth flow
  const ACCESS_TOKEN = 'your-fitbit-access-token-here'

  // Get activities from the last 30 days
  const recentActivities = useFitbitRecentActivities(ACCESS_TOKEN)

  // Get activities after a specific date (ascending order)
  const activitiesAfterDate = useFitbitActivitiesAfterDate(
    ACCESS_TOKEN,
    '2024-01-01', // Get activities after January 1, 2024
    50, // Limit to 50 activities
  )

  // Get activities before a specific date (descending order)
  const activitiesBeforeDate = useFitbitActivitiesBeforeDate(
    ACCESS_TOKEN,
    '2024-12-31', // Get activities before December 31, 2024
    25, // Limit to 25 activities
  )

  // Advanced usage with custom parameters
  const customActivityQuery = useFitbitActivityLogList(ACCESS_TOKEN, {
    afterDate: '2024-01-01T00:00:00',
    sort: 'asc',
    limit: 100,
    offset: 0,
  })

  return {
    recentActivities,
    activitiesAfterDate,
    activitiesBeforeDate,
    customActivityQuery,
  }
}

// Example: Using the raw API function for manual requests
export async function fetchActivitiesExample() {
  const ACCESS_TOKEN = 'your-fitbit-access-token-here'

  try {
    // Fetch activities after a specific date
    const response = await fetchFitbitActivityLogList(ACCESS_TOKEN, {
      afterDate: '2024-01-01',
      sort: 'asc',
      limit: 20,
      offset: 0,
    })

    console.log('Fetched activities:', response.activities.length)
    console.log('Pagination info:', response.pagination)

    // Process each activity
    response.activities.forEach((activity) => {
      console.log(`Activity: ${activity.activityName}`)
      console.log(`Duration: ${activity.duration / 1000 / 60} minutes`)
      console.log(`Calories: ${activity.calories}`)
      console.log(`Steps: ${activity.steps || 'N/A'}`)
      console.log(`Date: ${activity.startTime}`)
      console.log('---')
    })

    return response
  } catch (error) {
    console.error('Error fetching Fitbit activities:', error)
    throw error
  }
}

// Example: Pagination handling
export async function fetchAllActivitiesExample() {
  const ACCESS_TOKEN = 'your-fitbit-access-token-here'
  const allActivities = []

  try {
    let response = await fetchFitbitActivityLogList(ACCESS_TOKEN, {
      afterDate: '2024-01-01',
      sort: 'asc',
      limit: 100, // Maximum per request
      offset: 0,
    })

    allActivities.push(...response.activities)

    // Continue fetching if there are more pages
    while (response.pagination.next) {
      // Parse the next URL to get parameters
      const nextUrl = new URL(response.pagination.next)
      const nextParams = new URLSearchParams(nextUrl.search)

      response = await fetchFitbitActivityLogList(ACCESS_TOKEN, {
        afterDate: nextParams.get('afterDate') || '2024-01-01',
        sort: 'asc',
        limit: parseInt(nextParams.get('limit') || '100'),
        offset: parseInt(nextParams.get('offset') || '0'),
      })

      allActivities.push(...response.activities)
    }

    console.log(`Total activities fetched: ${allActivities.length}`)
    return allActivities
  } catch (error) {
    console.error('Error fetching all Fitbit activities:', error)
    throw error
  }
}

// Example types usage - this shows what data you'll receive
export function processActivityData() {
  // This is an example of the data structure you'll receive
  const exampleActivity = {
    activeDuration: 1536000, // milliseconds
    activityLevel: [
      { minutes: 3, name: 'sedentary' as const },
      { minutes: 9, name: 'lightly' as const },
      { minutes: 2, name: 'fairly' as const },
      { minutes: 11, name: 'very' as const },
    ],
    activityName: 'Walk',
    activityTypeId: 90013,
    calories: 204,
    duration: 1536000,
    elevationGain: 0,
    lastModified: '2019-01-04T19:31:15.000Z',
    logId: 19018673358,
    logType: 'auto_detected' as const,
    manualValuesSpecified: {
      calories: false,
      distance: false,
      steps: false,
    },
    originalDuration: 1536000,
    originalStartTime: '2019-01-03T12:08:29.000-08:00',
    startTime: '2019-01-03T12:08:29.000-08:00',
    steps: 1799,
    tcxLink: 'https://api.fitbit.com/1/user/-/activities/19018673358.tcx',
  }

  // Process the activity data
  console.log(`Activity: ${exampleActivity.activityName}`)
  console.log(`Duration: ${exampleActivity.duration / 1000 / 60} minutes`)
  console.log(`Calories burned: ${exampleActivity.calories}`)
  console.log(`Steps taken: ${exampleActivity.steps}`)

  return exampleActivity
}
