# StockTrack

Kiosk-mode inventory management app for Android tablets. Tracks stock movements, logs every transaction to a user, and alerts staff on low-stock items.

Built with Next.js + Capacitor (Android), Supabase backend, and Tailwind CSS.

## Features

- **Kiosk mode** — locks device to single-purpose inventory interface
- **User authentication** — role-based access (employee / admin)
- **Stock adjustments** — +/− buttons with quantity popup; all changes logged
- **Transaction logging** — every adjustment records user, item, quantity, and timestamp
- **Search & category filtering** — real-time search across full inventory
- **Low-stock alerts** — visual highlights when items fall below threshold
- **Admin panel** — add/edit items, set thresholds, manage users
- **Reports page** — transaction log with date range filters (day/week/month/year/custom), exportable as PDF

## Tech Stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 16 + React 19 |
| Mobile | Capacitor 8 (Android) |
| Backend / Auth | Supabase |
| Offline storage | Dexie (IndexedDB) |
| UI | Tailwind CSS v4, shadcn/ui, Radix UI |
| Animations | Framer Motion |
| PDF export | jsPDF + jspdf-autotable |

## Getting Started

### Prerequisites

- Node.js 20+
- Android Studio (for Android builds)
- Supabase project with credentials

### Install

```bash
npm install
```

### Environment

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run (web dev server)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Android

```bash
npm run build
npx cap sync android
npx cap open android
```

Then build/run from Android Studio.

## App Structure

```
src/
├── app/
│   ├── auth/          # Login page
│   ├── dashboard/     # Main inventory view
│   ├── admin/         # Admin panel (inventory + user management)
│   └── reports/       # Transaction reports
├── components/
│   ├── admin/         # InventoryView, UserManagement, AppSettings
│   ├── dashboard/     # TransactionReports, TransactionSummaryCompact
│   └── ui/            # Shared UI components
└── lib/               # Context providers (inventory, user, settings)
```

## Roles

| Role | Access |
|------|--------|
| Employee | Dashboard — search, filter, adjust stock |
| Admin | All employee access + admin panel + reports |
