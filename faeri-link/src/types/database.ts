// Database types based on the implementation plan
export interface User {
  id: string
  email: string
  display_name?: string
  avatar_url?: string
  bio?: string
  website?: string
  created_at: string
  updated_at: string
  last_login?: string
  is_email_verified: boolean
  plan: 'free' | 'pro'
  settings: UserSettings
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto'
  timezone: string
  language: string
  email_notifications: boolean
  two_factor_enabled: boolean
}

export interface Page {
  id: string
  user_id: string
  slug: string
  domain?: string
  title: string
  description?: string
  theme: string
  custom_css?: string
  status: 'draft' | 'published' | 'archived'
  is_public: boolean
  created_at: string
  updated_at: string
  published_at?: string
  seo_settings: SeoSettings
  social_links: SocialLinks
}

export interface SeoSettings {
  title?: string
  description?: string
  og_image?: string
  twitter_card: 'summary' | 'summary_large_image'
  no_index: boolean
}

export interface SocialLinks {
  twitter?: string
  instagram?: string
  youtube?: string
  tiktok?: string
  linkedin?: string
  github?: string
  discord?: string
}

export interface Block {
  id: string
  page_id: string
  type: BlockType
  position: number
  config: BlockConfig
  created_at: string
  updated_at: string
}

export type BlockType =
  | 'hero'
  | 'links'
  | 'faq'
  | 'social_icons'
  | 'video'
  | 'music'
  | 'text'
  | 'divider'
  | 'embed'

export interface BlockConfig {
  // Hero block config
  avatar_url?: string
  display_name?: string
  bio?: string
  background?: BackgroundConfig

  // Links block config
  layout?: 'list' | 'grid' | 'cards'
  links?: Link[]

  // FAQ block config
  questions?: FAQItem[]

  // Social icons config
  platforms?: SocialPlatform[]

  // Text block config
  content?: string
  alignment?: 'left' | 'center' | 'right'

  // Embed block config
  embed_url?: string
  embed_type?: 'youtube' | 'vimeo' | 'spotify' | 'soundcloud'

  // Common config
  padding?: string
  margin?: string
  custom_css?: string
}

export interface BackgroundConfig {
  type: 'solid' | 'gradient' | 'image'
  color?: string
  gradient?: GradientConfig
  image?: ImageConfig
}

export interface GradientConfig {
  colors: string[]
  direction: 'horizontal' | 'vertical' | 'diagonal'
}

export interface ImageConfig {
  url: string
  opacity: number
  blur: number
  position: 'center' | 'top' | 'bottom'
}

export interface Link {
  id: string
  page_id: string
  title: string
  url: string
  description?: string
  thumbnail_url?: string
  group?: string
  position: number
  is_active: boolean
  click_count: number
  schedule?: LinkSchedule
  deep_link_config?: DeepLinkConfig
  created_at: string
  updated_at: string
}

export interface LinkSchedule {
  start_date?: string
  end_date?: string
  timezone: string
}

export interface DeepLinkConfig {
  ios_url?: string
  android_url?: string
  fallback_url?: string
}

export interface FAQItem {
  id: string
  question: string
  answer: string
  position: number
  is_expanded: boolean
}

export interface SocialPlatform {
  platform: string
  url: string
  is_enabled: boolean
}

export interface Template {
  id: string
  name: string
  description: string
  preview_image: string
  category: string
  blocks: Block[]
  theme: string
  is_premium: boolean
  created_at: string
}

export interface Theme {
  id: string
  name: string
  colors: ThemeColors
  fonts: ThemeFonts
  spacing: ThemeSpacing
  is_premium: boolean
}

export interface ThemeColors {
  primary: string
  secondary: string
  background: string
  text: string
  muted: string
  accent: string
}

export interface ThemeFonts {
  heading: string
  body: string
  mono: string
}

export interface ThemeSpacing {
  small: string
  medium: string
  large: string
}

// Analytics types
export interface AnalyticsEvent {
  id: string
  page_id: string
  link_id?: string
  event_type: 'page_view' | 'link_click' | 'form_submit'
  timestamp: string
  user_agent?: string
  ip_address?: string
  referrer?: string
  device?: DeviceInfo
  geo?: GeoInfo
}

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop'
  os: string
  browser: string
  screen_size?: string
}

export interface GeoInfo {
  country?: string
  region?: string
  city?: string
  latitude?: number
  longitude?: number
}

// Integration types
export interface Integration {
  id: string
  page_id: string
  type: IntegrationType
  config: IntegrationConfig
  status: 'active' | 'inactive' | 'error'
  last_sync?: string
  created_at: string
  updated_at: string
}

export type IntegrationType =
  | 'convertkit'
  | 'meta_pixel'
  | 'google_analytics'
  | 'tiktok_pixel'
  | 'calendly'
  | 'webhook'

export interface IntegrationConfig {
  api_key?: string
  access_token?: string
  list_id?: string
  pixel_id?: string
  tracking_id?: string
  webhook_url?: string
  custom_fields?: Record<string, any>
}

// Payment types
export interface Payment {
  id: string
  page_id: string
  stripe_payment_intent_id?: string
  stripe_customer_id?: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  payer_email?: string
  payer_name?: string
  created_at: string
  completed_at?: string
}

// Form submission types
export interface FormSubmission {
  id: string
  page_id: string
  form_type: 'email' | 'contact' | 'newsletter'
  data: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
}

// Database response types
export type DatabaseResult<T> = {
  data: T | null
  error: Error | null
}

export type DatabaseListResult<T> = {
  data: T[]
  error: Error | null
  count?: number
}
