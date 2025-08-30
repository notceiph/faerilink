'use client'

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { analytics } from '@/lib/analytics';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

interface PageData {
  id: string;
  title: string;
  description: string;
  theme: string;
  custom_css: string;
  seo_settings: any;
  social_links: any;
  blocks: any[];
  links: any[];
}

interface Link {
  id: string;
  title: string;
  url: string;
  description?: string;
  thumbnail_url?: string;
  group_name?: string;
  position: number;
  is_active: boolean;
  click_count: number;
}

export default function PublicPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchPageData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call the database function to get public page data
      const { data, error } = await (supabase.rpc as any)('get_public_page_by_slug', { page_slug: slug });

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('Page not found');
      }

      const page = data[0];
      setPageData(page);

      // Set page ID for analytics
      analytics.setPageId(page.id);

      // Track page view
      await analytics.trackPageView();

    } catch (err) {
      console.error('Error fetching page:', err);
      setError(err instanceof Error ? err.message : 'Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchPageData();
    }
  }, [slug]);

  const handleLinkClick = async (link: Link) => {
    if (!pageData) return;

    try {
      // Track the link click
      await analytics.trackLinkClick(pageData.id, link.id);

      // Increment click count in database
      await (supabase.rpc as any)('increment_link_click', { link_uuid: link.id });

      // Open the link
      window.open(link.url, '_blank', 'noopener,noreferrer');

    } catch (error) {
      console.error('Error tracking link click:', error);
      // Still open the link even if tracking fails
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  };

  const renderBlock = (block: any) => {
    switch (block.type) {
      case 'hero':
        return (
          <div className="text-center mb-8">
            {block.config.avatar && (
              <img
                src={block.config.avatar}
                alt="Avatar"
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
            )}
            <h1 className="text-3xl font-bold mb-2">{block.config.bio}</h1>
            <p className="text-gray-600">{block.config.description}</p>
            {block.config.socialLinks && (
              <div className="flex justify-center gap-4 mt-4">
                {block.config.socialLinks.map((link: any, index: number) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <span className="text-2xl">{link.icon}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        );

      case 'links':
        return (
          <div className="mb-8">
            <div className="grid gap-4 max-w-md mx-auto">
              {pageData?.links
                .filter((link: Link) => link.is_active)
                .sort((a: Link, b: Link) => a.position - b.position)
                .map((link: Link) => (
                  <Card key={link.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <button
                        onClick={() => handleLinkClick(link)}
                        className="w-full text-left"
                      >
                        <div className="flex items-center gap-3">
                          {link.thumbnail_url && (
                            <img
                              src={link.thumbnail_url}
                              alt=""
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-medium">{link.title}</h3>
                            {link.description && (
                              <p className="text-sm text-gray-600">{link.description}</p>
                            )}
                          </div>
                        </div>
                      </button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        );

      case 'faq':
        return (
          <div className="mb-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">FAQ</h2>
            <div className="space-y-4">
              {block.config.questions?.map((faq: any, index: number) => (
                <details key={index} className="border rounded-lg p-4">
                  <summary className="font-medium cursor-pointer">
                    {faq.question}
                  </summary>
                  <p className="mt-2 text-gray-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        );

      case 'social_icons':
        return (
          <div className="mb-8">
            <div className="flex justify-center gap-4">
              {block.config.socialLinks?.map((link: any, index: number) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-800"
                >
                  <span className="text-2xl">{link.icon}</span>
                </a>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
          <p className="text-gray-600">The page you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
          <p className="text-gray-600">The page you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Head */}
      <head>
        <title>{pageData.seo_settings?.title || pageData.title}</title>
        <meta name="description" content={pageData.seo_settings?.description || pageData.description} />
        {pageData.seo_settings?.og_image && (
          <meta property="og:image" content={pageData.seo_settings.og_image} />
        )}
        <meta property="og:title" content={pageData.seo_settings?.title || pageData.title} />
        <meta property="og:description" content={pageData.seo_settings?.description || pageData.description} />
        <meta name="twitter:card" content={pageData.seo_settings?.twitter_card || "summary"} />
      </head>

      {/* Custom CSS */}
      {pageData.custom_css && (
        <style dangerouslySetInnerHTML={{ __html: pageData.custom_css }} />
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {pageData.blocks
          .sort((a: any, b: any) => a.position - b.position)
          .map((block: any) => (
            <div key={block.id}>
              {renderBlock(block)}
            </div>
          ))}
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 text-sm">
        <p>Powered by Faeri Link</p>
      </footer>
    </div>
  );
}
