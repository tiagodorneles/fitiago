// Test script to fetch Fitbit activities for the last 10 days
import { fetchFitbitActivityLogList } from './api'

async function testFitbitActivities() {
  // Calculate date 10 days ago
  const tenDaysAgo = new Date()
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)
  const afterDate = tenDaysAgo.toISOString().split('T')[0] // Format: yyyy-MM-dd

  console.log(`Fetching Fitbit activities after: ${afterDate}`)
  console.log('User ID: BTQQND')
  console.log('---')

  try {
    // For testing, you'll need to replace this with a real access token
    // You can get one from: https://dev.fitbit.com/build/reference/web-api/explore/
    const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN_HERE'

    if (ACCESS_TOKEN === 'YOUR_ACCESS_TOKEN_HERE') {
      console.error('❌ Access token not provided!')
      console.log('To test this integration:')
      console.log('1. Go to https://dev.fitbit.com/build/reference/web-api/explore/')
      console.log('2. Sign in with your Fitbit account')
      console.log('3. Navigate to "Get Activity Log List"')
      console.log('4. Click "Try It" to get a temporary access token')
      console.log('5. Copy the access token and replace YOUR_ACCESS_TOKEN_HERE in this file')
      console.log('6. Run this script again')
      return
    }

    const response = await fetchFitbitActivityLogList(ACCESS_TOKEN, {
      afterDate,
      sort: 'asc',
      limit: 50, // Get up to 50 activities
      offset: 0,
    })

    console.log(`✅ Successfully fetched ${response.activities.length} activities`)
    console.log('---')

    if (response.activities.length === 0) {
      console.log('No activities found for the last 10 days.')
    } else {
      console.log('Activities from the last 10 days:')
      console.log('---')

      response.activities.forEach((activity, index) => {
        const date = new Date(activity.startTime).toLocaleDateString()
        const time = new Date(activity.startTime).toLocaleTimeString()

        console.log(`${index + 1}. ${activity.activityName}`)
        console.log(`   Date: ${date} at ${time}`)
        console.log(`   Duration: ${Math.round(activity.duration / 1000 / 60)} minutes`)
        console.log(`   Calories: ${activity.calories}`)
        if (activity.steps) {
          console.log(`   Steps: ${activity.steps}`)
        }
        console.log('---')
      })

      // Show pagination info
      console.log('Pagination Info:')
      console.log(`- Limit: ${response.pagination.limit}`)
      console.log(`- Sort: ${response.pagination.sort}`)
      console.log(`- Has next page: ${!!response.pagination.next}`)
      console.log(`- Has previous page: ${!!response.pagination.previous}`)
    }
  } catch (error) {
    console.error('❌ Error fetching Fitbit activities:', error)

    if (error instanceof Error) {
      if (error.message.includes('401')) {
        console.log('This is likely an authentication error. Make sure your access token is valid.')
      } else if (error.message.includes('429')) {
        console.log('Rate limit exceeded. Please wait and try again later.')
      } else if (error.message.includes('403')) {
        console.log('Access forbidden. Check if your token has the required scopes.')
      }
    }
  }
}

// Run the test
testFitbitActivities()
