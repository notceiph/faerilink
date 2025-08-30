import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Link } from '@/types/database'
import { useLinks } from '@/hooks/useLinks'
import {
  Calendar,
  Clock,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Zap
} from 'lucide-react'

interface LinkSchedulerProps {
  link: Link
  onClose: () => void
}

export const LinkScheduler: React.FC<LinkSchedulerProps> = ({
  link,
  onClose,
}) => {
  const { updateLink } = useLinks({ pageId: link.page_id })

  const [startDate, setStartDate] = useState(link.schedule?.start_date || '')
  const [endDate, setEndDate] = useState(link.schedule?.end_date || '')
  const [timezone, setTimezone] = useState(link.schedule?.timezone || 'UTC')
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const schedule = {
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        timezone,
      }

      await updateLink(link.id, { schedule })
      onClose()
    } catch (error) {
      console.error('Error updating schedule:', error)
      alert('Error updating schedule. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = async () => {
    setIsLoading(true)
    try {
      await updateLink(link.id, { schedule: undefined })
      setStartDate('')
      setEndDate('')
      onClose()
    } catch (error) {
      console.error('Error clearing schedule:', error)
      alert('Error clearing schedule. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatus = () => {
    const now = new Date()
    const start = startDate ? new Date(startDate) : null
    const end = endDate ? new Date(endDate) : null

    if (!start && !end) return { status: 'active', message: 'Link is always active' }
    if (start && start > now) return { status: 'scheduled', message: 'Link will be active soon' }
    if (end && end < now) return { status: 'expired', message: 'Link has expired' }
    return { status: 'active', message: 'Link is currently active' }
  }

  const status = getStatus()

  const commonTimezones = [
    'UTC',
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Australia/Sydney',
    'Pacific/Auckland',
  ]

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Schedule Link
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
          {status.status === 'active' && <CheckCircle className="w-5 h-5 text-green-500" />}
          {status.status === 'scheduled' && <Clock className="w-5 h-5 text-blue-500" />}
          {status.status === 'expired' && <AlertCircle className="w-5 h-5 text-red-500" />}
          <span className="text-sm font-medium">{status.message}</span>
        </div>

        {/* Link Info */}
        <div className="p-3 border rounded-lg">
          <h4 className="font-medium text-sm mb-1">{link.title}</h4>
          <p className="text-xs text-muted-foreground truncate">{link.url}</p>
        </div>

        {/* Date Inputs */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Start Date & Time
            </label>
            <Input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty for immediate activation
            </p>
          </div>

          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              End Date & Time
            </label>
            <Input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty for no expiration
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background mt-1"
            >
              {commonTimezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const tomorrow = new Date()
              tomorrow.setDate(tomorrow.getDate() + 1)
              setStartDate(tomorrow.toISOString().slice(0, 16))
            }}
            className="flex-1"
          >
            <Zap className="w-4 h-4 mr-2" />
            Tomorrow
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const nextWeek = new Date()
              nextWeek.setDate(nextWeek.getDate() + 7)
              setStartDate(nextWeek.toISOString().slice(0, 16))
            }}
            className="flex-1"
          >
            Next Week
          </Button>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Schedule'}
          </Button>
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={isLoading}
          >
            Clear
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
          <p className="font-medium mb-1">Scheduling Tips:</p>
          <ul className="space-y-1">
            <li>• Use local timezone for scheduling</li>
            <li>• Scheduled links won't be visible until start time</li>
            <li>• Expired links will be hidden automatically</li>
            <li>• Visitors see times in their local timezone</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default LinkScheduler
