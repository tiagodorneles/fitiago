// OAuth 2.0 test for Fitbit integration (Node.js compatible)
import {
  buildAuthorizationUrl,
  generatePKCEData,
} from './api'

async function testOAuthFlowNode() {
  console.log('🔐 Fitbit OAuth 2.0 Test (Node.js)')
  console.log('===================================')

  try {
    console.log('🚀 Generating OAuth authorization URL...')

    // Generate PKCE data
    const pkceData = await generatePKCEData()

    // Build authorization URL
    const authUrl = buildAuthorizationUrl({
      scopes: ['activity'],
      state: pkceData.state,
      codeChallenge: pkceData.codeChallenge,
    })

    console.log('📋 OAuth Configuration:')
    console.log(`Client ID: 23QQ9C`)
    console.log(`Redirect URI: https://tiagodorneles.github.io/fitiago/`)
    console.log(`Application Type: CLIENT`)
    console.log(`Scopes: activity`)
    console.log('')

    console.log('🔑 Generated PKCE Values:')
    console.log(`State: ${pkceData.state}`)
    console.log(`Code Verifier: ${pkceData.codeVerifier.substring(0, 20)}...`)
    console.log(`Code Challenge: ${pkceData.codeChallenge}`)
    console.log('')

    console.log('🌐 Authorization URL:')
    console.log(authUrl)
    console.log('')

    console.log('📝 Step-by-Step Instructions:')
    console.log('=============================')
    console.log('1. 📋 COPY the authorization URL above')
    console.log('2. 🌐 OPEN it in your web browser')
    console.log('3. 🔐 LOG IN to your Fitbit account')
    console.log('4. ✅ AUTHORIZE the app (select "Allow")')
    console.log("5. 📱 You'll be redirected to: https://tiagodorneles.github.io/fitiago/")
    console.log('6. 📋 COPY the full redirect URL from your browser address bar')
    console.log('7. 🔧 Use the callback URL to get your access token')
    console.log('')

    console.log('💾 Save these values for the next step:')
    console.log('=====================================')
    console.log(`State: ${pkceData.state}`)
    console.log(`Code Verifier: ${pkceData.codeVerifier}`)
    console.log('')

    console.log('🔧 After authorization, run this in your browser console:')
    console.log('```javascript')
    console.log('// Copy the full URL from your address bar after authorization')
    console.log('const callbackUrl = window.location.href;')
    console.log('console.log("Callback URL:", callbackUrl);')
    console.log('```')
    console.log('')

    console.log('🚀 Or use our quick test URL generator:')
    console.log('Open the authorization URL, and after redirect, the URL will look like:')
    console.log('https://tiagodorneles.github.io/fitiago/?code=XXXXXX&state=' + pkceData.state)
  } catch (error) {
    console.error('❌ OAuth setup error:', error)
  }
}

// Helper to manually exchange code for tokens (when you have the callback URL)
export async function exchangeCodeManually(
  authorizationCode: string,
  codeVerifier: string,
  state: string,
  expectedState: string,
) {
  console.log('🔄 Exchanging authorization code for access token...')

  if (state !== expectedState) {
    throw new Error('State mismatch! Possible security issue.')
  }

  try {
    const tokenData = new URLSearchParams({
      client_id: '23QQ9C',
      grant_type: 'authorization_code',
      redirect_uri: 'https://tiagodorneles.github.io/fitiago/',
      code: authorizationCode,
      code_verifier: codeVerifier,
    })

    console.log('📤 Making token request...')

    const response = await fetch('https://api.fitbit.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `Token exchange failed: ${response.status} ${response.statusText} - ${errorText}`,
      )
    }

    const tokens = await response.json()

    console.log('✅ Token exchange successful!')
    console.log(`Access Token: ${tokens.access_token.substring(0, 30)}...`)
    console.log(`User ID: ${tokens.user_id}`)
    console.log(`Expires in: ${tokens.expires_in} seconds`)
    console.log(`Scopes: ${tokens.scope}`)

    return tokens
  } catch (error) {
    console.error('❌ Token exchange failed:', error)
    throw error
  }
}

// Run the test
testOAuthFlowNode()
