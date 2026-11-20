import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { CpuMemoryChart, NetworkTrafficChart } from '../components/Charts';
import { InfoTooltip } from '../components/InfoTooltip';
import { useVeilWatch } from '../context/VeilWatchContext';
import { TimeRange } from '../types/veilwatch';

const TIME_RANGES: { id: TimeRange; label: string; sliceCount: number }[] = [
  { id: '15m', label: '15m', sliceCount: 6 },
  { id: '1h', label: '1h', sliceCount: 12 },
  { id: '6h', label: '6h', sliceCount: 18 },
  { id: '24h', label: '24h', sliceCount: 24 },
];

export const OverviewPage: React.FC = () => {
  const {
    systems,
    alerts,
    inspections,
    activity,
    telemetry,
    lastUpdated,
    settings,
    navigateToPage,
  } = useVeilWatch();

  const [timeRange, setTimeRange] = useState<TimeRange>('1h');

  const stats = useMemo(() => {
    const total = systems.length;
    const healthy = systems.filter((s) => s.status === 'healthy').length;
    const warning = systems.filter((s) => s.status === 'warning').length;
    const critical = systems.filter((s) => s.status === 'critical').length;

    const healthScore =
      total === 0
        ? 100
        : Math.max(
            0,
            Math.round(((healthy * 100 + warning * 62 + critical * 22) / (total * 100)) * 100)
          );

    const avgInspectionScore =
      inspections.length === 0
        ? 95
        : Math.round(
            inspections.reduce((acc, item) => acc + item.privacyScore, 0) / inspections.length
          );

    const enabledRulesCount = Object.values(settings.exportPolicy).filter(Boolean).length;
    const policyBonus = Math.round((enabledRulesCount / 6) * 8);
    const privacyProtectionScore = Math.min(100, Math.round(avgInspectionScore * 0.92 + policyBonus));

    return { total, healthy, warning, critical, healthScore, privacyProtectionScore };
  }, [inspections, settings.exportPolicy, systems]);

  const rangedTelemetry = useMemo(() => {
    const cfg = TIME_RANGES.find((t) => t.id === timeRange) || TIME_RANGES[1];
    const sliced = telemetry.slice(-cfg.sliceCount);
    if (timeRange === '15m') return sliced;
    // Slight deterministic scaling label for wider range context while keeping real telemetry series
    return sliced;
  }, [telemetry, timeRange]);

  const recentIncidents = useMemo(() => alerts.slice(0, 4), [alerts]);

  return (
    <div className="space-y-6">
      {/* Top Toolbar: Simulated Scope & Time Range Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-[var(--vw-gold)]">
            Simulated Infrastructure Overview · Local Privacy Telemetry
          </p>
          <div className="flex items-center gap-2 mt-1 text-xs text-[var(--vw-text-muted)]">
            <Clock className="w-3.5 h-3.5" />
            <span>
              Last updated:{' '}
              <span className="font-mono tabular-nums text-[var(--vw-text)]">
                {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--vw-surface)] border border-[var(--vw-border)] self-start sm:self-auto">
          {TIME_RANGES.map((range) => (
            <button
              key={range.id}
              type="button"
              onClick={() => setTimeRange(range.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                timeRange === range.id
                  ? 'bg-[var(--vw-gold-soft)] text-[var(--vw-gold)] border border-[var(--vw-gold)]/30'
                  : 'text-[var(--vw-text-muted)] hover:text-[var(--vw-text)]'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="vw-glass-card rounded-2xl p-5">
          <p className="text-xs text-[var(--vw-text-muted)] mb-2">Total Monitored</p>
          <p className="font-display text-3xl font-bold tabular-nums text-[var(--vw-text)]">
            {stats.total}
          </p>
          <p className="text-xs text-[var(--vw-text-muted)] mt-1">Simulated nodes</p>
        </div>

        <div className="vw-glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[var(--vw-text-muted)]">Healthy Systems</p>
            <CheckCircle2 className="w-4 h-4 text-[var(--vw-ok)]" />
          </div>
          <p className="font-display text-3xl font-bold tabular-nums text-[var(--vw-ok)]">
            {stats.healthy}
          </p>
          <p className="text-xs text-[var(--vw-text-muted)] mt-1">Within nominal range</p>
        </div>

        <div className="vw-glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[var(--vw-text-muted)]">Warning Systems</p>
            <AlertTriangle className="w-4 h-4 text-[var(--vw-warn)]" />
          </div>
          <p className="font-display text-3xl font-bold tabular-nums text-[var(--vw-warn)]">
            {stats.warning}
          </p>
          <p className="text-xs text-[var(--vw-text-muted)] mt-1">Approaching threshold</p>
        </div>

        <div className="vw-glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[var(--vw-text-muted)]">Critical Systems</p>
            <XCircle className="w-4 h-4 text-[var(--vw-crit)]" />
          </div>
          <p className="font-display text-3xl font-bold tabular-nums text-[var(--vw-crit)]">
            {stats.critical}
          </p>
          <p className="text-xs text-[var(--vw-text-muted)] mt-1">Immediate triage needed</p>
        </div>

        <div className="vw-glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-[var(--vw-text-muted)]">
              Infra Health
              <InfoTooltip
                label="Infrastructure Health"
                explanation="Weighted average of Healthy (100%), Warning (62%), and Critical (22%) simulated nodes."
              />
            </span>
            <Activity className="w-4 h-4 text-[var(--vw-amber)]" />
          </div>
          <p className="font-display text-3xl font-bold tabular-nums text-[var(--vw-gold)]">
            {stats.healthScore}%
          </p>
          <p className="text-xs text-[var(--vw-text-muted)] mt-1">Fleet composite</p>
        </div>

        <div className="vw-glass-card vw-gradient-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-[var(--vw-text-muted)]">
              Privacy Score
              <InfoTooltip
                label="Privacy Protection Score"
                explanation="Derived from local Privacy Leak Radar inspection outcomes (92%) and active export policy safeguards (8%)."
              />
            </span>
            <ShieldCheck className="w-4 h-4 text-[var(--vw-gold)]" />
          </div>
          <p className="font-display text-3xl font-bold tabular-nums text-[var(--vw-gold)]">
            {stats.privacyProtectionScore}
            <span className="text-sm font-normal text-[var(--vw-text-muted)]">/100</span>
          </p>
          <p className="text-xs text-[var(--vw-text-muted)] mt-1">Local policy posture</p>
        </div>
      </section>

      {/* Telemetry Charts */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="vw-glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-base font-bold text-[var(--vw-text)]">
                CPU & Memory Utilization
              </h2>
              <p className="text-xs text-[var(--vw-text-muted)]">
                Aggregated simulated node compute metrics · Window: {timeRange}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigateToPage('predictive-health')}
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--vw-gold)] hover:underline cursor-pointer"
            >
              Predictive Analysis <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-64">
            <CpuMemoryChart data={rangedTelemetry} theme={settings.theme} />
          </div>
        </div>

        <div className="vw-glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-base font-bold text-[var(--vw-text)]">
                Network Traffic & Sanitized Egress
              </h2>
              <p className="text-xs text-[var(--vw-text-muted)]">
                Simulated ingress vs locally sanitized egress throughput · Window: {timeRange}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigateToPage('infrastructure')}
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--vw-gold)] hover:underline cursor-pointer"
            >
              Inspect Nodes <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-64">
            <NetworkTrafficChart data={rangedTelemetry} theme={settings.theme} />
          </div>
        </div>
      </section>

      {/* Recent Incidents & Live Activity Feed */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Incidents */}
        <div className="vw-glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-base font-bold text-[var(--vw-text)]">
                Recent Incidents
              </h2>
              <p className="text-xs text-[var(--vw-text-muted)]">
                Latest simulated alerts with SHA-256 non-PII fingerprints
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigateToPage('smart-alerts')}
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--vw-gold)] hover:underline cursor-pointer"
            >
              Manage Alerts <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentIncidents.length === 0 ? (
            <p className="text-sm text-[var(--vw-text-muted)] py-8 text-center">
              No recent incidents recorded.
            </p>
          ) : (
            <div className="divide-y divide-[var(--vw-border)]">
              {recentIncidents.map((alert) => (
                <div
                  key={alert.id}
                  className="py-3.5 flex items-start justify-between gap-4 first:pt-1 last:pb-1"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-[var(--vw-text-muted)] mb-1">
                      <span
                        className={`font-mono uppercase font-semibold ${
                          alert.severity === 'critical'
                            ? 'text-[var(--vw-crit)]'
                            : alert.severity === 'high'
                              ? 'text-[var(--vw-warn)]'
                              : alert.severity === 'medium'
                                ? 'text-[var(--vw-gold)]'
                                : 'text-[var(--vw-text-muted)]'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{alert.systemName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{alert.status}</span>
                    </div>
                    <p className="text-sm font-medium text-[var(--vw-text)] truncate">
                      {alert.title}
                    </p>
                  </div>
                  <span className="text-xs font-mono tabular-nums text-[var(--vw-text-muted)] shrink-0">
                    {new Date(alert.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Activity Feed */}
        <div className="vw-glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-base font-bold text-[var(--vw-text)]">
                Live Activity Feed
              </h2>
              <p className="text-xs text-[var(--vw-text-muted)]">
                Real-time simulated sweep events & local privacy gate decisions
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigateToPage('privacy-radar')}
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--vw-gold)] hover:underline cursor-pointer"
            >
              Test Privacy Radar <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[var(--vw-border)] max-h-72 overflow-y-auto pr-1">
            {activity.slice(0, 7).map((item) => (
              <div key={item.id} className="py-3 flex items-start justify-between gap-4 first:pt-1">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--vw-text)]">{item.title}</p>
                  <p className="text-xs text-[var(--vw-text-muted)] mt-0.5">{item.detail}</p>
                </div>
                <span className="text-xs font-mono tabular-nums text-[var(--vw-text-muted)] shrink-0">
                  {new Date(item.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
