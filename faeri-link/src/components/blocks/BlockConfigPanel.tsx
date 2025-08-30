import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Block, BlockType, BlockConfig } from '@/types/database'
import { generateId } from '@/lib/utils'
import {
  Type,
  Image,
  Link,
  HelpCircle,
  Share2,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Trash2
} from 'lucide-react'

interface BlockConfigPanelProps {
  block: Block
  onUpdate: (config: BlockConfig) => void
}

export const BlockConfigPanel: React.FC<BlockConfigPanelProps> = ({
  block,
  onUpdate,
}) => {
  const renderConfigPanel = () => {
    switch (block.type) {
      case 'hero':
        return <HeroBlockConfig config={block.config} onUpdate={onUpdate} />
      case 'links':
        return <LinksBlockConfig config={block.config} onUpdate={onUpdate} />
      case 'faq':
        return <FAQBlockConfig config={block.config} onUpdate={onUpdate} />
      case 'social_icons':
        return <SocialIconsBlockConfig config={block.config} onUpdate={onUpdate} />
      default:
        return <GenericBlockConfig config={block.config} onUpdate={onUpdate} />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getBlockIcon(block.type)}
          {block.type.charAt(0).toUpperCase() + block.type.slice(1)} Block Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderConfigPanel()}
      </CardContent>
    </Card>
  )
}

// Hero Block Configuration
interface HeroBlockConfigProps {
  config: BlockConfig
  onUpdate: (config: BlockConfig) => void
}

