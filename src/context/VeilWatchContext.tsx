import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityEvent,
  AlertItem,
  AlertSeverity,
  AlertStatus,
  IncidentFingerprint,
  MonitoredSystem,
  PageId,
  PredictiveWarning,
  PrivacyInspectionRecord,
  SimulationScenario,
  SystemCategory,
  TelemetryPoint,
  VeilWatchSettings,
} from '../types/veilwatch';
import {
  DEFAULT_SETTINGS,
  INITIAL_ACTIVITY,
  INITIAL_ALERTS,
  INITIAL_FINGERPRINTS,
  INITIAL_INSPECTIONS,
  INITIAL_SYSTEMS,
  INITIAL_TELEMETRY,
} from '../data/seedData';
import { buildNormalizedSignature, generatePrivacySafeHash } from '../utils/fingerprint';
import { analyzePredictiveWarnings } from '../utils/predictiveEngine';
import { inspectDataLocally } from '../utils/privacyEngine';

const STORAGE_KEYS = {
  systems: 'vw_systems_v1',
  alerts: 'vw_alerts_v1',
  inspections: 'vw_inspections_v1',
  fingerprints: 'vw_fingerprints_v1',
  settings: 'vw_settings_v1',
  activity: 'vw_activity_v1',
  telemetry: 'vw_telemetry_v1',
} as const;

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors cleanly
  }
}

interface NewSystemInput {
  name: string;
  category: SystemCategory;
  host: string;
  region: string;
  notes?: string;
}

interface VeilWatchContextValue {
  viewMode: 'landing' | 'dashboard';
  setViewMode: (mode: 'landing' | 'dashboard') => void;
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  navigateToPage: (page: PageId) => void;

  systems: MonitoredSystem[];
  alerts: AlertItem[];
  inspections: PrivacyInspectionRecord[];
  fingerprints: IncidentFingerprint[];
  activity: ActivityEvent[];
  telemetry: TelemetryPoint[];
  settings: VeilWatchSettings;
  predictiveWarnings: PredictiveWarning[];
  lastUpdated: string;
  toastMessage: { id: string; title: string; detail: string; level: 'info' | 'warning' | 'critical' | 'privacy' } | null;
  dismissToast: () => void;

  // Actions
  addSystem: (input: NewSystemInput) => Promise<{ ok: boolean; error?: string }>;
  toggleSystemMonitoring: (id: string) => void;
  removeSystem: (id: string) => void;
  updateAlertStatus: (id: string, status: AlertStatus) => void;
  runLocalPrivacyInspection: (rawInput: string) => Promise<PrivacyInspectionRecord>;
  recordFingerprintEvent: (params: {
    category: string;
    severity: AlertSeverity;
    componentType: string;
    patternCode: string;
  }) => Promise<IncidentFingerprint>;
  triggerSimulation: (scenario: SimulationScenario) => Promise<void>;
  updateSettings: (next: VeilWatchSettings) => void;
  requestBrowserNotifications: () => Promise<NotificationPermission | 'unsupported'>;
  browserNotificationPermission: NotificationPermission | 'unsupported';
  resetDemoData: () => void;
}

const VeilWatchContext = createContext<VeilWatchContextValue | null>(null);

