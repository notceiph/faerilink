'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import dynamic from 'next/dynamic'

// Lazy load heavy scheduling components
const SchedulingManagement = dynamic(() => import('@/components/SchedulingManagement').then(mod => ({ default: mod.SchedulingManagement })), {
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-2">Loading scheduling...</span>
    </div>
  )
})
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowLeft } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SchedulingPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [pages, setPages] = useState<any[]>([])
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const fetchPages = async () => {
      if (!user?.id) return

      try {
        const { data, error } = await supabase
          .from('pages')
          .select('id, title, slug')
          .eq('user_id', user.id)

        if (error) throw error

        setPages(data || [])
        if (data && data.length > 0) {
          setSelectedPageId(data[0].id)
        }
      } catch (error) {
        console.error('Error fetching pages:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPages()
  }, [user?.id])

  const handleSignOut = async () => {
    await signOut()
  }

  const handleCreatePage = () => {
    router.push('/create-page')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader
          user={user}
          onSignOut={handleSignOut}
          onCreatePage={handleCreatePage}
        />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mb-4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        user={user}
        onSignOut={handleSignOut}
        onCreatePage={handleCreatePage}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Scheduling</h1>
          <p className="text-muted-foreground">
            Manage appointments and meeting bookings
          </p>
        </div>

        {pages.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  📅
                </div>
                <h3 className="text-lg font-semibold mb-2">No pages yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first page to set up scheduling
                </p>
                <Button onClick={handleCreatePage}>
                  Create Your First Page
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {pages.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Page</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pages.map((page) => (
                      <Button
                        key={page.id}
                        variant={selectedPageId === page.id ? "default" : "outline"}
                        onClick={() => setSelectedPageId(page.id)}
                        className="justify-start h-auto p-4"
                      >
                        <div className="text-left">
                          <div className="font-medium">{page.title}</div>
                          <div className="text-sm text-muted-foreground">
                            /{page.slug}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedPageId && (
              <Card>
                <CardHeader>
                  <CardTitle>Scheduling Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <SchedulingManagement pageId={selectedPageId} />
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
