'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  Globe,
  Copy,
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react'

interface Page {
  id: string
  slug: string
  title: string
  description?: string
  status: 'draft' | 'published' | 'archived'
  is_public: boolean
  published_at?: string
  created_at: string
  updated_at: string
  custom_html?: string
  custom_css?: string
  custom_js?: string
}

interface PagesManagementProps {
  onClose?: () => void
  onEditPage?: (page: Page) => void
}

export const PagesManagement: React.FC<PagesManagementProps> = ({
  onClose,
  onEditPage
}) => {
  const { user } = useAuth()
  const [page, setPage] = useState<Page | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newPageData, setNewPageData] = useState({
    title: '',
    slug: '',
    description: ''
  })

  // Load user's single page
  useEffect(() => {
    loadPage()
  }, [])

  const loadPage = async () => {
    try {
      setIsLoading(true)
      setError('')

      const response = await fetch('/api/pages')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load page')
      }

      setPage(data.page || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load page')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePage = async () => {
    if (!newPageData.title || !newPageData.slug) {
      setError('Title and slug are required')
      return
    }

    try {
      setIsLoading(true)
      setError('')

      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPageData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create page')
      }

      setPage(data.page)
      setIsCreating(false)
      setNewPageData({ title: '', slug: '', description: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create page')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPage = async () => {
    if (!confirm('Are you sure you want to reset this page? This will clear all your custom content and restore default settings.')) {
      return
    }

    try {
      const response = await fetch(`/api/pages/${page?.id}`, {
        method: 'DELETE', // This will reset the page instead of deleting
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to reset page')
      }

      const data = await response.json()
      setPage(data.page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset page')
    }
  }

  const handleTogglePublish = async () => {
    if (!page) return

    try {
      const newStatus = page.status === 'published' ? 'draft' : 'published'

      const response = await fetch(`/api/pages/${page.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update page')
      }

      const data = await response.json()
      setPage(data.page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update page')
    }
  }

  const getStatusIndicator = (page: Page) => {
    const statusConfig = {
      published: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', label: 'Published' },
      draft: { icon: Edit3, color: 'text-yellow-500', bg: 'bg-yellow-50', label: 'Draft' },
      archived: { icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-50', label: 'Archived' },
    }

    const config = statusConfig[page.status]
    const Icon = config.icon

    return (
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${config.bg}`}>
        <Icon className={`w-3 h-3 ${config.color}`} />
        <span className={config.color}>{config.label}</span>
      </div>
    )
  }

  const getPageUrl = (page: Page) => {
    // In a real implementation, this would use your domain
    return `https://faerilink.com/${page.slug}`
  }

  if (isLoading && !page) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading page...</span>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            My Page
          </CardTitle>
          {page && (
            <Button onClick={() => onEditPage?.(page)}>
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Page
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create New Page Form */}
        {isCreating && (
          <Card className="border-2 border-primary">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-medium">Create New Page</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Page Title</label>
                  <Input
                    value={newPageData.title}
                    onChange={(e) => setNewPageData({ ...newPageData, title: e.target.value })}
                    placeholder="My Awesome Page"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">URL Slug</label>
                  <Input
                    value={newPageData.slug}
                    onChange={(e) => setNewPageData({ ...newPageData, slug: e.target.value })}
                    placeholder="my-awesome-page"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    URL: faerilink.com/{newPageData.slug || 'your-slug'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <Input
                    value={newPageData.description}
                    onChange={(e) => setNewPageData({ ...newPageData, description: e.target.value })}
                    placeholder="Brief description of your page"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreatePage} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Page'
                  )}
                </Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Page Content */}
        {!page ? (
          <div className="text-center py-12">
            <Globe className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No page yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first custom page with HTML, CSS, and JavaScript
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your Page
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold truncate">{page.title}</h3>
                      {getStatusIndicator(page)}
                    </div>

                    {page.description && (
                      <p className="text-muted-foreground text-sm mb-2">
                        {page.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span>/{page.slug}</span>
                      {page.published_at && (
                        <span>
                          Published {new Date(page.published_at).toLocaleDateString()}
                        </span>
                      )}
                      <span>
                        Created {new Date(page.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Show content preview */}
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Page Content:</h4>
                      <div className="bg-gray-50 rounded-md p-3 max-h-32 overflow-hidden">
                        <div className="text-xs text-gray-600">
                          <div className="mb-2">
                            <strong>HTML:</strong>
                            <div className="mt-1 p-2 bg-white rounded border text-xs font-mono overflow-hidden">
                              {page.custom_html ? page.custom_html.substring(0, 100) + (page.custom_html.length > 100 ? '...' : '') : 'No custom HTML'}
                            </div>
                          </div>
                          <div className="mb-2">
                            <strong>CSS:</strong>
                            <div className="mt-1 p-2 bg-white rounded border text-xs font-mono overflow-hidden">
                              {page.custom_css ? page.custom_css.substring(0, 100) + (page.custom_css.length > 100 ? '...' : '') : 'No custom CSS'}
                            </div>
                          </div>
                          <div>
                            <strong>JavaScript:</strong>
                            <div className="mt-1 p-2 bg-white rounded border text-xs font-mono overflow-hidden">
                              {page.custom_js ? page.custom_js.substring(0, 100) + (page.custom_js.length > 100 ? '...' : '') : 'No custom JavaScript'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {page.status === 'published' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(getPageUrl(page), '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditPage?.(page)}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTogglePublish()}
                    >
                      {page.status === 'published' ? <Eye className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResetPage()}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Page Status Info */}
        <div className="text-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {page ? 'You have 1 custom page' : 'No page created yet'}
          </p>
          <p className="text-sm text-green-600 mt-1">
            Edit with custom HTML, CSS, and JavaScript
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default PagesManagement
