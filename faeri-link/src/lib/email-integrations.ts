import { createClient } from './supabase/client';

export interface EmailIntegrationConfig {
  provider: 'convertkit';
  apiKey: string;
  tagId?: string; // For ConvertKit
}

export interface EmailSubscriber {
  email: string;
  firstName?: string;
  lastName?: string;
  tags?: string[];
  consentDate: string;
  consentIP?: string;
  consentUserAgent?: string;
}

export interface IntegrationHealthStatus {
  provider: string;
  status: 'connected' | 'error' | 'disconnected';
  lastChecked: string;
  error?: string;
  subscriberCount?: number;
}

class EmailIntegrationService {
  private supabase = createClient();



  // ConvertKit Integration
  async convertkitSubscribe(
    config: EmailIntegrationConfig,
    subscriber: EmailSubscriber
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/integrations/convertkit/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config,
          subscriber,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'ConvertKit API error');
      }

      return { success: true };
    } catch (error) {
      console.error('ConvertKit subscription error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async convertkitUnsubscribe(
    config: EmailIntegrationConfig,
    email: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/integrations/convertkit/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config,
          email,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'ConvertKit API error');
      }

      return { success: true };
    } catch (error) {
      console.error('ConvertKit unsubscribe error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Generic subscribe method that routes to the correct provider
  async subscribe(
    config: EmailIntegrationConfig,
    subscriber: EmailSubscriber
  ): Promise<{ success: boolean; error?: string }> {
    switch (config.provider) {
      case 'convertkit':
        return this.convertkitSubscribe(config, subscriber);
      default:
        return {
          success: false,
          error: `Unsupported email provider: ${config.provider}`
        };
    }
  }

  // Generic unsubscribe method
  async unsubscribe(
    config: EmailIntegrationConfig,
    email: string
  ): Promise<{ success: boolean; error?: string }> {
    switch (config.provider) {
      case 'convertkit':
        return this.convertkitUnsubscribe(config, email);
      default:
        return {
          success: false,
          error: `Unsupported email provider: ${config.provider}`
        };
    }
  }

  // Health check for integrations
  async checkIntegrationHealth(
    config: EmailIntegrationConfig
  ): Promise<IntegrationHealthStatus> {
    try {
      const response = await fetch('/api/integrations/health-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          provider: config.provider,
          status: 'error',
          lastChecked: new Date().toISOString(),
          error: result.error || 'Health check failed'
        };
      }

      return {
        provider: config.provider,
        status: 'connected',
        lastChecked: new Date().toISOString(),
        subscriberCount: result.subscriberCount
      };
    } catch (error) {
      return {
        provider: config.provider,
        status: 'error',
        lastChecked: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Save integration configuration
  async saveIntegrationConfig(
    pageId: string,
    config: EmailIntegrationConfig
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('integrations')
        .upsert({
          page_id: pageId,
          type: config.provider,
          config: {
            ...config,
            apiKey: await this.encryptSensitiveData(config.apiKey) // Encrypt API key
          },
          status: 'active',
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error saving integration config:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save configuration'
      };
    }
  }

  // Get integration configuration
  async getIntegrationConfig(
    pageId: string,
    provider: string
  ): Promise<EmailIntegrationConfig | null> {
    try {
      const { data, error } = await this.supabase
        .from('integrations')
        .select('config')
        .eq('page_id', pageId)
        .eq('type', provider)
        .single();

      if (error || !data) return null;

      const config = data.config as EmailIntegrationConfig;

      // Decrypt sensitive data
      if (config.apiKey) {
        config.apiKey = await this.decryptSensitiveData(config.apiKey);
      }

      return config;
    } catch (error) {
      console.error('Error getting integration config:', error);
      return null;
    }
  }

  // Basic encryption/decryption for sensitive data (in production, use proper encryption)
  private async encryptSensitiveData(data: string): Promise<string> {
    // In a real implementation, use proper encryption with a key
    return btoa(data); // Simple base64 for now
  }

  private async decryptSensitiveData(data: string): Promise<string> {
    // In a real implementation, use proper decryption
    return atob(data); // Simple base64 decode for now
  }
}

// Export singleton instance
export const emailIntegrationService = new EmailIntegrationService();