const HeroBlockConfig: React.FC<HeroBlockConfigProps> = ({ config, onUpdate }) => {
  const updateConfig = (key: string, value: any) => {
    onUpdate({ ...config, [key]: value })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium flex items-center gap-2">
          <Type className="w-4 h-4" />
          Display Name
        </label>
        <Input
          value={config.display_name || ''}
          onChange={(e) => updateConfig('display_name', e.target.value)}
          placeholder="Your Name"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Bio</label>
        <textarea
          className="w-full px-3 py-2 border rounded-md text-sm"
          rows={3}
          value={config.bio || ''}
          onChange={(e) => updateConfig('bio', e.target.value)}
          placeholder="Tell visitors about yourself..."
        />
      </div>

      <div>
        <label className="text-sm font-medium flex items-center gap-2">
          <Image className="w-4 h-4" />
          Avatar URL
        </label>
        <Input
          value={config.avatar_url || ''}
          onChange={(e) => updateConfig('avatar_url', e.target.value)}
          placeholder="https://example.com/avatar.jpg"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Text Alignment</label>
        <div className="flex gap-2 mt-2">
          {[
            { value: 'left' as const, icon: AlignLeft, label: 'Left' },
            { value: 'center' as const, icon: AlignCenter, label: 'Center' },
            { value: 'right' as const, icon: AlignRight, label: 'Right' },
          ].map(({ value, icon: Icon, label }) => (
            <Button
              key={value}
              variant={config.alignment === value ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateConfig('alignment', value)}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Links Block Configuration
interface LinksBlockConfigProps {
  config: BlockConfig
  onUpdate: (config: BlockConfig) => void
}

const LinksBlockConfig: React.FC<LinksBlockConfigProps> = ({ config, onUpdate }) => {
  const links = config.links || []

  const addLink = () => {
    const newLink = {
      id: generateId(),
      title: '',
      url: '',
      description: '',
      position: links.length,
      page_id: '', // Will be set when saving
      is_active: true,
      click_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    onUpdate({
      ...config,
      links: [...links, newLink],
    })
  }

  const updateLink = (index: number, updates: Partial<any>) => {
    const updatedLinks = [...links]
    updatedLinks[index] = { ...updatedLinks[index], ...updates }
    onUpdate({ ...config, links: updatedLinks })
  }

  const removeLink = (index: number) => {
    const updatedLinks = links.filter((_, i) => i !== index)
    onUpdate({ ...config, links: updatedLinks })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Layout</label>
        <div className="flex gap-2 mt-2">
          {[
            { value: 'list' as const, label: 'List' },
            { value: 'grid' as const, label: 'Grid' },
            { value: 'cards' as const, label: 'Cards' },
          ].map(({ value, label }) => (
            <Button
              key={value}
              variant={config.layout === value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onUpdate({ ...config, layout: value })}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Links</label>
          <Button size="sm" onClick={addLink}>
            <Plus className="w-4 h-4 mr-2" />
            Add Link
          </Button>
        </div>

        <div className="space-y-3">
          {links.map((link, index) => (
            <div key={link.id} className="border rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Link {index + 1}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLink(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Input
                  placeholder="Link Title"
                  value={link.title}
                  onChange={(e) => updateLink(index, { title: e.target.value })}
                />
                <Input
                  placeholder="URL"
                  value={link.url}
                  onChange={(e) => updateLink(index, { url: e.target.value })}
                />
                <Input
                  placeholder="Description (optional)"
                  value={link.description || ''}
                  onChange={(e) => updateLink(index, { description: e.target.value })}
                />
                <Input
                  placeholder="Thumbnail URL (optional)"
                  value={link.thumbnail_url || ''}
                  onChange={(e) => updateLink(index, { thumbnail_url: e.target.value })}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// FAQ Block Configuration
interface FAQBlockConfigProps {
  config: BlockConfig
  onUpdate: (config: BlockConfig) => void
}

const FAQBlockConfig: React.FC<FAQBlockConfigProps> = ({ config, onUpdate }) => {
  const questions = config.questions || []

  const addQuestion = () => {
    const newQuestion = {
      id: generateId(),
      question: '',
      answer: '',
      position: questions.length,
      is_expanded: false,
    }
    onUpdate({
      ...config,
      questions: [...questions, newQuestion],
    })
  }

  const updateQuestion = (index: number, updates: Partial<any>) => {
    const updatedQuestions = [...questions]
    updatedQuestions[index] = { ...updatedQuestions[index], ...updates }
    onUpdate({ ...config, questions: updatedQuestions })
  }

  const removeQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index)
    onUpdate({ ...config, questions: updatedQuestions })
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Questions</label>
          <Button size="sm" onClick={addQuestion}>
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>

        <div className="space-y-3">
          {questions.map((faq, index) => (
            <div key={faq.id} className="border rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Question {index + 1}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeQuestion(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Input
                  placeholder="Question"
                  value={faq.question}
                  onChange={(e) => updateQuestion(index, { question: e.target.value })}
                />
                <textarea
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  rows={3}
                  placeholder="Answer"
                  value={faq.answer}
                  onChange={(e) => updateQuestion(index, { answer: e.target.value })}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Social Icons Block Configuration
interface SocialIconsBlockConfigProps {
  config: BlockConfig
  onUpdate: (config: BlockConfig) => void
}

const SocialIconsBlockConfig: React.FC<SocialIconsBlockConfigProps> = ({
  config,
  onUpdate,
}) => {
  const platforms = config.platforms || []

  const availablePlatforms = [
    { key: 'twitter', name: 'Twitter', icon: '🐦' },
    { key: 'instagram', name: 'Instagram', icon: '📷' },
    { key: 'youtube', name: 'YouTube', icon: '📺' },
    { key: 'tiktok', name: 'TikTok', icon: '🎵' },
    { key: 'linkedin', name: 'LinkedIn', icon: '💼' },
    { key: 'github', name: 'GitHub', icon: '💻' },
    { key: 'discord', name: 'Discord', icon: '💬' },
    { key: 'facebook', name: 'Facebook', icon: '📘' },
  ]

  const togglePlatform = (platformKey: string) => {
    const existingPlatform = platforms.find(p => p.platform === platformKey)
    let updatedPlatforms

    if (existingPlatform) {
      updatedPlatforms = platforms.filter(p => p.platform !== platformKey)
    } else {
      updatedPlatforms = [
        ...platforms,
        {
          platform: platformKey,
          url: '',
          is_enabled: true,
        },
      ]
    }

    onUpdate({ ...config, platforms: updatedPlatforms })
  }

  const updatePlatformUrl = (platformKey: string, url: string) => {
    const updatedPlatforms = platforms.map(p =>
      p.platform === platformKey ? { ...p, url } : p
    )
    onUpdate({ ...config, platforms: updatedPlatforms })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Text Alignment</label>
        <div className="flex gap-2 mt-2">
          {[
            { value: 'left' as const, icon: AlignLeft, label: 'Left' },
            { value: 'center' as const, icon: AlignCenter, label: 'Center' },
            { value: 'right' as const, icon: AlignRight, label: 'Right' },
          ].map(({ value, icon: Icon, label }) => (
            <Button
              key={value}
              variant={config.alignment === value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onUpdate({ ...config, alignment: value })}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Social Platforms</label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {availablePlatforms.map(({ key, name, icon }) => {
            const isEnabled = platforms.some(p => p.platform === key)
            return (
              <Button
                key={key}
                variant={isEnabled ? 'default' : 'outline'}
                size="sm"
                onClick={() => togglePlatform(key)}
                className="justify-start"
              >
                <span className="mr-2">{icon}</span>
                {name}
              </Button>
            )
          })}
        </div>
      </div>

      {platforms.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Platform URLs</label>
          {platforms.map((platform) => {
            const platformInfo = availablePlatforms.find(p => p.key === platform.platform)
            return (
              <div key={platform.platform} className="flex gap-2">
                <span className="text-sm font-medium min-w-[100px] flex items-center">
                  {platformInfo?.icon} {platformInfo?.name}
                </span>
                <Input
                  placeholder={`https://${platform.platform}.com/username`}
                  value={platform.url}
                  onChange={(e) => updatePlatformUrl(platform.platform, e.target.value)}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Generic Block Configuration (fallback)
const GenericBlockConfig: React.FC<{ config: BlockConfig; onUpdate: (config: BlockConfig) => void }> = ({
  config,
  onUpdate,
}) => {
  return (
    <div className="text-sm text-muted-foreground">
      Configuration options for this block type are not yet available.
    </div>
  )
}

// Helper function to get block icons
function getBlockIcon(type: BlockType): React.ReactNode {
  switch (type) {
    case 'hero':
      return <Type className="w-4 h-4" />
    case 'links':
      return <Link className="w-4 h-4" />
    case 'faq':
      return <HelpCircle className="w-4 h-4" />
    case 'social_icons':
      return <Share2 className="w-4 h-4" />
    default:
      return <Palette className="w-4 h-4" />
  }
}

export default BlockConfigPanel
