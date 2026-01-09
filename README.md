# 🐼 PandaSpa Frontend

Frontend website cho PandaSpa.vn xây dựng bằng Next.js 16.1.1 (App Router)

## 📦 Tech Stack
- **Next.js 16.1.1** - App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Query** - Server state management
- **Zustand** - Client state management
- **React Hook Form + Zod** - Form validation
- **Axios** - HTTP client
- **SWR** - Data fetching (fallback)

## 🗂️ Project Structure

```
pandaspa-frontend/
├── src/
│   ├── app/                          # App Router (Next.js 16)
│   │   ├── [lang]/                   # Dynamic language routing
│   │   │   ├── page.tsx              # Homepage
│   │   │   ├── layout.tsx            # Root layout
│   │   │   └── admin/                # Admin routes
│   │   │       ├── login/
│   │   │       ├── dashboard/
│   │   │       └── leads/
│   │   ├── api/                      # API routes (if needed)
│   │   ├── globals.css
│   │   └── layout.tsx
│   │
│   ├── components/                   # React components
│   │   ├── common/                   # Shared components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Button.tsx
│   │   │   └── Loading.tsx
│   │   ├── home/                     # Homepage components
│   │   │   ├── HeroSection.tsx
│   │   │   ├── ServicesSection.tsx
│   │   │   └── ContactForm.tsx
│   │   └── admin/                    # Admin components
│   │       ├── LeadTable.tsx
│   │       ├── PageEditor.tsx
│   │       └── Sidebar.tsx
│   │
│   ├── lib/                          # Utilities & configurations
│   │   ├── api/                      # API client setup
│   │   │   ├── client.ts             # Axios instance
│   │   │   ├── public.ts             # Public API calls
│   │   │   └── admin.ts              # Admin API calls
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── usePageData.ts
│   │   │   ├── useAuth.ts
│   │   │   └── useLeads.ts
│   │   ├── stores/                   # Zustand stores
│   │   │   ├── authStore.ts
│   │   │   └── languageStore.ts
│   │   ├── schemas/                  # Zod validation schemas
│   │   │   ├── leadSchema.ts
│   │   │   └── authSchema.ts
│   │   ├── utils/                    # Helper functions
│   │   │   ├── formatters.ts
│   │   │   └── validators.ts
│   │   └── constants.ts              # Constants
│   │
│   ├── types/                        # TypeScript types
│   │   ├── api.types.ts
│   │   ├── page.types.ts
│   │   └── lead.types.ts
│   │
│   └── middleware.ts                 # Next.js middleware (auth, i18n)
│
├── public/
│   ├── images/
│   └── locales/                      # i18n translations
│       ├── en.json
│       └── vn.json
│
├── .env.local
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 🔑 Environment Variables

Tạo file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=https://pandaspa.vn
NEXT_PUBLIC_DEFAULT_LANG=vn
```

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📋 Features Checklist

### Public Website
- ✅ Multi-language support (VN/EN)
- ✅ Homepage with dynamic content from CMS
- ✅ SEO optimization (meta tags, canonical, hreflang)
- ✅ Service booking form with validation
- ✅ Responsive design
- ✅ Loading states & error handling

### Admin Dashboard
- ✅ JWT authentication
- ✅ Lead management (list, detail, status update)
- ✅ Page content editor (Hero, Meta)
- ✅ Role-based access control
- ✅ Audit log viewer

## 🎨 Design Principles

1. **Performance First**: Code-splitting, lazy loading, image optimization
2. **SEO Friendly**: Server-side rendering, meta tags, structured data
3. **Type Safety**: Full TypeScript coverage
4. **Error Handling**: Comprehensive error boundaries và user feedback
5. **Accessibility**: WCAG 2.1 AA compliance
6. **Mobile First**: Responsive design từ mobile lên desktop