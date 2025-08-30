import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import {
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Settings,
  TestTube,
  Save,
  Trash2
} from 'lucide-react';
import { emailIntegrationService, EmailIntegrationConfig, IntegrationHealthStatus } from '@/lib/email-integrations';
import { createClient } from '@/lib/supabase/client';

interface EmailIntegrationSettingsProps {
  pageId: string;
}

export const EmailIntegrationSettings: React.FC<EmailIntegrationSettingsProps> = ({ pageId }) => {
  const [config, setConfig] = useState<EmailIntegrationConfig>({
    provider: 'convertkit',
    apiKey: '',
    tagId: '',
  });
  const [healthStatus, setHealthStatus] = useState<IntegrationHealthStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const supabase = createClient();

  // Load existing configuration
  useEffect(() => {
    loadConfiguration();
  }, [pageId]);

  const loadConfiguration = async () => {
    try {
      const existingConfig = await emailIntegrationService.getIntegrationConfig(pageId, 'convertkit');
      if (existingConfig) {
        setConfig(existingConfig);
      } else {
        // Reset to default for ConvertKit
        setConfig({
          provider: 'convertkit',
          apiKey: '',
          tagId: '',
        });
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
    }
  };

  const handleSave = async () => {
    if (!config.apiKey.trim()) {
      alert('Please enter an API key');
      return;
    }

    setSaving(true);
    try {
      const result = await emailIntegrationService.saveIntegrationConfig(pageId, config);
      if (result.success) {
        alert('Configuration saved successfully!');
        await checkHealth();
      } else {
        alert(`Error saving configuration: ${result.error}`);
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('Error saving configuration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const checkHealth = async () => {
    setLoading(true);
    try {
      const status = await emailIntegrationService.checkIntegrationHealth(config);
      setHealthStatus(status);
    } catch (error) {
      console.error('Error checking health:', error);
      setHealthStatus({
        provider: config.provider,
        status: 'error',
        lastChecked: new Date().toISOString(),
        error: 'Health check failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const testIntegration = async () => {
    if (!testEmail.trim()) {
      alert('Please enter a test email address');
      return;
    }

    setTesting(true);
    try {
      const result = await emailIntegrationService.subscribe(config, {
        email: testEmail.trim(),
        firstName: 'Test',
        lastName: 'User',
        tags: ['test'],
        consentDate: new Date().toISOString(),
      });

      if (result.success) {
        alert('Test subscription successful! Check your email.');
        setTestEmail('');
      } else {
        alert(`Test failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error testing integration:', error);
      alert('Test failed. Please check your configuration.');
    } finally {
      setTesting(false);
    }
  };

  const removeIntegration = async () => {
    if (!confirm('Are you sure you want to remove this integration?')) return;

    try {
      const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('page_id', pageId)
        .eq('type', 'convertkit');

      if (error) throw error;

      // Reset configuration
      setConfig({
        provider: 'convertkit',
        apiKey: '',
        tagId: '',
      });

      setHealthStatus(null);
      alert('Integration removed successfully');
    } catch (error) {
      console.error('Error removing integration:', error);
      alert('Error removing integration. Please try again.');
    }
  };

  const getStatusIcon = (status: IntegrationHealthStatus['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'disconnected':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: IntegrationHealthStatus['status']) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Connection Error';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Provider Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Integration Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6 p-4 bg-green-50 border border-green-300 rounded-lg">
            <div className="p-2 bg-green-100 rounded-lg">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800">ConvertKit Integration</h3>
              <p className="text-sm text-green-600">Connect your ConvertKit account to collect email subscribers</p>
            </div>
          </div>

          {/* Configuration Form */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">API Key</label>
              <Input
                type="password"
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="your-convertkit-api-key"
              />
              <p className="text-xs text-gray-600 mt-1">
                Get your API key from ConvertKit Account Settings &gt; Advanced &gt; API Secret
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Tag ID (Optional)</label>
              <Input
                value={config.tagId || ''}
                onChange={(e) => setConfig({ ...config, tagId: e.target.value })}
                placeholder="123456"
              />
              <p className="text-xs text-gray-600 mt-1">
                Subscribers will be tagged with this tag. Leave empty to skip tagging.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-6">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Configuration
            </Button>

            <Button onClick={checkHealth} variant="outline" disabled={loading}>
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Check Connection
            </Button>

            <Button onClick={removeIntegration} variant="outline" className="text-red-600 border-red-300">
              <Trash2 className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Health Status */}
      {healthStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(healthStatus.status)}
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Status:</span>
                <span className="flex items-center gap-2">
                  {getStatusText(healthStatus.status)}
                </span>
              </div>

              {healthStatus.subscriberCount !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Subscribers:</span>
                  <span>{healthStatus.subscriberCount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="font-medium">Last Checked:</span>
                <span className="text-sm text-gray-600">
                  {new Date(healthStatus.lastChecked).toLocaleString()}
                </span>
              </div>

              {healthStatus.error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-red-800">
                      <p className="font-medium">Error:</p>
                      <p>{healthStatus.error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Integration */}
      {healthStatus?.status === 'connected' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              Test Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Send a test subscription to verify your integration is working correctly.
              </p>

              <div className="flex gap-2">
                <Input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                  className="flex-1"
                />
                <Button onClick={testIntegration} disabled={testing}>
                  {testing ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Mail className="w-4 h-4 mr-2" />
                  )}
                  Test
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
