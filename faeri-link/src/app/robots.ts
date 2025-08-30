import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://faerilink.com'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/auth/',
        '/dashboard/',
        '/admin/',
        '/private/',
        '/_next/',
        '/favicon.ico',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}

// Alternative robots.txt generation for text format (if needed)
export async function generateRobotsTxt(): Promise<string> {
  const robotsData = {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/auth/',
        '/dashboard/',
        '/admin/',
        '/private/',
        '/_next/',
        '/favicon.ico',
      ],
    },
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL || 'https://faerilink.com'}/sitemap.xml`,
    host: process.env.NEXT_PUBLIC_APP_URL || 'https://faerilink.com'
  }

  const content = `User-agent: *
${robotsData.rules.allow ? `Allow: ${robotsData.rules.allow}` : ''}
${robotsData.rules.disallow.map(rule => `Disallow: ${rule}`).join('\n')}

Sitemap: ${robotsData.sitemap}
Host: ${robotsData.host}`

  return content
}
