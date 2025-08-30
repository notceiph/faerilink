import React, { useState, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Link, Page } from '@/types/database'
import { useLinks, useLinkScheduling, useLinkValidation } from '@/hooks/useLinks'
import { useAnalytics } from '@/hooks/useAnalytics'
import {
  Plus,
  Edit3,
  Trash2,
  Copy,
  Calendar,
  Eye,
  EyeOff,
  ExternalLink,
  Search,
  Filter,
  MoreVertical,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface LinkManagerProps {
  page: Page
}

export const LinkManager: React.FC<LinkManagerProps> = ({ page }) => {
  const {
    links,
    loading,
    error,
    createLink,
    updateLink,
    deleteLink,
    reorderLinks,
    duplicateLink,
  } = useLinks({ pageId: page.id })

  const { getLinkStatus, formatScheduleDate } = useLinkScheduling()
  const { validateLink } = useLinkValidation()
  const { trackLinkClick } = useAnalytics(page.id)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'scheduled' | 'expired'>('all')
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Link>>({})

  // Filter and search links
  const filteredLinks = useMemo(() => {
    return links.filter(link => {
      const matchesSearch = link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          link.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          link.description?.toLowerCase().includes(searchTerm.toLowerCase())

      const linkStatus = getLinkStatus(link)
      const matchesStatus = statusFilter === 'all' || linkStatus === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [links, searchTerm, statusFilter, getLinkStatus])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validation = validateLink(formData)
    if (!validation.isValid) {
      alert(validation.errors.join('\n'))
      return
    }

    try {
      if (editingId) {
        await updateLink(editingId, formData)
        setEditingId(null)
      } else {
        await createLink(formData as Omit<Link, 'id' | 'page_id' | 'created_at' | 'updated_at'>)
        setIsCreating(false)
      }
      setFormData({})
    } catch (error) {
      console.error('Error saving link:', error)
      alert('Error saving link. Please try again.')
    }
  }

  // Handle edit
  const handleEdit = (link: Link) => {
    setEditingId(link.id)
    setFormData(link)
    setIsCreating(false)
  }

  // Handle delete
  const handleDelete = async (linkId: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return

    try {
      await deleteLink(linkId)
    } catch (error) {
      console.error('Error deleting link:', error)
      alert('Error deleting link. Please try again.')
    }
  }

  // Handle duplicate
  const handleDuplicate = async (linkId: string) => {
    try {
      await duplicateLink(linkId)
    } catch (error) {
      console.error('Error duplicating link:', error)
      alert('Error duplicating link. Please try again.')
    }
  }

  // Toggle link active status
  const toggleLinkStatus = async (link: Link) => {
    try {
      await updateLink(link.id, { is_active: !link.is_active })
    } catch (error) {
      console.error('Error updating link status:', error)
      alert('Error updating link status. Please try again.')
    }
  }

  // Handle link click with analytics tracking
  const handleLinkClick = async (link: Link, e: React.MouseEvent) => {
    // Track the click
    await trackLinkClick(link.id)

    // Open the link in a new tab
    window.open(link.url, '_blank', 'noopener,noreferrer')
  }

  // Get status indicator
  const getStatusIndicator = (link: Link) => {
    const status = getLinkStatus(link)

    const statusConfig = {
      active: { icon: CheckCircle, color: 'text-green-500', label: 'Active' },
      scheduled: { icon: Clock, color: 'text-blue-500', label: 'Scheduled' },
      expired: { icon: AlertCircle, color: 'text-red-500', label: 'Expired' },
      inactive: { icon: EyeOff, color: 'text-gray-500', label: 'Inactive' },
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <div className={`flex items-center gap-1 ${config.color}`}>
        <Icon className="w-4 h-4" />
        <span className="text-xs">{config.label}</span>
      </div>
    )
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading links...</div>
  }

  if (error) {
    return <div className="text-red-500 p-8">Error: {error}</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Link Management</h2>
          <p className="text-muted-foreground">
            Manage links for {page.title}
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Link
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search links..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="scheduled">Scheduled</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? 'Edit Link' : 'Create New Link'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Link Title"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">URL</label>
                <Input
                  type="url"
                  value={formData.url || ''}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description (optional)"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Thumbnail URL</label>
                <Input
                  type="url"
                  value={formData.thumbnail_url || ''}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Group (optional)</label>
                <Input
                  value={formData.group || ''}
                  onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                  placeholder="e.g., Social Media, Projects"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active ?? true}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <label htmlFor="is_active" className="text-sm font-medium">
                  Active
                </label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? 'Update' : 'Create'} Link
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false)
                    setEditingId(null)
                    setFormData({})
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Links List */}
      <div className="space-y-4">
        {filteredLinks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ExternalLink className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No links found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first link'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Link
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredLinks.map((link) => (
            <Card key={link.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium truncate">{link.title}</h3>
                      {getStatusIndicator(link)}
                    </div>

                    <button
                      onClick={(e) => handleLinkClick(link, e)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-2 text-left"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="truncate">{link.url}</span>
                    </button>

                    {link.description && (
                      <p className="text-muted-foreground text-sm mb-2">
                        {link.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{link.click_count} clicks</span>
                      {link.group && (
                        <span>Group: {link.group}</span>
                      )}
                      {link.schedule && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {formatScheduleDate(link.schedule.start_date || null)} - {formatScheduleDate(link.schedule.end_date || null)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => toggleLinkStatus(link)}
                    >
                      {link.is_active ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(link)}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDuplicate(link.id)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(link.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filteredLinks.length} of {links.length} links
        </span>
        <span>
          {links.reduce((sum, link) => sum + link.click_count, 0)} total clicks
        </span>
      </div>
    </div>
  )
}

export default LinkManager
