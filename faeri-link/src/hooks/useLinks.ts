import { useState, useCallback, useEffect } from 'react'
import { Link } from '@/types/database'
import { supabase } from '@/lib/supabase/client'
import { generateId } from '@/lib/utils'

interface UseLinksOptions {
  pageId: string
}

interface UseLinksReturn {
  links: Link[]
  loading: boolean
  error: string | null
  createLink: (linkData: Omit<Link, 'id' | 'page_id' | 'created_at' | 'updated_at'>) => Promise<Link | null>
  updateLink: (linkId: string, updates: Partial<Link>) => Promise<Link | null>
  deleteLink: (linkId: string) => Promise<boolean>
  reorderLinks: (linkIds: string[]) => Promise<boolean>
  duplicateLink: (linkId: string) => Promise<Link | null>
  getLinkById: (linkId: string) => Link | null
  refreshLinks: () => Promise<void>
}

export const useLinks = ({ pageId }: UseLinksOptions): UseLinksReturn => {
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch links for the page
  const fetchLinks = useCallback(async () => {
    if (!pageId) return

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('page_id', pageId)
        .order('position', { ascending: true })

      if (error) {
        throw error
      }

      setLinks(data || [])
    } catch (err) {
      console.error('Error fetching links:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch links')
    } finally {
      setLoading(false)
    }
  }, [pageId])

  // Create a new link
  const createLink = useCallback(async (linkData: Omit<Link, 'id' | 'page_id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null)

      // Validate URL format
      if (linkData.url && !isValidUrl(linkData.url)) {
        throw new Error('Invalid URL format')
      }

      const newLink: Omit<Link, 'id' | 'created_at' | 'updated_at'> = {
        ...linkData,
        page_id: pageId,
        is_active: linkData.is_active ?? true,
        click_count: 0,
      }

      const { data, error } = await supabase
        .from('links')
        .insert(newLink)
        .select()
        .single()

      if (error) {
        throw error
      }

      setLinks(prev => [...prev, data])
      return data
    } catch (err) {
      console.error('Error creating link:', err)
      setError(err instanceof Error ? err.message : 'Failed to create link')
      return null
    }
  }, [pageId])

  // Update an existing link
  const updateLink = useCallback(async (linkId: string, updates: Partial<Link>) => {
    try {
      setError(null)

      // Validate URL format if URL is being updated
      if (updates.url && !isValidUrl(updates.url)) {
        throw new Error('Invalid URL format')
      }

      const { data, error } = await supabase
        .from('links')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', linkId)
        .select()
        .single()

      if (error) {
        throw error
      }

      setLinks(prev => prev.map(link => link.id === linkId ? data : link))
      return data
    } catch (err) {
      console.error('Error updating link:', err)
      setError(err instanceof Error ? err.message : 'Failed to update link')
      return null
    }
  }, [])

  // Delete a link
  const deleteLink = useCallback(async (linkId: string) => {
    try {
      setError(null)

      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', linkId)

      if (error) {
        throw error
      }

      setLinks(prev => prev.filter(link => link.id !== linkId))
      return true
    } catch (err) {
      console.error('Error deleting link:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete link')
      return false
    }
  }, [])

  // Reorder links
  const reorderLinks = useCallback(async (linkIds: string[]) => {
    try {
      setError(null)

      // Update positions in batch
      const updates = linkIds.map((id, index) => ({
        id,
        position: index,
        updated_at: new Date().toISOString(),
      }))

      const { error } = await supabase
        .from('links')
        .upsert(updates, { onConflict: 'id' })

      if (error) {
        throw error
      }

      // Update local state
      setLinks(prev => {
        const reordered = [...prev].sort((a, b) => {
          const aIndex = linkIds.indexOf(a.id)
          const bIndex = linkIds.indexOf(b.id)
          return aIndex - bIndex
        })
        return reordered
      })

      return true
    } catch (err) {
      console.error('Error reordering links:', err)
      setError(err instanceof Error ? err.message : 'Failed to reorder links')
      return false
    }
  }, [])

  // Duplicate a link
  const duplicateLink = useCallback(async (linkId: string) => {
    try {
      setError(null)

      const originalLink = links.find(link => link.id === linkId)
      if (!originalLink) {
        throw new Error('Link not found')
      }

      const duplicatedLink: Omit<Link, 'id' | 'created_at' | 'updated_at'> = {
        ...originalLink,
        title: `${originalLink.title} (Copy)`,
        position: links.length,
        click_count: 0,
      }

      const { data, error } = await supabase
        .from('links')
        .insert(duplicatedLink)
        .select()
        .single()

      if (error) {
        throw error
      }

      setLinks(prev => [...prev, data])
      return data
    } catch (err) {
      console.error('Error duplicating link:', err)
      setError(err instanceof Error ? err.message : 'Failed to duplicate link')
      return null
    }
  }, [links])

  // Get link by ID
  const getLinkById = useCallback((linkId: string) => {
    return links.find(link => link.id === linkId) || null
  }, [links])

  // Refresh links data
  const refreshLinks = useCallback(async () => {
    await fetchLinks()
  }, [fetchLinks])

  // Fetch links on mount and when pageId changes
  useEffect(() => {
    fetchLinks()
  }, [fetchLinks])

  return {
    links,
    loading,
    error,
    createLink,
    updateLink,
    deleteLink,
    reorderLinks,
    duplicateLink,
    getLinkById,
    refreshLinks,
  }
}

