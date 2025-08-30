# Faeri Link 🌟

A high-performance link-in-bio platform that empowers creators, professionals, and teams to build beautiful, customizable landing pages with powerful analytics, monetization, and integrations.

![Faeri Link Banner](https://img.shields.io/badge/Faeri-Link-845ef7?style=for-the-badge&logo=next.js&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=flat-square&logo=stripe&logoColor=white)
![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/notceiph/faerilink?utm_source=oss&utm_medium=github&utm_campaign=notceiph%2Ffaerilink&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

## ✨ Features

### 🚀 Core Platform
- **Page Builder**: Drag-and-drop interface with 10+ templates
- **Link Management**: Organize, schedule, and track link performance
- **Custom Domains**: Automated SSL with Let's Encrypt
- **Responsive Design**: Mobile-first with perfect performance scores

### 📊 Analytics & Insights
- **Real-time Analytics**: Page views, unique visitors, CTR tracking
- **Device & Geo Breakdowns**: Comprehensive visitor insights
- **CSV Export**: Download analytics data for external analysis
- **Per-link Metrics**: Track individual link performance

### 💰 Monetization
- **Stripe Integration**: One-time tips and donations
- **Automated Payouts**: Direct transfers to connected accounts
- **Receipt Generation**: Professional email receipts
- **Regional Compliance**: SCA and tax handling

### 🔗 Integrations
- **Email Marketing**: Mailchimp and ConvertKit integration
- **Scheduling**: Calendly booking system
- **Pixel Tracking**: Meta, TikTok, and Google Analytics
- **Webhooks**: Zapier automation support

### 🔒 Security & Performance
- **Two-Factor Authentication**: TOTP and backup codes
- **SSL Everywhere**: HTTPS with HSTS and CSP headers
- **Rate Limiting**: Abuse prevention and spam protection
- **Accessibility**: WCAG 2.1 AA compliance

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom Design System
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **API**: Next.js API Routes

### Payments & Integrations
- **Payments**: Stripe Connect
- **Email**: Mailchimp, ConvertKit
- **Scheduling**: Calendly API
- **Analytics**: Custom RUM + Supabase

### Development & Testing
- **Testing**: Jest + React Testing Library
- **E2E Testing**: Playwright
- **Linting**: ESLint + TypeScript
- **Performance**: Lighthouse CI

### Deployment & Infrastructure
- **Hosting**: Vercel
- **CDN**: Vercel Edge Network
- **Monitoring**: Vercel Analytics
- **SSL**: Automated certificates

## 🎨 Design System

Faeri Link features a unique glassmorphism design with:
- **Soft gradients** and pastel color palette
- **Translucent surfaces** with blur effects
- **Lilac-violet accents** for high contrast
- **Cozy aesthetic** with subtle grain textures
- **Dark mode support** with automatic theme detection

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.17.0 or higher
- **npm** or **yarn**: Latest stable version
- **Git**: For version control

### Required Accounts
- **Supabase**: Database and authentication
- **Stripe**: Payment processing (for monetization features)
- **Vercel**: Deployment platform (optional for local development)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/faerilink.git
cd faerilink/faeri-link
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the `faeri-link` directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe Configuration (for monetization)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Optional: Analytics and Integrations
NEXT_PUBLIC_GA_TRACKING_ID=your-ga-tracking-id
MAILCHIMP_API_KEY=your-mailchimp-api-key
CONVERTKIT_API_KEY=your-convertkit-api-key
```

### 4. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your credentials
3. Run the database migrations (if provided)
4. Configure authentication providers

### 5. Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking
npm run format           # Code formatting (if prettier configured)

# Testing
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run test:ui          # Run tests with UI
npm run test:e2e         # Run end-to-end tests

# Performance & Accessibility
npm run accessibility    # Run accessibility audits
npm run performance      # Run performance tests
```

## 📁 Project Structure

```
faeri-link/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── analytics/         # Analytics pages
│   │   └── [slug]/            # Dynamic user pages
│   ├── components/            # Reusable components
│   │   ├── ui/               # Design system components
│   │   ├── blocks/           # Page builder blocks
│   │   ├── auth/             # Authentication components
│   │   └── dashboard/        # Dashboard components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility libraries
│   │   ├── supabase/         # Database client
│   │   ├── utils.ts          # General utilities
│   │   └── constants.ts      # App constants
│   ├── types/                # TypeScript definitions
│   └── utils/                # Helper functions
├── public/                   # Static assets
├── branding/                 # Brand guidelines
├── *.config.*               # Configuration files
└── README.md                # This file
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | ❌ |
| `STRIPE_SECRET_KEY` | Stripe secret key | ❌ |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | ❌ |

### Database Schema

The application uses the following main tables:
- `users` - User profiles and authentication
- `pages` - User landing pages
- `blocks` - Page building blocks
- `links` - Link data and metadata
- `analytics_events` - Tracking data
- `integrations` - Third-party connections
- `payments` - Financial transactions

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
npm run build
npm run start
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Make** your changes following our coding standards
4. **Test** thoroughly: `npm run test`
5. **Commit** with clear messages: `git commit -m "Add: feature description"`
6. **Push** to your branch: `git push origin feature/your-feature`
7. **Create** a Pull Request

### Code Standards

- **TypeScript**: Strict type checking enabled
- **ESLint**: Airbnb config with TypeScript support
- **Testing**: Minimum 80% coverage required
- **Performance**: Lighthouse scores must meet targets
- **Accessibility**: WCAG 2.1 AA compliance

### Commit Convention

```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
```

## 📊 Performance Targets

- **LCP**: < 1.5s on mid-range mobile over 4G
- **CLS**: < 0.1
- **Public JS**: ≤ 50KB
- **Accessibility**: WCAG 2.1 AA
- **Uptime**: 99.9% target

## 🔒 Security

- Row-level security (RLS) on all database tables
- Content Security Policy (CSP) headers
- HTTPS with HSTS everywhere
- Regular dependency updates and security audits
- Safe Browsing API integration for link validation

## 📈 Roadmap

### MVP Features (Current)
- ✅ Page builder with drag-and-drop
- ✅ Analytics dashboard
- ✅ Custom domains with SSL
- ✅ Stripe tips integration
- ✅ Email integrations

### Future Enhancements
- 🔄 Advanced personalization rules
- 🔄 White-label and agency features
- 🔄 Multivariate testing
- 🔄 Digital product marketplace
- 🔄 Advanced team collaboration

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** team for the amazing framework
- **Supabase** for the PostgreSQL backend
- **Stripe** for payment processing
- **Vercel** for hosting and edge functions
- **Tailwind CSS** for utility-first styling

## 📞 Support

- **Documentation**: [docs.faerilink.com](https://docs.faerilink.com)
- **Issues**: [GitHub Issues](https://github.com/your-username/faerilink/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/faerilink/discussions)
- **Email**: support@faerilink.com

---

**Made with ❤️ by the Faeri Link team**

Transform your online presence with beautiful, high-converting link-in-bio pages.
