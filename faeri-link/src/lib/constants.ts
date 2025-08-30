// Application constants
export const APP_CONFIG = {
  name: 'Faeri Link',
  description: 'High-performance link-in-bio platform',
  version: '1.0.0',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const

// Block types and their configurations
export const BLOCK_TYPES = {
  HERO: 'hero',
  LINKS: 'links',
  FAQ: 'faq',
  SOCIAL_ICONS: 'social_icons',
  VIDEO: 'video',
  MUSIC: 'music',
  TEXT: 'text',
  DIVIDER: 'divider',
  EMBED: 'embed',
} as const

export const LINK_LAYOUTS = {
  LIST: 'list',
  GRID: 'grid',
  CARDS: 'cards',
} as const

export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
} as const

export const PAGE_STATUSES = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const

export const LINK_STATUSES = {
  ACTIVE: 'active',
  SCHEDULED: 'scheduled',
  EXPIRED: 'expired',
  INACTIVE: 'inactive',
} as const

// Social media platforms
export const SOCIAL_PLATFORMS = {
  TWITTER: 'twitter',
  INSTAGRAM: 'instagram',
  YOUTUBE: 'youtube',
  TIKTOK: 'tiktok',
  LINKEDIN: 'linkedin',
  GITHUB: 'github',
  DISCORD: 'discord',
  FACEBOOK: 'facebook',
  TWITCH: 'twitch',
  SPOTIFY: 'spotify',
} as const

// Integration types
export const INTEGRATION_TYPES = {
  CONVERTKIT: 'convertkit',
  META_PIXEL: 'meta_pixel',
  GOOGLE_ANALYTICS: 'google_analytics',
  TIKTOK_PIXEL: 'tiktok_pixel',
  CALENDLY: 'calendly',
  WEBHOOK: 'webhook',
} as const

// Plan limits
export const PLAN_LIMITS = {
  FREE: {
    pages: 1,
    blocks_per_page: 10,
    links_per_page: 20,
    custom_domain: false,
    analytics_retention: 30, // days
    integrations: 2,
  },
  PRO: {
    pages: 10,
    blocks_per_page: 50,
    links_per_page: 100,
    custom_domain: true,
    analytics_retention: 365, // days
    integrations: 10,
  },
} as const

// Default templates
export const DEFAULT_TEMPLATES = [
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Clean and simple design for personal branding',
    category: 'personal',
    is_premium: false,
  },
  {
    id: 'creator',
    name: 'Content Creator',
    description: 'Perfect for YouTubers, TikTok creators, and influencers',
    category: 'creator',
    is_premium: false,
  },
  {
    id: 'business',
    name: 'Business Professional',
    description: 'Professional layout for consultants and entrepreneurs',
    category: 'business',
    is_premium: false,
  },
  {
    id: 'artist',
    name: 'Artist & Designer',
    description: 'Showcase your portfolio and creative work',
    category: 'creative',
    is_premium: true,
  },
  {
    id: 'musician',
    name: 'Musician',
    description: 'Music-focused layout with streaming links',
    category: 'music',
    is_premium: true,
  },
  {
    id: 'fitness',
    name: 'Fitness & Wellness',
    description: 'For coaches, trainers, and wellness professionals',
    category: 'fitness',
    is_premium: true,
  },
  {
    id: 'photographer',
    name: 'Photographer',
    description: 'Gallery-style layout for visual artists',
    category: 'photography',
    is_premium: true,
  },
  {
    id: 'restaurant',
    name: 'Restaurant & Food',
    description: 'Menu, reservations, and food delivery links',
    category: 'food',
    is_premium: true,
  },
  {
    id: 'nonprofit',
    name: 'Non-Profit',
    description: 'Donation-focused layout for charities and causes',
    category: 'nonprofit',
    is_premium: false,
  },
  {
    id: 'event',
    name: 'Event Organizer',
    description: 'Promote events, tickets, and schedules',
    category: 'events',
    is_premium: false,
  },
] as const

// Color palettes
export const COLOR_PALETTES = {
  default: {
    primary: '#3b82f6',
    secondary: '#f1f5f9',
    background: '#ffffff',
    text: '#1e293b',
    muted: '#64748b',
    accent: '#f8fafc',
  },
  dark: {
    primary: '#60a5fa',
    secondary: '#1e293b',
    background: '#0f172a',
    text: '#f8fafc',
    muted: '#94a3b8',
    accent: '#334155',
  },
  sunset: {
    primary: '#f59e0b',
    secondary: '#fef3c7',
    background: '#ffffff',
    text: '#92400e',
    muted: '#d97706',
    accent: '#fed7aa',
  },
  ocean: {
    primary: '#06b6d4',
    secondary: '#ecfeff',
    background: '#ffffff',
    text: '#0c4a6e',
    muted: '#0891b2',
    accent: '#cffafe',
  },
  forest: {
    primary: '#16a34a',
    secondary: '#f0fdf4',
    background: '#ffffff',
    text: '#14532d',
    muted: '#22c55e',
    accent: '#dcfce7',
  },
  purple: {
    primary: '#a855f7',
    secondary: '#faf5ff',
    background: '#ffffff',
    text: '#581c87',
    muted: '#c084fc',
    accent: '#f3e8ff',
  },
} as const

