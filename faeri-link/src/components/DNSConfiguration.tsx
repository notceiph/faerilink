import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

interface DNSRecord {
  type: 'CNAME' | 'A' | 'TXT';
  name: string;
  value: string;
  ttl?: number;
}

interface DNSConfigurationProps {
  domain: string;
  onRefresh?: () => void;
  refreshLoading?: boolean;
}

export const DNSConfiguration: React.FC<DNSConfigurationProps> = ({
  domain,
  onRefresh,
  refreshLoading = false
}) => {
  const [copiedRecord, setCopiedRecord] = useState<string | null>(null);

  const requiredRecords: DNSRecord[] = [
    {
      type: 'CNAME',
      name: domain,
      value: 'faerilink.com',
      ttl: 300
    }
  ];

  const optionalRecords: DNSRecord[] = [
    {
      type: 'TXT',
      name: `_faerilink.${domain}`,
      value: `faerilink-domain-verification=${Math.random().toString(36).substr(2, 16)}`,
      ttl: 300
    }
  ];

  const copyToClipboard = async (text: string, recordId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedRecord(recordId);
      setTimeout(() => setCopiedRecord(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatRecordValue = (record: DNSRecord): string => {
    const parts = [record.type, record.name, record.value];
    if (record.ttl) {
      parts.push(record.ttl.toString());
    }
    return parts.join(' ');
  };

  const renderDNSRecord = (record: DNSRecord, index: number, isRequired: boolean = true) => {
    const recordId = `${record.type}-${index}`;
    const isCopied = copiedRecord === recordId;

    return (
      <div key={index} className="border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              isRequired
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {isRequired ? 'Required' : 'Optional'}
            </span>
            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
              {record.type}
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => copyToClipboard(formatRecordValue(record), recordId)}
          >
            {isCopied ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Name</label>
            <div className="font-mono text-sm bg-gray-50 p-2 rounded border">
              {record.name}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Value</label>
            <div className="font-mono text-sm bg-gray-50 p-2 rounded border">
              {record.value}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">TTL</label>
            <div className="font-mono text-sm bg-gray-50 p-2 rounded border">
              {record.ttl || 300}s
            </div>
          </div>
        </div>

        {record.type === 'CNAME' && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Important Notes:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Point your domain to faerilink.com</li>
                  <li>DNS changes can take up to 48 hours to propagate</li>
                  <li>Don't remove any existing records unless instructed</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2">DNS Configuration for {domain}</h3>
        <p className="text-sm text-gray-600">
          Add these DNS records to your domain registrar or DNS provider
        </p>
      </div>

      {/* DNS Provider Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Setup Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'GoDaddy', url: 'https://dcc.godaddy.com/manage' },
              { name: 'Namecheap', url: 'https://ap.www.namecheap.com/domains' },
              { name: 'Cloudflare', url: 'https://dash.cloudflare.com' },
              { name: 'Google Domains', url: 'https://domains.google.com' }
            ].map((provider) => (
              <a
                key={provider.name}
                href={provider.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium">{provider.name}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Required Records */}
      <div>
        <h4 className="font-medium mb-3">Required DNS Records</h4>
        <div className="space-y-4">
          {requiredRecords.map((record, index) => renderDNSRecord(record, index, true))}
        </div>
      </div>

      {/* Optional Records */}
      <div>
        <h4 className="font-medium mb-3">Optional DNS Records</h4>
        <div className="space-y-4">
          {optionalRecords.map((record, index) => renderDNSRecord(record, index, false))}
        </div>
      </div>

      {/* Verification Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Verify Configuration</span>
            <Button
              size="sm"
              onClick={onRefresh}
              disabled={refreshLoading}
            >
              {refreshLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            After adding the DNS records, click the refresh button to verify your configuration.
            DNS changes can take up to 48 hours to propagate globally.
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Still not working?</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Wait at least 30 minutes for DNS changes to propagate</li>
                  <li>Check if you have any conflicting records</li>
                  <li>Ensure you're editing the correct domain</li>
                  <li>Contact your DNS provider for support</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h5 className="font-medium text-sm mb-1">Check Current DNS Records</h5>
              <p className="text-sm text-gray-600 mb-2">
                Use these tools to verify your current DNS configuration:
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`https://dns.google/query?name=${domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors"
                >
                  Google DNS
                </a>
                <a
                  href={`https://www.whatsmydns.net/#CNAME/${domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors"
                >
                  WhatsMyDNS
                </a>
                <a
                  href={`https://toolbox.googleapps.com/apps/dig/#CNAME/${domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors"
                >
                  Google Toolbox
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
