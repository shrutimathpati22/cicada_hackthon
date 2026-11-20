import React from 'react';

const GOLDEN_PARTICLES = [
  { top: '8%', left: '12%', size: 6, dur: '9s', delay: '0s' },
  { top: '16%', left: '78%', size: 5, dur: '11s', delay: '1.2s' },
  { top: '28%', left: '34%', size: 4, dur: '10s', delay: '2.4s' },
  { top: '38%', left: '88%', size: 7, dur: '12s', delay: '0.6s' },
  { top: '48%', left: '18%', size: 5, dur: '13s', delay: '3.1s' },
  { top: '58%', left: '62%', size: 6, dur: '10.5s', delay: '1.8s' },
  { top: '70%', left: '8%', size: 4, dur: '9.5s', delay: '2.9s' },
  { top: '76%', left: '46%', size: 6, dur: '11.5s', delay: '0.4s' },
  { top: '85%', left: '82%', size: 5, dur: '12.5s', delay: '2.1s' },
  { top: '22%', left: '54%', size: 4, dur: '8.8s', delay: '1.5s' },
  { top: '64%', left: '92%', size: 5, dur: '10.2s', delay: '3.5s' },
  { top: '91%', left: '26%', size: 6, dur: '11.8s', delay: '0.9s' },
];

export const GoldenBackdrop: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="no-print pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Light cream & soft ivory to champagne golden base gradient */}
      <div
        className="absolute inset-0 dark:opacity-20"
        style={{
          background:
            'radial-gradient(1200px 620px at 14% 6%, rgba(255, 241, 217, 0.95) 0%, rgba(255, 249, 239, 0.72) 55%, rgba(255, 249, 239, 1) 100%)',
        }}
      />

      {/* Gentle floating ambient golden light orbs */}
      <div
        className="vw-orb-float absolute -top-32 -left-24 w-[520px] h-[520px] rounded-full blur-3xl opacity-55 dark:opacity-20"
        style={{
          background:
            'radial-gradient(circle, rgba(245, 197, 66, 0.34) 0%, rgba(232, 195, 106, 0.16) 50%, transparent 74%)',
        }}
      />
      <div
        className="vw-orb-float absolute top-[28%] -right-28 w-[580px] h-[580px] rounded-full blur-3xl opacity-50 dark:opacity-15"
        style={{
          animationDelay: '4s',
          background:
            'radial-gradient(circle, rgba(232, 195, 106, 0.36) 0%, rgba(255, 241, 217, 0.25) 55%, transparent 75%)',
        }}
      />
      <div
        className="vw-orb-float absolute -bottom-36 left-[28%] w-[640px] h-[420px] rounded-full blur-3xl opacity-45 dark:opacity-15"
        style={{
          animationDelay: '7s',
          background:
            'radial-gradient(circle, rgba(217, 154, 37, 0.22) 0%, rgba(245, 197, 66, 0.14) 48%, transparent 72%)',
        }}
      />

      {/* Soft flowing golden waves */}
      <svg
        className="vw-wave-slow absolute top-0 left-[-5%] w-[112%] h-[420px] opacity-55 dark:opacity-20"
        viewBox="0 0 1440 420"
        fill="none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="vw-wave-grad-1" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E8C36A" stopOpacity="0.10" />
            <stop offset="45%" stopColor="#F5C542" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#D99A25" stopOpacity="0.12" />
          </linearGradient>
        </defs>
        <path
          d="M0 165 C 280 90, 520 235, 820 160 C 1100 90, 1280 185, 1440 135 L 1440 0 L 0 0 Z"
          fill="url(#vw-wave-grad-1)"
        />
        <path
          d="M0 198 C 310 120, 560 265, 860 185 C 1130 115, 1300 215, 1440 162"
          stroke="#D99A25"
          strokeOpacity="0.26"
          strokeWidth="1.4"
        />
      </svg>

      <svg
        className="vw-wave-reverse absolute bottom-0 left-[-5%] w-[112%] h-[340px] opacity-60 dark:opacity-20"
        viewBox="0 0 1440 340"
        fill="none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="vw-wave-grad-2" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF1D9" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#E8C36A" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#F5C542" stopOpacity="0.18" />
          </linearGradient>
        </defs>
        <path
          d="M0 185 C 240 250, 540 110, 860 185 C 1140 250, 1310 145, 1440 185 L 1440 340 L 0 340 Z"
          fill="url(#vw-wave-grad-2)"
        />
        <path
          d="M0 155 C 260 220, 560 85, 880 162 C 1150 225, 1320 125, 1440 160"
          stroke="#E8C36A"
          strokeOpacity="0.45"
          strokeWidth="1.4"
        />
      </svg>

      {/* Small glowing golden particles */}
      {GOLDEN_PARTICLES.map((p, idx) => (
        <span
          key={idx}
          className="vw-particle absolute rounded-full"
          style={
            {
              top: p.top,
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: 'radial-gradient(circle, #FFF9EF 0%, #F5C542 55%, rgba(217, 154, 37, 0) 100%)',
              boxShadow: '0 0 12px 2px rgba(245, 197, 66, 0.55)',
              '--dur': p.dur,
              '--delay': p.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};
