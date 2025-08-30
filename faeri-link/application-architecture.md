# Faeri Link Application Architecture

## Overview

Faeri Link is a comprehensive link-in-bio platform built with Next.js 15, TypeScript, and Supabase. It provides creators, professionals, and teams with a powerful tool to create customizable landing pages that consolidate their online presence, track performance, and monetize their audience.

## Application Categories & Responsibilities

### 1. Authentication & User Management
**Handles user registration, login, security, and profile management**

#### Key Components:
- **AuthProvider** (`src/hooks/useAuth.tsx`) - Central authentication context managing user state, session handling, and auth operations
- **Auth Forms** (`src/components/auth/`) - Login, signup, and email verification forms
- **Protected Routes** (`src/components/auth/ProtectedRoute.tsx`) - Route protection and authorization checks
- **Security Features** - 2FA setup, session management, password reset

#### Responsibilities:
- Email/password authentication with Supabase
- OAuth integration (Google, Apple)
- Email verification workflows
- User profile creation and management
- Session state management and persistence
- Security headers and protection

---

### 2. Page Builder & Content Management
**Handles the creation and customization of user landing pages**

#### Key Components:
- **PageBuilder** (`src/components/PageBuilder.tsx`) - Main drag-and-drop page building interface
- **Block Components** (`src/components/blocks/`) - Individual content blocks (Hero, Links, FAQ, Social Icons)
- **BlockConfigPanel** - Configuration interface for block customization
- **CodeEditor** (`src/components/CodeEditor.tsx`) - Custom HTML/CSS/JS editing interface

#### Block Types:
- **Hero Block** - Profile avatar, bio, and header information
- **Links Block** - Clickable links with customizable layouts (list, grid, cards)
- **FAQ Block** - Collapsible frequently asked questions
- **Social Icons Block** - Social media platform links
- **Email Capture Block** - Newsletter signup forms

#### Responsibilities:
- Drag-and-drop page construction
- Real-time preview with mobile/desktop toggle
- Template system with 10+ preset layouts
- Block configuration and customization
- Custom HTML/CSS/JS support (Pro feature)
- Responsive design handling

---

### 3. Link Management & Organization
**Handles CRUD operations for links, scheduling, and organization**

#### Key Components:
- **LinkManager** (`src/components/LinkManager.tsx`) - Link creation and editing interface
- **LinkScheduler** (`src/components/LinkScheduler.tsx`) - Link scheduling functionality
- **DraggableLinkList** (`src/components/DraggableLinkList.tsx`) - Link reordering interface

#### Features:
- Link creation, editing, deletion
- Custom titles and descriptions
- Drag-and-drop reordering
- Scheduling (start/end dates)
- Link categorization and grouping
- Status management (active, scheduled, expired)
- Deep linking support for mobile apps
- QR code generation

#### Responsibilities:
- Link validation and safety checking
- Position persistence and ordering
- Link performance tracking foundation
- Universal link support for iOS/Android

---

### 4. Analytics & Performance Tracking
**Handles data collection, processing, and visualization**

#### Key Components:
- **AnalyticsDashboard** (`src/components/AnalyticsDashboard.tsx`) - Main analytics interface
- **useAnalytics** (`src/hooks/useAnalytics.ts`) - Analytics data fetching and processing
- **Analytics API Routes** (`src/app/api/analytics/`) - Server-side analytics processing

#### Metrics Tracked:
- Page views and unique visitors
- Link clicks and click-through rates (CTR)
- Device breakdown (mobile, desktop, tablet)
- Geographic distribution
- Referrer tracking
- Event deduplication and processing

#### Responsibilities:
- Real-time analytics processing
- CSV export functionality
- Date range filtering
- Performance accuracy within ±3% of raw events
- Edge function integration for data collection

---

### 5. Integrations & Third-Party Services
**Handles external service connections and data flow**

#### Key Components:
- **IntegrationsManagement** (`src/components/IntegrationsManagement.tsx`) - Integration configuration interface
- **EmailIntegrationSettings** (`src/components/EmailIntegrationSettings.tsx`) - Email service setup
- **Integration API Routes** (`src/app/api/integrations/`) - Third-party API integrations

#### Integration Types:
- **Email Marketing** - Mailchimp, ConvertKit integration
- **Scheduling** - Calendly booking functionality
- **Pixel Tracking** - Meta, TikTok, Google Analytics pixels
- **Webhooks** - Zapier automation and custom integrations
- **Payment Processing** - Stripe Connect for monetization

#### Responsibilities:
- OAuth and API key management
- Connection health monitoring
- Data synchronization
- Consent management for privacy compliance
- Integration-specific configuration panels

---

### 6. Domain Management & SSL
**Handles custom domain setup and SSL certificate management**

#### Key Components:
- **DomainManagement** (`src/components/DomainManagement.tsx`) - Domain configuration interface
- **Middleware** (`src/middleware.ts`, `src/middleware-domains.ts`) - Domain routing and SSL handling

