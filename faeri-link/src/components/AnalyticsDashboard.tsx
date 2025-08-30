import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface AnalyticsData {
  totalViews: number;
  totalClicks: number;
  uniqueVisitors: number;
  ctr: number;
  topLinks: Array<{
    id: string;
    title: string;
    clicks: number;
    views: number;
  }>;
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  geoBreakdown: Array<{
    country: string;
    views: number;
  }>;
  recentEvents: Array<{
    timestamp: string;
    event_type: string;
    link_title?: string;
    device_type: string;
  }>;
}

interface AnalyticsDashboardProps {
  pageId: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ pageId }) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0] // today
  });

  const supabase = createClient();

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, fetch analytics events
      const { data: events, error: eventsError } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('page_id', pageId)
        .gte('timestamp', `${dateRange.start}T00:00:00Z`)
        .lte('timestamp', `${dateRange.end}T23:59:59Z`)
        .order('timestamp', { ascending: false });

      if (eventsError) {
        console.error('Analytics query error:', eventsError);
        throw new Error(`Failed to fetch analytics: ${eventsError.message}`);
      }

      // Then fetch links data separately to avoid complex joins
      const { data: links, error: linksError } = await supabase
        .from('links')
        .select('id, title')
        .eq('page_id', pageId);

      if (linksError) {
        console.warn('Links query error:', linksError);
        // Continue without links data
      }

      // Combine the data
      const eventsWithLinks = events?.map(event => ({
        ...event,
        links: event.link_id ? links?.find(link => link.id === event.link_id) : null
      })) || [];

      // Process the data
      const processedData = processAnalyticsData(eventsWithLinks);
      setData(processedData);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (events: any[]): AnalyticsData => {
    const totalViews = events.filter(e => e.event_type === 'page_view').length;
    const linkClicks = events.filter(e => e.event_type === 'link_click');

    // Calculate unique visitors (simplified - in reality you'd use more sophisticated methods)
    const uniqueIps = new Set(events.map(e => e.ip_address)).size;

    // Top links
    const linkStats = new Map<string, { title: string; clicks: number }>();
    linkClicks.forEach(event => {
      if (event.links) {
        const linkId = event.link_id;
        const title = event.links.title;
        if (!linkStats.has(linkId)) {
          linkStats.set(linkId, { title, clicks: 0 });
        }
        linkStats.get(linkId)!.clicks++;
      }
    });

    const topLinks = Array.from(linkStats.entries())
      .map(([id, { title, clicks }]) => ({
        id,
        title,
        clicks,
        views: totalViews // This is approximate
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);

    // Device breakdown
    const deviceBreakdown = {
      mobile: 0,
      desktop: 0,
      tablet: 0
    };

    events.forEach(event => {
      const deviceType = event.device?.type || 'desktop';
      if (deviceBreakdown[deviceType as keyof typeof deviceBreakdown] !== undefined) {
        deviceBreakdown[deviceType as keyof typeof deviceBreakdown]++;
      }
    });

    // Geo breakdown (simplified)
    const geoStats = new Map<string, number>();
    events.forEach(event => {
      const country = event.geo?.country || 'Unknown';
      geoStats.set(country, (geoStats.get(country) || 0) + 1);
    });

    const geoBreakdown = Array.from(geoStats.entries())
      .map(([country, views]) => ({ country, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Recent events
    const recentEvents = events
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20)
      .map(event => ({
        timestamp: event.timestamp,
        event_type: event.event_type,
        link_title: event.links?.title,
        device_type: event.device?.type || 'desktop'
      }));

    const ctr = totalViews > 0 ? (linkClicks.length / totalViews) * 100 : 0;

    return {
      totalViews,
      totalClicks: linkClicks.length,
      uniqueVisitors: uniqueIps,
      ctr,
      topLinks,
      deviceBreakdown,
      geoBreakdown,
      recentEvents
    };
  };

  useEffect(() => {
    fetchAnalytics();
  }, [pageId, dateRange]);

  const exportToCSV = () => {
    if (!data) return;

    const csvData = [
      ['Metric', 'Value'],
      ['Total Views', data.totalViews.toString()],
      ['Total Clicks', data.totalClicks.toString()],
      ['Unique Visitors', data.uniqueVisitors.toString()],
      ['Click-through Rate', `${data.ctr.toFixed(2)}%`],
      [],
      ['Top Links', 'Clicks'],
      ...data.topLinks.map(link => [link.title, link.clicks.toString()]),
      [],
      ['Device Breakdown', 'Count'],
      ['Mobile', data.deviceBreakdown.mobile.toString()],
      ['Desktop', data.deviceBreakdown.desktop.toString()],
      ['Tablet', data.deviceBreakdown.tablet.toString()],
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${pageId}-${dateRange.start}-to-${dateRange.end}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-600">Error: {error}</div>
          <Button onClick={fetchAnalytics} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-gray-600">No analytics data available</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
            <Button onClick={exportToCSV} variant="outline">
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">{data.totalViews.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Views</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">{data.totalClicks.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Clicks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-purple-600">{data.uniqueVisitors.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Unique Visitors</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-orange-600">{data.ctr.toFixed(2)}%</div>
            <div className="text-sm text-gray-600">CTR</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Links */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topLinks.map((link, index) => (
              <div key={link.id} className="flex items-center justify-between p-4 border rounded">
                <div className="flex items-center gap-4">
                  <div className="text-lg font-semibold text-gray-400">#{index + 1}</div>
                  <div>
                    <div className="font-medium">{link.title}</div>
                    <div className="text-sm text-gray-600">{link.clicks} clicks</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    {link.views > 0 ? ((link.clicks / link.views) * 100).toFixed(1) : 0}% CTR
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Device Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Mobile</span>
                <span className="font-medium">{data.deviceBreakdown.mobile}</span>
              </div>
              <div className="flex justify-between">
                <span>Desktop</span>
                <span className="font-medium">{data.deviceBreakdown.desktop}</span>
              </div>
              <div className="flex justify-between">
                <span>Tablet</span>
                <span className="font-medium">{data.deviceBreakdown.tablet}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Geographic Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.geoBreakdown.map((geo) => (
                <div key={geo.country} className="flex justify-between">
                  <span>{geo.country}</span>
                  <span className="font-medium">{geo.views}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.recentEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-2 border-b last:border-b-0">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    {new Date(event.timestamp).toLocaleString()}
                  </div>
                  <div className="text-sm">
                    {event.event_type === 'page_view' ? 'Page View' :
                     event.event_type === 'link_click' ? `Clicked: ${event.link_title || 'Unknown Link'}` :
                     'Form Submit'}
                  </div>
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {event.device_type}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
