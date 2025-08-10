// OAuth 2.0 test for Fitbit integration
import {
  fetchFitbitActivityLogList,
  handleOAuthCallback,
  startOAuthFlow,
  TokenStorage,
} from './api'

async function testOAuthFlow() {
  console.log('🔐 Fitbit OAuth 2.0 Test')
  console.log('========================')

  try {
    // Check if we already have a valid token
    const existingToken = await TokenStorage.getValidAccessToken()

    if (existingToken) {
      console.log('✅ Found existing valid access token!')
      await testApiWithToken(existingToken)
      return
    }

    console.log('🚀 Starting OAuth flow...')

    // Start OAuth flow
    const { authUrl, pkceData } = await startOAuthFlow(['activity'])

    console.log('📋 OAuth Details:')
    console.log(`Client ID: 23QQ9C`)
    console.log(`Redirect URI: https://tiagodorneles.github.io/fitiago/`)
    console.log(`Scopes: activity`)
    console.log(`State: ${pkceData.state}`)
    console.log(`Code Challenge: ${pkceData.codeChallenge.substring(0, 20)}...`)
    console.log('')

    console.log('🌐 Authorization URL:')
    console.log(authUrl)
    console.log('')

    console.log('📝 Next Steps:')
    console.log('1. Open the authorization URL above in your browser')
    console.log('2. Log in to Fitbit and authorize the app')
    console.log("3. After authorization, you'll be redirected to:")
    console.log('   https://tiagodorneles.github.io/fitiago/?code=XXXXXX&state=XXXXXX')
    console.log('4. Copy the full redirect URL and use it with handleOAuthCallback()')
    console.log('')
    console.log('Example usage after getting the redirect URL:')
    console.log('```javascript')
    console.log('import { handleOAuthCallback } from "./api"')
    console.log(
      'const tokens = await handleOAuthCallback("https://tiagodorneles.github.io/fitiago/?code=...&state=...")',
    )
    console.log('console.log("Access token:", tokens.access_token)')
    console.log('```')
  } catch (error) {
    console.error('❌ OAuth flow error:', error)
  }
}

async function testApiWithToken(accessToken: string) {
  console.log('🔍 Testing Fitbit API with access token...')

  try {
    // Get activities from last 10 days
    const tenDaysAgo = new Date()
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)
    const afterDate = tenDaysAgo.toISOString().split('T')[0]

    console.log(`📅 Fetching activities after ${afterDate}...`)

    const response = await fetchFitbitActivityLogList(accessToken, {
      afterDate,
      sort: 'asc',
      limit: 50,
      offset: 0,
    })

    console.log(`\n✅ Successfully fetched ${response.activities.length} activities!`)

    if (response.activities.length === 0) {
      console.log('No activities found for the last 10 days.')
    } else {
      console.log('\n📊 Activities from the last 10 days:')
      console.log('=====================================')

      response.activities.forEach((activity, index) => {
        const date = new Date(activity.startTime).toLocaleDateString()
        const time = new Date(activity.startTime).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })

        console.log(`${index + 1}. ${activity.activityName}`)
        console.log(`   📅 ${date} at ${time}`)
        console.log(`   ⏱️  Duration: ${Math.round(activity.duration / 1000 / 60)} minutes`)
        console.log(`   🔥 Calories: ${activity.calories}`)

        if (activity.steps) {
          console.log(`   👟 Steps: ${activity.steps.toLocaleString()}`)
        }

        if (activity.distance) {
          console.log(
            `   📏 Distance: ${activity.distance.toFixed(2)} ${activity.distanceUnit || 'km'}`,
          )
        }

        console.log('   ---')
      })
    }
  } catch (error) {
    console.error('❌ API test failed:', error)

    if (error instanceof Error && error.message.includes('401')) {
      console.log('🔑 Token may be expired or invalid. Try running the OAuth flow again.')
      TokenStorage.clearTokens()
    }
  }
}

// Helper function to manually test with callback URL
export async function testWithCallbackUrl(callbackUrl: string) {
  console.log('🔄 Processing OAuth callback...')

  try {
    const tokens = await handleOAuthCallback(callbackUrl)

    console.log('✅ OAuth callback successful!')
    console.log(`Access Token: ${tokens.access_token.substring(0, 20)}...`)
    console.log(`User ID: ${tokens.user_id}`)
    console.log(`Expires in: ${tokens.expires_in} seconds`)
    console.log(`Scopes: ${tokens.scope}`)

    // Test the API with the new token
    await testApiWithToken(tokens.access_token)
  } catch (error) {
    console.error('❌ OAuth callback failed:', error)
  }
}

// Run the test
testOAuthFlow()