export const VeilWatchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewMode, setViewMode] = useState<'landing' | 'dashboard'>('landing');
  const [activePage, setActivePage] = useState<PageId>('overview');

  const [systems, setSystems] = useState<MonitoredSystem[]>(() =>
    loadFromStorage(STORAGE_KEYS.systems, INITIAL_SYSTEMS)
  );
  const [alerts, setAlerts] = useState<AlertItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.alerts, INITIAL_ALERTS)
  );
  const [inspections, setInspections] = useState<PrivacyInspectionRecord[]>(() =>
    loadFromStorage(STORAGE_KEYS.inspections, INITIAL_INSPECTIONS)
  );
  const [fingerprints, setFingerprints] = useState<IncidentFingerprint[]>(() =>
    loadFromStorage(STORAGE_KEYS.fingerprints, INITIAL_FINGERPRINTS)
  );
  const [activity, setActivity] = useState<ActivityEvent[]>(() =>
    loadFromStorage(STORAGE_KEYS.activity, INITIAL_ACTIVITY)
  );
  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>(() =>
    loadFromStorage(STORAGE_KEYS.telemetry, INITIAL_TELEMETRY)
  );
  const [settings, setSettings] = useState<VeilWatchSettings>(() => {
    const loaded = loadFromStorage(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
    if (typeof window !== 'undefined' && !window.localStorage.getItem('vw_golden_theme_v2')) {
      window.localStorage.setItem('vw_golden_theme_v2', '1');
      return { ...loaded, theme: 'light' };
    }
    return loaded;
  });
  const [lastUpdated, setLastUpdated] = useState<string>(() => new Date().toISOString());
  const [toastMessage, setToastMessage] = useState<VeilWatchContextValue['toastMessage']>(null);
  const [browserNotificationPermission, setBrowserNotificationPermission] = useState<
    NotificationPermission | 'unsupported'
  >(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return window.Notification.permission;
  });

  // Sync theme to document root
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Persist state in localStorage
  useEffect(() => saveToStorage(STORAGE_KEYS.systems, systems), [systems]);
  useEffect(() => saveToStorage(STORAGE_KEYS.alerts, alerts), [alerts]);
  useEffect(() => saveToStorage(STORAGE_KEYS.inspections, inspections), [inspections]);
  useEffect(() => saveToStorage(STORAGE_KEYS.fingerprints, fingerprints), [fingerprints]);
  useEffect(() => saveToStorage(STORAGE_KEYS.activity, activity), [activity]);
  useEffect(() => saveToStorage(STORAGE_KEYS.telemetry, telemetry), [telemetry]);
  useEffect(() => saveToStorage(STORAGE_KEYS.settings, settings), [settings]);

  const showToast = useCallback(
    (title: string, detail: string, level: 'info' | 'warning' | 'critical' | 'privacy' = 'info') => {
      if (!settings.notifications.inAppBanner) return;
      const id = `toast-${Date.now()}`;
      setToastMessage({ id, title, detail, level });
    },
    [settings.notifications.inAppBanner]
  );

  const dismissToast = useCallback(() => setToastMessage(null), []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 5000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const emitBrowserNotification = useCallback(
    (title: string, body: string) => {
      if (
        settings.notifications.browserNotifications &&
        typeof window !== 'undefined' &&
        'Notification' in window &&
        window.Notification.permission === 'granted'
      ) {
        try {
          new window.Notification(title, { body });
        } catch {
          // Ignore browser notification exceptions in sandboxed frames
        }
      }
    },
    [settings.notifications.browserNotifications]
  );

  const navigateToPage = useCallback((page: PageId) => {
    setViewMode('dashboard');
    setActivePage(page);
  }, []);

  const recordFingerprintEvent = useCallback(
    async (params: {
      category: string;
      severity: AlertSeverity;
      componentType: string;
      patternCode: string;
    }): Promise<IncidentFingerprint> => {
      const normalizedPattern = buildNormalizedSignature(params);
      const hash = await generatePrivacySafeHash(normalizedPattern);
      const id = `VW-FP-${hash.slice(0, 8)}`;
      const now = new Date().toISOString();

      let matchedOrCreated: IncidentFingerprint = {
        id,
        hash,
        category: params.category,
        severity: params.severity,
        normalizedPattern,
        frequency: 1,
        firstSeen: now,
        lastSeen: now,
        affectedComponentType: params.componentType,
      };

      setFingerprints((prev) => {
        const existingIndex = prev.findIndex((f) => f.hash === hash);
        if (existingIndex >= 0) {
          const updated = [...prev];
          const existing = updated[existingIndex];
          matchedOrCreated = {
            ...existing,
            frequency: existing.frequency + 1,
            lastSeen: now,
            severity: params.severity,
          };
          updated[existingIndex] = matchedOrCreated;
          return updated;
        }
        return [matchedOrCreated, ...prev];
      });

      return matchedOrCreated;
    },
    []
  );

  const appendActivity = useCallback(
    (title: string, detail: string, level: ActivityEvent['level']) => {
      const entry: ActivityEvent = {
        id: `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
        timestamp: new Date().toISOString(),
        title,
        detail,
        level,
      };
      setActivity((prev) => [entry, ...prev].slice(0, 30));
    },
    []
  );

  // Simulated telemetry loop
  useEffect(() => {
    const intervalMs = settings.monitoringIntervalSec * 1000;
    const timer = window.setInterval(() => {
      const now = new Date();
      const label = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setSystems((prevSystems) => {
        const nextSystems = prevSystems.map((sys) => {
          if (!sys.monitoringActive) return sys;

          const jitterCpu = Math.round((Math.random() - 0.48) * 5);
          const jitterMem = Math.round((Math.random() - 0.48) * 3);
          const jitterRt = Math.round((Math.random() - 0.48) * 14);

          const cpu = Math.max(8, Math.min(99, sys.cpuUsage + jitterCpu));
          const memory = Math.max(15, Math.min(98, sys.memoryUsage + jitterMem));
          const responseTimeMs = Math.max(10, Math.min(600, sys.responseTimeMs + jitterRt));

          let status: MonitoredSystem['status'] = 'healthy';
          if (
            cpu >= settings.thresholds.cpuCritical ||
            memory >= settings.thresholds.memoryCritical ||
            responseTimeMs >= settings.thresholds.responseCriticalMs
          ) {
            status = 'critical';
          } else if (
            cpu >= settings.thresholds.cpuWarning ||
            memory >= settings.thresholds.memoryWarning ||
            responseTimeMs >= settings.thresholds.responseWarningMs
          ) {
            status = 'warning';
          }

          const nextHistory = [
            ...sys.history.slice(-11),
            { label, cpu, memory, responseMs: responseTimeMs },
          ];

          return {
            ...sys,
            cpuUsage: cpu,
            memoryUsage: memory,
            responseTimeMs,
            status,
            lastSeen: now.toISOString(),
            history: nextHistory,
          };
        });

        const activeNodes = nextSystems.filter((s) => s.monitoringActive);
        if (activeNodes.length > 0) {
          const avgCpu = Math.round(
            activeNodes.reduce((acc, s) => acc + s.cpuUsage, 0) / activeNodes.length
          );
          const avgMem = Math.round(
            activeNodes.reduce((acc, s) => acc + s.memoryUsage, 0) / activeNodes.length
          );
          const avgRt = Math.round(
            activeNodes.reduce((acc, s) => acc + s.responseTimeMs, 0) / activeNodes.length
          );

          setTelemetry((prevTel) => [
            ...prevTel.slice(-35),
            {
              timestamp: now.toISOString(),
              label,
              cpu: avgCpu,
              memory: avgMem,
              networkInMbps: Math.max(90, Math.round(210 + Math.random() * 110)),
              networkOutMbps: Math.max(60, Math.round(130 + Math.random() * 70)),
              responseMs: avgRt,
            },
          ]);
        }

        return nextSystems;
      });

      setLastUpdated(now.toISOString());
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [settings.monitoringIntervalSec, settings.thresholds]);

  const addSystem = useCallback(
    async (input: NewSystemInput): Promise<{ ok: boolean; error?: string }> => {
      try {
        const res = await fetch('/api/systems/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });
        const data = (await res.json()) as {
          valid?: boolean;
          errors?: string[];
          sanitized?: NewSystemInput;
        };

        if (!res.ok || !data.valid || !data.sanitized) {
          return {
            ok: false,
            error: data.errors?.[0] || 'Server validation rejected the system parameters.',
          };
        }

        const prefixMap: Record<SystemCategory, string> = {
          server: 'SRV',
          application: 'APP',
          network: 'NET',
          security: 'SEC',
        };
        const id = `${prefixMap[data.sanitized.category]}-${Math.floor(100 + Math.random() * 899)}`;
        const now = new Date();
        const label = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const baseCpu = 28 + Math.floor(Math.random() * 24);
        const baseMem = 34 + Math.floor(Math.random() * 26);
        const baseRt = 24 + Math.floor(Math.random() * 45);

        const newSystem: MonitoredSystem = {
          id,
          name: data.sanitized.name,
          category: data.sanitized.category,
          host: data.sanitized.host,
          region: data.sanitized.region,
          status: 'healthy',
          monitoringActive: true,
          uptimePercent: 100.0,
          cpuUsage: baseCpu,
          memoryUsage: baseMem,
          responseTimeMs: baseRt,
          lastSeen: now.toISOString(),
          notes: input.notes?.trim() || 'Simulated node added via Infrastructure Monitor.',
          history: [
            { label, cpu: baseCpu - 2, memory: baseMem - 1, responseMs: baseRt - 3 },
            { label, cpu: baseCpu, memory: baseMem, responseMs: baseRt },
          ],
        };

        setSystems((prev) => [newSystem, ...prev]);
        appendActivity(
          `Added simulated node ${newSystem.id}`,
          `${newSystem.name} (${newSystem.category}) registered in ${newSystem.region}.`,
          'info'
        );
        showToast('Demo System Registered', `${newSystem.name} is now active in simulated monitoring.`, 'info');
        return { ok: true };
      } catch {
        return { ok: false, error: 'Unable to validate system with local server.' };
      }
    },
    [appendActivity, showToast]
  );

  const toggleSystemMonitoring = useCallback(
    (id: string) => {
      setSystems((prev) =>
        prev.map((sys) => {
          if (sys.id !== id) return sys;
          const nextActive = !sys.monitoringActive;
          appendActivity(
            `${nextActive ? 'Resumed' : 'Paused'} monitoring on ${sys.id}`,
            `${sys.name} telemetry collection ${nextActive ? 'started' : 'paused'}.`,
            'info'
          );
          return { ...sys, monitoringActive: nextActive, lastSeen: new Date().toISOString() };
        })
      );
    },
    [appendActivity]
  );

  const removeSystem = useCallback(
    (id: string) => {
      setSystems((prev) => {
        const target = prev.find((s) => s.id === id);
        if (target) {
          appendActivity(
            `Removed simulated node ${target.id}`,
            `${target.name} removed from active inventory.`,
            'warning'
          );
        }
        return prev.filter((s) => s.id !== id);
      });
    },
    [appendActivity]
  );

  const updateAlertStatus = useCallback(
    (id: string, status: AlertStatus) => {
      setAlerts((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a;
          appendActivity(
            `Alert ${a.id} marked ${status}`,
            `${a.title} (${a.systemName})`,
            status === 'resolved' ? 'info' : 'warning'
          );
          return { ...a, status };
        })
      );
    },
    [appendActivity]
  );

  const runLocalPrivacyInspection = useCallback(
    async (rawInput: string): Promise<PrivacyInspectionRecord> => {
      // Strictly local in-browser processing; rawInput is NEVER sent over network or stored
      const result = inspectDataLocally(rawInput, settings.exportPolicy);
      setInspections((prev) => [result, ...prev].slice(0, 50));

      if (result.decision === 'blocked') {
        const fp = await recordFingerprintEvent({
          category: 'privacy',
          severity: 'high',
          componentType: 'Privacy Leak Radar',
          patternCode: `blocked_${result.classification.replace(/\s+/g, '_')}`,
        });

        const alertId = `ALT-${Math.floor(1100 + Math.random() * 8899)}`;
        const newAlert: AlertItem = {
          id: alertId,
          title: `Blocked Sensitive Export (${result.classification})`,
          description: `Privacy Leak Radar intercepted ${result.flaggedFields.reduce(
            (s, f) => s + f.count,
            0
          )} flagged field(s) locally. Raw input discarded immediately.`,
          severity: 'high',
          status: 'active',
          category: 'privacy',
          systemId: 'SEC-DLP-01',
          systemName: 'Edge Privacy Policy Enforcer',
          timestamp: new Date().toISOString(),
          recommendedAction:
            'Review export policy rules and use sanitized telemetry schema before forwarding logs.',
          fingerprintId: fp.id,
          simulationSource: 'Privacy Leak Radar',
        };
        setAlerts((prev) => [newAlert, ...prev]);
        appendActivity(
          'Privacy Leak Radar blocked sensitive payload',
          `${result.classification} intercepted locally (${fp.id}).`,
          'privacy'
        );
        showToast('Sensitive Export Blocked', result.ruleApplied, 'privacy');
        emitBrowserNotification('VEILWATCH Privacy Alert', result.ruleApplied);
      } else {
        appendActivity(
          'Privacy Leak Radar approved sanitized summary',
          `Classification: ${result.classification} · Score ${result.privacyScore}/100.`,
          'info'
        );
        showToast(
          'Sanitized Summary Ready',
          `Privacy score ${result.privacyScore}/100 · Approved for export.`,
          'info'
        );
      }

      return result;
    },
    [
      appendActivity,
      emitBrowserNotification,
      recordFingerprintEvent,
      settings.exportPolicy,
      showToast,
    ]
  );

  const triggerSimulation = useCallback(
    async (scenario: SimulationScenario) => {
      const now = new Date();
      const label = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      if (scenario === 'normal') {
        setSystems((prev) =>
          prev.map((s) => ({
            ...s,
            status: 'healthy',
            cpuUsage: Math.min(54, Math.max(22, s.cpuUsage - 18)),
            memoryUsage: Math.min(64, Math.max(32, s.memoryUsage - 12)),
            responseTimeMs: Math.min(75, Math.max(18, s.responseTimeMs - 45)),
            lastSeen: now.toISOString(),
            history: [
              ...s.history.slice(-11),
              {
                label,
                cpu: Math.min(54, Math.max(22, s.cpuUsage - 18)),
                memory: Math.min(64, Math.max(32, s.memoryUsage - 12)),
                responseMs: Math.min(75, Math.max(18, s.responseTimeMs - 45)),
              },
            ],
          }))
        );

        const fp = await recordFingerprintEvent({
          category: 'server',
          severity: 'low',
          componentType: 'Telemetry Cluster',
          patternCode: 'nominal_baseline_verified',
        });

        const alert: AlertItem = {
          id: `ALT-${Math.floor(1100 + Math.random() * 8899)}`,
          title: 'Simulated Baseline: Normal Operation Verified',
          description:
            'Simulated infrastructure sweep confirmed balanced CPU, memory, and response latency across active nodes.',
          severity: 'low',
          status: 'active',
          category: 'server',
          systemId: 'SRV-CORE-01',
          systemName: 'Core Telemetry Collector 01',
          timestamp: now.toISOString(),
          recommendedAction: 'No intervention required; continue routine simulated observation.',
          fingerprintId: fp.id,
          simulationSource: 'Simulation Panel',
        };
        setAlerts((prev) => [alert, ...prev]);
        appendActivity('Simulated normal operation sweep', 'Baseline telemetry normalized across cluster.', 'info');
        showToast('Normal Operation Simulated', 'All node baselines restored to nominal ranges.', 'info');
        return;
      }

      if (scenario === 'performance_anomaly') {
        setSystems((prev) =>
          prev.map((s) => {
            if (s.id !== 'SRV-VAULT-02' && s.category !== 'server') return s;
            const nextCpu = Math.min(95, Math.max(82, s.cpuUsage + 14));
            const nextMem = Math.min(93, Math.max(84, s.memoryUsage + 8));
            const nextRt = Math.min(360, s.responseTimeMs + 95);
            return {
              ...s,
              status: nextCpu >= 90 ? 'critical' : 'warning',
              cpuUsage: nextCpu,
              memoryUsage: nextMem,
              responseTimeMs: nextRt,
              lastSeen: now.toISOString(),
              history: [...s.history.slice(-11), { label, cpu: nextCpu, memory: nextMem, responseMs: nextRt }],
            };
          })
        );

        const fp = await recordFingerprintEvent({
          category: 'server',
          severity: 'high',
          componentType: 'Worker Compute Node',
          patternCode: 'cpu_memory_anomaly_spike',
        });

        const alert: AlertItem = {
          id: `ALT-${Math.floor(1100 + Math.random() * 8899)}`,
          title: 'Simulated Performance Anomaly on Local Redaction Worker 02',
          description:
            'CPU and memory climbed abruptly past threshold baselines with elevated queue wait latency.',
          severity: 'high',
          status: 'active',
          category: 'server',
          systemId: 'SRV-VAULT-02',
          systemName: 'Local Redaction Worker 02',
          timestamp: now.toISOString(),
          recommendedAction:
            'Inspect Predictive Health early warnings and rebalance simulated worker concurrency.',
          fingerprintId: fp.id,
          simulationSource: 'Simulation Panel',
        };
        setAlerts((prev) => [alert, ...prev]);
        appendActivity('Simulated performance anomaly triggered', `${alert.systemName} entered warning/critical load.`, 'warning');
        showToast('Performance Anomaly Generated', alert.title, 'warning');
        emitBrowserNotification('VEILWATCH High Alert', alert.title);
        return;
      }

      if (scenario === 'suspicious_access') {
        setSystems((prev) =>
          prev.map((s) =>
            s.id === 'SEC-SIEM-02' || s.id === 'APP-AUTH-01'
              ? {
                  ...s,
                  status: s.id === 'SEC-SIEM-02' ? 'critical' : 'warning',
                  cpuUsage: Math.min(96, s.cpuUsage + 18),
                  responseTimeMs: Math.min(410, s.responseTimeMs + 110),
                  lastSeen: now.toISOString(),
                }
              : s
          )
        );

        const fp = await recordFingerprintEvent({
          category: 'security',
          severity: 'critical',
          componentType: 'Identity Gateway',
          patternCode: 'unusual_token_probe_burst',
        });

        const alert: AlertItem = {
          id: `ALT-${Math.floor(1100 + Math.random() * 8899)}`,
          title: 'Simulated Suspicious Access Pattern Detected',
          description:
            'Simulated burst of repeated failed token assertions detected at Zero-Trust Identity Gateway without exposing user PII.',
          severity: 'critical',
          status: 'active',
          category: 'security',
          systemId: 'APP-AUTH-01',
          systemName: 'Zero-Trust Identity Gateway',
          timestamp: now.toISOString(),
          recommendedAction:
            'Apply temporary rate limiting on source ASN and rotate synthetic test session keys.',
          fingerprintId: fp.id,
          simulationSource: 'Simulation Panel',
        };
        setAlerts((prev) => [alert, ...prev]);
        appendActivity('Suspicious access pattern simulated', `Fingerprint ${fp.id} incremented.`, 'critical');
        showToast('Critical Security Alert', alert.title, 'critical');
        emitBrowserNotification('VEILWATCH Critical Security Alert', alert.title);
        return;
      }

      if (scenario === 'sensitive_export') {
        const syntheticPayload = JSON.stringify({
          event: 'diagnostic_export_attempt',
          operator_email: 'auditor.demo@example.invalid',
          contact_phone: '555-019-4821',
          api_key: 'sk_test_synthetic99887766',
          node_ip: '10.24.88.14',
        });
        await runLocalPrivacyInspection(syntheticPayload);
        return;
      }

      if (scenario === 'app_downtime') {
        setSystems((prev) =>
          prev.map((s) =>
            s.id === 'APP-BILL-02'
              ? {
                  ...s,
                  status: 'critical',
                  uptimePercent: Number(Math.max(96.5, s.uptimePercent - 0.35).toFixed(2)),
                  responseTimeMs: 540,
                  cpuUsage: 94,
                  lastSeen: now.toISOString(),
                  history: [
                    ...s.history.slice(-11),
                    { label, cpu: 94, memory: 89, responseMs: 540 },
                  ],
                }
              : s
          )
        );

        const fp = await recordFingerprintEvent({
          category: 'application',
          severity: 'critical',
          componentType: 'Application Microservice',
          patternCode: 'service_healthcheck_timeout',
        });

        const alert: AlertItem = {
          id: `ALT-${Math.floor(1100 + Math.random() * 8899)}`,
          title: 'Simulated Application Downtime: Billing Ledger Microservice',
          description:
            'Health probe returned simulated HTTP 503 timeout (540ms) on ledger-api.app.demo.',
          severity: 'critical',
          status: 'active',
          category: 'application',
          systemId: 'APP-BILL-02',
          systemName: 'Billing Ledger Microservice',
          timestamp: now.toISOString(),
          recommendedAction:
            'Failover to standby enclave replica and inspect sanitized error fingerprint.',
          fingerprintId: fp.id,
          simulationSource: 'Simulation Panel',
        };
        setAlerts((prev) => [alert, ...prev]);
        appendActivity('Simulated application downtime triggered', `${alert.systemName} unreachable (540ms).`, 'critical');
        showToast('Application Downtime Simulated', alert.title, 'critical');
        emitBrowserNotification('VEILWATCH Application Downtime', alert.title);
      }
    },
    [
      appendActivity,
      emitBrowserNotification,
      recordFingerprintEvent,
      runLocalPrivacyInspection,
      showToast,
    ]
  );

  const updateSettings = useCallback(
    (next: VeilWatchSettings) => {
      setSettings(next);
      appendActivity('Updated workspace settings', `Organization: ${next.organizationName}`, 'info');
      showToast('Settings Saved', 'Workspace configuration persisted locally.', 'info');
    },
    [appendActivity, showToast]
  );

  const requestBrowserNotifications = useCallback(async (): Promise<
    NotificationPermission | 'unsupported'
  > => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setBrowserNotificationPermission('unsupported');
      return 'unsupported';
    }
    const perm = await window.Notification.requestPermission();
    setBrowserNotificationPermission(perm);
    if (perm === 'granted') {
      setSettings((prev) => ({
        ...prev,
        notifications: { ...prev.notifications, browserNotifications: true },
      }));
      showToast('Browser Notifications Enabled', 'Alerts will notify you when triggered.', 'info');
    } else {
      showToast('Permission Not Granted', `Browser notification status: ${perm}.`, 'warning');
    }
    return perm;
  }, [showToast]);

  const resetDemoData = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach((k) => window.localStorage.removeItem(k));
    setSystems(INITIAL_SYSTEMS);
    setAlerts(INITIAL_ALERTS);
    setInspections(INITIAL_INSPECTIONS);
    setFingerprints(INITIAL_FINGERPRINTS);
    setActivity(INITIAL_ACTIVITY);
    setTelemetry(INITIAL_TELEMETRY);
    setSettings(DEFAULT_SETTINGS);
    setLastUpdated(new Date().toISOString());
    showToast('Demo Data Reset', 'All simulated nodes, alerts, and policies restored to initial defaults.', 'info');
  }, [showToast]);

  const predictiveWarnings = useMemo(
    () => analyzePredictiveWarnings(systems, settings.thresholds),
    [systems, settings.thresholds]
  );

  const value: VeilWatchContextValue = {
    viewMode,
    setViewMode,
    activePage,
    setActivePage,
    navigateToPage,
    systems,
    alerts,
    inspections,
    fingerprints,
    activity,
    telemetry,
    settings,
    predictiveWarnings,
    lastUpdated,
    toastMessage,
    dismissToast,
    addSystem,
    toggleSystemMonitoring,
    removeSystem,
    updateAlertStatus,
    runLocalPrivacyInspection,
    recordFingerprintEvent,
    triggerSimulation,
    updateSettings,
    requestBrowserNotifications,
    browserNotificationPermission,
    resetDemoData,
  };

  return <VeilWatchContext.Provider value={value}>{children}</VeilWatchContext.Provider>;
};

export function useVeilWatch(): VeilWatchContextValue {
  const ctx = useContext(VeilWatchContext);
  if (!ctx) throw new Error('useVeilWatch must be used inside VeilWatchProvider');
  return ctx;
}
