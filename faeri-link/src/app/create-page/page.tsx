'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { generateSlug } from '@/lib/utils'
import { Plus, ArrowLeft } from 'lucide-react'

export default function CreatePagePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setError('You must be logged in to create a page')
      return
    }

    if (!title.trim()) {
      setError('Page title is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Generate slug from title
      const slug = generateSlug(title)

      console.log('🔍 Debug: Attempting to create page with:', {
        title: title.trim(),
        slug,
        description: description.trim()
      })

      // Use our new API endpoint instead of direct Supabase calls
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          slug,
          description: description.trim(),
        }),
      })

      console.log('🔍 Debug: Response status:', response.status)
      console.log('🔍 Debug: Response headers:', Object.fromEntries(response.headers.entries()))

      const data = await response.json()
      console.log('🔍 Debug: Response data:', data)

      if (!response.ok) {
        const errorMessage = data.error || `HTTP ${response.status}: ${response.statusText}`
        console.error('❌ API Error:', errorMessage)
        throw new Error(errorMessage)
      }

      console.log('✅ Page created successfully:', data)
      console.log('🔄 Redirecting to dashboard...')

      // Force a small delay to ensure the page is fully created
      setTimeout(() => {
        console.log('🚀 Executing redirect to dashboard')
        router.push('/dashboard')
      }, 100)

    } catch (err) {
      console.error('❌ Error creating page:', err)

      // Provide more detailed error information
      let errorMessage = 'Failed to create page'
      if (err instanceof Error) {
        errorMessage = err.message
      } else if (typeof err === 'object' && err !== null) {
        errorMessage = JSON.stringify(err)
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Create New Page</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Page Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Page Title *
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My Awesome Page"
                  required
                  maxLength={100}
                />
                <p className="text-xs text-gray-600 mt-1">
                  This will be your page's title and main heading
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A brief description of what you'll share on this page..."
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  rows={3}
                  maxLength={250}
                />
                <p className="text-xs text-gray-600 mt-1">
                  This will appear in search results and social media previews
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <span className="text-sm">Error: {error}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Creating...' : 'Create Page'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>What happens next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium">Page Created</h4>
                <p className="text-sm text-gray-600">Your new page will be created with a unique URL</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium">Customize Your Page</h4>
                <p className="text-sm text-gray-600">Edit with custom HTML, CSS, and JavaScript code</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium">Go Live</h4>
                <p className="text-sm text-gray-600">Publish your page and share it with your audience</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
