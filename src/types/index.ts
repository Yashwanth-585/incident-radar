export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type IncidentStatus = 'active' | 'resolved' | 'investigating';

export interface Event {
  id: string;
  timestamp: string;
  service: string;
  source: string;
  type: string;
  message: string;
  severity: Severity;
  incidentId?: string;
}

export interface Evidence {
  id: string;
  title: string;
  description: string;
  source: string;
  timestamp: string;
  severity: Severity;
  metric?: {
    before: string;
    after: string;
  };
}

export interface Recommendation {
  id: string;
  title: string;
  reason: string;
  priority: number;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  confidence: number;
  status: IncidentStatus;
  service: string;
  startTime: string;
  lastUpdateTime: string;
  rootCause: string;
  evidence: Evidence[];
  recommendations: Recommendation[];
  correlatedServices: string[];
  correlatedEventCount: number;
  eventIds: string[];
}

export interface Service {
  id: string;
  name: string;
  health: 'healthy' | 'degraded' | 'critical';
  requestsPerMin: number;
  errorRate: number;
  latency: number;
  activeIncidents: number;
  dependencies: string[];
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  type: 'degradation' | 'failure' | 'leak' | 'noise';
}

export interface SimulationState {
  status: 'idle' | 'running' | 'completed';
  progress: {
    stage: string;
    percentage: number;
  };
  eventCount: number;
  incidentCount: number;
}
