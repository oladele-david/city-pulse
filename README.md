# CityPulse GovOps

**Enterprise Civic Infrastructure Intelligence Platform**

CityPulse is a real-time civic infrastructure monitoring and management platform designed for government agencies to detect, prioritize, and resolve urban issues using trusted community signals and AI-powered analytics.

---

## 🏛️ Overview

CityPulse GovOps provides municipal authorities with comprehensive tools to monitor and manage civic infrastructure health across their jurisdiction. The platform aggregates community reports, applies AI-driven confidence scoring, and presents actionable intelligence through an intuitive dashboard interface.

### Key Capabilities

- **Real-Time Issue Monitoring** - Live map visualization of civic infrastructure issues across the city
- **AI-Powered Confidence Scoring** - Machine learning algorithms validate and prioritize community reports
- **Advanced Analytics** - Comprehensive insights into issue trends, resolution times, and heat zones
- **Multi-Channel Reporting** - Aggregate issues from social media, mobile apps, and direct submissions
- **Role-Based Access Control** - Secure, permission-based access for different agency roles
- **Desktop-Optimized Experience** - Professional interface designed for government workstations

---

## 🚀 Technology Stack

### Frontend Framework
- **React 18.3** - Modern component-based UI library
- **TypeScript 5.8** - Type-safe development
- **Vite 5.4** - Lightning-fast build tooling
- **React Router 6.30** - Client-side routing

### UI & Visualization
- **Tailwind CSS 3.4** - Utility-first styling framework
- **Shadcn/UI** - Accessible component library
- **Radix UI** - Unstyled, accessible primitives
- **Recharts 2.15** - Data visualization and charting
- **Mapbox GL** - Interactive mapping

### State & Data Management
- **TanStack Query 5.83** - Server state synchronization
- **React Hook Form 7.61** - Performant form handling
- **Zod 3.25** - Schema validation

### Icons & Assets
- **Hugeicons** - Comprehensive icon library
- **Lucide React** - Additional icon set

---

## 📋 Features

### Dashboard Overview
- Active issues summary with severity breakdown
- Real-time metrics and trend indicators
- Issue density heatmap visualization
- Recent activity feed

### Live Map
- Interactive city-wide issue mapping
- Severity-based marker clustering
- Real-time filtering by status and severity
- Issue detail drawer with AI analysis
- Light/Dark map theme toggle

### Issues Management
- Comprehensive issue table with pagination
- Advanced search and filtering
- Bulk status updates
- Inline status editing
- CSV/PDF export capabilities
- Confidence score visualization

### Analytics
- Issues distribution by type and area (pie charts)
- Heat zone analysis with trend indicators
- Resolution time trends across severity levels
- Scrollable data tables

### Settings
- Profile management
- Notification preferences
- Role and permission configuration

---

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **Mapbox Access Token** (for map functionality)

### Environment Configuration

1. **Clone the repository**
   ```bash
   git clone https://github.com/Psybah/citypulse-govops.git
   cd citypulse-govops
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_MAPBOX_TOKEN=your_mapbox_token_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:8080`

### Production Build

```bash
npm run build
npm run preview
```

### Backend MVP Foundation

The Lagos MVP backend now lives in `apps/api` and is designed around NestJS + Prisma + PostgreSQL contracts.

```bash
npm run api:dev
npm run api:test
```

Create `apps/api/.env` from [apps/api/.env.example](/home/dot/hackathons/citypulse-govops/apps/api/.env.example) before running the API.

Demo credentials:
- Citizen: `citizen@citypulse.ng` / `CitizenPass123!`
- Admin: `admin@citypulse.ng` / `AdminPass123!`

Notes:
- The API serves under `/api/v1`.
- Swagger UI is available at `/api/docs` once the Nest app is running.
- Prisma schema and Lagos seed data live in [schema.prisma](/home/dot/hackathons/citypulse-govops/apps/api/prisma/schema.prisma) and [lagos-locations.json](/home/dot/hackathons/citypulse-govops/apps/api/prisma/seeds/lagos-locations.json).
- The service currently uses in-memory repositories for local/demo execution while keeping the Prisma schema and seed flow ready for the Postgres rollout.

---

## 📁 Project Structure

```
citypulse-govops/
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── analytics/          # Analytics chart components
│   │   │   ├── cards/              # Dashboard card components
│   │   │   ├── map/                # Map-related components
│   │   │   ├── DashboardLayout.tsx # Main layout wrapper
│   │   │   └── Sidebar.tsx         # Navigation sidebar
│   │   ├── ui/                     # Shadcn/UI components
│   │   └── MobileBlocker.tsx       # Mobile device blocker
│   ├── data/                       # Mock data and types
│   ├── lib/                        # Utility functions
│   ├── pages/
│   │   ├── auth/                   # Authentication pages
│   │   └── dashboard/              # Dashboard pages
│   ├── App.tsx                     # Root component
│   └── main.tsx                    # Application entry point
├── public/                         # Static assets
└── prd.md                          # Product requirements document
```

---

## 🎨 Design System

### Color Palette
- **Primary** - `#1e40af` (Blue) - Main brand color
- **Accent** - `#f59e0b` (Amber) - Highlights and CTAs
- **Destructive** - `#ef4444` (Red) - Errors and high severity
- **Muted** - Neutral grays for secondary content

### Typography
- **Font Family** - System font stack for optimal performance
- **Headings** - Bold, tracking-tight
- **Body** - Regular weight, comfortable line height

### Components
All components follow accessibility best practices (WCAG 2.1 AA) and support keyboard navigation.

---

## 📊 Data Flow

1. **Issue Ingestion** - Community reports aggregated from multiple channels
2. **AI Processing** - Confidence scoring and validation
3. **Dashboard Display** - Real-time visualization and analytics
4. **Agency Action** - Status updates and resolution tracking
5. **Analytics** - Historical trend analysis and insights

---

## 🧪 Development Guidelines

### Code Standards
- TypeScript strict mode enabled
- ESLint configuration enforced
- Component-driven architecture
- Functional components with hooks

### Naming Conventions
- **Components** - PascalCase (e.g., `DashboardLayout`)
- **Files** - PascalCase for components, camelCase for utilities
- **CSS Classes** - Tailwind utilities, no custom CSS unless necessary

### State Management
- Server state via TanStack Query
- Form state via React Hook Form
- Local state via React hooks
- No global state management library (intentional simplicity)

---

## 📈 Performance Optimization

- Code splitting via React Router
- Lazy loading for heavy components
- Optimized bundle size with Vite
- Efficient re-rendering with React.memo where appropriate
- Virtualized lists for large datasets (planned)

---

## 🤝 Contributing

I'm not accepting contributions yet... reach me at abiodunoluwamurewa@gmail.com

## 🙏 Acknowledgments

**Version** - 1.0.0  
**Last Updated** - December 2025
