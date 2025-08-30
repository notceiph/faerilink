import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import {
  Plus,
  Globe,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Trash2
} from 'lucide-react';

interface Domain {
  id: string;
  domain: string;
  status: 'pending' | 'active' | 'error' | 'expired';
  verified_at?: string;
  expires_at?: string;
  ssl_status: 'pending' | 'active' | 'error';
  ssl_certificate?: string;
  dns_records: Array<{
    type: string;
    name: string;
    value: string;
    verified: boolean;
  }>;
  last_checked: string;
  created_at: string;
}

interface DomainManagementProps {
  pageId: string;
}

export const DomainManagement: React.FC<DomainManagementProps> = ({ pageId }) => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingDomain, setAddingDomain] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchDomains = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the page to see if it has a custom domain
      const { data: page, error: pageError } = await supabase
        .from('pages')
        .select('domain')
        .eq('id', pageId)
        .single();

      if (pageError) throw pageError;

      // For now, create a mock domain entry if page has a domain
      if (page.domain) {
        const mockDomain: Domain = {
          id: 'mock-domain-id',
          domain: page.domain,
          status: 'active',
          verified_at: new Date().toISOString(),
          ssl_status: 'active',
          dns_records: [
            {
              type: 'CNAME',
              name: page.domain,
              value: 'faerilink.com',
              verified: true
            }
          ],
          last_checked: new Date().toISOString(),
          created_at: new Date().toISOString()
        };
        setDomains([mockDomain]);
      } else {
        setDomains([]);
      }
    } catch (err) {
      console.error('Error fetching domains:', err);
      setError(err instanceof Error ? err.message : 'Failed to load domains');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, [pageId]);

  const validateDomain = (domain: string): boolean => {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  };

  const checkDNSRecords = async (domain: string) => {
    try {
      // In a real implementation, you'd call a DNS checking service
      // For now, simulate a DNS check
      const mockDNSRecords = [
        {
          type: 'CNAME',
          name: domain,
          value: 'faerilink.com',
          verified: true
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return mockDNSRecords;
    } catch (error) {
      console.error('DNS check error:', error);
      return [];
    }
  };

  const addDomain = async () => {
    if (!newDomain.trim()) {
      setError('Please enter a domain name');
      return;
    }

    if (!validateDomain(newDomain)) {
      setError('Please enter a valid domain name (e.g., example.com)');
      return;
    }

    try {
      setError(null);

      // Check if domain already exists for this page
      const existingDomain = domains.find(d => d.domain === newDomain);
      if (existingDomain) {
        setError('This domain is already configured for this page');
        return;
      }

      // Check DNS records
      const dnsRecords = await checkDNSRecords(newDomain);

      // Create new domain entry
      const newDomainEntry: Domain = {
        id: `domain-${Date.now()}`,
        domain: newDomain,
        status: (dnsRecords.length > 0 ? 'active' : 'pending') as Domain['status'],
        verified_at: dnsRecords.length > 0 ? new Date().toISOString() : undefined,
        ssl_status: 'pending',
        dns_records: dnsRecords,
        last_checked: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      // Update the page with the custom domain
      const { error: updateError } = await supabase
        .from('pages')
        .update({ domain: newDomain })
        .eq('id', pageId);

      if (updateError) throw updateError;

      setDomains([...domains, newDomainEntry]);
      setNewDomain('');
      setAddingDomain(false);

    } catch (err) {
      console.error('Error adding domain:', err);
      setError(err instanceof Error ? err.message : 'Failed to add domain');
    }
  };

  const removeDomain = async (domainId: string) => {
    try {
      const domainToRemove = domains.find(d => d.id === domainId);
      if (!domainToRemove) return;

      // Remove domain from page
      const { error: updateError } = await supabase
        .from('pages')
        .update({ domain: null })
        .eq('id', pageId);

      if (updateError) throw updateError;

      setDomains(domains.filter(d => d.id !== domainId));
    } catch (err) {
      console.error('Error removing domain:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove domain');
    }
  };

  const refreshDomainStatus = async (domainId: string) => {
    try {
      const domain = domains.find(d => d.id === domainId);
      if (!domain) return;

      // Re-check DNS records
      const dnsRecords = await checkDNSRecords(domain.domain);

      // Update domain status
      const updatedDomain = {
        ...domain,
        dns_records: dnsRecords,
        status: (dnsRecords.length > 0 ? 'active' : 'pending') as Domain['status'],
        verified_at: dnsRecords.length > 0 ? new Date().toISOString() : undefined,
        last_checked: new Date().toISOString()
      };

      setDomains(domains.map(d => d.id === domainId ? updatedDomain : d));
    } catch (err) {
      console.error('Error refreshing domain status:', err);
    }
  };

  const getStatusIcon = (status: Domain['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'expired':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: Domain['status']) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'pending':
        return 'Pending Verification';
      case 'error':
        return 'Configuration Error';
      case 'expired':
        return 'Expired';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Custom Domain</h2>
          <p className="text-muted-foreground">
            Connect your own domain to this page
          </p>
        </div>
        {!addingDomain && domains.length === 0 && (
          <Button onClick={() => setAddingDomain(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Domain
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <XCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Add Domain Form */}
      {addingDomain && (
        <Card>
          <CardHeader>
            <CardTitle>Add Custom Domain</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Domain Name</label>
              <Input
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="example.com"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter your domain name without "https://" or "www"
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">DNS Configuration Required</h4>
              <p className="text-sm text-blue-800 mb-3">
                To connect your domain, add this CNAME record to your DNS settings:
              </p>
              <div className="bg-white rounded p-3 font-mono text-sm">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <span className="ml-2 font-semibold">CNAME</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-semibold">{newDomain || 'your-domain.com'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Value:</span>
                    <span className="ml-2 font-semibold">faerilink.com</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={addDomain}>
                Add Domain
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setAddingDomain(false);
                  setNewDomain('');
                  setError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Domain List */}
      {domains.length > 0 && (
        <div className="space-y-4">
          {domains.map((domain) => (
            <Card key={domain.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <Globe className="w-5 h-5 text-blue-600" />
                      <div>
                        <h3 className="font-medium">{domain.domain}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(domain.status)}
                          <span className="text-sm text-muted-foreground">
                            {getStatusText(domain.status)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* DNS Records */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">DNS Records</h4>
                      <div className="space-y-2">
                        {domain.dns_records.map((record, index) => (
                          <div key={index} className="flex items-center gap-4 text-sm bg-gray-50 p-3 rounded">
                            <span className="font-mono bg-white px-2 py-1 rounded border">
                              {record.type}
                            </span>
                            <span className="font-mono flex-1">{record.name}</span>
                            <span className="font-mono flex-1">{record.value}</span>
                            <div className="flex items-center gap-1">
                              {record.verified ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                              )}
                              <span className="text-xs">
                                {record.verified ? 'Verified' : 'Not Verified'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SSL Status */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">SSL Certificate</h4>
                      <div className="flex items-center gap-2">
                        {domain.ssl_status === 'active' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                        )}
                        <span className="text-sm">
                          {domain.ssl_status === 'active' ? 'Active' : 'Pending'}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Last checked: {new Date(domain.last_checked).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => refreshDomainStatus(domain.id)}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeDomain(domain.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {domains.length === 0 && !addingDomain && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Globe className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Custom Domain</h3>
            <p className="text-muted-foreground text-center mb-4">
              Your page is currently using the default faerilink.com subdomain.
              Add a custom domain to make it your own.
            </p>
            <Button onClick={() => setAddingDomain(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Custom Domain
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
