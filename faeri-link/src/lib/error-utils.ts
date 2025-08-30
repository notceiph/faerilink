// Utility functions for better error handling and logging

export function logError(error: any, context: string) {
  console.group(`🚨 Error in ${context}`)

  // Basic error information
  console.error('Error object:', error)
  console.error('Error type:', typeof error)

  // Check if it's a standard Error object
  if (error instanceof Error) {
    console.error('Message:', error.message)
    console.error('Stack:', error.stack)
    console.error('Name:', error.name)
  }

  // Handle Supabase/PostgreSQL errors
  if (error && typeof error === 'object') {
    const errorKeys = Object.keys(error)
    console.error('Error keys:', errorKeys)

    // Common Supabase error properties
    if (error.message) console.error('Error message:', error.message)
    if (error.details) console.error('Error details:', error.details)
    if (error.hint) console.error('Error hint:', error.hint)
    if (error.code) console.error('Error code:', error.code)
    if (error.statusCode) console.error('Status code:', error.statusCode)

    // If it's an empty object, try to get more info
    if (errorKeys.length === 0) {
      console.error('Empty error object - this might be a serialization issue')
      console.error('Error toString():', error.toString?.())
      console.error('Error JSON:', JSON.stringify(error, null, 2))
    }
  }

  // Handle network errors
  if (error && error.name === 'NetworkError') {
    console.error('Network error detected')
  }

  console.groupEnd()
}

export function formatErrorForUser(error: any): string {
  if (!error) return 'An unknown error occurred'

  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message
  }

  // Handle Supabase errors
  if (error && typeof error === 'object') {
    if (error.message) {
      return error.message
    }

    // Check for common error patterns
    if (error.code === 'PGRST116') {
      return 'No data found for the requested resource'
    }

    if (error.code === '23505') {
      return 'A record with this information already exists'
    }

    if (error.statusCode === 401) {
      return 'Authentication required. Please sign in again.'
    }

    if (error.statusCode === 403) {
      return 'You do not have permission to perform this action.'
    }

    if (error.statusCode === 404) {
      return 'The requested resource was not found.'
    }

    if (error.statusCode >= 500) {
      return 'Server error. Please try again later.'
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error
  }

  return 'An unexpected error occurred. Please try again.'
}
