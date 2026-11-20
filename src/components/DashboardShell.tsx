import React, { useMemo, useState } from 'react';
import {
  Activity,
  Bell,
  ChevronLeft,
  ChevronRight,
  Cpu,
  FileBarChart2,
  Fingerprint,
  Home,
  LayoutDashboard,
  Menu,
  Radar,
  Server,
  Settings,
  ShieldAlert,
  X,
} from 'lucide-react';
import { useVeilWatch } from '../context/VeilWatchContext';
import { PageId } from '../types/veilwatch';
import { GoldenBackdrop } from './GoldenBackdrop';
import { VeilWatchLogo } from './VeilWatchLogo';

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
  { id: 'infrastructure', label: 'Infrastructure Monitor', icon: Server },
  { id: 'privacy-radar', label: 'Privacy Leak Radar', icon: Radar },
  { id: 'smart-alerts', label: 'Smart Alert Center', icon: ShieldAlert },
  { id: 'predictive-health', label: 'Predictive Health', icon: Cpu },
  { id: 'fingerprints', label: 'Incident Fingerprints', icon: Fingerprint },
  { id: 'audit-reports', label: 'Audit Reports', icon: FileBarChart2 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const DashboardShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    activePage,
    setActivePage,
    setViewMode,
    alerts,
    updateAlertStatus,
    settings,
    predictiveWarnings,
    toastMessage,
    dismissToast,
  } = useVeilWatch();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const activeAlerts = useMemo(
    () => alerts.filter((a) => a.status === 'active'),
    [alerts]
  );

  const currentNav = NAV_ITEMS.find((n) => n.id === activePage) || NAV_ITEMS[0];

  const handleSelectPage = (id: PageId) => {
    setActivePage(id);
    setMobileOpen(false);
    setNotifOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-[var(--vw-bg)] text-[var(--vw-text)] relative overflow-x-hidden">
      <GoldenBackdrop />

      {/* Mobile Sidebar Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#29231B]/45 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`no-print fixed lg:sticky top-0 left-0 z-50 h-screen flex flex-col border-r border-[var(--vw-border)] bg-[var(--vw-bg-cream)]/90 dark:bg-[var(--vw-surface-solid)] backdrop-blur-xl transition-all duration-200 ${
          collapsed ? 'lg:w-20' : 'lg:w-64'
        } ${mobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Row */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[var(--vw-border)]">
          <button
            type="button"
            onClick={() => handleSelectPage('overview')}
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vw-amber)] rounded cursor-pointer"
          >
            <VeilWatchLogo compact={collapsed} />
          </button>

          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:inline-flex items-center justify-center w-8 h-8 rounded-lg text-[var(--vw-text-muted)] hover:text-[var(--vw-text)] hover:bg-[var(--vw-gold-soft)] transition-colors cursor-pointer"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
            className="lg:hidden inline-flex items-center justify-center w-8 h-8 rounded-lg text-[var(--vw-text-muted)] hover:text-[var(--vw-text)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links (Selected item highlighted in gold) */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5" aria-label="Primary dashboard navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            const badgeCount =
              item.id === 'smart-alerts'
                ? activeAlerts.length
                : item.id === 'predictive-health'
                  ? predictiveWarnings.length
                  : 0;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectPage(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#F5C542]/40 via-[#E8C36A]/28 to-[#FFF1D9]/60 dark:from-[#F5C542]/25 dark:to-[#D99A25]/15 text-[#29231B] dark:text-[#F5C542] border border-[#D99A25]/55 shadow-[0_6px_18px_-8px_rgba(217,154,37,0.48)] font-semibold'
                    : 'text-[var(--vw-text-muted)] hover:text-[var(--vw-text)] hover:bg-[var(--vw-surface)] border border-transparent'
                } ${collapsed ? 'justify-center px-2' : 'justify-between'}`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-[#B87914] dark:text-[#F5C542]' : ''
                    }`}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </span>
                {!collapsed && badgeCount > 0 && (
                  <span className="font-mono text-xs tabular-nums font-bold text-[var(--vw-gold)] shrink-0">
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Return to Landing */}
        <div className="p-3 border-t border-[var(--vw-border)] space-y-1">
          <button
            type="button"
            onClick={() => setViewMode('landing')}
            title={collapsed ? 'Landing Page' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-[var(--vw-text-muted)] hover:text-[var(--vw-text)] hover:bg-[var(--vw-surface)] transition-colors cursor-pointer ${
              collapsed ? 'justify-center px-2' : ''
            }`}
          >
            <Home className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Back to Landing Page</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col relative z-10">
        {/* Top Navigation Bar */}
        <header className="no-print sticky top-0 z-30 h-16 px-4 sm:px-6 border-b border-[var(--vw-border)] bg-[var(--vw-bg)]/85 backdrop-blur-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-[var(--vw-border)] bg-[var(--vw-surface)] text-[var(--vw-text)] hover:border-[var(--vw-amber)]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="font-display text-base sm:text-lg font-bold tracking-tight truncate">
                {currentNav.label}
              </h1>
              <p className="hidden sm:block text-xs text-[var(--vw-text-muted)] truncate">
                Simulated Prototype Environment · Local-Only Privacy Inspection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Quick link to Privacy Radar */}
            <button
              type="button"
              onClick={() => handleSelectPage('privacy-radar')}
              className="hidden md:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border border-[var(--vw-border)] bg-[var(--vw-surface)] hover:border-[var(--vw-amber)] hover:shadow-[0_0_16px_-4px_rgba(245,197,66,0.42)] text-[var(--vw-text)] transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-[var(--vw-amber)]" />
              Inspect Sample Data
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((v) => !v)}
                aria-label={`Notifications (${activeAlerts.length} active alerts)`}
                className="relative inline-flex items-center justify-center w-10 h-10 rounded-xl border border-[var(--vw-border)] bg-[var(--vw-surface)] hover:border-[var(--vw-amber)] hover:shadow-[0_0_16px_-4px_rgba(245,197,66,0.45)] text-[var(--vw-text)] transition-all cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {activeAlerts.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-gradient-to-br from-[#F5C542] to-[#D99A25] text-[#29231B] border border-[#FFF9EF] text-[11px] font-mono font-bold flex items-center justify-center tabular-nums shadow-sm">
                    {activeAlerts.length}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl vw-glass-card shadow-2xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[var(--vw-border)] flex items-center justify-between bg-[var(--vw-surface-muted)]">
                    <span className="font-display text-sm font-semibold">
                      Active Alerts ({activeAlerts.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelectPage('smart-alerts')}
                      className="text-xs font-semibold text-[var(--vw-gold)] hover:underline cursor-pointer"
                    >
                      View All
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-[var(--vw-border)]">
                    {activeAlerts.length === 0 ? (
                      <div className="p-5 text-center text-xs text-[var(--vw-text-muted)]">
                        No active alerts. Simulated systems are operating normally.
                      </div>
                    ) : (
                      activeAlerts.slice(0, 5).map((alert) => (
                        <div key={alert.id} className="p-3.5 space-y-1.5">
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="font-mono uppercase font-semibold text-[var(--vw-gold)]">
                              {alert.severity} · {alert.id}
                            </span>
                            <span className="text-[var(--vw-text-muted)] tabular-nums">
                              {new Date(alert.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-[var(--vw-text)] leading-snug">
                            {alert.title}
                          </p>
                          <div className="flex items-center gap-3 pt-1">
                            <button
                              type="button"
                              onClick={() => updateAlertStatus(alert.id, 'acknowledged')}
                              className="text-xs font-semibold text-[var(--vw-gold)] hover:underline cursor-pointer"
                            >
                              Acknowledge
                            </button>
                            <button
                              type="button"
                              onClick={() => updateAlertStatus(alert.id, 'resolved')}
                              className="text-xs font-semibold text-[var(--vw-ok)] hover:underline cursor-pointer"
                            >
                              Resolve
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Area */}
            <button
              type="button"
              onClick={() => handleSelectPage('settings')}
              className="flex items-center gap-2.5 pl-1 pr-2.5 py-1 rounded-xl border border-[var(--vw-border)] bg-[var(--vw-surface)] hover:border-[var(--vw-amber)] hover:shadow-[0_0_16px_-4px_rgba(245,197,66,0.38)] transition-all cursor-pointer"
              title="Open Workspace Settings"
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-[var(--vw-surface-muted)] shrink-0 ring-1 ring-[#E8C36A]/50">
                {!avatarError ? (
                  <img
                    src="/src/assets/images/avatar_security_lead_1795192519321.jpg"
                    alt="Security operations lead profile"
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[var(--vw-gold)]">
                    VW
                  </div>
                )}
              </div>
              <div className="hidden sm:block text-left min-w-0">
                <p className="text-xs font-semibold text-[var(--vw-text)] truncate max-w-[140px]">
                  {settings.organizationName}
                </p>
                <p className="text-[11px] text-[var(--vw-text-muted)]">Security Operator</p>
              </div>
            </button>
          </div>
        </header>

        {/* Transient In-App Banner Toast */}
        {toastMessage && (
          <div className="no-print mx-4 sm:mx-6 mt-4 rounded-xl vw-glass-card vw-gradient-border px-4 py-3 flex items-center justify-between gap-4 vw-page-enter">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--vw-gold)]">{toastMessage.title}</p>
              <p className="text-xs text-[var(--vw-text-muted)] truncate">{toastMessage.detail}</p>
            </div>
            <button
              type="button"
              onClick={dismissToast}
              aria-label="Dismiss notification banner"
              className="text-[var(--vw-text-muted)] hover:text-[var(--vw-text)] p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Active Page Viewport with Gentle Page Transition */}
        <main key={activePage} className="flex-1 p-4 sm:p-6 max-w-[1440px] w-full mx-auto vw-page-enter">
          {children}
        </main>
      </div>
    </div>
  );
};
