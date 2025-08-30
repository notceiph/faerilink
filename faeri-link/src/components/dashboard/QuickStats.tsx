'use client'

import { Card, CardContent } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Link as LinkIcon, Eye, BarChart3, FileText } from 'lucide-react'

interface DashboardStats {
  totalPages: number
  totalLinks: number
  totalClicks: number
  totalViews: number
}

interface QuickStatsProps {
  stats: DashboardStats
  loading: boolean
}

export function QuickStats({ stats, loading }: QuickStatsProps) {
  const statItems = [
    {
      label: 'Total Pages',
      value: stats.totalPages,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Total Links',
      value: stats.totalLinks,
      icon: LinkIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Total Clicks',
      value: stats.totalClicks,
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      format: (value: number) => value.toLocaleString()
    },
    {
      label: 'Page Views',
      value: stats.totalViews,
      icon: Eye,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      format: (value: number) => value.toLocaleString()
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item) => (
        <Card key={item.label} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                                  <p className="text-2xl font-bold">
                    {loading ? <Skeleton className="h-8 w-16" /> : item.format ? item.format(item.value) : item.value}
                  </p>
              </div>
              <div className={`p-2 rounded-lg ${item.bgColor}`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
