'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Skeleton, SkeletonList } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { Clock, TrendingUp, Users, Link as LinkIcon } from 'lucide-react'
import { useState, useEffect } from 'react'

export function RecentActivity() {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const fetchActivities = async () => {
      setLoading(true)
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      const mockActivities = [
        {
          type: 'page_view',
          message: 'Your page received 25 new views',
          time: '2 hours ago',
          icon: TrendingUp,
          color: 'text-green-600'
        },
        {
          type: 'link_click',
          message: 'Instagram link clicked 12 times',
          time: '4 hours ago',
          icon: LinkIcon,
          color: 'text-blue-600'
        },
        {
          type: 'new_follower',
          message: '3 new followers from your page',
          time: '1 day ago',
          icon: Users,
          color: 'text-purple-600'
        }
      ]

      setActivities(mockActivities)
      setLoading(false)
    }

    fetchActivities()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <SkeletonList items={3} />
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="p-2 bg-muted rounded-lg flex-shrink-0">
                  <activity.icon className={`w-4 h-4 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}

            {activities.length === 0 && (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recent activity yet</p>
                <p className="text-sm text-muted-foreground">
                  Create your first page to start seeing activity here
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
