'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import dynamic from 'next/dynamic'

// Lazy load heavy pages management components
const PagesManagement = dynamic(() => import('@/components/PagesManagement').then(mod => ({ default: mod.PagesManagement })), {
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-2">Loading pages...</span>
    </div>
  )
})
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Plus } from 'lucide-react'

export default function PagesPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()

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
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Pages</h1>
              <p className="text-muted-foreground">
                Manage and edit your link-in-bio pages
              </p>
            </div>
            <Button onClick={handleCreatePage}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Page
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <PagesManagement
              onEditPage={(page) => {
                // Navigate to page editor or show edit modal
                console.log('Edit page:', page)
              }}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
