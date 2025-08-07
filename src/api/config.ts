// API Configuration for Hevy API
export const API_CONFIG = {
  BASE_URL: 'https://api.hevyapp.com',
  API_KEY: '489b1a5a-0afa-4e1b-bddd-0b4f760ffb5c',
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'api-key': '489b1a5a-0afa-4e1b-bddd-0b4f760ffb5c',
  },
} as const

// Helper function to create API URLs
export const createApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
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
