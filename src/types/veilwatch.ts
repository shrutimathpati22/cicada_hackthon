export type PageId =
  | 'overview'
  | 'infrastructure'
  | 'privacy-radar'
  | 'smart-alerts'
  | 'predictive-health'
  | 'fingerprints'
  | 'audit-reports'
  | 'settings';

export type SystemCategory = 'server' | 'application' | 'network' | 'security';
export type HealthStatus = 'healthy' | 'warning' | 'critical';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';
export type TimeRange = '15m' | '1h' | '6h' | '24h';

export interface TelemetryPoint {
  timestamp: string;
  label: string;
  cpu: number;
  memory: number;
  networkInMbps: number;
  networkOutMbps: number;
  responseMs: number;
}

export interface MonitoredSystem {
  id: string;
  name: string;
  category: SystemCategory;
  host: string;
  region: string;
  status: HealthStatus;
  monitoringActive: boolean;
  uptimePercent: number;
  cpuUsage: number;
  memoryUsage: number;
  responseTimeMs: number;
  lastSeen: string;
  history: { label: string; cpu: number; memory: number; responseMs: number }[];
  notes: string;
}

export interface AlertItem {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  category: SystemCategory | 'privacy';
  systemId: string;
  systemName: string;
  timestamp: string;
  recommendedAction: string;
  fingerprintId: string;
  simulationSource?: string;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  title: string;
  detail: string;
  level: 'info' | 'warning' | 'critical' | 'privacy';
}

export interface ExportPolicyRules {
  blockOnCredentials: boolean;
  blockOnPII: boolean;
  redactEmails: boolean;
  redactPhones: boolean;
  redactInternalIps: boolean;
  allowSanitizedSummaryExport: boolean;
}

export interface FlaggedFieldSummary {
  fieldType: string;
  category: 'Credential' | 'PII' | 'Financial' | 'Network';
  count: number;
  maskedPreview: string;
  actionTaken: 'Redacted' | 'Blocked' | 'Masked';
  weightPenalty: number;
}

export type DataClassification =
  | 'Public Operational'
  | 'Internal Telemetry'
  | 'Confidential PII'
  | 'Restricted Credentials';

export interface PrivacyInspectionRecord {
  id: string;
  timestamp: string;
  classification: DataClassification;
  decision: 'approved' | 'blocked';
  privacyScore: number;
  scoreBreakdown: string;
  explanation: string;
  flaggedFields: FlaggedFieldSummary[];
  redactedSummary: string;
  ruleApplied: string;
  byteLength: number;
}

export interface IncidentFingerprint {
  id: string;
  hash: string;
  category: string;
  severity: AlertSeverity;
  normalizedPattern: string;
  frequency: number;
  firstSeen: string;
  lastSeen: string;
  affectedComponentType: string;
}

export interface PredictiveWarning {
  id: string;
  systemId: string;
  systemName: string;
  category: SystemCategory;
  severity: 'warning' | 'critical';
  metric: 'CPU' | 'Memory' | 'Response Time';
  currentValue: number;
  threshold: number;
  trendDelta: number;
  ruleTriggered: string;
  explanation: string;
  recommendedMaintenance: string;
  detectedAt: string;
}

export interface VeilWatchSettings {
  organizationName: string;
  monitoringIntervalSec: 3 | 5 | 10 | 30;
  thresholds: {
    cpuWarning: number;
    cpuCritical: number;
    memoryWarning: number;
    memoryCritical: number;
    responseWarningMs: number;
    responseCriticalMs: number;
  };
  exportPolicy: ExportPolicyRules;
  notifications: {
    inAppBanner: boolean;
    browserNotifications: boolean;
  };
  theme: 'dark' | 'light';
}

export type SimulationScenario =
  | 'normal'
  | 'performance_anomaly'
  | 'suspicious_access'
  | 'sensitive_export'
  | 'app_downtime';
