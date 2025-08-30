import React from 'react'
import { cn } from '@/lib/utils'
import { BlockType, BlockConfig } from '@/types/database'

interface BaseBlockProps {
  id: string
  type: BlockType
  config: BlockConfig
  isEditing?: boolean
  onConfigChange?: (config: BlockConfig) => void
  className?: string
  children?: React.ReactNode
}

export const BaseBlock: React.FC<BaseBlockProps> = ({
  id,
  type,
  config,
  isEditing = false,
  onConfigChange,
  className,
  children,
}) => {
  const baseClasses = cn(
    'relative w-full',
    // Default spacing
    'py-4 px-4 sm:px-6',
    // Background and styling
    config.background && getBackgroundClasses(config.background),
    // Custom CSS
    config.custom_css,
    className
  )

  return (
    <div
      id={`block-${id}`}
      className={baseClasses}
      data-block-type={type}
      data-block-id={id}
    >
      {isEditing && (
        <div className="absolute -top-2 -left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded shadow-sm">
            {type}
          </div>
        </div>
      )}
      {children}
    </div>
  )
}

function getBackgroundClasses(background: any): string {
  if (!background) return ''

  const classes = []

  switch (background.type) {
    case 'solid':
      if (background.color) {
        classes.push(`bg-[${background.color}]`)
      }
      break
    case 'gradient':
      if (background.gradient?.colors) {
        const direction = background.gradient.direction === 'horizontal' ? 'bg-gradient-to-r' : 'bg-gradient-to-b'
        classes.push(direction)
        // Add custom gradient classes if needed
      }
      break
    case 'image':
      if (background.image?.url) {
        classes.push('bg-cover bg-center bg-no-repeat')
        if (background.image.blur) {
          classes.push('backdrop-blur-sm')
        }
      }
      break
  }

  return classes.join(' ')
}

export default BaseBlock
