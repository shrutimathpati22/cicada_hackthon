import React, { useState } from 'react';
import {
  Activity,
  ArrowRight,
  BellRing,
  CheckCircle2,
  Fingerprint,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { useVeilWatch } from '../context/VeilWatchContext';
import { GoldenBackdrop } from './GoldenBackdrop';
import { VeilWatchLogo } from './VeilWatchLogo';

export const LandingPage: React.FC = () => {
  const { navigateToPage, setViewMode } = useVeilWatch();
  const [heroImgError, setHeroImgError] = useState(false);
  const [aboutImgError, setAboutImgError] = useState(false);

  const handleEnterDashboard = () => {
    setViewMode('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[var(--vw-bg)] text-[var(--vw-text)] relative overflow-x-hidden">
      <GoldenBackdrop />

      {/* 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 border-b border-[var(--vw-border)] bg-[var(--vw-bg)]/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
          <a
            href="#top"
            className="whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vw-amber)] rounded"
          >
            <VeilWatchLogo />
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[var(--vw-text-muted)]">
            <a
              href="#highlights"
              className="hover:text-[var(--vw-text)] transition-colors whitespace-nowrap shrink-0"
            >
              Platform
            </a>
            <a
              href="#privacy-boundary"
              className="hover:text-[var(--vw-text)] transition-colors whitespace-nowrap shrink-0"
            >
              Privacy Radar
            </a>
            <a
              href="#architecture"
              className="hover:text-[var(--vw-text)] transition-colors whitespace-nowrap shrink-0"
            >
              Architecture
            </a>
            <a
              href="#about"
              className="hover:text-[var(--vw-text)] transition-colors whitespace-nowrap shrink-0"
            >
              About
            </a>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleEnterDashboard}
              className="vw-gradient-btn px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer"
            >
              Enter Dashboard
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="relative z-10 vw-page-enter">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-14 pb-16 lg:pt-20 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-xs font-semibold tracking-wider text-[var(--vw-gold)] mb-4">
                Privacy-First Infrastructure Intelligence · Interactive Hackathon Prototype
              </p>

              <h1
                className="font-display font-extrabold tracking-tight leading-[1.08] mb-5 text-balance"
                style={{ fontSize: 'clamp(2.35rem, 4.2vw, 3.85rem)' }}
              >
                <span className="vw-gradient-text">See Everything.</span>
                <br />
                <span className="text-[var(--vw-text)]">Expose Nothing.</span>
              </h1>

              <p className="text-base sm:text-lg text-[var(--vw-text-muted)] leading-relaxed max-w-xl mb-8">
                VEILWATCH monitors servers, applications, networks, and security events while
                enforcing local redaction before summaries ever leave your environment.
                Designed with a strict local privacy boundary and simulated telemetry for safe
                demonstration.
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-8">
                <button
                  type="button"
                  onClick={handleEnterDashboard}
                  className="vw-gradient-btn inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm sm:text-base font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Enter Dashboard
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigateToPage('privacy-radar')}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold border border-[var(--vw-border)] bg-[var(--vw-surface)] hover:border-[var(--vw-amber)] hover:shadow-[0_0_20px_-6px_rgba(245,197,66,0.45)] text-[var(--vw-text)] transition-all whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-[var(--vw-amber)] vw-shield-glow" />
                  Try Privacy Leak Radar
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--vw-text-muted)]">
                <span>100% Local Inspection Console</span>
                <span aria-hidden="true">·</span>
                <span>Zero Raw PII Retention</span>
                <span aria-hidden="true">·</span>
                <span>Simulated Demo Telemetry</span>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="h-full min-h-[300px] lg:min-h-[420px] rounded-2xl overflow-hidden vw-glass-card vw-gold-glow relative">
                {!heroImgError ? (
                  <img
                    src="/src/assets/images/hero_veilwatch_vault_1795192520018.jpg"
                    alt="VEILWATCH architectural security vault with champagne gold precision geometry"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-10 bg-gradient-to-br from-[#FFF1D9] via-[#FFF9EF] to-[#E8C36A]/40">
                    <ShieldCheck className="w-14 h-14 text-[var(--vw-amber)] vw-shield-glow mb-4" />
                    <p className="font-display text-lg font-semibold text-[var(--vw-text)]">
                      VEILWATCH Enclave Architecture
                    </p>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-[#29231B]/95 via-[#29231B]/70 to-transparent">
                  <p className="text-xs font-mono text-[#F5C542] mb-1">
                    LOCAL PRIVACY BOUNDARY · SHA-256 NON-PII FINGERPRINTING
                  </p>
                  <p className="text-sm text-[#FFF9EF]">
                    Inspect credentials, emails, and internal endpoints inside the browser before
                    any summary is generated.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Three Highlights */}
        <section
          id="highlights"
          className="max-w-7xl mx-auto px-6 py-14 border-t border-[var(--vw-border)]"
        >
          <div className="max-w-2xl mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              <span className="vw-gradient-text">Three Pillars of Private Observability</span>
            </h2>
            <p className="text-sm sm:text-base text-[var(--vw-text-muted)]">
              Built to keep operational visibility high while preventing accidental leakage of
              sensitive fields into centralized logs or reports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="vw-glass-card rounded-2xl p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="font-mono text-xs text-[var(--vw-gold)]">01. Highlight</span>
                  <Lock className="w-5 h-5 text-[var(--vw-amber)] vw-shield-glow" />
                </div>
                <h3 className="font-display text-xl font-bold text-[var(--vw-text)] mb-3">
                  Privacy Protection
                </h3>
                <p className="text-sm text-[var(--vw-text-muted)] leading-relaxed">
                  Local Privacy Leak Radar detects email addresses, phone numbers, synthetic
                  credentials, and private IPs directly in-browser, applying configurable redaction
                  or blocking policies without transmitting raw payloads.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigateToPage('privacy-radar')}
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--vw-gold)] hover:underline cursor-pointer"
              >
                Open Privacy Leak Radar <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </article>

            <article className="vw-glass-card rounded-2xl p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="font-mono text-xs text-[var(--vw-gold)]">02. Highlight</span>
                  <Activity className="w-5 h-5 text-[var(--vw-amber)]" />
                </div>
                <h3 className="font-display text-xl font-bold text-[var(--vw-text)] mb-3">
                  Intelligent Monitoring
                </h3>
                <p className="text-sm text-[var(--vw-text-muted)] leading-relaxed">
                  Track simulated servers, applications, networks, and security events in unified
                  charts alongside rule-based Predictive Health warnings that explain sustained CPU,
                  memory, and latency anomalies.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigateToPage('infrastructure')}
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--vw-gold)] hover:underline cursor-pointer"
              >
                Explore Infrastructure Monitor <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </article>

            <article className="vw-glass-card rounded-2xl p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="font-mono text-xs text-[var(--vw-gold)]">03. Highlight</span>
                  <BellRing className="w-5 h-5 text-[var(--vw-amber)]" />
                </div>
                <h3 className="font-display text-xl font-bold text-[var(--vw-text)] mb-3">
                  Smart Alerts
                </h3>
                <p className="text-sm text-[var(--vw-text-muted)] leading-relaxed">
                  Simulate anomalies, downtime, and export attempts with instant severity triage,
                  SHA-256 non-PII incident fingerprinting, persistent acknowledgements, and optional
                  browser notifications.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigateToPage('smart-alerts')}
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--vw-gold)] hover:underline cursor-pointer"
              >
                Open Smart Alert Center <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </article>
          </div>
        </section>

        {/* Architecture & Privacy Boundary Band */}
        <section
          id="privacy-boundary"
          className="max-w-7xl mx-auto px-6 py-12 border-t border-[var(--vw-border)]"
        >
          <div id="architecture" className="vw-glass-card vw-gradient-border rounded-2xl p-8 lg:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              <div>
                <p className="font-mono text-xs text-[var(--vw-gold)] mb-2">
                  Signature Architecture
                </p>
                <h2 className="font-display text-2xl font-bold text-[var(--vw-text)] mb-3">
                  Local Inspection Before Any Central Summary
                </h2>
                <p className="text-sm text-[var(--vw-text-muted)] leading-relaxed">
                  Unlike traditional telemetry collectors that ship raw payloads first and redact
                  later, VEILWATCH inspects, masks, and scores sensitive events locally before
                  creating exportable audit artifacts.
                </p>
              </div>

              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="p-5 rounded-xl bg-[var(--vw-surface-muted)] border border-[var(--vw-border)]">
                  <ShieldCheck className="w-5 h-5 text-[var(--vw-amber)] vw-shield-glow mb-3" />
                  <p className="text-sm font-semibold text-[var(--vw-text)] mb-1">
                    1. Local Regex & Policy Engine
                  </p>
                  <p className="text-xs text-[var(--vw-text-muted)] leading-relaxed">
                    Flags credentials, PII, and internal IPs locally; discards raw console input
                    immediately after inspection.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-[var(--vw-surface-muted)] border border-[var(--vw-border)]">
                  <Fingerprint className="w-5 h-5 text-[var(--vw-amber)] mb-3" />
                  <p className="text-sm font-semibold text-[var(--vw-text)] mb-1">
                    2. Non-PII SHA-256 Hashing
                  </p>
                  <p className="text-xs text-[var(--vw-text-muted)] leading-relaxed">
                    Groups recurring incidents by structural category and severity hash without
                    storing personal logs.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-[var(--vw-surface-muted)] border border-[var(--vw-border)]">
                  <CheckCircle2 className="w-5 h-5 text-[var(--vw-amber)] mb-3" />
                  <p className="text-sm font-semibold text-[var(--vw-text)] mb-1">
                    3. Transparent Audit Output
                  </p>
                  <p className="text-xs text-[var(--vw-text-muted)] leading-relaxed">
                    Produces CSV and print-ready executive summaries containing only sanitized
                    counts and decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section
          id="about"
          className="max-w-7xl mx-auto px-6 py-16 border-t border-[var(--vw-border)]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            <div className="lg:col-span-5">
              <div className="h-full min-h-[260px] rounded-2xl overflow-hidden vw-glass-card">
                {!aboutImgError ? (
                  <img
                    src="/src/assets/images/about_privacy_shield_1795192519176.jpg"
                    alt="Concentric smoked glass and champagne gold privacy boundary rings"
                    referrerPolicy="no-referrer"
                    onError={() => setAboutImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-8 bg-[#FFF1D9]">
                    <Lock className="w-12 h-12 text-[var(--vw-amber)] vw-shield-glow" />
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col justify-center">
              <p className="font-mono text-xs text-[var(--vw-gold)] mb-2">
                About VEILWATCH · Problem & Solution
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--vw-text)] mb-4 text-balance">
                Closing the Observability Privacy Gap
              </h2>
              <p className="text-sm sm:text-base text-[var(--vw-text-muted)] leading-relaxed mb-4">
                Modern infrastructure teams depend on real-time logs, traces, and alerts to keep
                systems online. Yet diagnostic payloads frequently contain customer email
                addresses, phone numbers, internal topology IPs, and accidental API credentials —
                turning monitoring pipelines into secondary breach surfaces.
              </p>
              <p className="text-sm sm:text-base text-[var(--vw-text-muted)] leading-relaxed mb-6">
                VEILWATCH demonstrates a privacy-first alternative: inspect sensitive operational
                events locally inside the organization boundary, block policy-violating exports,
                fingerprint recurring incidents via non-sensitive hashes, and deliver crisp
                observability without exposing underlying data.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handleEnterDashboard}
                  className="vw-gradient-btn inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Launch Prototype Console
                  <ArrowRight className="w-4 h-4" />
                </button>
                <span className="text-xs text-[var(--vw-text-muted)]">
                  Prototype Notice: Uses simulated telemetry and local-only browser inspection (not a
                  certified DLP appliance).
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="relative z-10 border-t border-[var(--vw-border)] py-8 bg-[var(--vw-bg)]/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[var(--vw-text-muted)]">
          <div className="flex items-center gap-3">
            <span className="font-display font-semibold text-[var(--vw-text)]">VEILWATCH</span>
            <span aria-hidden="true">·</span>
            <span>See Everything. Expose Nothing.</span>
          </div>
          <p>
            Hackathon Prototype · Simulated monitoring data only; no real external infrastructure
            connected.
          </p>
        </div>
      </footer>
    </div>
  );
};
