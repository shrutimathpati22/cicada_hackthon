import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface InfoTooltipProps {
  label: string;
  explanation: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ label, explanation }) => {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        aria-label={`Technical info about ${label}`}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[var(--vw-text-muted)] hover:text-[var(--vw-gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vw-gold)] transition-colors"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute z-40 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-lg vw-glass-card text-xs leading-relaxed text-[var(--vw-text)] shadow-xl pointer-events-none"
        >
          <span className="block font-semibold text-[var(--vw-gold)] mb-1">{label}</span>
          <span className="text-[var(--vw-text-muted)]">{explanation}</span>
        </span>
      )}
    </span>
  );
};