// Utility functions
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return url.startsWith('http://') || url.startsWith('https://')
  } catch {
    return false
  }
}

// Hook for managing link scheduling
export const useLinkScheduling = () => {
  const isLinkActive = useCallback((link: Link): boolean => {
    if (!link.schedule) return link.is_active

    const now = new Date()
    const startDate = link.schedule.start_date ? new Date(link.schedule.start_date) : null
    const endDate = link.schedule.end_date ? new Date(link.schedule.end_date) : null

    if (startDate && startDate > now) return false
    if (endDate && endDate < now) return false

    return link.is_active
  }, [])

  const getLinkStatus = useCallback((link: Link): 'active' | 'scheduled' | 'expired' | 'inactive' => {
    if (!link.is_active) return 'inactive'

    if (!link.schedule) return 'active'

    const now = new Date()
    const startDate = link.schedule.start_date ? new Date(link.schedule.start_date) : null
    const endDate = link.schedule.end_date ? new Date(link.schedule.end_date) : null

    if (startDate && startDate > now) return 'scheduled'
    if (endDate && endDate < now) return 'expired'

    return 'active'
  }, [])

  const formatScheduleDate = useCallback((dateString: string | null): string => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString()
  }, [])

  return {
    isLinkActive,
    getLinkStatus,
    formatScheduleDate,
  }
}

// Hook for link analytics
export const useLinkAnalytics = () => {
  const trackLinkClick = useCallback(async (linkId: string, pageId: string) => {
    try {
      // Track in analytics events table
      await supabase
        .from('analytics_events')
        .insert({
          page_id: pageId,
          link_id: linkId,
          event_type: 'link_click',
          timestamp: new Date().toISOString(),
        })

      // Increment click count
      await (supabase.rpc as any)('increment_link_click', { link_uuid: linkId })

      // Track with Google Analytics if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'link_click', {
          link_id: linkId,
          page_id: pageId,
        })
      }
    } catch (error) {
      console.error('Error tracking link click:', error)
    }
  }, [])

  return {
    trackLinkClick,
  }
}

// Hook for link validation
export const useLinkValidation = () => {
  const validateLink = useCallback((link: Partial<Link>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (!link.title?.trim()) {
      errors.push('Title is required')
    }

    if (!link.url?.trim()) {
      errors.push('URL is required')
    } else if (!isValidUrl(link.url)) {
      errors.push('Invalid URL format')
    }

    if (link.title && link.title.length > 100) {
      errors.push('Title must be less than 100 characters')
    }

    if (link.description && link.description.length > 500) {
      errors.push('Description must be less than 500 characters')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }, [])

  return {
    validateLink,
  }
}
