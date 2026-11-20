import React from 'react';

interface LogoProps {
  compact?: boolean;
}

export const VeilWatchLogo: React.FC<LogoProps> = ({ compact = false }) => {
  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 select-none">
      <svg
        width="30"
        height="30"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0 vw-shield-glow"
      >
        <defs>
          <linearGradient id="vw-brand-grad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F5C542" />
            <stop offset="50%" stopColor="#E8C36A" />
            <stop offset="100%" stopColor="#D99A25" />
          </linearGradient>
          <linearGradient id="vw-shield-fill" x1="5" y1="3" x2="27" y2="29" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF9EF" />
            <stop offset="100%" stopColor="#FFF1D9" />
          </linearGradient>
          <linearGradient id="vw-eye-grad" x1="9" y1="12" x2="23" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#D99A25" />
            <stop offset="100%" stopColor="#8F5A0B" />
          </linearGradient>
        </defs>
        <path
          d="M16 2.5L27.5 7.2V15.4C27.5 22.3 22.6 27.6 16 29.5C9.4 27.6 4.5 22.3 4.5 15.4V7.2L16 2.5Z"
          stroke="url(#vw-brand-grad)"
          strokeWidth="2"
          fill="url(#vw-shield-fill)"
        />
        <path
          d="M9.5 15.8C11.4 12.9 13.6 11.5 16 11.5C18.4 11.5 20.6 12.9 22.5 15.8C20.6 18.7 18.4 20.1 16 20.1C13.6 20.1 11.4 18.7 9.5 15.8Z"
          stroke="url(#vw-eye-grad)"
          strokeWidth="1.75"
        />
        <circle cx="16" cy="15.8" r="2.3" fill="#D99A25" />
      </svg>
      {!compact && (
        <span className="font-display font-bold text-lg tracking-tight text-[var(--vw-text)]">
          VEIL<span className="text-[var(--vw-amber)]">WATCH</span>
        </span>
      )}
    </span>
  );
};
