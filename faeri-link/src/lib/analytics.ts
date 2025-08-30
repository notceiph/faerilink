import { createClient } from './supabase/client';

interface AnalyticsEvent {
  pageId: string;
  linkId?: string;
  eventType: 'page_view' | 'link_click' | 'form_submit';
  referrer?: string;
  screenSize?: string;
}

class AnalyticsTracker {
  private supabase = createClient();
  private pageId: string | null = null;
  private sessionId: string;
  private lastEventTime: number = 0;
  private readonly DEDUPLICATION_WINDOW = 5000; // 5 seconds

  constructor() {
    // Generate session ID
    this.sessionId = this.generateSessionId();

    // Set up page visibility tracking
    this.setupPageVisibilityTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupPageVisibilityTracking() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.pageId) {
        // Page became visible again - could track return visits
        this.trackPageView();
      }
    });
  }

  private shouldDeduplicate(eventType: string): boolean {
    const now = Date.now();
    if (now - this.lastEventTime < this.DEDUPLICATION_WINDOW) {
      console.log(`Deduplicating ${eventType} event`);
      return true;
    }
    this.lastEventTime = now;
    return false;
  }

  private getScreenSize(): string {
    if (typeof window === 'undefined') return 'unknown';
    return `${window.screen.width}x${window.screen.height}`;
  }

  private getReferrer(): string | undefined {
    if (typeof document === 'undefined') return undefined;
    return document.referrer || undefined;
  }

  async trackPageView(pageId?: string) {
    if (pageId) this.pageId = pageId;
    if (!this.pageId) return;

    if (this.shouldDeduplicate('page_view')) return;

    try {
      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageId: this.pageId,
          eventType: 'page_view',
          referrer: this.getReferrer(),
          screenSize: this.getScreenSize(),
        }),
      });

      if (!response.ok) {
        console.error('Failed to track page view:', await response.text());
      }
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  async trackLinkClick(pageId: string, linkId: string) {
    if (this.shouldDeduplicate('link_click')) return;

    try {
      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageId,
          linkId,
          eventType: 'link_click',
          referrer: this.getReferrer(),
          screenSize: this.getScreenSize(),
        }),
      });

      if (!response.ok) {
        console.error('Failed to track link click:', await response.text());
      }
    } catch (error) {
      console.error('Error tracking link click:', error);
    }
  }

  async trackFormSubmit(pageId: string, formData?: any) {
    if (this.shouldDeduplicate('form_submit')) return;

    try {
      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageId,
          eventType: 'form_submit',
          referrer: this.getReferrer(),
          screenSize: this.getScreenSize(),
        }),
      });

      if (!response.ok) {
        console.error('Failed to track form submit:', await response.text());
      }
    } catch (error) {
      console.error('Error tracking form submit:', error);
    }
  }

  // Utility method to set page ID for tracking
  setPageId(pageId: string) {
    this.pageId = pageId;
  }

  // Get current session ID
  getSessionId(): string {
    return this.sessionId;
  }
}

// Create singleton instance
export const analytics = new AnalyticsTracker();

// Hook for React components
export const useAnalytics = () => {
  return {
    trackPageView: analytics.trackPageView.bind(analytics),
    trackLinkClick: analytics.trackLinkClick.bind(analytics),
    trackFormSubmit: analytics.trackFormSubmit.bind(analytics),
    setPageId: analytics.setPageId.bind(analytics),
  };
};
