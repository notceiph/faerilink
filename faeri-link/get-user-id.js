// Get User ID for Debugging
console.log('🔍 Getting User ID for debugging...\n')

// Instructions for user
console.log('📋 To get your User ID:')
console.log('1. Open your browser to http://localhost:3001')
console.log('2. Sign in to your account')
console.log('3. Open Developer Tools (F12)')
console.log('4. Go to Console tab')
console.log('5. Run this code:')
console.log('')
console.log('   // Get user ID from auth')
console.log('   const { supabase } = require("./src/lib/supabase/client")')
console.log('   supabase.auth.getUser().then(result => console.log("User ID:", result.data.user?.id))')
console.log('')
console.log('6. Copy the User ID and run:')
console.log('   node debug-user-pages.js YOUR_USER_ID')
console.log('')
console.log('Alternatively, you can run this in the browser console:')
console.log('   fetch("/api/pages").then(r => r.json()).then(console.log)')

// Also provide a way to check auth status
async function checkAuthStatus() {
  try {
    const { createClient } = require('@supabase/supabase-js')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Missing Supabase configuration')
      return
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // This won't work from server side, but shows the concept
    console.log('\n🔐 Auth Check:')
    console.log('If you see auth errors, you may need to check your Supabase setup')
    console.log('Try accessing your app in the browser first to establish a session')

  } catch (error) {
    console.log('❌ Auth check failed:', error.message)
  }
}

checkAuthStatus()
