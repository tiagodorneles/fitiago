// Fitbit OAuth 2.0 implementation with PKCE support
import { FITBIT_OAUTH_CONFIG } from './config'

// Types for OAuth flow
export interface PKCEData {
  codeVerifier: string
  codeChallenge: string
  state: string
}

export interface FitbitTokenResponse {
  access_token: string
  expires_in: number
  refresh_token: string
  scope: string
  token_type: string
  user_id: string
}

export interface FitbitAuthParams {
  scopes?: string[]
  state?: string
  codeChallenge?: string
}

// Utility functions for PKCE
export function generateRandomString(length: number = 128): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  let result = ''
  const values = new Uint8Array(length)
  crypto.getRandomValues(values)

  for (let i = 0; i < length; i++) {
    result += charset[values[i] % charset.length]
  }

  return result
}

export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(codeVerifier)
  const digest = await crypto.subtle.digest('SHA-256', data)

  // Convert to base64url
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

// Generate PKCE values for OAuth flow
export async function generatePKCEData(): Promise<PKCEData> {
  const codeVerifier = generateRandomString(128)
  const codeChallenge = await generateCodeChallenge(codeVerifier)
  const state = generateRandomString(32)

  return {
    codeVerifier,
    codeChallenge,
    state,
  }
}

// Build authorization URL
export function buildAuthorizationUrl(params: FitbitAuthParams = {}): string {
  const {
    scopes = ['activity'], // Default to activity scope
    state,
    codeChallenge,
  } = params

  const authParams = new URLSearchParams({
    response_type: 'code',
    client_id: FITBIT_OAUTH_CONFIG.CLIENT_ID,
    redirect_uri: FITBIT_OAUTH_CONFIG.REDIRECT_URI,
    scope: scopes.join(' '),
  })

  if (state) {
    authParams.set('state', state)
  }

  if (codeChallenge) {
    authParams.set('code_challenge', codeChallenge)
    authParams.set('code_challenge_method', 'S256')
  }

  return `${FITBIT_OAUTH_CONFIG.AUTHORIZATION_URL}?${authParams.toString()}`
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(
  authorizationCode: string,
  codeVerifier: string,
): Promise<FitbitTokenResponse> {
  const tokenData = new URLSearchParams({
    client_id: FITBIT_OAUTH_CONFIG.CLIENT_ID,
    grant_type: 'authorization_code',
    redirect_uri: FITBIT_OAUTH_CONFIG.REDIRECT_URI,
    code: authorizationCode,
    code_verifier: codeVerifier,
  })

  const response = await fetch(FITBIT_OAUTH_CONFIG.TOKEN_URL, {
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

  return response.json()
}

// Refresh access token
export async function refreshAccessToken(refreshToken: string): Promise<FitbitTokenResponse> {
  const tokenData = new URLSearchParams({
    client_id: FITBIT_OAUTH_CONFIG.CLIENT_ID,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  })

  const response = await fetch(FITBIT_OAUTH_CONFIG.TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: tokenData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Token refresh failed: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response.json()
}

// Simple token storage (in production, use secure storage)
export class TokenStorage {
  private static readonly ACCESS_TOKEN_KEY = 'fitbit_access_token'
  private static readonly REFRESH_TOKEN_KEY = 'fitbit_refresh_token'
  private static readonly EXPIRES_AT_KEY = 'fitbit_expires_at'
  private static readonly USER_ID_KEY = 'fitbit_user_id'

  static saveTokens(tokenResponse: FitbitTokenResponse): void {
    const expiresAt = Date.now() + tokenResponse.expires_in * 1000

    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokenResponse.access_token)
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokenResponse.refresh_token)
    localStorage.setItem(this.EXPIRES_AT_KEY, expiresAt.toString())
    localStorage.setItem(this.USER_ID_KEY, tokenResponse.user_id)
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY)
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  static getUserId(): string | null {
    return localStorage.getItem(this.USER_ID_KEY)
  }

  static isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY)
    if (!expiresAt) return true

    return Date.now() >= parseInt(expiresAt)
  }

  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
    localStorage.removeItem(this.EXPIRES_AT_KEY)
    localStorage.removeItem(this.USER_ID_KEY)
  }

  static async getValidAccessToken(): Promise<string | null> {
    const accessToken = this.getAccessToken()
    const refreshToken = this.getRefreshToken()

    if (!accessToken) return null

    if (!this.isTokenExpired()) {
      return accessToken
    }

    // Token is expired, try to refresh
    if (refreshToken) {
      try {
        const newTokens = await refreshAccessToken(refreshToken)
        this.saveTokens(newTokens)
        return newTokens.access_token
      } catch (error) {
        console.error('Failed to refresh token:', error)
        this.clearTokens()
        return null
      }
    }

    return null
  }
}

// Complete OAuth flow helper
export async function startOAuthFlow(
  scopes: string[] = ['activity'],
): Promise<{ authUrl: string; pkceData: PKCEData }> {
  const pkceData = await generatePKCEData()

  // Store PKCE data temporarily (in production, use secure storage)
  sessionStorage.setItem('fitbit_pkce_data', JSON.stringify(pkceData))

  const authUrl = buildAuthorizationUrl({
    scopes,
    state: pkceData.state,
    codeChallenge: pkceData.codeChallenge,
  })

  return { authUrl, pkceData }
}

// Handle OAuth callback
export async function handleOAuthCallback(callbackUrl: string): Promise<FitbitTokenResponse> {
  const url = new URL(callbackUrl)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  if (error) {
    throw new Error(`OAuth error: ${error}`)
  }

  if (!code) {
    throw new Error('Authorization code not found in callback URL')
  }

  // Retrieve PKCE data
  const pkceDataStr = sessionStorage.getItem('fitbit_pkce_data')
  if (!pkceDataStr) {
    throw new Error('PKCE data not found. OAuth flow may have been interrupted.')
  }

  const pkceData: PKCEData = JSON.parse(pkceDataStr)

  // Validate state parameter
  if (state !== pkceData.state) {
    throw new Error('Invalid state parameter. Possible CSRF attack.')
  }

  // Exchange code for tokens
  const tokens = await exchangeCodeForTokens(code, pkceData.codeVerifier)

  // Save tokens
  TokenStorage.saveTokens(tokens)

  // Clean up
  sessionStorage.removeItem('fitbit_pkce_data')

  return tokens
}
