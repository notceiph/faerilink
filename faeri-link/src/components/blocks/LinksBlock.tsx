import React from 'react'
import { Button } from '@/components/ui/Button'
import { BlockConfig, Link as LinkType } from '@/types/database'
import BaseBlock from './BaseBlock'
import { ExternalLink, Eye, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LinksBlockProps {
  id: string
  config: BlockConfig
  isEditing?: boolean
  onConfigChange?: (config: BlockConfig) => void
  links?: LinkType[]
  onLinkClick?: (linkId: string) => void
}

export const LinksBlock: React.FC<LinksBlockProps> = ({
  id,
  config,
  isEditing,
  onConfigChange,
  links = [],
  onLinkClick,
}) => {
  const {
    layout = 'list',
    padding,
    margin,
  } = config

  const layoutClasses = {
    list: 'space-y-4',
    grid: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
    cards: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
  }

  const handleLinkClick = (link: LinkType) => {
    if (onLinkClick) {
      onLinkClick(link.id)
    }

    // Track analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'link_click', {
        event_category: 'engagement',
        event_label: link.title,
        value: link.url,
      })
    }
  }

  return (
    <BaseBlock
      id={id}
      type="links"
      config={config}
      isEditing={isEditing}
      onConfigChange={onConfigChange}
    >
      <div className={layoutClasses[layout as keyof typeof layoutClasses]}>
        {links.map((link) => (
          <LinkItem
            key={link.id}
            link={link}
            layout={layout}
            onClick={() => handleLinkClick(link)}
            showAnalytics={isEditing}
          />
        ))}
      </div>
    </BaseBlock>
  )
}

interface LinkItemProps {
  link: LinkType
  layout: string
  onClick: () => void
  showAnalytics?: boolean
}

const LinkItem: React.FC<LinkItemProps> = ({
  link,
  layout,
  onClick,
  showAnalytics = false,
}) => {
  const isActive = link.is_active && isLinkScheduled(link)

  const baseClasses = cn(
    'group relative w-full transition-all duration-200 hover:scale-105',
    {
      'opacity-50 cursor-not-allowed': !isActive,
      'cursor-pointer': isActive,
    }
  )

  if (layout === 'cards') {
    return (
      <div className={cn(baseClasses, 'bg-card rounded-lg border p-4 shadow-sm hover:shadow-md')}>
        {link.thumbnail_url && (
          <div className="aspect-video mb-3 rounded-md overflow-hidden bg-muted">
            <img
              src={link.thumbnail_url}
              alt={link.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <h3 className="font-semibold text-sm mb-1">{link.title}</h3>
        {link.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {link.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onClick}
            disabled={!isActive}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Visit
          </Button>
          {showAnalytics && (
            <div className="flex items-center gap-1 ml-2 text-xs text-muted-foreground">
              <Eye className="w-3 h-3" />
              <span>{link.click_count}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (layout === 'grid') {
    return (
      <Button
        variant="outline"
        className={cn(baseClasses, 'h-auto p-4 flex flex-col items-start justify-start text-left')}
        onClick={onClick}
        disabled={!isActive}
      >
        <div className="flex items-start justify-between w-full mb-2">
          <h3 className="font-medium text-sm flex-1">{link.title}</h3>
          {showAnalytics && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
              <BarChart3 className="w-3 h-3" />
              <span>{link.click_count}</span>
            </div>
          )}
        </div>
        {link.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {link.description}
          </p>
        )}
        {link.thumbnail_url && (
          <div className="mt-2 w-full aspect-video rounded bg-muted overflow-hidden">
            <img
              src={link.thumbnail_url}
              alt={link.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </Button>
    )
  }

  // Default list layout
  return (
    <Button
      variant="outline"
      className={cn(baseClasses, 'w-full h-auto p-4 justify-start')}
      onClick={onClick}
      disabled={!isActive}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3 flex-1 text-left">
          {link.thumbnail_url && (
            <div className="w-10 h-10 rounded bg-muted overflow-hidden flex-shrink-0">
              <img
                src={link.thumbnail_url}
                alt={link.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{link.title}</h3>
            {link.description && (
              <p className="text-xs text-muted-foreground truncate">
                {link.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showAnalytics && (
            <div className="text-xs text-muted-foreground">
              {link.click_count}
            </div>
          )}
          <ExternalLink className="w-4 h-4" />
        </div>
      </div>
    </Button>
  )
}

function isLinkScheduled(link: LinkType): boolean {
  if (!link.schedule) return true

  const now = new Date()
  const startDate = link.schedule.start_date ? new Date(link.schedule.start_date) : null
  const endDate = link.schedule.end_date ? new Date(link.schedule.end_date) : null

  if (startDate && startDate > now) return false
  if (endDate && endDate < now) return false

  return true
}

export default LinksBlock
