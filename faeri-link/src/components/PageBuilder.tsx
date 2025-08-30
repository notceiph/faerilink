import React, { useState, useCallback, useRef } from 'react'
import { useDrop } from 'react-dnd'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Page, Block, BlockType, BlockConfig } from '@/types/database'
import { BLOCK_TYPES, DEFAULT_TEMPLATES } from '@/lib/constants'
import { generateId, cn } from '@/lib/utils'
import HeroBlock from '@/components/blocks/HeroBlock'
import LinksBlock from '@/components/blocks/LinksBlock'
import FAQBlock from '@/components/blocks/FAQBlock'
import SocialIconsBlock from '@/components/blocks/SocialIconsBlock'
import BlockConfigPanel from '@/components/blocks/BlockConfigPanel'
import {
  Plus,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  Palette,
  Settings,
  Trash2,
  Move,
  Copy
} from 'lucide-react'

interface PageBuilderProps {
  page: Page
  blocks: Block[]
  onPageUpdate: (page: Partial<Page>) => void
  onBlocksUpdate: (blocks: Block[]) => void
  isPreview?: boolean
}

export const PageBuilder: React.FC<PageBuilderProps> = ({
  page,
  blocks,
  onPageUpdate,
  onBlocksUpdate,
  isPreview = false,
}) => {
  const [isMobilePreview, setIsMobilePreview] = useState(false)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [draggedBlock, setDraggedBlock] = useState<Block | null>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'BLOCK',
    drop: (item: { type: BlockType; id?: string }, monitor) => {
      if (item.id) {
        // Reordering existing block
        handleBlockReorder(item.id)
      } else {
        // Adding new block
        handleAddBlock(item.type)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  // Connect the drop ref
  drop(dropRef)

  const handleAddBlock = useCallback((type: BlockType) => {
    const newBlock: Block = {
      id: generateId(),
      page_id: page.id,
      type,
      position: blocks.length,
      config: getDefaultBlockConfig(type),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    onBlocksUpdate([...blocks, newBlock])
  }, [blocks, onBlocksUpdate, page.id])

  const handleBlockReorder = useCallback((blockId: string) => {
    // Implement block reordering logic
    const draggedIndex = blocks.findIndex(b => b.id === draggedBlock?.id)
    const targetIndex = blocks.findIndex(b => b.id === blockId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newBlocks = [...blocks]
    const [removed] = newBlocks.splice(draggedIndex, 1)
    newBlocks.splice(targetIndex, 0, removed)

    // Update positions
    newBlocks.forEach((block, index) => {
      block.position = index
    })

    onBlocksUpdate(newBlocks)
  }, [blocks, draggedBlock, onBlocksUpdate])

  const handleBlockUpdate = useCallback((blockId: string, config: BlockConfig) => {
    const updatedBlocks = blocks.map(block =>
      block.id === blockId
        ? { ...block, config, updated_at: new Date().toISOString() }
        : block
    )
    onBlocksUpdate(updatedBlocks)
  }, [blocks, onBlocksUpdate])

  const handleBlockDelete = useCallback((blockId: string) => {
    const updatedBlocks = blocks.filter(block => block.id !== blockId)
    onBlocksUpdate(updatedBlocks)
  }, [blocks, onBlocksUpdate])

  const handleBlockDuplicate = useCallback((blockId: string) => {
    const blockToDuplicate = blocks.find(block => block.id === blockId)
    if (!blockToDuplicate) return

    const duplicatedBlock: Block = {
      ...blockToDuplicate,
      id: generateId(),
      position: blockToDuplicate.position + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const updatedBlocks = [...blocks]
    updatedBlocks.splice(blockToDuplicate.position + 1, 0, duplicatedBlock)
    onBlocksUpdate(updatedBlocks)
  }, [blocks, onBlocksUpdate])

  const renderBlock = (block: Block) => {
    const commonProps = {
      id: block.id,
      config: block.config,
      isEditing: !isPreview,
      onConfigChange: (config: BlockConfig) => handleBlockUpdate(block.id, config),
    }

    switch (block.type) {
      case BLOCK_TYPES.HERO:
        return <HeroBlock {...commonProps} />
      case BLOCK_TYPES.LINKS:
        return <LinksBlock {...commonProps} />
      case BLOCK_TYPES.FAQ:
        return <FAQBlock {...commonProps} />
      case BLOCK_TYPES.SOCIAL_ICONS:
        return <SocialIconsBlock {...commonProps} />
      default:
        return (
          <div className="p-4 border-2 border-dashed border-muted rounded-lg text-center text-muted-foreground">
            Unknown block type: {block.type}
          </div>
        )
    }
  }

  if (isPreview) {
    return (
      <div className="min-h-screen bg-background">
        <div className={cn(
          'max-w-md mx-auto bg-background transition-all duration-300',
          isMobilePreview ? 'scale-75' : 'scale-100'
        )}>
          {blocks.map((block) => (
            <div key={block.id}>
              {renderBlock(block)}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Toolbar */}
      <div className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">{page.title}</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMobilePreview(!isMobilePreview)}
              >
                {isMobilePreview ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="sm">
                <Palette className="w-4 h-4 mr-2" />
                Theme
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button size="sm">
              Publish
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-background border-r border-border p-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Add Blocks</h3>
              <div className="grid grid-cols-1 gap-2">
                <BlockButton
                  type={BLOCK_TYPES.HERO}
                  label="Hero"
                  description="Profile and bio section"
                />
                <BlockButton
                  type={BLOCK_TYPES.LINKS}
                  label="Links"
                  description="Clickable links and buttons"
                />
                <BlockButton
                  type={BLOCK_TYPES.FAQ}
                  label="FAQ"
                  description="Frequently asked questions"
                />
                <BlockButton
                  type={BLOCK_TYPES.SOCIAL_ICONS}
                  label="Social Icons"
                  description="Social media links"
                />
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Templates</h3>
              <div className="space-y-2">
                {DEFAULT_TEMPLATES.slice(0, 3).map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    className="w-full justify-start h-auto p-3"
                    onClick={() => handleApplyTemplate(template.id)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {template.description}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 p-8">
          <div
            ref={dropRef}
            className={cn(
              'min-h-[600px] bg-background rounded-lg border-2 border-dashed transition-colors',
              isOver ? 'border-primary bg-primary/5' : 'border-muted',
              isMobilePreview ? 'max-w-sm mx-auto' : 'max-w-2xl mx-auto'
            )}
          >
            {blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Plus className="w-12 h-12 mb-4" />
                <p className="text-lg font-medium mb-2">Start building your page</p>
                <p className="text-sm">Drag blocks from the sidebar or click to add</p>
              </div>
            ) : (
              <div className="space-y-4 p-4">
                {blocks.map((block) => (
                  <BlockWrapper
                    key={block.id}
                    block={block}
                    isSelected={selectedBlockId === block.id}
                    onSelect={() => setSelectedBlockId(block.id)}
                    onDelete={() => handleBlockDelete(block.id)}
                    onDuplicate={() => handleBlockDuplicate(block.id)}
                    isMobilePreview={isMobilePreview}
                  >
                    {renderBlock(block)}
                  </BlockWrapper>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Properties Panel */}
        {selectedBlockId && (
          <BlockPropertiesPanel
            block={blocks.find(b => b.id === selectedBlockId)!}
            onUpdate={(config) => handleBlockUpdate(selectedBlockId, config)}
            onClose={() => setSelectedBlockId(null)}
          />
        )}
      </div>
    </div>
  )
}

// Helper components
interface BlockButtonProps {
  type: BlockType
  label: string
  description: string
}

const BlockButton: React.FC<BlockButtonProps> = ({ type, label, description }) => {
  return (
    <Button
      variant="outline"
      className="w-full justify-start h-auto p-3 text-left"
    >
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </Button>
  )
}

interface BlockWrapperProps {
  block: Block
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onDuplicate: () => void
  isMobilePreview: boolean
  children: React.ReactNode
}

const BlockWrapper: React.FC<BlockWrapperProps> = ({
  block,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  isMobilePreview,
  children,
}) => {
  return (
    <div
      className={cn(
        'relative group border rounded-lg transition-all',
        isSelected ? 'ring-2 ring-primary' : 'hover:border-primary/50',
        isMobilePreview ? 'max-w-sm mx-auto' : ''
      )}
      onClick={onSelect}
    >
      {/* Block toolbar */}
      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <div className="flex gap-1">
          <Button size="icon" variant="secondary" className="h-6 w-6">
            <Move className="w-3 h-3" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation()
              onDuplicate()
            }}
          >
            <Copy className="w-3 h-3" />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {children}
    </div>
  )
}

interface BlockPropertiesPanelProps {
  block: Block
  onUpdate: (config: BlockConfig) => void
  onClose: () => void
}

const BlockPropertiesPanel: React.FC<BlockPropertiesPanelProps> = ({
  block,
  onUpdate,
  onClose,
}) => {
  return (
    <div className="w-80 bg-background border-l border-border p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Block Settings</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      <BlockConfigPanel block={block} onUpdate={onUpdate} />
    </div>
  )
}

// Utility functions
function getDefaultBlockConfig(type: BlockType): BlockConfig {
  switch (type) {
    case BLOCK_TYPES.HERO:
      return {
        display_name: 'Your Name',
        bio: 'Your bio goes here...',
        alignment: 'center',
      }
    case BLOCK_TYPES.LINKS:
      return {
        layout: 'list',
        links: [],
      }
    case BLOCK_TYPES.FAQ:
      return {
        questions: [
          {
            id: generateId(),
            question: 'Sample Question',
            answer: 'Sample answer goes here...',
            position: 0,
            is_expanded: false,
          },
        ],
      }
    case BLOCK_TYPES.SOCIAL_ICONS:
      return {
        platforms: [],
        alignment: 'center',
      }
    default:
      return {}
  }
}

function handleApplyTemplate(templateId: string) {
  // Template application logic will be implemented
  console.log('Applying template:', templateId)
}

export default PageBuilder
