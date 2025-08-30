'use client'

import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  Plus,
  Eye,
  BarChart3,
  Globe,
  Zap,
  Calendar,
  Settings,
  ExternalLink
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface QuickActionsProps {
  onCreatePage: () => void
}

export function QuickActions({ onCreatePage }: QuickActionsProps) {
  const router = useRouter()

  const actions = [
    {
      title: 'Create Page',
      description: 'Build your link-in-bio page',
      icon: Plus,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      action: onCreatePage,
      primary: true
    },
    {
      title: 'View Pages',
      description: 'Manage your existing pages',
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      action: () => router.push('/pages'),
    },
    {
      title: 'Analytics',
      description: 'Track your page performance',
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      action: () => router.push('/analytics'),
    },
    {
      title: 'Custom Domain',
      description: 'Connect your own domain',
      icon: Globe,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      action: () => router.push('/domains'),
    },
    {
      title: 'Integrations',
      description: 'Connect external services',
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      action: () => router.push('/integrations'),
    },
    {
      title: 'Scheduling',
      description: 'Manage appointments & meetings',
      icon: Calendar,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
      action: () => router.push('/scheduling'),
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action) => (
            <Card key={action.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${action.bgColor} flex-shrink-0`}>
                      <action.icon className={`w-6 h-6 ${action.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold mb-1">{action.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {action.description}
                      </p>
                      {action.primary ? (
                        <Button size="sm" onClick={action.action}>
                          <action.icon className="w-4 h-4 mr-2" />
                          {action.title}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={action.action}
                          className="group"
                        >
                          Open
                          <ExternalLink className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
