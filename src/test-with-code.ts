// Test script to exchange authorization code for access token and fetch activities
import { fetchFitbitActivityLogList } from './api'

// REPLACE THESE VALUES AFTER GETTING THEM FROM THE OAUTH FLOW
const AUTHORIZATION_CODE = 'YOUR_AUTHORIZATION_CODE_HERE'
const CODE_VERIFIER = 'YOUR_CODE_VERIFIER_HERE'
const STATE = 'YOUR_STATE_HERE'
const EXPECTED_STATE = 'YOUR_EXPECTED_STATE_HERE'

async function testWithAuthCode() {
  console.log('🔐 Testing Fitbit API with Authorization Code')
  console.log('==============================================')

  // Validate inputs
  if (AUTHORIZATION_CODE === 'YOUR_AUTHORIZATION_CODE_HERE') {
    console.log('❌ Please update the script with your actual authorization code!')
    console.log('')
    console.log('📋 To get these values:')
    console.log('1. Run: npx tsx src/oauth-test-node.ts')
    console.log('2. Follow the instructions to get the authorization URL')
    console.log('3. Authorize the app in your browser')
    console.log('4. Copy the code, state, and verifier values')
    console.log('5. Update this script with those values')
    return
  }

  try {
    // Step 1: Exchange code for tokens
    console.log('🔄 Step 1: Exchanging authorization code for access token...')

    if (STATE !== EXPECTED_STATE) {
      throw new Error('State mismatch! Security check failed.')
    }

    const tokenData = new URLSearchParams({
      client_id: '23QQ9C',
      grant_type: 'authorization_code',
      redirect_uri: 'https://tiagodorneles.github.io/fitiago/',
      code: AUTHORIZATION_CODE,
      code_verifier: CODE_VERIFIER,
    })

    const tokenResponse = await fetch('https://api.fitbit.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenData,
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      throw new Error(`Token exchange failed: ${tokenResponse.status} - ${errorText}`)
    }

    const tokens = await tokenResponse.json()

    console.log('✅ Token exchange successful!')
    console.log(`Access Token: ${tokens.access_token.substring(0, 30)}...`)
    console.log(`User ID: ${tokens.user_id}`)
    console.log(`Expires in: ${tokens.expires_in} seconds`)
    console.log(`Scopes: ${tokens.scope}`)
    console.log('')

    // Step 2: Test API with the access token
    console.log('🔍 Step 2: Testing Fitbit API with access token...')

    // Get activities from last 10 days
    const tenDaysAgo = new Date()
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)
    const afterDate = tenDaysAgo.toISOString().split('T')[0]

    console.log(`📅 Fetching activities after ${afterDate} for user ${tokens.user_id}...`)

    const response = await fetchFitbitActivityLogList(
      tokens.access_token,
      {
        afterDate,
        sort: 'asc',
        limit: 50,
        offset: 0,
      },
      tokens.user_id,
    ) // Use the actual user ID from token response

    console.log(`\n✅ Successfully fetched ${response.activities.length} activities!`)

    if (response.activities.length === 0) {
      console.log('📭 No activities found for the last 10 days.')
      console.log(
        '💡 Try extending the date range or check if you have activities in your Fitbit account.',
      )
    } else {
      console.log('\n📊 Activities from the last 10 days:')
      console.log('====================================')

      response.activities.forEach((activity, index) => {
        const date = new Date(activity.startTime).toLocaleDateString()
        const time = new Date(activity.startTime).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })

        console.log(`${index + 1}. 🏃 ${activity.activityName}`)
        console.log(`   📅 ${date} at ${time}`)
        console.log(`   ⏱️  ${Math.round(activity.duration / 1000 / 60)} minutes`)
        console.log(`   🔥 ${activity.calories} calories`)

        if (activity.steps) {
          console.log(`   👟 ${activity.steps.toLocaleString()} steps`)
        }

        if (activity.distance) {
          console.log(`   📏 ${activity.distance.toFixed(2)} ${activity.distanceUnit || 'km'}`)
        }

        console.log('   ---')
      })

      console.log('\n📈 Summary:')
      console.log(`Total activities: ${response.activities.length}`)
      console.log(`Total calories: ${response.activities.reduce((sum, a) => sum + a.calories, 0)}`)
      console.log(
        `Total steps: ${response.activities.reduce((sum, a) => sum + (a.steps || 0), 0).toLocaleString()}`,
      )
    }
  } catch (error) {
    console.error('❌ Error:', error)

    if (error instanceof Error) {
      if (error.message.includes('400')) {
        console.log('💡 This might be an invalid authorization code or it may have expired.')
        console.log('   Authorization codes are single-use and expire quickly.')
        console.log('   Please run the OAuth flow again to get a new code.')
      } else if (error.message.includes('401')) {
        console.log('💡 Authentication failed. Check your client credentials.')
      }
    }
  }
}

testWithAuthCode()
