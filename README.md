# PandaSpa Frontend

Frontend for PandaSpa built with Next.js App Router. Includes the public website and the admin dashboard UI.

## Tech Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- @tanstack/react-query
- @tanstack/react-table
- Chart.js + react-chartjs-2
- Socket.IO client
- i18n (VN/EN)

## Project Structure
```txt
src/
├── app/
│   ├── [lang]/
│   │   ├── page.tsx                 # Public homepage
│   │   └── admin/                   # Admin routes
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── home/                        # Public UI sections
│   └── admin/                       # Admin UI
├── lib/
│   ├── api/                         # API clients (public/admin)
│   └── realtime/                    # Socket hooks
├── types/
└── middleware.ts
```

## Environment Variables
Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_LANG=vi
```

## Development
```bash
npm install
npm run dev
```

## Production
```bash
npm run build
npm start
```

## Admin Auth (Cookie-Only)
- Admin authentication uses HttpOnly cookies set by the backend.
- Frontend does not store tokens in localStorage.
- Requests use `credentials: "include"`.

## Data Flow
- Public homepage loads from `/public/pages/home?lang=...`.
- Admin editor updates `/admin/pages/home/*` endpoints.
- If homepage is DRAFT, it will not render on public unless `SHOW_DRAFT_HOME=true` in backend (non-production).

## Realtime
- Admin Live uses Socket.IO gateway at `/admin-live`.
- Heartbeat is sent every 10 seconds.

## Scripts
```bash
npm run dev
npm run build
npm start
```
