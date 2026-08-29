# Incident Radar — Frontend Prototype

Production-quality frontend prototype for an AI-powered incident intelligence SaaS.

**Frontend only.** All data is mock. No backend, auth, real LLM, or external integrations.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS (dark-first)
- Lucide React
- Recharts

## Run

```bash
npm install --legacy-peer-deps
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Path | Page |
|------|------|
| `/` | Overview + production simulation |
| `/incidents` | Incident list |
| `/incidents/INC-001` | Investigation (timeline, evidence, AI hypothesis, actions) |
| `/events` | Operational event explorer |
| `/services` | Service health + dependency graph |
| `/simulation` | Scenario runner |

## Demo flow

1. Open Overview
2. Click **Run Production Simulation**
3. Watch events → candidates → critical incident surface
4. Click **Investigate** on Payment Service Degradation

## Architecture notes

- Mock data: `src/data/`
- API boundary: `src/lib/api.ts` (swap for real REST later)
- Types: `src/types/`
- State: React context (simulation, toasts, sidebar)

No Redux. No backend.
