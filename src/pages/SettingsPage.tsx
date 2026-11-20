import React, { useState } from 'react';
import { Bell, CheckCircle2, Moon, RotateCcw, Save, Shield, Sun } from 'lucide-react';
import { useVeilWatch } from '../context/VeilWatchContext';
import { VeilWatchSettings } from '../types/veilwatch';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    requestBrowserNotifications,
    browserNotificationPermission,
    resetDemoData,
  } = useVeilWatch();

  const [draft, setDraft] = useState<VeilWatchSettings>(settings);
  const [error, setError] = useState('');
  const [savedNotice, setSavedNotice] = useState('');
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSavedNotice('');

    if (draft.organizationName.trim().length < 2) {
      setError('Organization name must be at least 2 characters.');
      return;
    }
    if (draft.thresholds.cpuWarning >= draft.thresholds.cpuCritical) {
      setError('CPU warning threshold must be lower than CPU critical threshold.');
      return;
    }
    if (draft.thresholds.memoryWarning >= draft.thresholds.memoryCritical) {
      setError('Memory warning threshold must be lower than Memory critical threshold.');
      return;
    }
    if (draft.thresholds.responseWarningMs >= draft.thresholds.responseCriticalMs) {
      setError('Response latency warning threshold must be lower than critical threshold.');
      return;
    }

    updateSettings({
      ...draft,
      organizationName: draft.organizationName.trim(),
    });
    setSavedNotice('Settings saved locally to browser storage.');
  };

  const handleConfirmReset = () => {
    resetDemoData();
    setConfirmResetOpen(false);
    // Sync draft after reset on next tick
    window.setTimeout(() => {
      const stored = window.localStorage.getItem('vw_settings_v1');
      if (stored) {
        try {
          setDraft(JSON.parse(stored) as VeilWatchSettings);
        } catch {
          // ignore
        }
      }
    }, 50);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <form onSubmit={handleSave} className="space-y-6">
        {/* Organization & Monitoring Interval */}
        <section className="vw-glass-card rounded-2xl p-6 space-y-5">
          <div>
            <h2 className="font-display text-base font-bold">Organization & Telemetry Cadence</h2>
            <p className="text-xs text-[var(--vw-text-muted)]">
              Persisted locally in your browser · Controls simulated refresh interval and report
              headers
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--vw-text-muted)] mb-1.5">
                Organization Name
              </label>
              <input
                type="text"
                required
                value={draft.organizationName}
                onChange={(e) => setDraft({ ...draft, organizationName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--vw-bg)] border border-[var(--vw-border)] text-sm text-[var(--vw-text)] focus:outline-none focus:border-[var(--vw-gold)]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--vw-text-muted)] mb-1.5">
                Demo Monitoring Interval
              </label>
              <select
                value={draft.monitoringIntervalSec}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    monitoringIntervalSec: Number(e.target.value) as 3 | 5 | 10 | 30,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--vw-bg)] border border-[var(--vw-border)] text-sm text-[var(--vw-text)] focus:outline-none focus:border-[var(--vw-gold)]"
              >
                <option value={3}>Every 3 seconds (Fast Demo)</option>
                <option value={5}>Every 5 seconds (Default)</option>
                <option value={10}>Every 10 seconds</option>
                <option value={30}>Every 30 seconds</option>
              </select>
            </div>
          </div>
        </section>

        {/* Alert Thresholds */}
        <section className="vw-glass-card rounded-2xl p-6 space-y-5">
          <div>
            <h2 className="font-display text-base font-bold">Rule-Based Alert Thresholds</h2>
            <p className="text-xs text-[var(--vw-text-muted)]">
              Drives simulated system health classification and Predictive Health early warnings
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-3">
              <label className="block text-xs font-medium text-[var(--vw-text-muted)]">
                CPU Warning / Critical (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={20}
                  max={95}
                  value={draft.thresholds.cpuWarning}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      thresholds: { ...draft.thresholds, cpuWarning: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[var(--vw-bg)] border border-[var(--vw-border)] font-mono text-xs"
                />
                <input
                  type="number"
                  min={30}
                  max={99}
                  value={draft.thresholds.cpuCritical}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      thresholds: { ...draft.thresholds, cpuCritical: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[var(--vw-bg)] border border-[var(--vw-border)] font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-medium text-[var(--vw-text-muted)]">
                Memory Warning / Critical (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={20}
                  max={95}
                  value={draft.thresholds.memoryWarning}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      thresholds: { ...draft.thresholds, memoryWarning: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[var(--vw-bg)] border border-[var(--vw-border)] font-mono text-xs"
                />
                <input
                  type="number"
                  min={30}
                  max={99}
                  value={draft.thresholds.memoryCritical}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      thresholds: { ...draft.thresholds, memoryCritical: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[var(--vw-bg)] border border-[var(--vw-border)] font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-medium text-[var(--vw-text-muted)]">
                Latency Warning / Critical (ms)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={50}
                  max={800}
                  value={draft.thresholds.responseWarningMs}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      thresholds: {
                        ...draft.thresholds,
                        responseWarningMs: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[var(--vw-bg)] border border-[var(--vw-border)] font-mono text-xs"
                />
                <input
                  type="number"
                  min={80}
                  max={1500}
                  value={draft.thresholds.responseCriticalMs}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      thresholds: {
                        ...draft.thresholds,
                        responseCriticalMs: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[var(--vw-bg)] border border-[var(--vw-border)] font-mono text-xs"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Policy, Notifications & Theme */}
        <section className="vw-glass-card rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[var(--vw-gold)]" />
            <h2 className="font-display text-base font-bold">
              Privacy Policy, Notifications & Appearance
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <label className="p-3.5 rounded-xl bg-[var(--vw-bg)] border border-[var(--vw-border)] flex items-center justify-between gap-3 cursor-pointer">
              <span>Block Export on Credentials</span>
              <input
                type="checkbox"
                checked={draft.exportPolicy.blockOnCredentials}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    exportPolicy: {
                      ...draft.exportPolicy,
                      blockOnCredentials: e.target.checked,
                    },
                  })
                }
                className="h-4 w-4 accent-[#D99A25]"
              />
            </label>

            <label className="p-3.5 rounded-xl bg-[var(--vw-bg)] border border-[var(--vw-border)] flex items-center justify-between gap-3 cursor-pointer">
              <span>Block Export on PII Detection</span>
              <input
                type="checkbox"
                checked={draft.exportPolicy.blockOnPII}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    exportPolicy: { ...draft.exportPolicy, blockOnPII: e.target.checked },
                  })
                }
                className="h-4 w-4 accent-[#D99A25]"
              />
            </label>

            <label className="p-3.5 rounded-xl bg-[var(--vw-bg)] border border-[var(--vw-border)] flex items-center justify-between gap-3 cursor-pointer">
              <span>In-App Toast Alert Banners</span>
              <input
                type="checkbox"
                checked={draft.notifications.inAppBanner}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    notifications: { ...draft.notifications, inAppBanner: e.target.checked },
                  })
                }
                className="h-4 w-4 accent-[#D99A25]"
              />
            </label>

            <div className="p-3.5 rounded-xl bg-[var(--vw-bg)] border border-[var(--vw-border)] flex items-center justify-between gap-3">
              <div>
                <span className="block font-medium">Browser Notifications</span>
                <span className="text-[11px] text-[var(--vw-text-muted)]">
                  Permission: {browserNotificationPermission}
                </span>
              </div>
              <button
                type="button"
                onClick={requestBrowserNotifications}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--vw-border)] hover:border-[var(--vw-gold)] text-[var(--vw-gold)] cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                Request
              </button>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[var(--vw-border)]">
            <div>
              <p className="text-xs font-semibold">Interface Theme</p>
              <p className="text-[11px] text-[var(--vw-text-muted)]">
                Switch between Golden Ivory & Cream (Default) and Obsidian Gold Dark
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--vw-surface-muted)] border border-[var(--vw-border)] self-start">
              <button
                type="button"
                onClick={() => setDraft({ ...draft, theme: 'light' })}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                  draft.theme === 'light'
                    ? 'bg-[var(--vw-gold-soft)] text-[var(--vw-gold)] font-semibold'
                    : 'text-[var(--vw-text-muted)]'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                Golden Ivory
              </button>
              <button
                type="button"
                onClick={() => setDraft({ ...draft, theme: 'dark' })}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                  draft.theme === 'dark'
                    ? 'bg-[var(--vw-gold-soft)] text-[var(--vw-gold)] font-semibold'
                    : 'text-[var(--vw-text-muted)]'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                Obsidian Gold
              </button>
            </div>
          </div>
        </section>

        {error && (
          <p className="text-xs text-[var(--vw-crit)] bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {savedNotice && (
          <p className="text-xs text-[var(--vw-ok)] bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {savedNotice}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-rose-600/35 text-[var(--vw-crit)] hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Demo Data
          </button>

          <button
            type="submit"
            className="vw-gradient-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </form>

      {/* Confirm Reset Modal */}
      {confirmResetOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#29231B]/60 backdrop-blur-xs"
        >
          <div className="w-full max-w-sm vw-glass-card rounded-2xl p-6 space-y-4">
            <h3 className="font-display text-base font-bold">Reset All Demo Data?</h3>
            <p className="text-xs text-[var(--vw-text-muted)] leading-relaxed">
              This restores simulated systems, alerts, fingerprints, privacy inspection history, and
              settings to their original defaults in localStorage.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmResetOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--vw-border)] text-[var(--vw-text-muted)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#BE123C] text-white cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
