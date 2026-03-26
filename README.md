# CityPulse

CityPulse is a Lagos-focused civic reporting platform with two connected experiences:

- a citizen mobile flow for reporting, tracking, and validating issues in the community
- an admin operations console for reviewing signals, mapping incidents, and managing response activity

The current build combines a React frontend with a NestJS API foundation for auth, issues, analytics, locations, leaderboard, and payments.

## What The Product Does

CityPulse helps residents raise civic complaints with location context and helps operators turn those complaints into visible action.

Core workflows in this repo:

- citizen reporting flow for complaints and public-interest incidents
- citizen sign up and login
- live issue map with Lagos context
- issue reactions and credibility signals
- admin login and protected console routes
- analytics, issue management, and status updates
- location resolution for Lagos LGAs and communities
- payment initialization and webhook handling in the API MVP

## Experience Map

### Citizen app

- Landing page at `/`
- Mobile app at `/mobile`
- Citizen auth at `/mobile/auth`
- Citizens can register, sign in, report issues, view nearby issues, react to reports, and track community activity

### Admin console

- Admin login at `/console/login`
- Console routes under `/console`
- Admins can review live issues, inspect map activity, monitor analytics, and update issue status

## Tech Stack

### Frontend

- React 18
- TypeScript
- Vite
- React Router
- Tailwind CSS
- shadcn/ui
- TanStack Query
- React Hook Form
- Zod
- Mapbox GL / `react-map-gl`

### Backend

- NestJS
- Prisma
- PostgreSQL
- JWT auth
- Jest

## Local Setup

### Frontend

```bash
npm install
npm run dev
```

The frontend runs at `http://localhost:8080`.

Create a root `.env` file if you want the full mapped experience:

```env
VITE_MAPBOX_TOKEN=your_mapbox_token_here
VITE_API_BASE_URL=http://localhost:3001/api/v1
VITE_DEMO_CITIZEN_EMAIL=citizen@citypulse.ng
VITE_DEMO_CITIZEN_PASSWORD=CitizenPass123!
```

### API

```bash
npm run api:dev
```

Create `apps/api/.env` from [apps/api/.env.example](/home/dot/hackathons/city-pulse/apps/api/.env.example).

Important API env values:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/citypulse
JWT_SECRET=replace-me
CORS_ORIGIN=http://localhost:8080,http://127.0.0.1:8080,http://localhost:5173,http://127.0.0.1:5173,https://city-pulse-lyart.vercel.app,https://*.vercel.app
PERSISTENCE_DRIVER=database
```

`CORS_ORIGIN` accepts a comma-separated allowlist. Wildcards such as `https://*.vercel.app` are supported for preview deployments.

The API serves under `/api/v1`, and Swagger is available at `/api/docs` when the Nest app is running.

## Demo Login Details

These credentials are hard-coded in the seeded/in-memory demo setup and exposed in the frontend auth flows:

- Admin: `admin@citypulse.ng` / `AdminPass123!`
- Citizen: `citizen@citypulse.ng` / `CitizenPass123!`

Where they appear in the codebase:

- [src/components/auth/LoginForm.tsx](/home/dot/hackathons/city-pulse/src/components/auth/LoginForm.tsx)
- [apps/api/src/infrastructure/in-memory/in-memory-database.service.ts](/home/dot/hackathons/city-pulse/apps/api/src/infrastructure/in-memory/in-memory-database.service.ts)
- [apps/api/prisma/seed.ts](/home/dot/hackathons/city-pulse/apps/api/prisma/seed.ts)

## Project Structure

```text
city-pulse/
├── src/                  # React frontend
├── apps/api/             # NestJS API
├── public/               # Static assets
├── prd.md                # Product context
├── mobile-prd.md         # Mobile experience notes
└── CityPulse_Pitch_Deck_Script.md
```

## Team Contributions

CityPulse was built as a collaborative hackathon project spanning product thinking, interface design, frontend delivery, backend systems, and supporting documentation. The contribution breakdown below shows how each team member contributed to the submission.

### Psybah

- Frontend implementation across the main React app and mobile-first citizen experience
- Admin console UI and dashboard presentation
- Citizen-facing flows, landing page, and interaction design implementation
- README and product-facing documentation contributions

Evidence in repo history:

- dominant history across `src/`
- commits touching [README.md](/home/dot/hackathons/city-pulse/README.md), [prd.md](/home/dot/hackathons/city-pulse/prd.md), and [CityPulse_Pitch_Deck_Script.md](/home/dot/hackathons/city-pulse/CityPulse_Pitch_Deck_Script.md)

### oladele-david

- Backend engineering for the NestJS API in `apps/api`
- Auth, issues, analytics, locations, leaderboard, and payments API foundations
- Prisma schema, migrations, seed data, and backend test coverage
- Documentation contributions across product and setup materials

Evidence in repo history:

- primary history across `apps/api/`
- commits touching backend tests and supporting documentation
