import React, { useMemo, useState } from 'react';
import { Calendar, CheckCircle2, Download, Printer } from 'lucide-react';
import { AlertDistributionChart, PrivacyDecisionBarChart } from '../components/Charts';
import { useVeilWatch } from '../context/VeilWatchContext';

type DatePreset = 'all' | '24h' | '7d' | 'custom';

export const AuditReportsPage: React.FC = () => {
  const { alerts, inspections, settings } = useVeilWatch();

  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [exportStatus, setExportStatus] = useState('');
  const [exporting, setExporting] = useState(false);

  const dateBounds = useMemo(() => {
    const now = Date.now();
    if (datePreset === '24h') return { start: now - 86_400_000, end: now + 60_000 };
    if (datePreset === '7d') return { start: now - 7 * 86_400_000, end: now + 60_000 };
    if (datePreset === 'custom') {
      const start = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : 0;
      const end = toDate ? new Date(`${toDate}T23:59:59`).getTime() : Number.MAX_SAFE_INTEGER;
      return { start, end };
    }
    return { start: 0, end: Number.MAX_SAFE_INTEGER };
  }, [datePreset, fromDate, toDate]);

  const filteredAlerts = useMemo(
    () =>
      alerts.filter((a) => {
        const ts = new Date(a.timestamp).getTime();
        return ts >= dateBounds.start && ts <= dateBounds.end;
      }),
    [alerts, dateBounds]
  );

  const filteredInspections = useMemo(
    () =>
      inspections.filter((i) => {
        const ts = new Date(i.timestamp).getTime();
        return ts >= dateBounds.start && ts <= dateBounds.end;
      }),
    [dateBounds, inspections]
  );

  const metrics = useMemo(() => {
    const totalIncidents = filteredAlerts.length;
    const resolvedIncidents = filteredAlerts.filter((a) => a.status === 'resolved').length;
    const blockedExports = filteredInspections.filter((i) => i.decision === 'blocked').length;
    const approvedSummaries = filteredInspections.filter((i) => i.decision === 'approved').length;
    return { totalIncidents, resolvedIncidents, blockedExports, approvedSummaries };
  }, [filteredAlerts, filteredInspections]);

  const handleExportCsv = async () => {
    setExporting(true);
    setExportStatus('');
    try {
      const res = await fetch('/api/audit/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationName: settings.organizationName,
          totalIncidents: metrics.totalIncidents,
          resolvedIncidents: metrics.resolvedIncidents,
          blockedExports: metrics.blockedExports,
          approvedSummaries: metrics.approvedSummaries,
          dateFilter: datePreset,
        }),
      });
      const validation = (await res.json()) as {
        valid?: boolean;
        exportCertificateId?: string;
        error?: string;
      };

      if (!res.ok || !validation.valid) {
        setExportStatus(validation.error || 'Server rejected audit summary export.');
        setExporting(false);
        return;
      }

      const escapeCsv = (val: string | number) =>
        `"${String(val).replace(/"/g, '""')}"`;

      const rows: string[] = [
        ['Section', 'Timestamp', 'Category/Classification', 'Severity/Decision', 'Reference', 'Sanitized Detail'].join(','),
        ...filteredAlerts.map((a) =>
          [
            escapeCsv('Incident Alert'),
            escapeCsv(a.timestamp),
            escapeCsv(a.category),
            escapeCsv(`${a.severity} (${a.status})`),
            escapeCsv(a.fingerprintId),
            escapeCsv(a.title),
          ].join(',')
        ),
        ...filteredInspections.map((i) =>
          [
            escapeCsv('Privacy Inspection'),
            escapeCsv(i.timestamp),
            escapeCsv(i.classification),
            escapeCsv(`${i.decision} (Score ${i.privacyScore})`),
            escapeCsv(i.id),
            escapeCsv(i.redactedSummary),
          ].join(',')
        ),
      ];

      const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `veilwatch-audit-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportStatus(
        `Sanitized CSV exported (${validation.exportCertificateId}) — zero raw PII included.`
      );
    } catch {
      setExportStatus('Failed to export sanitized CSV.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 print-only-area">
      {/* Header & Export Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-[var(--vw-gold)]">
            {settings.organizationName} · Sanitized Executive Audit Report
          </p>
          <p className="text-xs text-[var(--vw-text-muted)] mt-1">
            Aggregates incident counts, severity distribution, and redacted privacy inspection
            summaries.
          </p>
        </div>

        <div className="no-print flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={exporting}
            onClick={handleExportCsv}
            className="vw-gradient-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer disabled:opacity-60"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Validating Export...' : 'Export Sanitized CSV'}
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-[var(--vw-border)] bg-[var(--vw-surface)] hover:border-[var(--vw-gold)] text-[var(--vw-text)] whitespace-nowrap cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[var(--vw-gold)]" />
            Print-Friendly View
          </button>
        </div>
      </div>

      {exportStatus && (
        <div className="no-print vw-glass-card rounded-xl px-4 py-3 text-xs text-[var(--vw-ok)] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{exportStatus}</span>
        </div>
      )}

      {/* Date Range Filters */}
      <section className="no-print vw-glass-card rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-[var(--vw-text-muted)]">
          <Calendar className="w-4 h-4 text-[var(--vw-gold)]" />
          <span>Audit Reporting Window</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--vw-surface-muted)]/70 border border-[var(--vw-border)]">
            {(
              [
                { id: 'all', label: 'All Time' },
                { id: '24h', label: 'Last 24h' },
                { id: '7d', label: 'Last 7 Days' },
                { id: 'custom', label: 'Custom Range' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDatePreset(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                  datePreset === opt.id
                    ? 'bg-[var(--vw-gold-soft)] text-[var(--vw-gold)]'
                    : 'text-[var(--vw-text-muted)] hover:text-[var(--vw-text)]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {datePreset === 'custom' && (
            <div className="flex items-center gap-2 text-xs">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                aria-label="From date"
                className="px-2.5 py-1.5 rounded-lg bg-[var(--vw-bg)] border border-[var(--vw-border)] text-[var(--vw-text)]"
              />
              <span className="text-[var(--vw-text-muted)]">to</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                aria-label="To date"
                className="px-2.5 py-1.5 rounded-lg bg-[var(--vw-bg)] border border-[var(--vw-border)] text-[var(--vw-text)]"
              />
            </div>
          )}
        </div>
      </section>

      {/* Summary KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="vw-glass-card rounded-2xl p-5">
          <p className="text-xs text-[var(--vw-text-muted)] mb-1">Total Incidents</p>
          <p className="font-display text-3xl font-bold tabular-nums">{metrics.totalIncidents}</p>
        </div>
        <div className="vw-glass-card rounded-2xl p-5">
          <p className="text-xs text-[var(--vw-text-muted)] mb-1">Resolved Incidents</p>
          <p className="font-display text-3xl font-bold tabular-nums text-[var(--vw-ok)]">
            {metrics.resolvedIncidents}
          </p>
        </div>
        <div className="vw-glass-card rounded-2xl p-5">
          <p className="text-xs text-[var(--vw-text-muted)] mb-1">Blocked Export Attempts</p>
          <p className="font-display text-3xl font-bold tabular-nums text-[var(--vw-crit)]">
            {metrics.blockedExports}
          </p>
        </div>
        <div className="vw-glass-card rounded-2xl p-5">
          <p className="text-xs text-[var(--vw-text-muted)] mb-1">Approved Summaries</p>
          <p className="font-display text-3xl font-bold tabular-nums text-[var(--vw-gold)]">
            {metrics.approvedSummaries}
          </p>
        </div>
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="vw-glass-card rounded-2xl p-6">
          <h3 className="font-display text-base font-bold mb-1">Alert Severity Distribution</h3>
          <p className="text-xs text-[var(--vw-text-muted)] mb-4">
            Incidents grouped by severity level within active audit window
          </p>
          <div className="h-64">
            <AlertDistributionChart alerts={filteredAlerts} theme={settings.theme} />
          </div>
        </div>

        <div className="vw-glass-card rounded-2xl p-6">
          <h3 className="font-display text-base font-bold mb-1">Privacy Export Outcomes</h3>
          <p className="text-xs text-[var(--vw-text-muted)] mb-4">
            Approved sanitized summaries vs blocked sensitive export attempts
          </p>
          <div className="h-64">
            <PrivacyDecisionBarChart
              approved={metrics.approvedSummaries}
              blocked={metrics.blockedExports}
              theme={settings.theme}
            />
          </div>
        </div>
      </section>

      {/* Privacy Inspection History Table */}
      <section className="vw-glass-card rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="font-display text-base font-bold">
            Sanitized Privacy Inspection Ledger
          </h3>
          <p className="text-xs text-[var(--vw-text-muted)]">
            Contains policy decisions, scores, and redacted summaries only
          </p>
        </div>

        {filteredInspections.length === 0 ? (
          <p className="text-xs text-[var(--vw-text-muted)] py-6 text-center">
            No privacy inspection records found for the selected date range.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[680px]">
              <thead>
                <tr className="border-b border-[var(--vw-border)] font-mono text-[11px] text-[var(--vw-text-muted)]">
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Classification</th>
                  <th className="py-2.5 px-3">Decision</th>
                  <th className="py-2.5 px-3 text-right">Score</th>
                  <th className="py-2.5 px-3">Policy Applied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--vw-border)]">
                {filteredInspections.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 px-3 font-mono tabular-nums text-[var(--vw-text-muted)] whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-medium">{item.classification}</td>
                    <td className="py-3 px-3 font-semibold uppercase">
                      <span
                        className={
                          item.decision === 'blocked' ? 'text-[var(--vw-crit)]' : 'text-[var(--vw-ok)]'
                        }
                      >
                        {item.decision}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-[var(--vw-gold)]">
                      {item.privacyScore}/100
                    </td>
                    <td className="py-3 px-3 text-[var(--vw-text-muted)]">{item.ruleApplied}</td>
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
