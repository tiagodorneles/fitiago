// API Configuration for Hevy API
export const HEVY_API_CONFIG = {
  BASE_URL: 'https://api.hevyapp.com',
  API_KEY: '489b1a5a-0afa-4e1b-bddd-0b4f760ffb5c',
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'api-key': '489b1a5a-0afa-4e1b-bddd-0b4f760ffb5c',
  },
} as const

// API Configuration for Fitbit API
export const FITBIT_API_CONFIG = {
  BASE_URL: 'https://api.fitbit.com',
  USER_ID: 'BTQQND', // The user ID we'll be consulting
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Accept-Language': 'en_US', // For measurement unit system
  },
} as const

// OAuth 2.0 Configuration for Fitbit
export const FITBIT_OAUTH_CONFIG = {
  CLIENT_ID: '23QQ9C',
  CLIENT_SECRET: 'd89906836c2b263cbea89457886cab25',
  REDIRECT_URI: 'https://tiagodorneles.github.io/fitiago/',
  AUTHORIZATION_URL: 'https://www.fitbit.com/oauth2/authorize',
  TOKEN_URL: 'https://api.fitbit.com/oauth2/token',
  SCOPES: [
    'activity',
    'heartrate',
    'location',
    'nutrition',
    'profile',
    'settings',
    'sleep',
    'social',
    'weight',
  ],
  APPLICATION_TYPE: 'CLIENT', // Client-side application
} as const

// Backward compatibility
export const API_CONFIG = HEVY_API_CONFIG

// Helper function to create API URLs
export const createApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// Helper function to create Fitbit API URLs
export const createFitbitApiUrl = (endpoint: string): string => {
  return `${FITBIT_API_CONFIG.BASE_URL}${endpoint}`
}

// Helper function for making API requests
export const apiRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const url = createApiUrl(endpoint)

  console.log('Making API request to:', url)

  const response = await fetch(url, {
    ...options,
    headers: {
      ...API_CONFIG.DEFAULT_HEADERS,
      ...options.headers,
    },
  })

  console.log('API response status:', response.status, response.statusText)

  if (!response.ok) {
    console.error('API request failed:', response.status, response.statusText)
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  console.log('API response data:', data)

  return data
}

// Helper function for making Fitbit API requests
export const fitbitApiRequest = async <T>(
  endpoint: string,
  accessToken: string,
  options: RequestInit = {},
): Promise<T> => {
  const url = createFitbitApiUrl(endpoint)

  console.log('Making Fitbit API request to:', url)

  const response = await fetch(url, {
    ...options,
    headers: {
      ...FITBIT_API_CONFIG.DEFAULT_HEADERS,
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  })

  console.log('Fitbit API response status:', response.status, response.statusText)

  if (!response.ok) {
    console.error('Fitbit API request failed:', response.status, response.statusText)
    throw new Error(`Fitbit API request failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  console.log('Fitbit API response data:', data)

  return data
}
