// Quick Fitbit test - complete OAuth flow and fetch activities
import {
  buildAuthorizationUrl,
  fetchFitbitActivityLogList,
  generatePKCEData,
} from './api'

async function quickFitbitTest() {
  console.log('🚀 Quick Fitbit Activity Test')
  console.log('==============================')

  try {
    // Generate PKCE values
    const pkceData = await generatePKCEData()

    // Build authorization URL
    const authUrl = buildAuthorizationUrl({
      scopes: ['activity'],
      state: pkceData.state,
      codeChallenge: pkceData.codeChallenge,
    })

    console.log('📋 STEP 1: Authorize the App')
    console.log('============================')
    console.log('Click this URL to authorize:')
    console.log(authUrl)
    console.log('')

    console.log('📝 STEP 2: After Authorization')
    console.log('==============================')
    console.log('After clicking "Allow", you\'ll be redirected to a URL like:')
    console.log('https://tiagodorneles.github.io/fitiago/?code=XXXXXX&state=' + pkceData.state)
    console.log('')
    console.log('Copy ONLY the code parameter value (the long string after code=)')
    console.log('')

    console.log('🔧 STEP 3: Update and Run')
    console.log('=========================')
    console.log('1. Copy the authorization code from the redirect URL')
    console.log('2. Replace AUTHORIZATION_CODE below with your code')
    console.log('3. Run this script again')
    console.log('')

    // Placeholder for the authorization code - user will replace this
    const AUTHORIZATION_CODE = 'REPLACE_WITH_YOUR_CODE'

    if (AUTHORIZATION_CODE === 'REPLACE_WITH_YOUR_CODE') {
      console.log('💾 Values needed for next run:')
      console.log('==============================')
      console.log(`const AUTHORIZATION_CODE = 'YOUR_CODE_HERE'`)
      console.log(`const CODE_VERIFIER = '${pkceData.codeVerifier}'`)
      console.log(`const STATE = '${pkceData.state}'`)
      console.log('')
      console.log('⏹️  Stopping here - please get the authorization code first!')
      return
    }

    // If we have the code, proceed with token exchange
    console.log('🔄 STEP 4: Exchanging Code for Token')
    console.log('====================================')

    const tokenData = new URLSearchParams({
      client_id: '23QQ9C',
      grant_type: 'authorization_code',
      redirect_uri: 'https://tiagodorneles.github.io/fitiago/',
      code: AUTHORIZATION_CODE,
      code_verifier: pkceData.codeVerifier,
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
    console.log(`User ID: ${tokens.user_id}`)
    console.log(`Access Token: ${tokens.access_token.substring(0, 20)}...`)
    console.log('')

    // Now fetch activities!
    console.log('🔍 STEP 5: Fetching Your Activities')
    console.log('===================================')

    const tenDaysAgo = new Date()
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)
    const afterDate = tenDaysAgo.toISOString().split('T')[0]

    console.log(`📅 Getting activities after ${afterDate}...`)

    const response = await fetchFitbitActivityLogList(
      tokens.access_token,
      {
        afterDate,
        sort: 'asc',
        limit: 50,
        offset: 0,
      },
      tokens.user_id,
    )

    console.log(`\n🎉 SUCCESS! Found ${response.activities.length} activities`)

    if (response.activities.length === 0) {
      console.log('\n📭 No activities found for the last 10 days.')
      console.log('💡 Try a longer date range or check your Fitbit app for recorded activities.')
    } else {
      console.log('\n📊 Your Activities (Last 10 Days):')
      console.log('===================================')

      // Show just the activity names as requested
      response.activities.forEach((activity, index) => {
        const date = new Date(activity.startTime).toLocaleDateString()
        console.log(`${index + 1}. ${activity.activityName} (${date})`)
      })

      console.log('\n📈 Quick Summary:')
      console.log(`Total activities: ${response.activities.length}`)
      console.log(
        `Total calories burned: ${response.activities.reduce((sum, a) => sum + a.calories, 0)}`,
      )

      const totalSteps = response.activities.reduce((sum, a) => sum + (a.steps || 0), 0)
      if (totalSteps > 0) {
        console.log(`Total steps: ${totalSteps.toLocaleString()}`)
      }
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

quickFitbitTest()