#### Features:
- Custom domain mapping
- DNS configuration guidance
- Automated SSL certificate issuance (Let's Encrypt)
- Domain health monitoring
- Propagation status tracking

#### Responsibilities:
- Domain validation and verification
- SSL certificate automation
- DNS record guidance for major providers
- Domain routing logic
- Certificate renewal management

---

### 7. Scheduling & Booking System
**Handles appointment booking and meeting management**

#### Key Components:
- **SchedulingManagement** (`src/components/SchedulingManagement.tsx`) - Scheduling configuration interface
- **BookingCalendar** (`src/components/scheduling/BookingCalendar.tsx`) - Calendar interface
- **useScheduling** (`src/hooks/useScheduling.ts`) - Scheduling state management

#### Features:
- Meeting type creation and configuration
- Availability schedule management
- Booking form generation
- Calendar integration
- Timezone handling
- Buffer time and advance booking settings

#### Responsibilities:
- Meeting type CRUD operations
- Availability configuration
- Booking workflow management
- Notification system
- Calendar integration
- Timezone conversion and handling

---

### 8. Monetization & Payment Processing
**Handles payment collection and financial features**

#### Key Components:
- **Stripe Integration** - Payment processing via Stripe Connect
- **Tip functionality** - One-time payment collection
- **Payment API Routes** (`src/app/api/payments/`) - Payment processing endpoints

#### Features:
- Stripe Connect onboarding
- One-time payment processing
- Receipt generation and email delivery
- Payout management
- Regional tax handling
- SCA compliance

#### Responsibilities:
- Payment flow management
- Stripe webhook handling
- Financial reporting
- Payout status tracking
- Compliance with payment regulations

---

### 9. UI/UX Components & Design System
**Handles reusable UI components and user experience**

#### Key Components:
- **UI Components** (`src/components/ui/`) - Reusable design system components
- **Accessibility Components** (`src/lib/accessibility.ts`) - WCAG compliance features
- **ClientLayout** (`src/components/ClientLayout.tsx`) - Application layout wrapper

#### Component Library:
- **Button** - Accessible button with variants
- **Input** - Form input with validation
- **Card** - Content container component
- **Badge** - Status and label display
- **LoadingSpinner** - Loading state indicator
- **AuthError** - Authentication error display

#### Responsibilities:
- WCAG 2.1 AA compliance
- Consistent design language
- Responsive design implementation
- Accessibility features
- Component reusability and maintainability

---

### 10. Performance & Security Infrastructure
**Handles application performance, security, and reliability**

#### Key Components:
- **Performance Optimization** - Image optimization, lazy loading
- **Security Headers** - CSP, HSTS, SRI implementation
- **Error Handling** (`src/lib/error-utils.ts`) - Centralized error management
- **Performance Monitoring** - Core Web Vitals tracking

#### Features:
- Static and edge rendering
- Image optimization pipeline
- CDN integration
- Security headers and policies
- Error tracking and reporting
- Performance monitoring

#### Responsibilities:
- LCP optimization (< 1.5s target)
- Security vulnerability mitigation
- Error boundary implementation
- Performance budget enforcement
- Reliability and uptime monitoring

---

### 11. Data Layer & API Management
**Handles database operations, API routes, and data flow**

#### Key Components:
- **Supabase Client** (`src/lib/supabase/client.ts`) - Database connection
- **API Routes** (`src/app/api/`) - Server-side API endpoints
- **Database Types** (`src/types/database.ts`) - TypeScript type definitions
- **Middleware** - Request processing and routing

#### Database Schema:
- **Users** - Authentication and profile data
- **Pages** - Page configuration and content
- **Blocks** - Page building blocks
- **Links** - Link data and metadata
- **Analytics Events** - Tracking and analytics data
- **Integrations** - Third-party service connections
- **Payments** - Financial transaction data

#### Responsibilities:
- Database query optimization
- API endpoint management
- Data validation and sanitization
- Row-level security (RLS) implementation
- Database migration management

---

### 12. Development Tools & Quality Assurance
**Handles testing, linting, and development workflow**

#### Key Components:
- **Testing Infrastructure** - Jest, Testing Library, Playwright
- **Linting Configuration** - ESLint, TypeScript checking
- **Performance Testing** - Lighthouse CI integration
- **Accessibility Testing** - Automated accessibility audits

#### Responsibilities:
- Unit and component testing
- End-to-end testing automation
- Performance budget enforcement
- Code quality maintenance
- Development workflow optimization

## Data Flow Architecture

### User Journey Flow:
1. **Authentication** → User signs up/logs in
2. **Page Creation** → User creates their first page using Page Builder
3. **Content Management** → User adds links, blocks, and customizes design
4. **Publishing** → Page is published and made publicly accessible
5. **Analytics Collection** → User interactions are tracked and processed
6. **Monetization** → Optional payment integration and tip collection

### Technical Data Flow:
- **Frontend** → React components with hooks for state management
- **API Layer** → Next.js API routes handling business logic
- **Database** → Supabase PostgreSQL with RLS policies
- **External Services** → Third-party integrations via webhooks/APIs
- **CDN/Edge** → Vercel CDN for performance optimization

## Deployment & Infrastructure

- **Hosting**: Vercel with edge functions
- **Database**: Supabase (PostgreSQL)
- **CDN**: Vercel CDN with edge caching
- **SSL**: Automated certificate management
- **Monitoring**: Vercel Analytics and custom RUM implementation

This architecture provides a scalable, maintainable foundation for a comprehensive link-in-bio platform with strong separation of concerns and clear responsibility boundaries.
