'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/hooks/useAuth'

interface ClientLayoutProps {
  children: ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background text-foreground">
        {children}
      </div>
    </AuthProvider>
  )
}
