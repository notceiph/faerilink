'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Plus, Settings } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { logError, formatErrorForUser } from '@/lib/error-utils'
import dynamic from 'next/dynamic'

// Lazy load dashboard components for better performance
const DashboardHeader = dynamic(() => import('@/components/dashboard/DashboardHeader').then(mod => ({ default: mod.DashboardHeader })), {
  loading: () => <div className="h-16 bg-muted animate-pulse" />
})

const QuickStats = dynamic(() => import('@/components/dashboard/QuickStats').then(mod => ({ default: mod.QuickStats })), {
  loading: () => <div className="grid grid-cols-2 md:grid-cols-4 gap-4"><div className="h-32 bg-muted animate-pulse rounded" /><div className="h-32 bg-muted animate-pulse rounded" /><div className="h-32 bg-muted animate-pulse rounded" /><div className="h-32 bg-muted animate-pulse rounded" /></div>
})

const QuickActions = dynamic(() => import('@/components/dashboard/QuickActions').then(mod => ({ default: mod.QuickActions })), {
  loading: () => <div className="h-64 bg-muted animate-pulse rounded" />
})

const RecentActivity = dynamic(() => import('@/components/dashboard/RecentActivity').then(mod => ({ default: mod.RecentActivity })), {
  loading: () => <div className="h-48 bg-muted animate-pulse rounded" />
})

const GettingStarted = dynamic(() => import('@/components/dashboard/GettingStarted').then(mod => ({ default: mod.GettingStarted })), {
  loading: () => <div className="h-64 bg-muted animate-pulse rounded" />
})

interface DashboardStats {
  totalPages: number;
  totalLinks: number;
  totalClicks: number;
  totalViews: number;
}

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalPages: 0,
    totalLinks: 0,
    totalClicks: 0,
    totalViews: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchDashboardData = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)

      // Fetch user's pages and basic stats
      const { data: pagesData, error: pagesError } = await supabase
        .from('pages')
        .select(`
          id,
          title,
          slug,
          status,
          created_at,
          links (
            id,
            click_count
          )
        `)
        .eq('user_id', user.id)

      if (pagesError) {
        logError(pagesError, 'fetchDashboardData - pages query')
        throw pagesError
      }

      // Calculate basic stats
      const totalPages = pagesData?.length || 0
      const totalLinks = pagesData?.reduce((sum, page) => sum + (page.links?.length || 0), 0) || 0
      const totalClicks = pagesData?.reduce((sum, page) =>
        sum + (page.links?.reduce((linkSum: number, link: any) => linkSum + link.click_count, 0) || 0), 0) || 0

      // Get basic view count (simplified for dashboard)
      const totalViews = totalClicks * 2 // Rough estimate for demo

      setStats({
        totalPages,
        totalLinks,
        totalClicks,
        totalViews
      })

    } catch (error) {
      logError(error, 'fetchDashboardData')
      const userFriendlyMessage = formatErrorForUser(error)
      setError(userFriendlyMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [user?.id])

  const handleSignOut = async () => {
    await signOut()
  }

  const handleCreatePage = () => {
    router.push('/create-page')
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        user={user}
        onSignOut={handleSignOut}
        onCreatePage={handleCreatePage}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back{user?.display_name ? `, ${user.display_name}` : ''}!
          </h2>
          <p className="text-muted-foreground">
            Ready to create amazing link in bio pages?
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 text-red-600">⚠️</div>
                <h3 className="font-semibold text-red-800">Error Loading Dashboard</h3>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setError(null)
                  fetchDashboardData()
                }}
                className="mt-3"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-8">
          <QuickStats stats={stats} loading={loading} />
          <QuickActions onCreatePage={handleCreatePage} />
          <RecentActivity />
          <GettingStarted onCreatePage={handleCreatePage} />
        </div>
      </main>
    </div>
  )
}
