#!/usr/bin/env node

/**
 * Faeri Link Authentication Setup Script
 *
 * This script helps verify and set up the authentication system
 */

const fs = require('fs')
const path = require('path')

// Check if .env.local exists
function checkEnvFile() {
  const envPath = path.join(__dirname, '.env.local')

  if (!fs.existsSync(envPath)) {
    console.log('❌ .env.local file not found')
    console.log('📝 Creating template .env.local file...')
    return false
  }

  console.log('✅ .env.local file exists')
  return true
}

// Validate environment variables
function validateEnvVars() {
  require('dotenv').config({ path: '.env.local' })

  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]

  const optional = [
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_JWT_SECRET',
    'NEXTAUTH_SECRET'
  ]

  let hasAllRequired = true

  console.log('\n🔍 Checking required environment variables:')
  required.forEach(varName => {
    const value = process.env[varName]
    if (!value || value.includes('your-')) {
      console.log(`❌ ${varName} is missing or has placeholder value`)
      hasAllRequired = false
    } else {
      console.log(`✅ ${varName} is set`)
    }
  })

  console.log('\n📋 Optional environment variables:')
  optional.forEach(varName => {
    const value = process.env[varName]
    if (!value || value.includes('your-')) {
      console.log(`⚠️  ${varName} is missing or has placeholder value`)
    } else {
      console.log(`✅ ${varName} is set`)
    }
  })

  return hasAllRequired
}

// Test Supabase connection
async function testSupabaseConnection() {
  try {
    const { createClient } = require('@supabase/supabase-js')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-') || supabaseKey.includes('your-')) {
      console.log('⚠️  Skipping Supabase connection test - credentials not properly set')
      return false
    }

    console.log('\n🔍 Testing Supabase connection...')

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test connection with a simple query
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.log('❌ Supabase connection failed:', error.message)
      return false
    }

    console.log('✅ Supabase connection successful')
    return true

  } catch (error) {
    console.log('❌ Error testing Supabase connection:', error.message)
    return false
  }
}

// Main setup function
async function runSetup() {
  console.log('🚀 Faeri Link Authentication Setup\n')

  const steps = [
    { name: 'Check .env.local file', fn: checkEnvFile },
    { name: 'Validate environment variables', fn: validateEnvVars },
    { name: 'Test Supabase connection', fn: testSupabaseConnection }
  ]

  let allPassed = true

  for (const step of steps) {
    console.log(`\n📋 ${step.name}...`)
    const passed = typeof step.fn === 'function' ? await step.fn() : step.fn
    if (!passed) {
      allPassed = false
    }
  }

  console.log('\n' + '='.repeat(50))

  if (allPassed) {
    console.log('🎉 Authentication setup verification passed!')
    console.log('✨ You can now start developing with full authentication support.')
    console.log('\n📝 Next steps:')
    console.log('   1. Start your dev server: npm run dev')
    console.log('   2. Visit http://localhost:3000/auth/login')
    console.log('   3. Test creating an account and signing in')
  } else {
    console.log('⚠️  Setup verification failed. Please address the issues above.')
    console.log('\n🔧 To fix common issues:')
    console.log('   1. Get your Supabase credentials from https://supabase.com/dashboard')
    console.log('   2. Update .env.local with real values (not placeholders)')
    console.log('   3. Make sure your Supabase project is active')
    console.log('   4. Run this script again to verify')
  }

  console.log('\n📖 For more help, check the env-setup.txt file')
  console.log('🔗 Supabase Dashboard: https://supabase.com/dashboard')
}

// Run setup if this script is executed directly
if (require.main === module) {
  runSetup().catch(console.error)
}

module.exports = { runSetup, checkEnvFile, validateEnvVars, testSupabaseConnection }
