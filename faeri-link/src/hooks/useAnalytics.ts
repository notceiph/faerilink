import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { analytics } from '@/lib/analytics';

interface AnalyticsEvent {
  id: string;
  page_id: string;
  link_id?: string;
  timestamp: string;
  event_type: 'page_view' | 'link_click' | 'form_submit';
  user_agent?: string;
  referrer?: string;
  device?: {
    type: string;
    os: string;
    browser: string;
    screen_size: string;
  };
  geo?: {
    country: string;
    region: string;
    city: string;
    lat: number | null;
    lng: number | null;
  };
  links?: {
    title: string;
  };
}

interface AnalyticsSummary {
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
}

export const useAnalytics = (pageId?: string) => {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchAnalytics = useCallback(async (startDate?: string, endDate?: string) => {
    if (!pageId) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('analytics_events')
        .select(`
          *,
          links!inner(title)
        `)
        .eq('page_id', pageId)
        .order('timestamp', { ascending: false });

      if (startDate) {
        query = query.gte('timestamp', `${startDate}T00:00:00Z`);
      }
      if (endDate) {
        query = query.lte('timestamp', `${endDate}T23:59:59Z`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const analyticsEvents = data || [];
      setEvents(analyticsEvents);

      // Calculate summary
      const summary = calculateSummary(analyticsEvents);
      setSummary(summary);

    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [pageId, supabase]);

  const calculateSummary = (events: AnalyticsEvent[]): AnalyticsSummary => {
    const totalViews = events.filter(e => e.event_type === 'page_view').length;
    const linkClicks = events.filter(e => e.event_type === 'link_click');

    // Calculate unique visitors (simplified)
    const uniqueIps = new Set(events.map(e => e.user_agent && (e.user_agent + (e.geo?.country || ''))).filter(Boolean)).size;

    // Top links
    const linkStats = new Map<string, { title: string; clicks: number; views: number }>();

    // First, get all unique link IDs from clicks
    const linkIds = Array.from(new Set(linkClicks.map(e => e.link_id).filter(Boolean)));

    // For each link, calculate clicks and views
    linkIds.forEach(linkId => {
      const linkClicksForId = linkClicks.filter(e => e.link_id === linkId);
      const linkTitle = linkClicksForId[0]?.links?.title || 'Unknown Link';

      linkStats.set(linkId!, {
        title: linkTitle,
        clicks: linkClicksForId.length,
        views: totalViews // This is approximate - in reality you'd want per-link view tracking
      });
    });

    const topLinks = Array.from(linkStats.entries())
      .map(([linkId, stats]) => ({
        id: linkId,
        ...stats
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);

    const ctr = totalViews > 0 ? (linkClicks.length / totalViews) * 100 : 0;

    return {
      totalViews,
      totalClicks: linkClicks.length,
      uniqueVisitors: uniqueIps,
      ctr,
      topLinks
    };
  };

  const trackPageView = useCallback(async () => {
    if (!pageId) return;
    await analytics.trackPageView(pageId);
  }, [pageId]);

  const trackLinkClick = useCallback(async (linkId: string) => {
    if (!pageId) return;
    await analytics.trackLinkClick(pageId, linkId);
  }, [pageId]);

  const trackFormSubmit = useCallback(async () => {
    if (!pageId) return;
    await analytics.trackFormSubmit(pageId);
  }, [pageId]);

  // Auto-track page view when pageId changes
  useEffect(() => {
    if (pageId) {
      analytics.setPageId(pageId);
      trackPageView();
    }
  }, [pageId, trackPageView]);

  return {
    events,
    summary,
    loading,
    error,
    fetchAnalytics,
    trackPageView,
    trackLinkClick,
    trackFormSubmit,
    refetch: () => fetchAnalytics()
  };
};
