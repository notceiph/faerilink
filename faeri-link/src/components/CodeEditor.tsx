'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import {
  Save,
  Eye,
  EyeOff,
  Code,
  Palette,
  FileText,
  Smartphone,
  Monitor,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'

interface CodeEditorProps {
  page: any
  onPageUpdate: (updates: any) => void
  isPreview?: boolean
}

interface ContentTab {
  id: 'html' | 'css' | 'js'
  label: string
  icon: React.ReactNode
  content: string
  language: string
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  page,
  onPageUpdate,
  isPreview = false
}) => {
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html')
  const [isMobilePreview, setIsMobilePreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const tabs: ContentTab[] = [
    {
      id: 'html',
      label: 'HTML',
      icon: <FileText className="w-4 h-4" />,
      content: page?.custom_html || '',
      language: 'html'
    },
    {
      id: 'css',
      label: 'CSS',
      icon: <Palette className="w-4 h-4" />,
      content: page?.custom_css || '',
      language: 'css'
    },
    {
      id: 'js',
      label: 'JavaScript',
      icon: <Code className="w-4 h-4" />,
      content: page?.custom_js || '',
      language: 'javascript'
    }
  ]

  const handleContentChange = (tabId: 'html' | 'css' | 'js', content: string) => {
    const updates: any = {}
    updates[`custom_${tabId}`] = content
    updates.updated_at = new Date().toISOString()

    onPageUpdate(updates)
    setHasUnsavedChanges(true)

    // Clear validation errors when content changes
    setValidationErrors([])
  }

  const validateContent = (content: string, type: 'html' | 'css' | 'js'): string[] => {
    const errors: string[] = []

    switch (type) {
      case 'html':
        if (content.length > 50000) {
          errors.push('HTML content exceeds maximum length (50KB)')
        }
        // Check for dangerous tags
        const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form']
        for (const tag of dangerousTags) {
          if (content.toLowerCase().includes(`<${tag}`)) {
            errors.push(`Dangerous tag <${tag}> is not allowed. Use the JavaScript editor instead.`)
          }
        }
        // Check for event handlers
        const eventHandlers = ['onclick', 'onload', 'onerror', 'onmouseover']
        for (const handler of eventHandlers) {
          if (content.toLowerCase().includes(handler)) {
            errors.push(`Event handler ${handler} is not allowed in HTML. Use the JavaScript editor instead.`)
          }
        }
        break

      case 'css':
        if (content.length > 20000) {
          errors.push('CSS content exceeds maximum length (20KB)')
        }
        break

      case 'js':
        if (content.length > 10000) {
          errors.push('JavaScript content exceeds maximum length (10KB)')
        }
        // Check for dangerous operations
        const dangerousOps = [
          'eval(', 'Function(', 'setTimeout(', 'setInterval(',
          'XMLHttpRequest', 'fetch(', 'import(', 'require(',
          'document.write', 'document.writeln', 'innerHTML',
          'localStorage', 'sessionStorage', 'cookie'
        ]
        for (const op of dangerousOps) {
          if (content.includes(op)) {
            errors.push(`Dangerous operation '${op}' is not allowed`)
          }
        }
        break
    }

    return errors
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      // Validate all content before saving
      const allErrors: string[] = []

      tabs.forEach(tab => {
        const errors = validateContent(tab.content, tab.id)
        allErrors.push(...errors)
      })

      if (allErrors.length > 0) {
        setValidationErrors(allErrors)
        setIsSaving(false)
        return
      }

      // Save content via API
      const response = await fetch('/api/pages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          custom_html: tabs.find(t => t.id === 'html')?.content,
          custom_css: tabs.find(t => t.id === 'css')?.content,
          custom_js: tabs.find(t => t.id === 'js')?.content,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save page')
      }

      setHasUnsavedChanges(false)
      setValidationErrors([])
    } catch (error) {
      console.error('Save error:', error)
      setValidationErrors([error instanceof Error ? error.message : 'Failed to save page'])
    } finally {
      setIsSaving(false)
    }
  }

  const renderCodeEditor = (tab: ContentTab) => {
    return (
      <div className="relative h-96">
        <textarea
          value={tab.content}
          onChange={(e) => handleContentChange(tab.id, e.target.value)}
          className="w-full h-full p-4 font-mono text-sm bg-slate-900 text-slate-100 border-0 resize-none focus:outline-none"
          placeholder={`Enter your ${tab.label} code here...`}
          disabled={isPreview}
        />
        {/* Basic syntax highlighting could be added here with a library like Prism.js */}
      </div>
    )
  }

  const renderPreview = () => {
    const html = tabs.find(t => t.id === 'html')?.content || ''
    const css = tabs.find(t => t.id === 'css')?.content || ''
    const js = tabs.find(t => t.id === 'js')?.content || ''

    return (
      <div className="h-96 bg-white border rounded-lg overflow-hidden">
        <iframe
          srcDoc={`
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>${css}</style>
              </head>
              <body>
                ${html}
                <script>${js}</script>
              </body>
            </html>
          `}
          className="w-full h-full border-0"
          title="Page Preview"
          sandbox="allow-same-origin"
        />
      </div>
    )
  }

  if (isPreview) {
    return (
      <div className="min-h-screen bg-background">
        <div className={`max-w-4xl mx-auto p-4 ${isMobilePreview ? 'max-w-sm' : ''}`}>
          {renderPreview()}
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
            <h1 className="text-lg font-semibold">{page?.title || 'My Page'}</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMobilePreview(!isMobilePreview)}
              >
                {isMobilePreview ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreview(!isPreview)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="px-4 pb-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-red-800">Validation Errors</span>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Save Status */}
        {hasUnsavedChanges && validationErrors.length === 0 && (
          <div className="px-4 pb-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">You have unsaved changes</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex">
        {/* Code Editor */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          <div className="bg-background border-b border-border">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1">
            {renderCodeEditor(tabs.find(t => t.id === activeTab)!)}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="w-1/2 border-l border-border bg-background">
          <div className="p-4">
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Live Preview
            </h3>
            <div className={`border rounded-lg overflow-hidden ${isMobilePreview ? 'max-w-sm mx-auto' : ''}`}>
              {renderPreview()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CodeEditor
