import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Mail,
  Calendar,
  BarChart3,
  Zap,
  Settings,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { EmailIntegrationSettings } from './EmailIntegrationSettings';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'not_configured' | 'connected' | 'error' | 'disconnected';
  category: 'email' | 'scheduling' | 'analytics' | 'webhooks';
  comingSoon?: boolean;
}

interface IntegrationsManagementProps {
  pageId: string;
}

export const IntegrationsManagement: React.FC<IntegrationsManagementProps> = ({ pageId }) => {
  const [activeIntegration, setActiveIntegration] = useState<string | null>(null);

  const integrations: Integration[] = [
    {
      id: 'email',
      name: 'Email Marketing',
      description: 'Connect with ConvertKit to collect email subscribers',
      icon: <Mail className="w-6 h-6" />,
      status: 'not_configured',
      category: 'email'
    },
    {
      id: 'scheduling',
      name: 'Scheduling',
      description: 'Add Calendly booking functionality to your page',
      icon: <Calendar className="w-6 h-6" />,
      status: 'not_configured',
      category: 'scheduling',
      comingSoon: true
    },
    {
      id: 'pixels',
      name: 'Pixel Tracking',
      description: 'Track conversions with Meta, TikTok, and Google pixels',
      icon: <BarChart3 className="w-6 h-6" />,
      status: 'not_configured',
      category: 'analytics',
      comingSoon: true
    },
    {
      id: 'webhooks',
      name: 'Webhooks',
      description: 'Send data to Zapier and other automation tools',
      icon: <Zap className="w-6 h-6" />,
      status: 'not_configured',
      category: 'webhooks',
      comingSoon: true
    }
  ];

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'disconnected':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Settings className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Error';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Not Configured';
    }
  };

  const renderIntegrationContent = () => {
    switch (activeIntegration) {
      case 'email':
        return <EmailIntegrationSettings pageId={pageId} />;
      case 'scheduling':
        return (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Calendly Integration</h3>
              <p className="text-gray-600 mb-4">
                Add scheduling functionality to your page. Coming soon!
              </p>
              <Button disabled className="opacity-50 cursor-not-allowed">
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        );
      case 'pixels':
        return (
          <Card>
            <CardContent className="p-8 text-center">
              <BarChart3 className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Pixel Tracking</h3>
              <p className="text-gray-600 mb-4">
                Track conversions and user behavior with pixel integrations. Coming soon!
              </p>
              <Button disabled className="opacity-50 cursor-not-allowed">
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        );
      case 'webhooks':
        return (
          <Card>
            <CardContent className="p-8 text-center">
              <Zap className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Webhooks</h3>
              <p className="text-gray-600 mb-4">
                Connect with Zapier and other automation platforms. Coming soon!
              </p>
              <Button disabled className="opacity-50 cursor-not-allowed">
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        );
      default:
        return (
          <Card>
            <CardContent className="p-8 text-center">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select an Integration</h3>
              <p className="text-gray-600">
                Choose an integration from the list to configure it for your page.
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Integrations</h2>
        <p className="text-muted-foreground">
          Connect your page with external services and tools
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Integration List */}
        <div className="space-y-4">
          <h3 className="font-semibold">Available Integrations</h3>

          {integrations.map((integration) => (
            <Card
              key={integration.id}
              className={`cursor-pointer transition-all ${
                activeIntegration === integration.id
                  ? 'ring-2 ring-blue-500 shadow-lg'
                  : 'hover:shadow-md'
              } ${integration.comingSoon ? 'opacity-60' : ''}`}
              onClick={() => setActiveIntegration(integration.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {integration.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{integration.name}</h4>
                      {integration.comingSoon && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                          Soon
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {integration.description}
                    </p>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(integration.status)}
                      <span className="text-xs text-gray-500">
                        {getStatusText(integration.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Integration Configuration */}
        <div className="lg:col-span-2">
          {renderIntegrationContent()}
        </div>
      </div>

      {/* Integration Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Why Use Integrations?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Grow Your Audience</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Collect email addresses from visitors</li>
                <li>• Build your mailing list automatically</li>
                <li>• Segment subscribers by interests</li>
                <li>• Send targeted content updates</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Track Performance</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Monitor which links get clicked most</li>
                <li>• Track conversions from different sources</li>
                <li>• Measure engagement and audience growth</li>
                <li>• Get insights into visitor behavior</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Automate Workflows</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Automatically add new subscribers to lists</li>
                <li>• Trigger emails when content is published</li>
                <li>• Sync data with your CRM or tools</li>
                <li>• Set up custom notifications</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Professional Features</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Add booking functionality</li>
                <li>• Track marketing campaign performance</li>
                <li>• Integrate with your existing stack</li>
                <li>• Scale your online presence</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
