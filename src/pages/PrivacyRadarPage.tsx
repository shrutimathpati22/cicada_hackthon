import React, { useMemo, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  Lock,
  Radar,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { InfoTooltip } from '../components/InfoTooltip';
import { useVeilWatch } from '../context/VeilWatchContext';
import { ExportPolicyRules, PrivacyInspectionRecord } from '../types/veilwatch';

const SYNTHETIC_SAMPLES: { label: string; payload: string }[] = [
  {
    label: 'Synthetic Auth & PII Event',
    payload: JSON.stringify(
      {
        timestamp: '2026-11-20T08:30:00Z',
        service: 'auth-gw-demo',
        operator_email: 'elena.vance@example.invalid',
        recovery_phone: '+1 (415) 555-0192',
        api_key: 'sk_test_99441122synthetic',
        source_ip: '10.42.18.91',
        status: 'token_refresh_denied',
      },
      null,
      2
    ),
  },
  {
    label: 'Customer Support Diagnostic',
    payload:
      'Support trace for user contact: marcus.chen@example.invalid | callback: 555-014-8832 | internal host: 192.168.14.22 | latency: 142ms',
  },
  {
    label: 'Clean Operational Metric',
    payload: JSON.stringify(
      {
        node_id: 'SRV-CORE-01',
        cpu_utilization_pct: 41.2,
        memory_utilization_pct: 55.8,
        p95_latency_ms: 34,
        health: 'nominal',
      },
      null,
      2
    ),
  },
];

export const PrivacyRadarPage: React.FC = () => {
  const { inspections, runLocalPrivacyInspection, settings, updateSettings } = useVeilWatch();

  const [rawInput, setRawInput] = useState('');
  const [inputError, setInputError] = useState('');
  const [latestResult, setLatestResult] = useState<PrivacyInspectionRecord | null>(
    inspections[0] || null
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const blocked = inspections.filter((i) => i.decision === 'blocked').length;
    const approved = inspections.filter((i) => i.decision === 'approved').length;
    return { blocked, approved };
  }, [inspections]);

  const handleInspect = async (e: React.FormEvent) => {
    e.preventDefault();
    setInputError('');
    if (!rawInput.trim()) {
      setInputError('Enter synthetic sample event text or JSON to inspect locally.');
      return;
    }

    const result = await runLocalPrivacyInspection(rawInput);
    setLatestResult(result);
    // Clear raw sensitive input immediately after local inspection
    setRawInput('');
  };

  const togglePolicyRule = (key: keyof ExportPolicyRules) => {
    updateSettings({
      ...settings,
      exportPolicy: {
        ...settings.exportPolicy,
        [key]: !settings.exportPolicy[key],
      },
    });
  };

  const handleCopySummary = async (record: PrivacyInspectionRecord) => {
    try {
      await navigator.clipboard.writeText(record.redactedSummary);
      setCopiedId(record.id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Ignore clipboard failures in restricted environments
    }
  };

  return (
    <div className="space-y-6">
      {/* Prototype Boundary Disclosure */}
      <div className="vw-glass-card vw-gradient-border rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <Lock className="w-5 h-5 text-[var(--vw-gold)] shrink-0 mt-0.5" />
          <div>
            <h2 className="font-display text-sm sm:text-base font-bold text-[var(--vw-text)]">
              Local-Only Privacy Inspection Engine (Prototype)
            </h2>
            <p className="text-xs text-[var(--vw-text-muted)] leading-relaxed mt-1">
              All text entered below is inspected strictly in browser memory. Raw input is never
              transmitted to external services, never written to localStorage or logs, and cleared
              automatically after inspection. This is a hackathon prototype detection engine, not a
              certified enterprise DLP system.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5 shrink-0 font-mono text-xs tabular-nums">
          <div>
            <span className="block text-[var(--vw-text-muted)]">Approved</span>
            <span className="text-lg font-bold text-[var(--vw-ok)]">{counts.approved}</span>
          </div>
          <div>
            <span className="block text-[var(--vw-text-muted)]">Blocked</span>
            <span className="text-lg font-bold text-[var(--vw-crit)]">{counts.blocked}</span>
          </div>
        </div>
      </div>

      {/* Main Split: Interactive Test Console + Configurable Demo Export Policy */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Test Console */}
        <section className="xl:col-span-7 vw-glass-card rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Radar className="w-4 h-4 text-[var(--vw-gold)]" />
              <h3 className="font-display text-base font-bold">Interactive Inspection Console</h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {SYNTHETIC_SAMPLES.map((sample) => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => {
                    setRawInput(sample.payload);
                    setInputError('');
                  }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium border border-[var(--vw-border)] bg-[var(--vw-surface-muted)]/60 hover:border-[var(--vw-gold)]/50 text-[var(--vw-text-muted)] hover:text-[var(--vw-text)] transition-colors cursor-pointer"
                >
                  Load: {sample.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleInspect} className="space-y-4">
            <div>
              <label
                htmlFor="privacy-console-input"
                className="block text-xs text-[var(--vw-text-muted)] mb-2"
              >
                Synthetic Event Payload (JSON, log line, or diagnostic text — auto-cleared on
                inspect)
              </label>
              <textarea
                id="privacy-console-input"
                rows={7}
                value={rawInput}
                onChange={(e) => {
                  setRawInput(e.target.value);
                  if (inputError) setInputError('');
                }}
                placeholder='Paste synthetic payload e.g. {"email":"demo@example.invalid","api_key":"sk_test_12345678","cpu":42}'
                className="w-full p-4 rounded-xl bg-[var(--vw-bg)] border border-[var(--vw-border)] font-mono text-xs text-[var(--vw-text)] placeholder:text-[var(--vw-text-muted)]/60 focus:outline-none focus:border-[var(--vw-gold)]"
              />
              {inputError && <p className="text-xs text-[var(--vw-crit)] mt-1.5">{inputError}</p>}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-[var(--vw-text-muted)]">
                Detects emails, phone numbers, synthetic credentials, financial IDs, and private
                IPv4s.
              </span>
              <button
                type="submit"
                className="vw-gradient-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Inspect Data
              </button>
            </div>
          </form>
        </section>

        {/* Configurable Demo Export Rules */}
        <section className="xl:col-span-5 vw-glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold">Demo Export Policy Rules</h3>
              <p className="text-xs text-[var(--vw-text-muted)]">
                Configure allow/block behavior applied locally before summary export
              </p>
            </div>
            <InfoTooltip
              label="Local Export Policy"
              explanation="Controls whether payloads containing synthetic credentials or PII are hard-blocked or redacted into a sanitized summary."
            />
          </div>

          <div className="divide-y divide-[var(--vw-border)] text-xs">
            {(
              [
                {
                  key: 'blockOnCredentials',
                  label: 'Block Export on Credential-Like Fields',
                  desc: 'Rejects external summaries when API keys, tokens, or passwords appear.',
                },
                {
                  key: 'blockOnPII',
                  label: 'Block Export on PII Detection',
                  desc: 'Blocks summaries when emails, phone numbers, or IDs are present.',
                },
                {
                  key: 'redactEmails',
                  label: 'Redact Email Addresses Locally',
                  desc: 'Replaces email patterns with [REDACTED_EMAIL].',
                },
                {
                  key: 'redactPhones',
                  label: 'Redact Phone Numbers Locally',
                  desc: 'Replaces phone numbers with [REDACTED_PHONE].',
                },
                {
                  key: 'redactInternalIps',
                  label: 'Mask Internal Private IPv4s',
                  desc: 'Masks RFC1918 host addresses with [INTERNAL_HOST_REDACTED].',
                },
                {
                  key: 'allowSanitizedSummaryExport',
                  label: 'Allow Sanitized Summary Export',
                  desc: 'Permits exporting redacted summaries when no hard block rules trigger.',
                },
              ] as const
            ).map((rule) => {
              const checked = settings.exportPolicy[rule.key];
              return (
                <label
                  key={rule.key}
                  className="py-3 flex items-start justify-between gap-4 cursor-pointer first:pt-1 last:pb-1"
                >
                  <div>
                    <span className="font-semibold text-[var(--vw-text)] block">
                      {rule.label}
                    </span>
                    <span className="text-[var(--vw-text-muted)]">{rule.desc}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => togglePolicyRule(rule.key)}
                    className="mt-1 h-4 w-4 accent-[#D99A25] cursor-pointer shrink-0"
                  />
                </label>
              );
            })}
          </div>
        </section>
      </div>

      {/* Latest Inspection Outcome */}
      {latestResult && (
        <section className="vw-glass-card rounded-2xl p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--vw-border)] pb-4">
            <div className="flex items-start gap-3">
              {latestResult.decision === 'blocked' ? (
                <ShieldAlert className="w-6 h-6 text-[var(--vw-crit)] shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-[var(--vw-ok)] vw-shield-glow shrink-0 mt-0.5" />
              )}
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  <span
                    className={
                      latestResult.decision === 'blocked'
                        ? 'text-[var(--vw-crit)] font-bold uppercase'
                        : 'text-[var(--vw-ok)] font-bold uppercase'
                    }
                  >
                    {latestResult.decision === 'blocked'
                      ? 'Export Blocked'
                      : 'Approved for Summary Export'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[var(--vw-gold)]">{latestResult.classification}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[var(--vw-text-muted)]">
                    {latestResult.byteLength} bytes inspected locally
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold mt-1">{latestResult.ruleApplied}</h3>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p className="text-[11px] text-[var(--vw-text-muted)] inline-flex items-center gap-1">
                  Privacy Score
                  <InfoTooltip
                    label="Transparent Scoring Explanation"
                    explanation={latestResult.scoreBreakdown}
                  />
                </p>
                <p className="font-display text-2xl font-bold tabular-nums text-[var(--vw-gold)]">
                  {latestResult.privacyScore}
                  <span className="text-xs font-normal text-[var(--vw-text-muted)]">/100</span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Explanation & Flagged Fields */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-[var(--vw-gold)] mb-1">
                  Inspection Explanation & Score Breakdown
                </h4>
                <p className="text-xs text-[var(--vw-text)] leading-relaxed">
                  {latestResult.explanation}
                </p>
                <p className="text-[11px] font-mono text-[var(--vw-text-muted)] mt-2">
                  {latestResult.scoreBreakdown}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-[var(--vw-text)] mb-2">
                  Flagged Sensitive Fields ({latestResult.flaggedFields.length})
                </h4>
                {latestResult.flaggedFields.length === 0 ? (
                  <p className="text-xs text-[var(--vw-ok)] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    No sensitive entities detected in inspected payload.
                  </p>
                ) : (
                  <div className="rounded-xl border border-[var(--vw-border)] overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[var(--vw-surface-muted)]/60 text-[var(--vw-text-muted)] font-mono text-[11px]">
                        <tr>
                          <th className="py-2 px-3">Field Type</th>
                          <th className="py-2 px-3 text-right">Count</th>
                          <th className="py-2 px-3">Masked Sample</th>
                          <th className="py-2 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--vw-border)]">
                        {latestResult.flaggedFields.map((field) => (
                          <tr key={field.fieldType}>
                            <td className="py-2 px-3 font-medium">{field.fieldType}</td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums">
                              {field.count}
                            </td>
                            <td className="py-2 px-3 font-mono text-[var(--vw-text-muted)]">
                              {field.maskedPreview}
                            </td>
                            <td className="py-2 px-3 text-right font-semibold text-[var(--vw-gold)]">
                              {field.actionTaken}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Redacted Exportable Summary */}
            <div className="flex flex-col justify-between p-4 rounded-xl bg-[var(--vw-bg)] border border-[var(--vw-border)]">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="text-xs font-semibold text-[var(--vw-text)]">
                    Redacted Safe Summary Output
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleCopySummary(latestResult)}
                    className="inline-flex items-center gap-1 text-xs text-[var(--vw-gold)] hover:underline cursor-pointer"
                  >
                    {copiedId === latestResult.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Summary
                      </>
                    )}
                  </button>
                </div>
                <pre className="whitespace-pre-wrap break-words font-mono text-xs text-[var(--vw-text-muted)] leading-relaxed">
                  {latestResult.redactedSummary}
                </pre>
              </div>
              <p className="text-[11px] text-[var(--vw-text-muted)] mt-4 pt-3 border-t border-[var(--vw-border)]">
                Raw input has been cleared from the console. Only this sanitized summary is retained
                in inspection history.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Privacy Inspection History */}
      <section className="vw-glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-bold">Privacy Inspection History</h3>
            <p className="text-xs text-[var(--vw-text-muted)]">
              Redacted metadata log · Zero raw sensitive input persisted
            </p>
          </div>
          <span className="text-xs font-mono tabular-nums text-[var(--vw-text-muted)]">
            {inspections.length} inspection{inspections.length === 1 ? '' : 's'}
          </span>
        </div>

        {inspections.length === 0 ? (
          <p className="text-xs text-[var(--vw-text-muted)] py-6 text-center">
            No inspections logged yet. Use the console above to inspect synthetic event data.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[720px]">
              <thead>
                <tr className="border-b border-[var(--vw-border)] font-mono text-[11px] text-[var(--vw-text-muted)]">
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Classification</th>
                  <th className="py-2.5 px-3">Decision</th>
                  <th className="py-2.5 px-3 text-right">Score</th>
                  <th className="py-2.5 px-3">Redacted Summary Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--vw-border)]">
                {inspections.slice(0, 12).map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setLatestResult(item)}
                    className="hover:bg-[var(--vw-surface-muted)]/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 font-mono tabular-nums text-[var(--vw-text-muted)] whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-3 font-medium">{item.classification}</td>
                    <td className="py-3 px-3">
                      <span
                        className={
                          item.decision === 'blocked'
                            ? 'text-[var(--vw-crit)] font-semibold uppercase'
                            : 'text-[var(--vw-ok)] font-semibold uppercase'
                        }
                      >
                        {item.decision}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-[var(--vw-gold)]">
                      {item.privacyScore}/100
                    </td>
                    <td className="py-3 px-3 font-mono text-[var(--vw-text-muted)] max-w-md truncate">
                      {item.redactedSummary}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
