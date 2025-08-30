import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { CheckCircle, XCircle, Mail, Loader2 } from 'lucide-react';
import { emailIntegrationService, EmailIntegrationConfig, EmailSubscriber } from '@/lib/email-integrations';
import { useAnalytics } from '@/hooks/useAnalytics';

interface EmailCaptureBlockProps {
  config: {
    title?: string;
    description?: string;
    buttonText?: string;
    successMessage?: string;
    errorMessage?: string;
    emailProvider?: 'convertkit';
    tagId?: string;
    tags?: string[];
    consentText?: string;
    backgroundColor?: string;
    textColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
  };
  pageId: string;
  isEditing?: boolean;
  onConfigChange?: (config: any) => void;
}

export const EmailCaptureBlock: React.FC<EmailCaptureBlockProps> = ({
  config,
  pageId,
  isEditing = false,
  onConfigChange
}) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const { trackFormSubmit } = useAnalytics(pageId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setStatus('error');
      setMessage('Please enter your email address');
      return;
    }

    if (!consent && config.consentText) {
      setStatus('error');
      setMessage('Please consent to continue');
      return;
    }

    if (!config.emailProvider || !config.tagId) {
      setStatus('error');
      setMessage('Email integration not configured');
      return;
    }

    setStatus('loading');

    try {
      // Get integration config
      const integrationConfig = await emailIntegrationService.getIntegrationConfig(
        pageId,
        config.emailProvider
      );

      if (!integrationConfig) {
        throw new Error('Email integration not configured');
      }

      // Create subscriber data
      const subscriber: EmailSubscriber = {
        email: email.trim().toLowerCase(),
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        tags: config.tags || [],
        consentDate: new Date().toISOString(),
        consentIP: undefined, // Will be set by the API
        consentUserAgent: navigator.userAgent,
      };

      // Subscribe using the integration service
      const result = await emailIntegrationService.subscribe(integrationConfig, subscriber);

      if (result.success) {
        setStatus('success');
        setMessage(config.successMessage || 'Successfully subscribed!');

        // Track the form submission
        await trackFormSubmit();

        // Reset form
        setEmail('');
        setFirstName('');
        setLastName('');
        setConsent(false);
      } else {
        throw new Error(result.error || 'Subscription failed');
      }
    } catch (error) {
      console.error('Email subscription error:', error);
      setStatus('error');
      setMessage(config.errorMessage || 'Something went wrong. Please try again.');
    }
  };

  // Configuration UI for page builder
  if (isEditing) {
    return (
      <Card className="border-2 border-dashed border-blue-300">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium">Email Capture Block</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={config.title || ''}
                  onChange={(e) => onConfigChange?.({ ...config, title: e.target.value })}
                  placeholder="Join our newsletter"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Button Text</label>
                <Input
                  value={config.buttonText || ''}
                  onChange={(e) => onConfigChange?.({ ...config, buttonText: e.target.value })}
                  placeholder="Subscribe"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={config.description || ''}
                  onChange={(e) => onConfigChange?.({ ...config, description: e.target.value })}
                  placeholder="Get the latest updates delivered to your inbox"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email Provider</label>
                <select
                  value={config.emailProvider || ''}
                  onChange={(e) => onConfigChange?.({
                    ...config,
                    emailProvider: 'convertkit'
                  })}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="convertkit">ConvertKit</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Tag ID (Optional)</label>
                <Input
                  value={config.tagId || ''}
                  onChange={(e) => onConfigChange?.({
                    ...config,
                    tagId: e.target.value
                  })}
                  placeholder="123456"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium">Consent Text</label>
                <Input
                  value={config.consentText || ''}
                  onChange={(e) => onConfigChange?.({ ...config, consentText: e.target.value })}
                  placeholder="I agree to receive marketing emails"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Success Message</label>
                <Input
                  value={config.successMessage || ''}
                  onChange={(e) => onConfigChange?.({ ...config, successMessage: e.target.value })}
                  placeholder="Successfully subscribed!"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Error Message</label>
                <Input
                  value={config.errorMessage || ''}
                  onChange={(e) => onConfigChange?.({ ...config, errorMessage: e.target.value })}
                  placeholder="Something went wrong"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Public display
  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <Mail className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2" style={{ color: config.textColor }}>
              {config.title || 'Join our newsletter'}
            </h2>
            <p className="text-gray-600" style={{ color: config.textColor }}>
              {config.description || 'Get the latest updates delivered to your inbox'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={status === 'loading'}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                disabled={status === 'loading'}
              />
              <Input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                disabled={status === 'loading'}
              />
            </div>

            {config.consentText && (
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1"
                  disabled={status === 'loading'}
                />
                <label htmlFor="consent" className="text-sm text-gray-600">
                  {config.consentText}
                </label>
              </div>
            )}

            <Button
              type="submit"
              disabled={status === 'loading'}
              className="w-full"
              style={{
                backgroundColor: config.buttonColor || '#3B82F6',
                color: config.buttonTextColor || '#FFFFFF'
              }}
            >
              {status === 'loading' ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Mail className="w-4 h-4 mr-2" />
              )}
              {status === 'loading' ? 'Subscribing...' : (config.buttonText || 'Subscribe')}
            </Button>
          </form>

          {status !== 'idle' && (
            <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
              status === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {status === 'success' ? (
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span className="text-sm">{message}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
