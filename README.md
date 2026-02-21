# Job Tracker

Job Tracker is a full-stack job application dashboard that helps candidates track every application, monitor interview progress, and visualize outcomes over time. The product is designed to feel real in a recruiter demo: it ships with a seeded, realistic dataset, polished UX details like toasts, and a focused analytics experience.

## Demo Credentials (Preset for Live Demo)

Use the demo account below to access a fully populated workspace. The seed script creates this user and loads realistic applications so the app is never empty during a walkthrough.

- Email: demo@example.com
- Password: demo123456

To generate the dataset locally, run:

```bash
npm run prisma:seed
```

## Key Features

- Application management: create, edit, delete, and update status
- Search and filter: find applications by company, role, or location
- Analytics dashboard:
  - Applications over time
  - Status distribution
  - Interview and offer rates
- Secure authentication via NextAuth
- Polished UX: confirmation toasts, empty state handling, and smooth flows

## Tech Stack

- Frontend: Next.js 16 (App Router), React 19, Tailwind CSS
- Backend: Next.js route handlers, Prisma ORM
- Database: PostgreSQL
- Auth: NextAuth.js + Prisma Adapter
- UI: shadcn/ui, Radix UI primitives
- Charts: Recharts
- Notifications: react-hot-toast
- Icons: Lucide

## Project Structure

```
src/
├── app/
│   ├── api/                 # Route handlers for auth and applications
│   ├── (auth)/              # Login/register pages
│   ├── dashboard/           # Main dashboard + analytics
│   └── middleware.ts        # Auth middleware (if enabled)
├── components/              # Shared UI components
├── lib/                     # Prisma client and utilities
├── types/                   # TypeScript type definitions
prisma/
├── schema.prisma            # Prisma schema
└── seed.ts                  # Demo data seed script
```

## Getting Started (Local)

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Setup

1. Install dependencies:

```bash
npm install
```

2. Add environment variables in .env.local:

```
DATABASE_URL="postgresql://user:password@localhost:5432/job_tracker"
NEXTAUTH_SECRET="your-secret-key"
```

3. Initialize the database:

```bash
npx prisma migrate dev
```

4. Seed demo data (recommended):

```bash
npm run prisma:seed
```

5. Start the dev server:

```bash
npm run dev
```

Open http://localhost:3000.

## Available Scripts

- npm run dev - Start development server
- npm run build - Build for production
- npm run start - Start production server
- npm run lint - Run ESLint
- npm run prisma:seed - Seed database with demo data

## Database and Prisma

To update the data model:

1. Edit prisma/schema.prisma
2. Generate a migration:

```bash
npx prisma migrate dev --name <migration-name>
```

## Deployment

### Vercel + Neon (Recommended)

This project is deployed using Vercel for hosting and Neon for serverless PostgreSQL.

1. Create a free database at [neon.tech](https://neon.tech)
2. Push this repo to GitHub
3. Import the project at [vercel.com](https://vercel.com)
4. Add these environment variables in Vercel:
   - `DATABASE_URL` — your Neon connection string
   - `NEXTAUTH_SECRET` — a random 32-character string
   - `NEXTAUTH_URL` — your Vercel deployment URL (e.g. https://job-tracker.vercel.app)
5. Deploy
6. Run the seed script once locally against your production database to populate the demo account:
```bash
npm run prisma:seed
```

Also change `NEXTAUTH_URL` in the local setup section from a generic placeholder to:
NEXTAUTH_URL="http://localhost:3000"

### Other Platforms

Use the standard Next.js deployment flow.

## Notes for Live Demo

The seeded dataset intentionally includes realistic companies, roles, locations, and salary ranges. This makes the first-time experience feel complete and avoids the impression of an unfinished app.

If you want to regenerate fresh demo data, run:

```bash
npm run prisma:seed
```

## License

MIT

