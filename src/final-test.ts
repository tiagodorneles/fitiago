// Final test - paste your authorization code here and run!
import { fetchFitbitActivityLogList } from './api'

async function finalTest() {
  console.log('🎯 Final Fitbit Test - Get Your Activities!')
  console.log('==========================================')

  // 👇 PASTE YOUR AUTHORIZATION CODE HERE 👇
  const AUTHORIZATION_CODE = '5f0adbd036aa6eadc059336e89eda445a520a971'

  // These are the matching PKCE values for the authorization URL above
  const CODE_VERIFIER =
    'j3x7b_NJzyYotZ5a5Du-MBo7nGXopcPSjQ7B9.cW~gJMN9zXA-Wc9.KNnr19~dTz2bTx3gCEGHJF3Mj.8~AQCNl_y4qbPCi2Lmh8rvJjHWtV3vF3tLKM0z'
  const EXPECTED_STATE = 'NqvyR2xqaYX9Ez0869Ie3Rj.k~~SS8PY'

  if (AUTHORIZATION_CODE === ('PASTE_YOUR_CODE_HERE' as string)) {
    console.log('❌ Please paste your authorization code!')
    console.log('')
    console.log("🔗 If you haven't authorized yet, click this URL:")
    console.log(
      'https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=23QQ9C&redirect_uri=https%3A%2F%2Ftiagodorneles.github.io%2Ffitiago%2F&scope=activity&state=NqvyR2xqaYX9Ez0869Ie3Rj.k%7E%7ESS8PY&code_challenge=-A52WZBw6cAyXxEdGjWMb_Vgu-VLN2nThTWKT-HlmsY&code_challenge_method=S256',
    )
    console.log('')
    console.log('📝 After authorization:')
    console.log('1. Copy the code from the redirect URL')
    console.log('2. Replace PASTE_YOUR_CODE_HERE with your code')
    console.log('3. Run this script again: npx tsx src/final-test.ts')
    return
  }

  try {
    console.log('🔄 Step 1: Exchanging authorization code for access token...')

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
      console.error('❌ Token exchange failed:', errorText)
      console.log('')
      console.log('💡 Common issues:')
      console.log('- Authorization code may have expired (they expire quickly)')
      console.log('- Make sure you copied the entire code correctly')
      console.log('- Try getting a fresh authorization code')
      return
    }

    const tokens = await tokenResponse.json()

    console.log('✅ Success! Got access token')
    console.log(`👤 User ID: ${tokens.user_id}`)
    console.log(`🔑 Token expires in: ${tokens.expires_in} seconds`)
    console.log(`📋 Scopes: ${tokens.scope}`)
    console.log('')

    console.log('🔍 Step 2: Fetching your Fitbit activities...')

    // Get activities from last 10 days
    const tenDaysAgo = new Date()
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)
    const afterDate = tenDaysAgo.toISOString().split('T')[0]

    console.log(`📅 Looking for activities after ${afterDate}`)

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

    console.log('')
    console.log('🎉 RESULTS:')
    console.log('===========')

    if (response.activities.length === 0) {
      console.log('📭 No activities found for the last 10 days.')
      console.log('')
      console.log('💡 Suggestions:')
      console.log('- Check if you have activities recorded in your Fitbit app')
      console.log('- Try a longer date range')
      console.log('- Make sure your Fitbit device is synced')
    } else {
      console.log(`✅ Found ${response.activities.length} activities!`)
      console.log('')
      console.log('📊 Your Activities (Last 10 Days):')
      console.log('===================================')

      // Show activity names as requested
      response.activities.forEach((activity, index) => {
        const date = new Date(activity.startTime).toLocaleDateString()
        const time = new Date(activity.startTime).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })

        // Just show title/name as requested
        console.log(`${index + 1}. ${activity.activityName} (${date} at ${time})`)
      })

      console.log('')
      console.log('📈 Summary:')
      console.log(`• Total activities: ${response.activities.length}`)
      console.log(
        `• Total calories: ${response.activities.reduce((sum, a) => sum + a.calories, 0)}`,
      )

      const totalSteps = response.activities.reduce((sum, a) => sum + (a.steps || 0), 0)
      if (totalSteps > 0) {
        console.log(`• Total steps: ${totalSteps.toLocaleString()}`)
      }

      const totalMinutes = Math.round(
        response.activities.reduce((sum, a) => sum + a.duration, 0) / 1000 / 60,
      )
      console.log(`• Total active time: ${totalMinutes} minutes`)
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

finalTest()
