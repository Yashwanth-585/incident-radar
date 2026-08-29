# Incident Radar — AI-Powered Incident Intelligence Frontend

A production-quality frontend prototype for **Incident Radar**, an AI-powered incident intelligence platform that transforms hundreds of noisy operational events into prioritized, explainable incidents.

## Project Location

The project has been built at: `C:\Projects\incident-radar`

**Note:** The original workspace path contained special characters that caused Webpack conflicts. The project was moved to a path without special characters for compatibility.

## Overview

Incident Radar is a SaaS platform for engineering and SRE teams that acts as an intelligence layer above operational monitoring systems. Instead of investigating hundreds of individual alerts, engineers see:

```
187 events
    ↓
CORRELATION
    ↓
6 incidents
    ↓
EVIDENCE & ROOT-CAUSE HYPOTHESIS
    ↓
RECOMMENDED ACTION
```

## Architecture

### Technology Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Charts:** Recharts
- **State:** React hooks (useState, useContext)

### Project Structure

```
src/
  ├── app/                    # Next.js pages
  │   ├── page.tsx           # Overview dashboard
  │   ├── incidents/         # Incident listing and details
  │   ├── events/            # Event explorer
  │   ├── services/          # Service health and dependencies
  │   ├── simulation/        # Production simulation
  │   ├── layout.tsx         # Root layout
  │   └── globals.css        # Global styles
  │
  ├── components/
  │   ├── layout/            # Sidebar, Header, Layout
  │   ├── ui/                # Button, Card, Badge, Toast, etc.
  │   ├── incidents/         # Incident-specific components
  │   ├── events/            # Event table and filters
  │   ├── services/          # Service cards and dependency graph
  │   ├── simulation/        # Simulation controls and progress
  │   ├── charts/            # Recharts visualizations
  │   └── common/            # KPI cards and shared components
  │
  ├── data/                  # Mock data
  │   ├── events.ts         # 187 mock events
  │   ├── incidents.ts      # 6 mock incidents
  │   ├── services.ts       # 7 services
  │   └── scenarios.ts      # 4 simulation scenarios
  │
  ├── lib/
  │   └── api.ts            # API abstraction layer
  │
  └── types/
      └── index.ts          # TypeScript interfaces
```

## Features

### 1. Overview Dashboard (`/`)
- **KPI Cards:** Events, Active Incidents, Correlation Rate, Mean Detection Time
- **Severity Summary:** Visual breakdown of incident severity
- **Critical Incident:** Highlighted incident card with full details
- **Production Simulation:** Button to generate test incidents
- **Charts:** Event volume and error rate trends

### 2. Incidents (`/incidents`)
- **List View:** All incidents with filtering (critical, active, resolved)
- **Incident Cards:** Service, severity, confidence, affected services
- **Quick Navigation:** Click to open investigation

### 3. Incident Investigation (`/incidents/[id]`)
- **AI Investigation:** Root cause hypothesis with confidence score
- **Evidence Cards:** 5+ evidence items showing causal progression
- **Timeline:** Vertical timeline with timestamps and metric changes
- **Recommendations:** Primary and secondary actions with reasoning
- **Correlated Events:** Table of all related events

### 4. Events (`/events`)
- **Event Table:** 187 events, 30 rows per page
- **Filters:** Service, Severity, Source, Search
- **Sorting:** By timestamp or severity
- **Full Details:** Timestamp, source, service, message

### 5. Services (`/services`)
- **Dependency Graph:** ASCII-style visualization of service dependencies
- **Service Cards:** Health status, requests/min, error rate, latency
- **Grouping:** Critical, Degraded, and Healthy services
- **Dependencies:** Shows which services each depends on

### 6. Simulation (`/simulation`)
- **4 Scenarios:** Degradation, Failure, Memory Leak, Noise
- **Progress Display:** 6-stage simulation with visual progress
- **Results:** Final event count, incident candidates, confirmed incidents

## Running the Project

### Prerequisites
- Node.js 18+
- npm

### Development Server

```bash
cd C:\Projects\incident-radar
npm install
npm run dev
```

Server will start at: `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Design System

### Colors
- **Background:** `#0f172a` (slate-950)
- **Surfaces:** `#1e293b` (slate-900)
- **Text:** `#f1f5f9` (slate-100)
- **Severity:**
  - Critical: Red (`#dc2626`)
  - High: Orange (`#ea580c`)
  - Medium: Yellow (`#eab308`)
  - Low: Green (`#16a34a`)
- **AI Insight:** Blue/Purple

### Component Patterns
- **Cards:** Dark surfaces with subtle borders
- **Badges:** Colored backgrounds with matching text
- **Buttons:** Three variants (primary, secondary, ghost)
- **Tables:** Striped rows with hover effects
- **Charts:** Minimal styling, high contrast

## Mock Data

All data is centralized and production-ready:

- **187 Events:** From deployment through payment failures
- **6 Incidents:** Critical payment degradation, auth errors, latency, cache, notifications, checkout
- **7 Services:** API Gateway, Payment API, Auth, Checkout, PostgreSQL, Redis, Notifications
- **4 Scenarios:** Each generates realistic event cascades

## API Abstraction

The `lib/api.ts` module provides a clean boundary:

```typescript
await getIncidents()          // Returns all incidents
await getIncident(id)         // Returns single incident
await getEvents()             // Returns all events
await getEventsByIncident()   // Returns correlated events
await getServices()           // Returns all services
await runSimulation(scenario) // Runs scenario with stages
```

**Future:** Replace with REST API calls without touching components.

## Key Interactions

- **Sidebar Collapse:** Persistent across navigation
- **Incident Navigation:** Click card → opens investigation
- **Event Filtering:** Real-time filter updates
- **Simulation:** Animated stage progression
- **Toast Notifications:** Action feedback
- **Loading States:** Skeleton/spinner for all async operations

## Responsive Design

- **Desktop:** Persistent 256px sidebar + full content
- **Tablet:** Collapsible sidebar + responsive grid
- **Mobile:** Stacked cards, full-width tables, top navigation

## Quality Checklist

✅ Serious B2B product look and feel
✅ Dark-first design with restrained styling
✅ Realistic operational data
✅ Clear information hierarchy
✅ Consistent spacing and typography
✅ Meaningful interactions with feedback
✅ Useful loading and empty states
✅ No unnecessary decoration
✅ Modular component architecture
✅ Type-safe TypeScript throughout
✅ Production-ready code quality
✅ Responsive layouts
✅ Accessible UI patterns

## Future Architecture

This prototype demonstrates the frontend. The complete system will add:

```
External Sources (GitHub, AWS, Datadog, etc.)
         ↓
Ingestion API
         ↓
Event Pipeline
         ↓
PostgreSQL + pgvector
         ↓
Correlation Engine
         ↓
AI Reasoning (LLM)
         ↓
Priority Engine
         ↓
Incident API
         ↓
This Frontend ← (You are here)
```

## Development Notes

- **No Redux:** Uses React hooks and Context API
- **Minimal Dependencies:** Only essential libraries
- **Mock Data First:** Easy to swap with real APIs
- **Type Safety:** Full TypeScript coverage
- **Component Reusability:** Shared UI patterns
- **Performance:** Code splitting via Next.js
- **Accessibility:** Semantic HTML, keyboard navigation

## Project Status

✅ **COMPLETE** — Production-quality frontend prototype ready for:
- Demo to stakeholders
- Backend integration
- Real data connection
- Deployment

All features implemented per PRD/TRD specification.

---

**Built with attention to quality, not decoration.**

For backend integration: Update `lib/api.ts` to point to real API endpoints.
