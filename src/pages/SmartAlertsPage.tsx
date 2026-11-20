import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Cpu,
  Lock,
  RotateCcw,
  Search,
  ServerCrash,
  ShieldAlert,
} from 'lucide-react';
import { useVeilWatch } from '../context/VeilWatchContext';
import { AlertSeverity, AlertStatus, SimulationScenario } from '../types/veilwatch';

const SIMULATION_SCENARIOS: {
  id: SimulationScenario;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'normal',
    label: 'Normal operation',
    description: 'Normalize baseline metrics & emit low-severity sweep.',
    icon: CheckCircle2,
  },
  {
    id: 'performance_anomaly',
    label: 'Performance anomaly',
    description: 'Spike compute CPU & memory past warning thresholds.',
    icon: Cpu,
  },
  {
    id: 'suspicious_access',
    label: 'Suspicious access pattern',
    description: 'Trigger repeated failed token assertion burst.',
    icon: ShieldAlert,
  },
  {
    id: 'sensitive_export',
    label: 'Sensitive data export attempt',
    description: 'Run synthetic PII/credential payload through Privacy Radar.',
    icon: Lock,
  },
  {
    id: 'app_downtime',
    label: 'Application downtime',
    description: 'Simulate microservice 503 timeout on Billing Ledger.',
    icon: ServerCrash,
  },
];

