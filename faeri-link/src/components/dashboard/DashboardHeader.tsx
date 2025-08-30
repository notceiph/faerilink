'use client'

import { Button } from '@/components/ui/Button'
import { Settings, Plus } from 'lucide-react'
import { User } from '@supabase/supabase-js'

interface DashboardHeaderProps {
  user: User | null
  onSignOut: () => void
  onCreatePage: () => void
}

export function DashboardHeader({ user, onSignOut, onCreatePage }: DashboardHeaderProps) {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Faeri Link</h1>
            <span className="text-muted-foreground">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onCreatePage}
              className="hidden sm:flex"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Page
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onCreatePage}
              className="sm:hidden"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
