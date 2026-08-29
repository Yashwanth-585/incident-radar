import { Scenario } from '@/types';

export const scenarios: Scenario[] = [
  {
    id: 'scenario-payment-degradation',
    title: 'Payment Service Degradation',
    description:
      'Deployment → DB connections → latency → errors → payment failures',
    type: 'degradation',
  },
  {
    id: 'scenario-database-failure',
    title: 'Database Failure',
    description:
      'DB CPU → query latency → API timeout → checkout failures',
    type: 'failure',
  },
  {
    id: 'scenario-memory-leak',
    title: 'Memory Leak',
    description: 'Deployment → memory growth → pod restarts → request failures',
    type: 'leak',
  },
  {
    id: 'scenario-noisy-environment',
    title: 'Noisy Production Environment',
    description: 'Generate unrelated low-severity alerts and noise events',
    type: 'noise',
  },
];
