'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Plus, Link as LinkIcon, Share2, Zap } from 'lucide-react'

interface GettingStartedProps {
  onCreatePage: () => void
}

export function GettingStarted({ onCreatePage }: GettingStartedProps) {
  const steps = [
    {
      step: 1,
      title: 'Create Your Page',
      description: 'Choose a template and customize your page',
      icon: Plus,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      step: 2,
      title: 'Add Your Links',
      description: 'Add all your important links and content',
      icon: LinkIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      step: 3,
      title: 'Publish & Share',
      description: 'Publish your page and share it everywhere',
      icon: Share2,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Getting Started
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step) => (
            <div key={step.step} className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${step.bgColor}`}>
                  <step.icon className={`w-6 h-6 ${step.color}`} />
                </div>
                <div className="ml-3 text-left">
                  <div className="text-sm font-medium text-muted-foreground">Step {step.step}</div>
                </div>
              </div>
              <h3 className="font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-4">
          <Button size="lg" onClick={onCreatePage}>
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Page
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