// Font options
export const FONT_OPTIONS = {
  sans: {
    name: 'Inter',
    value: 'font-sans',
    import: 'Inter:wght@300;400;500;600;700',
  },
  serif: {
    name: 'Merriweather',
    value: 'font-serif',
    import: 'Merriweather:wght@300;400;700',
  },
  mono: {
    name: 'JetBrains Mono',
    value: 'font-mono',
    import: 'JetBrains+Mono:wght@400;500;600',
  },
  display: {
    name: 'Cal Sans',
    value: 'font-display',
    import: 'Cal+Sans:wght@400;500;600;700',
  },
  rounded: {
    name: 'Nunito',
    value: 'font-rounded',
    import: 'Nunito:wght@300;400;500;600;700',
  },
} as const

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    SIGNUP: '/api/auth/signup',
    REFRESH: '/api/auth/refresh',
    RESET_PASSWORD: '/api/auth/reset-password',
    VERIFY_EMAIL: '/api/auth/verify-email',
  },

  // Pages
  PAGES: {
    CREATE: '/api/pages',
    LIST: '/api/pages',
    GET: (id: string) => `/api/pages/${id}`,
    UPDATE: (id: string) => `/api/pages/${id}`,
    DELETE: (id: string) => `/api/pages/${id}`,
    PUBLISH: (id: string) => `/api/pages/${id}/publish`,
    DUPLICATE: (id: string) => `/api/pages/${id}/duplicate`,
  },

  // Blocks
  BLOCKS: {
    CREATE: '/api/blocks',
    UPDATE: (id: string) => `/api/blocks/${id}`,
    DELETE: (id: string) => `/api/blocks/${id}`,
    REORDER: '/api/blocks/reorder',
  },

  // Links
  LINKS: {
    CREATE: '/api/links',
    UPDATE: (id: string) => `/api/links/${id}`,
    DELETE: (id: string) => `/api/links/${id}`,
    REORDER: '/api/links/reorder',
    QR_CODE: (id: string) => `/api/links/${id}/qrcode`,
  },

  // Analytics
  ANALYTICS: {
    PAGE_VIEWS: (pageId: string) => `/api/analytics/pages/${pageId}`,
    LINK_CLICKS: (linkId: string) => `/api/analytics/links/${linkId}`,
    EXPORT: '/api/analytics/export',
  },

  // Integrations
  INTEGRATIONS: {
    CONNECT: (type: string) => `/api/integrations/${type}/connect`,
    DISCONNECT: (id: string) => `/api/integrations/${id}/disconnect`,
    STATUS: (id: string) => `/api/integrations/${id}/status`,
    SYNC: (id: string) => `/api/integrations/${id}/sync`,
  },

  // Payments
  PAYMENTS: {
    CREATE_INTENT: '/api/payments/create-intent',
    CONFIRM: '/api/payments/confirm',
    WEBHOOK: '/api/payments/webhook',
  },

  // Templates
  TEMPLATES: {
    LIST: '/api/templates',
    GET: (id: string) => `/api/templates/${id}`,
    APPLY: (id: string) => `/api/templates/${id}/apply`,
  },
} as const

// Validation rules
export const VALIDATION_RULES = {
  EMAIL: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  URL: {
    pattern: /^https?:\/\/.+/,
    message: 'Please enter a valid URL starting with http:// or https://',
  },
  SLUG: {
    pattern: /^[a-z0-9-]+$/,
    minLength: 3,
    maxLength: 50,
    message: 'Slug must be 3-50 characters and contain only lowercase letters, numbers, and hyphens',
  },
  PASSWORD: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    message: 'Password must be at least 8 characters with uppercase, lowercase, and number',
  },
  DISPLAY_NAME: {
    minLength: 2,
    maxLength: 50,
    message: 'Display name must be 2-50 characters',
  },
} as const

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
  SERVER: 'Server error. Please try again later.',
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Changes saved successfully.',
  DELETED: 'Item deleted successfully.',
  CREATED: 'Item created successfully.',
  UPDATED: 'Item updated successfully.',
  PUBLISHED: 'Page published successfully.',
  COPIED: 'Copied to clipboard.',
} as const
