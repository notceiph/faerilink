import React from 'react'
import { AlertCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AuthErrorProps {
  error: string | null
  onDismiss?: () => void
  className?: string
}

export const AuthError: React.FC<AuthErrorProps> = ({
  error,
  onDismiss,
  className
}) => {
  if (!error) return null

  return (
    <div className={cn(
      'p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3',
      className
    )}>
      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-red-800 font-medium">Authentication Error</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-600 hover:text-red-800 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
