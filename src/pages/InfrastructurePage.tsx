import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Globe,
  Pause,
  Play,
  Plus,
  Search,
  Server,
  Shield,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import { useVeilWatch } from '../context/VeilWatchContext';
import { HealthStatus, MonitoredSystem, SystemCategory } from '../types/veilwatch';

const CATEGORY_SECTIONS: {
  id: SystemCategory;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'server',
    title: 'Servers',
    subtitle: 'Simulated compute & local redaction enclave hosts',
    icon: Server,
  },
  {
    id: 'application',
    title: 'Applications',
    subtitle: 'Simulated microservices & authentication gateways',
    icon: Activity,
  },
  {
    id: 'network',
    title: 'Networks',
    subtitle: 'Simulated ingress meshes & egress policy proxies',
    icon: Globe,
  },
  {
    id: 'security',
    title: 'Security Events',
    subtitle: 'Simulated privacy enforcers & anomaly correlators',
    icon: Shield,
  },
];

export const InfrastructurePage: React.FC = () => {
  const { systems, addSystem, toggleSystemMonitoring, removeSystem } = useVeilWatch();

  const [categoryTab, setCategoryTab] = useState<'all' | SystemCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | HealthStatus | 'paused'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailSystem, setDetailSystem] = useState<MonitoredSystem | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<MonitoredSystem | null>(null);

  // Add form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<SystemCategory>('server');
  const [formHost, setFormHost] = useState('');
  const [formRegion, setFormRegion] = useState('us-east-enclave');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filteredSystems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return systems.filter((sys) => {
      if (categoryTab !== 'all' && sys.category !== categoryTab) return false;
      if (statusFilter === 'paused' && sys.monitoringActive) return false;
      if (statusFilter !== 'all' && statusFilter !== 'paused' && sys.status !== statusFilter) {
        return false;
      }
      if (q) {
        const hay = `${sys.name} ${sys.id} ${sys.host} ${sys.region}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [categoryTab, searchQuery, statusFilter, systems]);

  const sectionsToRender =
    categoryTab === 'all'
      ? CATEGORY_SECTIONS
      : CATEGORY_SECTIONS.filter((sec) => sec.id === categoryTab);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (formName.trim().length < 3) {
      setFormError('System name must be at least 3 characters.');
      return;
    }
    if (formHost.trim().length < 3 || /\s/.test(formHost.trim())) {
      setFormError('Host identifier must be at least 3 characters with no spaces.');
      return;
    }

    setSubmitting(true);
    const res = await addSystem({
      name: formName.trim(),
      category: formCategory,
      host: formHost.trim(),
      region: formRegion.trim(),
      notes: formNotes.trim(),
    });
    setSubmitting(false);

    if (!res.ok) {
      setFormError(res.error || 'Validation failed.');
      return;
    }

    setFormName('');
    setFormHost('');
    setFormNotes('');
    setAddModalOpen(false);
  };

  const renderStatusLabel = (sys: MonitoredSystem) => {
    if (!sys.monitoringActive) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--vw-text-muted)]">
          <Pause className="w-3.5 h-3.5" />
          Paused
        </span>
      );
    }
    if (sys.status === 'healthy') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--vw-ok)]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Healthy
        </span>
      );
    }
    if (sys.status === 'warning') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--vw-warn)]">
          <AlertTriangle className="w-3.5 h-3.5" />
          Warning
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--vw-crit)]">
        <XCircle className="w-3.5 h-3.5" />
        Critical
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Primary Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-[var(--vw-gold)]">
            Simulated Infrastructure Inventory · Not Connected to External Hardware
          </p>
          <p className="text-sm text-[var(--vw-text-muted)] mt-1">
            Monitor simulated servers, applications, networks, and security nodes with local
            pause/resume controls.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormError('');
            setAddModalOpen(true);
          }}
          className="vw-gradient-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap shrink-0 self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Demo System
        </button>
      </div>

      {/* Category & Filter Controls */}
      <div className="vw-glass-card rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Category Segmented Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-[var(--vw-surface-muted)]/70 border border-[var(--vw-border)]">
          <button
            type="button"
            onClick={() => setCategoryTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              categoryTab === 'all'
                ? 'bg-[var(--vw-gold-soft)] text-[var(--vw-gold)]'
                : 'text-[var(--vw-text-muted)] hover:text-[var(--vw-text)]'
            }`}
          >
            All Sections
          </button>
          {CATEGORY_SECTIONS.map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => setCategoryTab(sec.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                categoryTab === sec.id
                  ? 'bg-[var(--vw-gold-soft)] text-[var(--vw-gold)]'
                  : 'text-[var(--vw-text-muted)] hover:text-[var(--vw-text)]'
              }`}
            >
              {sec.title}
            </button>
          ))}
        </div>

        {/* Search & Health Status Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--vw-text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, ID, host..."
              aria-label="Search simulated systems"
              className="w-full sm:w-56 pl-9 pr-3 py-2 rounded-xl bg-[var(--vw-bg)] border border-[var(--vw-border)] text-xs text-[var(--vw-text)] placeholder:text-[var(--vw-text-muted)] focus:outline-none focus:border-[var(--vw-gold)]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            aria-label="Filter by health status"
            className="px-3 py-2 rounded-xl bg-[var(--vw-bg)] border border-[var(--vw-border)] text-xs text-[var(--vw-text)] focus:outline-none focus:border-[var(--vw-gold)]"
          >
            <option value="all">All Health States</option>
            <option value="healthy">Healthy</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
            <option value="paused">Monitoring Paused</option>
          </select>
        </div>
      </div>

      {/* Empty State if zero match */}
      {filteredSystems.length === 0 ? (
        <div className="vw-glass-card rounded-2xl p-10 text-center">
          <p className="font-display text-base font-semibold text-[var(--vw-text)] mb-1">
            No simulated systems match your current filters
          </p>
          <p className="text-xs text-[var(--vw-text-muted)] mb-5">
            Clear your search query or add a new simulated node to begin monitoring.
          </p>
          <button
            type="button"
            onClick={() => {
              setCategoryTab('all');
              setStatusFilter('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--vw-border)] bg-[var(--vw-surface-muted)] text-[var(--vw-text)] hover:border-[var(--vw-gold)] cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {sectionsToRender.map((sec) => {
            const Icon = sec.icon;
            const sectionNodes = filteredSystems.filter((s) => s.category === sec.id);
            if (sectionNodes.length === 0) return null;

            return (
              <section key={sec.id} className="space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--vw-border)] pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-[var(--vw-gold)]" />
                    <h2 className="font-display text-base font-bold text-[var(--vw-text)]">
                      {sec.title}
                    </h2>
                    <span className="text-xs text-[var(--vw-text-muted)] hidden sm:inline">
                      · {sec.subtitle}
                    </span>
                  </div>
                  <span className="text-xs font-mono tabular-nums text-[var(--vw-text-muted)]">
                    {sectionNodes.length} node{sectionNodes.length === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="vw-glass-card rounded-2xl overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[820px]">
                    <thead>
                      <tr className="border-b border-[var(--vw-border)] text-[11px] font-mono text-[var(--vw-text-muted)]">
                        <th className="py-3 px-4 font-medium">System & ID</th>
                        <th className="py-3 px-4 font-medium">Status</th>
                        <th className="py-3 px-4 font-medium text-right">Uptime</th>
                        <th className="py-3 px-4 font-medium text-right">CPU</th>
                        <th className="py-3 px-4 font-medium text-right">Memory</th>
                        <th className="py-3 px-4 font-medium text-right">Latency</th>
                        <th className="py-3 px-4 font-medium text-right">Last Seen</th>
                        <th className="py-3 px-4 font-medium text-right">Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--vw-border)] text-xs">
                      {sectionNodes.map((sys) => (
                        <tr
                          key={sys.id}
                          className="hover:bg-[var(--vw-surface-muted)]/40 transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-[var(--vw-text)]">{sys.name}</p>
                            <p className="font-mono text-[11px] text-[var(--vw-text-muted)]">
                              {sys.id} · {sys.host} · {sys.region}
                            </p>
                          </td>
                          <td className="py-3.5 px-4">{renderStatusLabel(sys)}</td>
                          <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                            {sys.uptimePercent.toFixed(2)}%
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                            {sys.cpuUsage}%
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                            {sys.memoryUsage}%
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                            {sys.responseTimeMs}ms
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[var(--vw-text-muted)]">
                            {new Date(sys.lastSeen).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setDetailSystem(sys)}
                                title="View system details"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--vw-border)] hover:border-[var(--vw-gold)]/50 text-[var(--vw-text)] transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Details
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleSystemMonitoring(sys.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--vw-border)] hover:border-[var(--vw-gold)]/50 text-[var(--vw-text)] transition-colors cursor-pointer"
                              >
                                {sys.monitoringActive ? (
                                  <>
                                    <Pause className="w-3.5 h-3.5 text-[var(--vw-gold)]" />
                                    Pause
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-3.5 h-3.5 text-[var(--vw-ok)]" />
                                    Start
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmRemove(sys)}
                                aria-label={`Remove ${sys.name}`}
                                className="inline-flex items-center justify-center p-1.5 rounded-lg border border-[var(--vw-border)] hover:border-[var(--vw-crit)]/60 text-[var(--vw-text-muted)] hover:text-[var(--vw-crit)] transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Add Demo System Modal */}
      {addModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-system-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
        >
          <div className="w-full max-w-md vw-glass-card rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 id="add-system-title" className="font-display text-lg font-bold">
                  Add Demo System
                </h2>
                <p className="text-xs text-[var(--vw-text-muted)]">
                  Validated by backend server · Synthetic telemetry only
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                aria-label="Close modal"
                className="p-1.5 rounded-lg text-[var(--vw-text-muted)] hover:text-[var(--vw-text)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--vw-text-muted)] mb-1.5">
                  System Name
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Enclave Telemetry Relay 04"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--vw-bg)] border border-[var(--vw-border)] text-sm text-[var(--vw-text)] focus:outline-none focus:border-[var(--vw-gold)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--vw-text-muted)] mb-1.5">
                    Section Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as SystemCategory)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--vw-bg)] border border-[var(--vw-border)] text-sm text-[var(--vw-text)] focus:outline-none focus:border-[var(--vw-gold)]"
                  >
                    <option value="server">Server</option>
                    <option value="application">Application</option>
                    <option value="network">Network</option>
                    <option value="security">Security Event</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--vw-text-muted)] mb-1.5">
                    Environment Zone
                  </label>
                  <input
                    type="text"
                    required
                    value={formRegion}
                    onChange={(e) => setFormRegion(e.target.value)}
                    placeholder="us-east-enclave"
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--vw-bg)] border border-[var(--vw-border)] text-sm text-[var(--vw-text)] focus:outline-none focus:border-[var(--vw-gold)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--vw-text-muted)] mb-1.5">
                  Simulated Host / Endpoint Identifier
                </label>
                <input
                  type="text"
                  required
                  value={formHost}
                  onChange={(e) => setFormHost(e.target.value)}
                  placeholder="relay-04.internal.demo"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--vw-bg)] border border-[var(--vw-border)] text-sm font-mono text-[var(--vw-text)] focus:outline-none focus:border-[var(--vw-gold)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--vw-text-muted)] mb-1.5">
                  Operational Notes (Optional)
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Local pre-redaction node"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--vw-bg)] border border-[var(--vw-border)] text-sm text-[var(--vw-text)] focus:outline-none focus:border-[var(--vw-gold)]"
                />
              </div>

              {formError && (
                <p className="text-xs text-[var(--vw-crit)] bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">
                  {formError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--vw-border)] text-[var(--vw-text-muted)] hover:text-[var(--vw-text)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="vw-gradient-btn px-5 py-2 rounded-xl text-xs font-semibold disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? 'Validating...' : 'Register Demo System'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* System Details Modal */}
      {detailSystem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg vw-glass-card rounded-2xl p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs text-[var(--vw-gold)]">
                  {detailSystem.id} · Simulated {detailSystem.category}
                </p>
                <h2 className="font-display text-lg font-bold mt-1">{detailSystem.name}</h2>
                <p className="text-xs text-[var(--vw-text-muted)]">
                  {detailSystem.host} · {detailSystem.region}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailSystem(null)}
                aria-label="Close system details"
                className="p-1.5 rounded-lg text-[var(--vw-text-muted)] hover:text-[var(--vw-text)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[var(--vw-surface-muted)]/60 border border-[var(--vw-border)]">
                <p className="text-[11px] text-[var(--vw-text-muted)]">CPU Load</p>
                <p className="font-mono text-lg font-bold tabular-nums">{detailSystem.cpuUsage}%</p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--vw-surface-muted)]/60 border border-[var(--vw-border)]">
                <p className="text-[11px] text-[var(--vw-text-muted)]">Memory</p>
                <p className="font-mono text-lg font-bold tabular-nums">
                  {detailSystem.memoryUsage}%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--vw-surface-muted)]/60 border border-[var(--vw-border)]">
                <p className="text-[11px] text-[var(--vw-text-muted)]">Latency</p>
                <p className="font-mono text-lg font-bold tabular-nums">
                  {detailSystem.responseTimeMs}ms
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--vw-surface-muted)]/60 border border-[var(--vw-border)]">
                <p className="text-[11px] text-[var(--vw-text-muted)]">Uptime</p>
                <p className="font-mono text-lg font-bold tabular-nums">
                  {detailSystem.uptimePercent}%
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-[var(--vw-text)] mb-1">
                Simulated Operational Role
              </p>
              <p className="text-xs text-[var(--vw-text-muted)] leading-relaxed">
                {detailSystem.notes}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-[var(--vw-text)] mb-2">
                Recent Interval Snapshots
              </p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto text-xs font-mono">
                {detailSystem.history.map((pt, i) => (
                  <div
                    key={`${pt.label}-${i}`}
                    className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[var(--vw-bg)] border border-[var(--vw-border)] tabular-nums"
                  >
                    <span className="text-[var(--vw-text-muted)]">{pt.label}</span>
                    <span>CPU {pt.cpu}%</span>
                    <span>MEM {pt.memory}%</span>
                    <span>{pt.responseMs}ms</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setDetailSystem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--vw-border)] text-[var(--vw-text)] hover:border-[var(--vw-gold)] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Remove Modal */}
      {confirmRemove && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
        >
          <div className="w-full max-w-sm vw-glass-card rounded-2xl p-6 space-y-4">
            <h2 className="font-display text-base font-bold">Remove Demo System?</h2>
            <p className="text-xs text-[var(--vw-text-muted)] leading-relaxed">
              Remove <span className="font-semibold text-[var(--vw-text)]">{confirmRemove.name}</span>{' '}
              (<span className="font-mono">{confirmRemove.id}</span>) from simulated monitoring?
              This action updates local inventory immediately.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmRemove(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--vw-border)] text-[var(--vw-text-muted)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  removeSystem(confirmRemove.id);
                  setConfirmRemove(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#BE123C] text-white hover:opacity-90 cursor-pointer"
              >
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
