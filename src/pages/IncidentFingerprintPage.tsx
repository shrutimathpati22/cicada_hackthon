import React, { useMemo, useState } from 'react';
import { Fingerprint, Hash, Layers, ShieldCheck } from 'lucide-react';
import { InfoTooltip } from '../components/InfoTooltip';
import { useVeilWatch } from '../context/VeilWatchContext';
import { AlertSeverity } from '../types/veilwatch';

export const IncidentFingerprintPage: React.FC = () => {
  const { fingerprints, recordFingerprintEvent } = useVeilWatch();

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [testCategory, setTestCategory] = useState('security');
  const [testSeverity, setTestSeverity] = useState<AlertSeverity>('high');
  const [testComponent, setTestComponent] = useState('Identity Gateway');
  const [testPattern, setTestPattern] = useState('repeated_token_validation_failure');
  const [lastHashCreated, setLastHashCreated] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const categories = useMemo(
    () => Array.from(new Set(fingerprints.map((f) => f.category))),
    [fingerprints]
  );

  const visibleFingerprints = useMemo(
    () =>
      categoryFilter === 'all'
        ? fingerprints
        : fingerprints.filter((f) => f.category === categoryFilter),
    [categoryFilter, fingerprints]
  );

  const handleGenerateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!testComponent.trim() || !testPattern.trim()) {
      setFormError('Component type and structural pattern code are required.');
      return;
    }

    const fp = await recordFingerprintEvent({
      category: testCategory,
      severity: testSeverity,
      componentType: testComponent,
      patternCode: testPattern,
    });
    setLastHashCreated(`${fp.id} (Frequency: ${fp.frequency})`);
  };

  return (
    <div className="space-y-6">
      {/* Privacy-Safe Hashing Explanation */}
      <section className="vw-glass-card vw-gradient-border rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Fingerprint className="w-5 h-5 text-[var(--vw-gold)] shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-sm sm:text-base font-bold">
                Privacy-Safe Incident Fingerprinting (SHA-256 Normalized)
              </h2>
              <InfoTooltip
                label="Non-PII Fingerprinting"
                explanation="Hashes only normalized structural attributes (category|severity|component_type|pattern_code) using SHA-256. Raw log lines, IP addresses, usernames, and emails are never hashed or stored."
              />
            </div>
            <p className="text-xs text-[var(--vw-text-muted)] mt-1 leading-relaxed">
              Groups recurring operational incidents into stable reference IDs using a one-way
              SHA-256 digest of normalized non-sensitive characteristics — keeping raw logs and
              personal identifiers out of fingerprint storage.
            </p>
          </div>
        </div>

        <div className="font-mono text-xs tabular-nums shrink-0">
          <span className="text-[var(--vw-text-muted)] block">Unique Fingerprints</span>
          <span className="text-2xl font-bold text-[var(--vw-gold)]">{fingerprints.length}</span>
        </div>
      </section>

      {/* Interactive Fingerprint Normalization Tester */}
      <section className="vw-glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-[var(--vw-gold)]" />
          <h3 className="font-display text-base font-bold">
            Group Similar Incident by Normalized Characteristics
          </h3>
        </div>

        <form onSubmit={handleGenerateTest} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-xs text-[var(--vw-text-muted)] mb-1">Category</label>
            <select
              value={testCategory}
              onChange={(e) => setTestCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--vw-bg)] border border-[var(--vw-border)] text-xs text-[var(--vw-text)] focus:outline-none focus:border-[var(--vw-gold)]"
            >
              <option value="security">security</option>
              <option value="server">server</option>
              <option value="application">application</option>
              <option value="network">network</option>
              <option value="privacy">privacy</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-[var(--vw-text-muted)] mb-1">Severity</label>
            <select
              value={testSeverity}
              onChange={(e) => setTestSeverity(e.target.value as AlertSeverity)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--vw-bg)] border border-[var(--vw-border)] text-xs text-[var(--vw-text)] focus:outline-none focus:border-[var(--vw-gold)]"
            >
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
              <option value="critical">critical</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-[var(--vw-text-muted)] mb-1">
              Component Type (Non-PII)
            </label>
            <input
              type="text"
              value={testComponent}
              onChange={(e) => setTestComponent(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--vw-bg)] border border-[var(--vw-border)] text-xs text-[var(--vw-text)] focus:outline-none focus:border-[var(--vw-gold)]"
            />
          </div>

          <div>
            <label className="block text-xs text-[var(--vw-text-muted)] mb-1">
              Normalized Pattern Code
            </label>
            <input
              type="text"
              value={testPattern}
              onChange={(e) => setTestPattern(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--vw-bg)] border border-[var(--vw-border)] font-mono text-xs text-[var(--vw-text)] focus:outline-none focus:border-[var(--vw-gold)]"
            />
          </div>

          <button
            type="submit"
            className="vw-gradient-btn px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer"
          >
            Generate / Group Hash
          </button>
        </form>

        {formError && <p className="text-xs text-[var(--vw-crit)]">{formError}</p>}

        {lastHashCreated && (
          <p className="text-xs font-mono text-[var(--vw-ok)] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Fingerprint recorded & grouped locally: {lastHashCreated}
          </p>
        )}
      </section>

      {/* Fingerprint Registry */}
      <section className="vw-glass-card rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--vw-gold)]" />
            <h3 className="font-display text-base font-bold">Grouped Incident Fingerprints</h3>
          </div>

          <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-[var(--vw-surface-muted)]/70 border border-[var(--vw-border)]">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                categoryFilter === 'all'
                  ? 'bg-[var(--vw-gold-soft)] text-[var(--vw-gold)]'
                  : 'text-[var(--vw-text-muted)]'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-[var(--vw-gold-soft)] text-[var(--vw-gold)]'
                    : 'text-[var(--vw-text-muted)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead>
              <tr className="border-b border-[var(--vw-border)] font-mono text-[11px] text-[var(--vw-text-muted)]">
                <th className="py-3 px-3">Incident Reference ID</th>
                <th className="py-3 px-3">Category & Component</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3">Normalized Non-PII Signature</th>
                <th className="py-3 px-3 text-right">Frequency</th>
                <th className="py-3 px-3 text-right">Last Seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--vw-border)]">
              {visibleFingerprints.map((fp) => (
                <tr key={fp.id} className="hover:bg-[var(--vw-surface-muted)]/40">
                  <td className="py-3.5 px-3">
                    <span className="font-mono font-bold text-[var(--vw-gold)]">{fp.id}</span>
                    <span className="block font-mono text-[10px] text-[var(--vw-text-muted)]">
                      SHA256: {fp.hash}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-semibold capitalize">{fp.category}</span>
                    <span className="block text-[var(--vw-text-muted)]">
                      {fp.affectedComponentType}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono uppercase font-semibold">
                    <span
                      className={
                        fp.severity === 'critical'
                          ? 'text-[var(--vw-crit)]'
                          : fp.severity === 'high'
                            ? 'text-[var(--vw-warn)]'
                            : fp.severity === 'medium'
                              ? 'text-[var(--vw-gold)]'
                              : 'text-[var(--vw-text-muted)]'
                      }
                    >
                      {fp.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[11px] text-[var(--vw-text-muted)]">
                    {fp.normalizedPattern}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono tabular-nums font-bold">
                    {fp.frequency}x
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono tabular-nums text-[var(--vw-text-muted)]">
                    {new Date(fp.lastSeen).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
