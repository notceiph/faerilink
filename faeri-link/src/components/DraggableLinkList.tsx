import React, { useState, useRef, useEffect } from 'react'
import { useDrag, useDrop, DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { Link } from '@/types/database'
import { useLinks, useLinkScheduling } from '@/hooks/useLinks'
import {
  GripVertical,
  Edit3,
  Trash2,
  Copy,
  Calendar,
  Eye,
  EyeOff,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react'

interface DraggableLinkListProps {
  pageId: string
  onEditLink?: (link: Link) => void
}

interface LinkItemProps {
  link: Link
  index: number
  moveLink: (dragIndex: number, hoverIndex: number) => void
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
  onToggleActive: () => void
}

const ITEM_TYPE = 'LINK_ITEM'

const LinkItem: React.FC<LinkItemProps> = ({
  link,
  index,
  moveLink,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleActive,
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const { getLinkStatus } = useLinkScheduling()

  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    hover: (item: { index: number }, monitor) => {
      if (!ref.current) return

      const dragIndex = item.index
      const hoverIndex = index

      if (dragIndex === hoverIndex) return

      const hoverBoundingRect = ref.current.getBoundingClientRect()
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return

      moveLink(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  })

  drag(drop(ref))

  const linkStatus = getLinkStatus(link)
  const statusConfig = {
    active: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
    scheduled: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
    expired: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
    inactive: { icon: EyeOff, color: 'text-gray-500', bg: 'bg-gray-50' },
  }

  const StatusIcon = statusConfig[linkStatus].icon

  return (
    <div
      ref={ref}
      className={`group relative p-4 border rounded-lg transition-all ${
        isDragging ? 'opacity-50' : 'opacity-100'
      } ${isOver ? 'border-primary bg-primary/5' : 'border-border bg-card hover:shadow-sm'}`}
    >
      <div className="flex items-center gap-4">
        {/* Drag Handle */}
        <div className="cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-5 h-5 text-muted-foreground" />
        </div>

        {/* Link Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-medium truncate">{link.title}</h3>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusConfig[linkStatus].bg}`}>
              <StatusIcon className={`w-3 h-3 ${statusConfig[linkStatus].color}`} />
              <span className={statusConfig[linkStatus].color}>
                {linkStatus.charAt(0).toUpperCase() + linkStatus.slice(1)}
              </span>
            </div>
          </div>

          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm mb-1"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="truncate">{link.url}</span>
          </a>

          {link.description && (
            <p className="text-muted-foreground text-sm truncate">
              {link.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
            <span>{link.click_count} clicks</span>
            {link.group && (
              <span>Group: {link.group}</span>
            )}
            {link.schedule && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>
                  {link.schedule.start_date || link.schedule.end_date
                    ? `${link.schedule.start_date || '...'} - ${link.schedule.end_date || '...'}`
                    : 'No schedule'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="ghost"
            onClick={onToggleActive}
            className="h-8 w-8"
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
            onClick={onEdit}
            className="h-8 w-8"
          >
            <Edit3 className="w-4 h-4" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={onDuplicate}
            className="h-8 w-8"
          >
            <Copy className="w-4 h-4" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={onDelete}
            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export const DraggableLinkList: React.FC<DraggableLinkListProps> = ({
  pageId,
  onEditLink,
}) => {
  const {
    links,
    loading,
    error,
    updateLink,
    deleteLink,
    duplicateLink,
    reorderLinks,
  } = useLinks({ pageId })

  const [localLinks, setLocalLinks] = useState<Link[]>(links)

  // Update local state when links change
  useEffect(() => {
    setLocalLinks(links)
  }, [links])

  const moveLink = (dragIndex: number, hoverIndex: number) => {
    const newLinks = [...localLinks]
    const [removed] = newLinks.splice(dragIndex, 1)
    newLinks.splice(hoverIndex, 0, removed)
    setLocalLinks(newLinks)
  }

  const handleReorderEnd = async () => {
    const linkIds = localLinks.map(link => link.id)
    const success = await reorderLinks(linkIds)

    if (!success) {
      // Revert on error
      setLocalLinks(links)
    }
  }

  const handleToggleActive = async (link: Link) => {
    try {
      await updateLink(link.id, { is_active: !link.is_active })
    } catch (error) {
      console.error('Error updating link status:', error)
    }
  }

  const handleDelete = async (linkId: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return

    try {
      await deleteLink(linkId)
    } catch (error) {
      console.error('Error deleting link:', error)
    }
  }

  const handleDuplicate = async (linkId: string) => {
    try {
      await duplicateLink(linkId)
    } catch (error) {
      console.error('Error duplicating link:', error)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading links...</div>
  }

  if (error) {
    return <div className="text-red-500 p-8">Error: {error}</div>
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        {localLinks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ExternalLink className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No links yet</h3>
              <p className="text-muted-foreground text-center">
                Add your first link to get started with your page.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {localLinks.map((link, index) => (
              <LinkItem
                key={link.id}
                link={link}
                index={index}
                moveLink={moveLink}
                onEdit={() => onEditLink?.(link)}
                onDelete={() => handleDelete(link.id)}
                onDuplicate={() => handleDuplicate(link.id)}
                onToggleActive={() => handleToggleActive(link)}
              />
            ))}
          </div>
        )}

        {/* Save Order Button */}
        {localLinks.length > 1 && (
          <div className="flex justify-center pt-4">
            <Button onClick={handleReorderEnd} variant="outline">
              Save Link Order
            </Button>
          </div>
        )}
      </div>
    </DndProvider>
  )
}

export default DraggableLinkList
