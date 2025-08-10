// Quick test for Fitbit activities - just replace the ACCESS_TOKEN
import { fetchFitbitActivityLogList } from './api'

async function quickTest() {
  // REPLACE THIS WITH YOUR ACTUAL ACCESS TOKEN
  const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN_HERE'

  if (ACCESS_TOKEN === 'YOUR_ACCESS_TOKEN_HERE') {
    console.log('❌ Please replace YOUR_ACCESS_TOKEN_HERE with your actual Fitbit access token')
    return
  }

  try {
    // Get activities from last 10 days
    const tenDaysAgo = new Date()
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)
    const afterDate = tenDaysAgo.toISOString().split('T')[0]

    console.log(`🔍 Fetching activities after ${afterDate} for user BTQQND...`)

    const response = await fetchFitbitActivityLogList(ACCESS_TOKEN, {
      afterDate,
      sort: 'asc',
      limit: 50,
      offset: 0,
    })

    console.log(`\n✅ Found ${response.activities.length} activities:\n`)

    // Show only activity names/titles as requested
    response.activities.forEach((activity, index) => {
      const date = new Date(activity.startTime).toLocaleDateString()
      console.log(`${index + 1}. ${activity.activityName} (${date})`)
    })
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

quickTest()