export const SmartAlertsPage: React.FC = () => {
  const {
    alerts,
    updateAlertStatus,
    triggerSimulation,
    requestBrowserNotifications,
    browserNotificationPermission,
  } = useVeilWatch();

  const [severityFilter, setSeverityFilter] = useState<'all' | AlertSeverity>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | AlertStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [simulating, setSimulating] = useState<SimulationScenario | null>(null);

  const filteredAlerts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return alerts.filter((a) => {
      if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (q) {
        const hay = `${a.id} ${a.title} ${a.description} ${a.systemName} ${a.fingerprintId}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [alerts, searchQuery, severityFilter, statusFilter]);

  const handleSimulate = async (id: SimulationScenario) => {
    setSimulating(id);
    await triggerSimulation(id);
    setSimulating(null);
  };

  return (
    <div className="space-y-6">
      {/* Simulation Control Panel */}
      <section className="vw-glass-card vw-gradient-border rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--vw-gold)]" />
              <h2 className="font-display text-base font-bold">Event Simulation Panel</h2>
            </div>
            <p className="text-xs text-[var(--vw-text-muted)] mt-1">
              Trigger simulated operational or security events to test alert routing, KPIs, and
              non-PII incident fingerprinting.
            </p>
          </div>

          <button
            type="button"
            onClick={requestBrowserNotifications}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--vw-border)] bg-[var(--vw-surface-muted)] hover:border-[var(--vw-gold)]/60 text-[var(--vw-text)] transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 text-[var(--vw-gold)]" />
            {browserNotificationPermission === 'granted'
              ? 'Browser Notifications Active'
              : browserNotificationPermission === 'denied'
                ? 'Notifications Blocked by Browser'
                : browserNotificationPermission === 'unsupported'
                  ? 'Browser Notifications Unsupported'
                  : 'Enable Browser Notifications'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {SIMULATION_SCENARIOS.map((sc) => {
            const Icon = sc.icon;
            const busy = simulating === sc.id;
            return (
              <button
                key={sc.id}
                type="button"
                disabled={busy}
                onClick={() => handleSimulate(sc.id)}
                className="p-4 rounded-xl text-left border border-[var(--vw-border)] bg-[var(--vw-bg)]/70 hover:border-[var(--vw-gold)]/60 hover:bg-[var(--vw-surface-muted)]/60 transition-colors cursor-pointer disabled:opacity-60"
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-4 h-4 text-[var(--vw-gold)]" />
                  <span className="text-[11px] font-mono text-[var(--vw-text-muted)]">
                    {busy ? 'Running...' : 'Simulate'}
                  </span>
                </div>
                <p className="text-xs font-semibold text-[var(--vw-text)] mb-1">{sc.label}</p>
                <p className="text-[11px] text-[var(--vw-text-muted)] leading-snug">
                  {sc.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="vw-glass-card rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--vw-surface-muted)]/70 border border-[var(--vw-border)]">
            {(['all', 'low', 'medium', 'high', 'critical'] as const).map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  severityFilter === sev
                    ? 'bg-[var(--vw-gold-soft)] text-[var(--vw-gold)]'
                    : 'text-[var(--vw-text-muted)] hover:text-[var(--vw-text)]'
                }`}
              >
                {sev === 'all' ? 'All Severities' : sev}
              </button>
            ))}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            aria-label="Filter alerts by status"
            className="px-3 py-2 rounded-xl bg-[var(--vw-bg)] border border-[var(--vw-border)] text-xs text-[var(--vw-text)] focus:outline-none focus:border-[var(--vw-gold)]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-[var(--vw-text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alert history..."
            aria-label="Search alert history"
            className="w-full sm:w-64 pl-9 pr-3 py-2 rounded-xl bg-[var(--vw-bg)] border border-[var(--vw-border)] text-xs text-[var(--vw-text)] placeholder:text-[var(--vw-text-muted)] focus:outline-none focus:border-[var(--vw-gold)]"
          />
        </div>
      </section>

      {/* Alert List */}
      {filteredAlerts.length === 0 ? (
        <div className="vw-glass-card rounded-2xl p-10 text-center">
          <p className="font-display text-base font-semibold mb-1">
            No alerts match the selected filters
          </p>
          <p className="text-xs text-[var(--vw-text-muted)] mb-4">
            Adjust severity/status filters or trigger a simulation event above.
          </p>
          <button
            type="button"
            onClick={() => {
              setSeverityFilter('all');
              setStatusFilter('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--vw-border)] bg-[var(--vw-surface-muted)] cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <article
              key={alert.id}
              className="vw-glass-card rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className={`inline-flex items-center gap-1 font-mono font-bold uppercase ${
                      alert.severity === 'critical'
                        ? 'text-[var(--vw-crit)]'
                        : alert.severity === 'high'
                          ? 'text-[var(--vw-warn)]'
                          : alert.severity === 'medium'
                            ? 'text-[var(--vw-gold)]'
                            : 'text-[var(--vw-text-muted)]'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {alert.severity}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-[var(--vw-text-muted)]">{alert.id}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[var(--vw-text)] font-medium">{alert.systemName}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-[var(--vw-gold)]">{alert.fingerprintId}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums text-[var(--vw-text-muted)]">
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                </div>

                <h3 className="font-display text-sm sm:text-base font-bold text-[var(--vw-text)]">
                  {alert.title}
                </h3>

                <p className="text-xs text-[var(--vw-text-muted)] leading-relaxed">
                  {alert.description}
                </p>

                <p className="text-xs text-[var(--vw-text)]">
                  <span className="font-semibold text-[var(--vw-gold)]">Recommended Action: </span>
                  {alert.recommendedAction}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <span className="text-xs font-mono uppercase text-[var(--vw-text-muted)] mr-2">
                  Status: <strong className="text-[var(--vw-text)]">{alert.status}</strong>
                </span>

                {alert.status === 'active' && (
                  <button
                    type="button"
                    onClick={() => updateAlertStatus(alert.id, 'acknowledged')}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-[var(--vw-border)] bg-[var(--vw-surface-muted)] hover:border-[var(--vw-amber)] text-[var(--vw-gold)] transition-colors cursor-pointer"
                  >
                    Acknowledge
                  </button>
                )}

                {alert.status !== 'resolved' ? (
                  <button
                    type="button"
                    onClick={() => updateAlertStatus(alert.id, 'resolved')}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-emerald-600/35 bg-emerald-500/12 hover:bg-emerald-500/20 text-[var(--vw-ok)] transition-colors cursor-pointer"
                  >
                    Resolve
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => updateAlertStatus(alert.id, 'active')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-[var(--vw-border)] hover:border-[var(--vw-gold)] text-[var(--vw-text)] transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reopen
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
