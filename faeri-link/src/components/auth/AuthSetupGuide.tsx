'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { AlertCircle, CheckCircle, Copy, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react'

export const AuthSetupGuide: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>('env-setup')

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const sections = [
    {
      id: 'env-setup',
      title: 'Environment Variables Setup',
      description: 'Configure your Supabase credentials',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Create a <code className="bg-gray-100 px-1 rounded">.env.local</code> file in your project root with these variables:
          </p>

          <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">.env.local</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(`NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key`)}
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
            </div>
            <pre className="text-xs">
{`# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here`}
            </pre>
          </div>

          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Go to <a href="https://supabase.com/dashboard" target="_blank" className="text-blue-600 hover:underline">Supabase Dashboard</a></span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Select your project</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Go to Settings → API</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Copy Project URL and anon/public key</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'database-setup',
      title: 'Database Setup',
      description: 'Ensure your Supabase database has the required tables',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your database should have these tables created:
          </p>

          <div className="grid gap-2">
            {[
              { name: 'users', required: true, description: 'User profiles and authentication data' },
              { name: 'pages', required: true, description: 'Link in bio pages' },
              { name: 'blocks', required: true, description: 'Page content blocks' },
              { name: 'links', required: true, description: 'Individual links on pages' },
              { name: 'analytics_events', required: false, description: 'Page view and click tracking' },
              { name: 'integrations', required: false, description: 'Third-party service connections' }
            ].map(table => (
              <div key={table.name} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <code className="font-mono">{table.name}</code>
                  <p className="text-xs text-muted-foreground">{table.description}</p>
                </div>
                <Badge variant={table.required ? 'default' : 'secondary'}>
                  {table.required ? 'Required' : 'Optional'}
                </Badge>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            If you're missing tables, run the database schema from the <code>database-schema.sql</code> file.
          </p>
        </div>
      )
    },
    {
      id: 'auth-policies',
      title: 'Authentication Policies',
      description: 'Configure Row Level Security (RLS) policies',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            These RLS policies should be enabled in your Supabase database:
          </p>

          <div className="space-y-2">
            {[
              'Users can only access their own data',
              'Pages belong to their creators',
              'Links are scoped to specific pages',
              'Analytics events are user-specific',
              'Integrations are user-controlled'
            ].map(policy => (
              <div key={policy} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span className="text-sm">{policy}</span>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            These policies are automatically applied when you run the database schema.
          </p>
        </div>
      )
    },
    {
      id: 'troubleshooting',
      title: 'Common Issues & Solutions',
      description: 'Debug common authentication problems',
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                "Invalid API key" Error
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Check your environment variables and ensure they're loaded correctly.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => copyToClipboard('console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)\nconsole.log("Supabase Key:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)')}
              >
                <Copy className="w-3 h-3 mr-1" />
                Debug Code
              </Button>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Sign Out Not Working
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Check if the sign out function is properly clearing session data.
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                User Profile Not Created
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Ensure the users table exists and has proper permissions.
              </p>
            </div>
          </div>
        </div>
      )
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Authentication Setup Guide
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sections.map(section => (
            <div key={section.id} className="border rounded-lg">
              <button
                onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
              >
                <div>
                  <h3 className="font-medium">{section.title}</h3>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
                {expandedSection === section.id ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {expandedSection === section.id && (
                <div className="px-4 pb-4">
                  {section.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
