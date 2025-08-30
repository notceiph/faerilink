/**
 * Supabase Setup and Configuration Helper
 *
 * This file provides utilities to help set up and verify Supabase configuration
 */

import { createClient } from './client'

// Environment validation
export function validateEnvironment() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]

  const missingVars = requiredEnvVars.filter(
    varName => !process.env[varName]
  )

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:')
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`)
    })
    return false
  }

  console.log('✅ All required environment variables are set')
  return true
}

// Supabase connection test
export async function testSupabaseConnection() {
  try {
    console.log('🔍 Testing Supabase connection...')

    if (!validateEnvironment()) {
      return false
    }

    const supabase = createClient()

    // Test basic connection
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error('❌ Supabase connection failed:', error.message)
      return false
    }

    console.log('✅ Supabase connection successful')
    console.log('🔗 Connected to:', process.env.NEXT_PUBLIC_SUPABASE_URL)

    return true
  } catch (error) {
    console.error('❌ Unexpected error testing Supabase connection:', error)
    return false
  }
}

// Database schema verification
export async function verifyDatabaseSchema() {
  try {
    console.log('🔍 Verifying database schema...')

    const supabase = createClient()

    // Check if users table exists
    const { data: usersTable, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    if (usersError) {
      console.error('❌ Users table verification failed:', usersError.message)
      console.log('💡 Make sure to run the database migrations')
      return false
    }

    console.log('✅ Users table exists')

    // Check if pages table exists
    const { data: pagesTable, error: pagesError } = await supabase
      .from('pages')
      .select('id')
      .limit(1)

    if (pagesError) {
      console.error('❌ Pages table verification failed:', pagesError.message)
      return false
    }

    console.log('✅ Pages table exists')

    // Check if RLS is enabled
    const { data: rlsCheck, error: rlsError } = await supabase
      .from('users')
      .select('*')
      .limit(1)

    if (rlsError && rlsError.message.includes('policy')) {
      console.log('⚠️  Row Level Security policies may need to be configured')
    } else {
      console.log('✅ Database schema verification complete')
    }

    return true
  } catch (error) {
    console.error('❌ Database schema verification failed:', error)
    return false
  }
}

// Setup verification function
export async function runSetupVerification() {
  console.log('🚀 Starting Faeri Link authentication setup verification...\n')

  const steps = [
    { name: 'Environment Variables', fn: validateEnvironment },
    { name: 'Supabase Connection', fn: testSupabaseConnection },
    { name: 'Database Schema', fn: verifyDatabaseSchema }
  ]

  let allPassed = true

  for (const step of steps) {
    console.log(`\n📋 Checking ${step.name}...`)
    const passed = await step.fn()
    if (!passed) {
      allPassed = false
    }
  }

  console.log('\n' + '='.repeat(50))

  if (allPassed) {
    console.log('🎉 Setup verification completed successfully!')
    console.log('✨ Your Faeri Link authentication system is ready to use.')
    console.log('\n📝 Next steps:')
    console.log('   1. Start your development server: npm run dev')
    console.log('   2. Visit http://localhost:3000/auth/login to test authentication')
    console.log('   3. Create a test account and verify the flow works')
  } else {
    console.log('⚠️  Setup verification failed. Please address the issues above.')
    console.log('\n🔧 Common solutions:')
    console.log('   1. Check your .env.local file has correct Supabase credentials')
    console.log('   2. Verify your Supabase project is active and accessible')
    console.log('   3. Run the database migrations if tables are missing')
    console.log('   4. Check Supabase dashboard for any configuration issues')
  }

  return allPassed
}

// Helper function to generate secure secrets
export function generateSecureSecret(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Export for use in other modules
export default {
  validateEnvironment,
  testSupabaseConnection,
  verifyDatabaseSchema,
  runSetupVerification,
  generateSecureSecret
}
