async function testLiveAuth() {
  console.log('🔐 Testing with Live Authorization Code')
  console.log('======================================')

  // Values from the callback URL
  const AUTHORIZATION_CODE = 'dfedfceeffe8a264a8367b6eff441f5ebe83445a'
  const STATE = 'b8LQqYm1cZ9pae9snJq.iNTkZ4g~2K6T'

  // We need the code verifier from the OAuth flow that generated this state
  // Let me generate a new one for this test
  console.log(
    '⚠️  Note: We need the original code_verifier that was used to generate this authorization code.',
  )
  console.log('Let me run a fresh OAuth flow to get a new authorization code...')

  try {
    // Generate new PKCE values
    const { generatePKCEData, buildAuthorizationUrl } = await import('./api')

    const pkceData = await generatePKCEData()
    const authUrl = buildAuthorizationUrl({
      scopes: ['activity'],
      state: pkceData.state,
      codeChallenge: pkceData.codeChallenge,
    })

    console.log('\n🆕 Fresh OAuth Flow:')
    console.log('===================')
    console.log(`State: ${pkceData.state}`)
    console.log(`Code Verifier: ${pkceData.codeVerifier}`)
    console.log(`Code Challenge: ${pkceData.codeChallenge}`)
    console.log('')
    console.log('🌐 New Authorization URL:')
    console.log(authUrl)
    console.log('')
    console.log('📝 Instructions:')
    console.log('1. Click the authorization URL above')
    console.log('2. Authorize the app again')
    console.log('3. Copy the new callback URL')
    console.log('4. Use the values below to exchange for tokens')
    console.log('')
    console.log('💾 Save these for token exchange:')
    console.log(`State: ${pkceData.state}`)
    console.log(`Code Verifier: ${pkceData.codeVerifier}`)
  } catch (error) {
    console.error('❌ Error generating OAuth flow:', error)
  }
}

// Alternative: Try to use the existing code (will likely fail without correct verifier)
async function tryExistingCode() {
  console.log('\n🔄 Attempting to use existing authorization code...')
  console.log('(This will likely fail without the correct code_verifier)')

  const AUTHORIZATION_CODE = 'dfedfceeffe8a264a8367b6eff441f5ebe83445a'

  try {
    // This will fail because we don't have the matching code_verifier
    const tokenData = new URLSearchParams({
      client_id: '23QQ9C',
      grant_type: 'authorization_code',
      redirect_uri: 'https://tiagodorneles.github.io/fitiago/',
      code: AUTHORIZATION_CODE,
      code_verifier: 'dummy_verifier', // This won't work
    })

    const response = await fetch('https://api.fitbit.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ Expected failure:', errorText)
      console.log('💡 This is expected - we need the correct code_verifier')
    }
  } catch (error) {
    console.log('❌ Expected error:', error)
  }
}

testLiveAuth()
tryExistingCode()
