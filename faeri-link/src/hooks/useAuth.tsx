import { useState, useEffect, useContext, createContext, ReactNode } from 'react'
import { User } from '@/types/database'
import { supabase } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signUp: (email: string, password: string) => Promise<{ error: any; requiresVerification?: boolean }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
  resendVerificationEmail: (email: string) => Promise<{ error: any }>
  updateProfile: (updates: Partial<User>) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    let loadingTimeout: NodeJS.Timeout

    // Get initial session with timeout
    const getInitialSession = async () => {
      try {
        setError(null)
        console.log('🔍 Getting initial session...')

        // Set a timeout to prevent infinite loading
        loadingTimeout = setTimeout(() => {
          if (isMounted) {
            console.warn('⏰ Loading timeout reached, forcing loading state to complete')
            console.log('🔍 useAuth state at timeout:', { user: !!user, loading, error })
            setLoading(false)
            setError('Connection timeout. Please check your internet connection and try again.')
          }
        }, 5000) // Reduced to 5 seconds for faster debugging

        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('Session error:', sessionError)
          if (isMounted) {
            setError(`Failed to get authentication session: ${sessionError.message}`)
          }
        }

        console.log('📋 Initial session result:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          userEmail: session?.user?.email
        })

        if (session?.user) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (userError) {
            console.error('User data error:', userError)

            // If user profile doesn't exist, try to create it
            if (userError.code === 'PGRST116' && userError.message.includes('No rows found')) {
              console.log('User profile not found during initial load, creating new profile...')
              const { error: insertError } = await supabase
                .from('users')
                .insert({
                  id: session.user.id,
                  email: session.user.email,
                  plan: 'free',
                  is_email_verified: session.user.email_confirmed_at ? true : false,
                })

              if (insertError) {
                console.error('Error creating user profile during initial load:', insertError)
                if (isMounted) {
                  setError(`Failed to create user profile: ${insertError.message}`)
                }
              } else {
                // Fetch the newly created user profile
                const { data: newUserData, error: fetchError } = await supabase
                  .from('users')
                  .select('*')
                  .eq('id', session.user.id)
                  .single()

                if (fetchError) {
                  console.error('Error fetching newly created user during initial load:', fetchError)
                  if (isMounted) {
                    setError('Failed to load user data after creating profile')
                  }
                } else if (newUserData && isMounted) {
                  setUser(newUserData)
                }
              }
            } else {
              // Other database errors
              if (isMounted) {
                setError(`Database error: ${userError.message}`)
              }
            }
          } else if (userData && isMounted) {
            setUser(userData)
          }
        }
      } catch (err) {
        console.error('Authentication error:', err)
        if (isMounted) {
          setError(`Authentication failed: ${err instanceof Error ? err.message : 'Unknown error'}. Please check your configuration.`)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
          if (loadingTimeout) {
            clearTimeout(loadingTimeout)
          }
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id)

        try {
          if (event === 'SIGNED_IN' && session?.user) {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (userError) {
              console.error('User data error on sign in:', userError)

              // If user profile doesn't exist, try to create it
              if (userError.code === 'PGRST116' && userError.message.includes('No rows found')) {
                console.log('User profile not found, creating new profile...')
                const { error: insertError } = await supabase
                  .from('users')
                  .insert({
                    id: session.user.id,
                    email: session.user.email,
                    plan: 'free',
                    is_email_verified: session.user.email_confirmed_at ? true : false,
                  })

                if (insertError) {
                  console.error('Error creating user profile:', insertError)
                  if (isMounted) {
                    setError(`Failed to create user profile: ${insertError.message}`)
                  }
                } else {
                  // Fetch the newly created user profile
                  const { data: newUserData, error: fetchError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single()

                  if (fetchError) {
                    console.error('Error fetching newly created user:', fetchError)
                    if (isMounted) {
                      setError('Failed to load user data after creating profile')
                    }
                  } else if (newUserData && isMounted) {
                    setUser(newUserData)
                    setError(null)
                  }
                }
              } else {
                // Other database errors
                if (isMounted) {
                  setError(`Database error: ${userError.message}`)
                }
              }
            } else if (userData && isMounted) {
              setUser(userData)
              setError(null)
            }
          } else if (event === 'SIGNED_OUT') {
            if (isMounted) {
              setUser(null)
              setError(null)
            }
          } else if (event === 'TOKEN_REFRESHED') {
            console.log('Token refreshed successfully')
          }
        } catch (err) {
          console.error('Auth state change error:', err)
          if (isMounted) {
            setError('Authentication state change failed')
          }
        }
      }
    )

    return () => {
      isMounted = false
      if (loadingTimeout) {
        clearTimeout(loadingTimeout)
      }
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      setError(null)
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify-email`
        }
      })

      if (error) {
        console.error('Signup error:', error)
        return { error }
      }

      // Create user profile in our users table
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const userData = {
          id: user.id,
          email: user.email,
          display_name: displayName || null,
          plan: 'free' as const,
          is_email_verified: false,
        }

        const { error: insertError } = await supabase
          .from('users')
          .insert(userData)

        if (insertError) {
          console.error('Error creating user profile:', insertError)
          // Don't return error here as the auth user was created successfully
          // The profile will be created later when they sign in
        }
      }

      return { error: null, requiresVerification: true }
    } catch (err) {
      console.error('Signup error:', err)
      return { error: err instanceof Error ? err : new Error('Signup failed') }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Signin error:', error)
        return { error }
      }

      // Ensure user profile exists in our users table
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single()

        if (!existingUser) {
          // Create user profile if it doesn't exist
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email,
              plan: 'free',
              is_email_verified: user.email_confirmed_at ? true : false,
            })

          if (insertError) {
            console.error('Error creating user profile on signin:', insertError)
          }
        }
      }

      return { error: null }
    } catch (err) {
      console.error('Signin error:', err)
      return { error: err instanceof Error ? err : new Error('Signin failed') }
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
        setError('Failed to sign out')
      } else {
        // Clear all user data and redirect
        setUser(null)
        setError(null)

        // Clear any local storage/cookies
        if (typeof window !== 'undefined') {
          localStorage.clear()
          sessionStorage.clear()

          // Redirect to login page
          window.location.href = '/auth/login'
        }
      }
    } catch (err) {
      console.error('Sign out error:', err)
      setError('Failed to sign out')
    }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    return { error }
  }

  const resendVerificationEmail = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/verify-email`
      }
    })
    return { error }
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return { error: new Error('No user logged in') }

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)

    if (!error) {
      setUser({ ...user, ...updates })
    }

    return { error }
  }

  const value: AuthContextType = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    resendVerificationEmail,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook for checking if user is authenticated
export const useRequireAuth = () => {
  const { user, loading } = useAuth()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (!loading) {
      setIsAuthorized(!!user)
    }
  }, [user, loading])

  return { user, loading, isAuthorized }
}

// Hook for protected routes
export const useProtectedRoute = () => {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login if not authenticated
      // Use Next.js router for client-side navigation
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
    }
  }, [user, loading])

  return { user, loading }
}
