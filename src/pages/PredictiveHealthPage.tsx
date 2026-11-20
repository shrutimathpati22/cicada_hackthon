import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Cpu, TrendingUp, Wrench } from 'lucide-react';
import { PredictiveTrendChart } from '../components/Charts';
import { InfoTooltip } from '../components/InfoTooltip';
import { useVeilWatch } from '../context/VeilWatchContext';

export const PredictiveHealthPage: React.FC = () => {
  const { systems, predictiveWarnings, settings, navigateToPage } = useVeilWatch();

  const [selectedSystemId, setSelectedSystemId] = useState<string>(() => {
    const flagged = systems.find((s) => s.status !== 'healthy');
    return flagged?.id || systems[0]?.id || '';
  });

  const selectedSystem = useMemo(
    () => systems.find((s) => s.id === selectedSystemId) || systems[0] || null,
    [selectedSystemId, systems]
  );

  return (
    <div className="space-y-6">
      {/* Rule-Based Methodology Banner */}
      <section className="vw-glass-card vw-gradient-border rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Cpu className="w-5 h-5 text-[var(--vw-gold)] shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-sm sm:text-base font-bold">
                Rule-Based Early Warning Engine
              </h2>
              <InfoTooltip
                label="Rule-Based Early Warnings"
                explanation="Evaluates consecutive telemetry intervals for sustained threshold breaches and steep upward trends. These are deterministic heuristic warnings, not guaranteed future predictions."
              />
            </div>
            <p className="text-xs text-[var(--vw-text-muted)] mt-1 leading-relaxed">
              Continuously inspects simulated CPU, memory, and latency trends against your
              configured baselines ({settings.thresholds.cpuWarning}% CPU /{' '}
              {settings.thresholds.memoryWarning}% Memory / {settings.thresholds.responseWarningMs}
              ms Latency). Results are rule-based early warnings, not guaranteed future
              predictions.
            </p>
          </div>
        </div>

        <div className="font-mono text-xs tabular-nums shrink-0">
          <span className="text-[var(--vw-text-muted)] block">Active Early Warnings</span>
          <span className="text-2xl font-bold text-[var(--vw-gold)]">
            {predictiveWarnings.length}
          </span>
        </div>
      </section>

      {/* Performance Trend Chart for Selected Node */}
      <section className="vw-glass-card rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-base font-bold">
              Node Performance Trend & Baseline Threshold
            </h3>
            <p className="text-xs text-[var(--vw-text-muted)]">
              Inspect multi-interval CPU, memory, and scaled latency progression
            </p>
          </div>

          <select
            value={selectedSystem?.id || ''}
            onChange={(e) => setSelectedSystemId(e.target.value)}
            aria-label="Select simulated node for trend chart"
            className="px-3.5 py-2 rounded-xl bg-[var(--vw-bg)] border border-[var(--vw-border)] text-xs text-[var(--vw-text)] focus:outline-none focus:border-[var(--vw-gold)]"
          >
            {systems.map((sys) => (
              <option key={sys.id} value={sys.id}>
                {sys.id} — {sys.name} ({sys.status})
              </option>
            ))}
          </select>
        </div>

        {selectedSystem ? (
          <div className="h-72">
            <PredictiveTrendChart
              labels={selectedSystem.history.map((h) => h.label)}
              cpu={selectedSystem.history.map((h) => h.cpu)}
              memory={selectedSystem.history.map((h) => h.memory)}
              responseMs={selectedSystem.history.map((h) => h.responseMs)}
              cpuThreshold={settings.thresholds.cpuWarning}
              theme={settings.theme}
            />
          </div>
        ) : (
          <p className="text-xs text-[var(--vw-text-muted)] py-10 text-center">
            No monitored systems available. Add a simulated system in Infrastructure Monitor.
          </p>
        )}
      </section>

      {/* Early Warning Findings */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold">
            Detected Rule-Based Early Warnings ({predictiveWarnings.length})
          </h3>
          <button
            type="button"
            onClick={() => navigateToPage('settings')}
            className="text-xs font-medium text-[var(--vw-gold)] hover:underline cursor-pointer"
          >
            Tune Threshold Rules
          </button>
        </div>

        {predictiveWarnings.length === 0 ? (
          <div className="vw-glass-card rounded-2xl p-8 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[var(--vw-ok)] mx-auto" />
            <p className="font-display text-sm font-bold">
              No Sustained Threshold Breaches Detected
            </p>
            <p className="text-xs text-[var(--vw-text-muted)] max-w-md mx-auto">
              All active simulated nodes are operating below sustained rule thresholds. Trigger a
              Performance Anomaly in the Smart Alert Center to observe early warning escalation.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {predictiveWarnings.map((warn) => (
              <article key={warn.id} className="vw-glass-card rounded-2xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span
                        className={
                          warn.severity === 'critical'
                            ? 'text-[var(--vw-crit)] font-bold uppercase'
                            : 'text-[var(--vw-warn)] font-bold uppercase'
                        }
                      >
                        Rule-Based Early Warning · {warn.severity}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[var(--vw-text-muted)]">{warn.systemId}</span>
                    </div>
                    <h4 className="font-display text-sm sm:text-base font-bold mt-1">
                      {warn.systemName} — {warn.metric}
                    </h4>
                  </div>

                  <div className="text-right font-mono tabular-nums shrink-0">
                    <span className="text-lg font-bold text-[var(--vw-text)]">
                      {warn.currentValue}
                      {warn.metric === 'Response Time' ? 'ms' : '%'}
                    </span>
                    <span className="block text-[11px] text-[var(--vw-text-muted)]">
                      Delta {warn.trendDelta >= 0 ? `+${warn.trendDelta}` : warn.trendDelta}
                      {warn.metric === 'Response Time' ? 'ms' : '%'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[var(--vw-surface-muted)]/60 border border-[var(--vw-border)] text-xs space-y-1">
                  <p className="font-semibold text-[var(--vw-gold)] flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Rule Triggered: {warn.ruleTriggered}
                  </p>
                  <p className="text-[var(--vw-text-muted)] leading-relaxed">{warn.explanation}</p>
                </div>

                <div className="flex items-start gap-2 text-xs text-[var(--vw-text)]">
                  <Wrench className="w-4 h-4 text-[var(--vw-amber)] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Recommended Maintenance: </span>
                    <span className="text-[var(--vw-text-muted)]">
                      {warn.recommendedMaintenance}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--vw-border)] text-[11px] text-[var(--vw-text-muted)]">
                  <span className="inline-flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-[var(--vw-gold)]" />
                    Heuristic rule output (non-predictive guarantee)
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedSystemId(warn.systemId)}
                    className="text-[var(--vw-gold)] font-medium hover:underline cursor-pointer"
                  >
                    Focus in Chart
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
