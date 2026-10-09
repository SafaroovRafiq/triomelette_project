import React from 'react';
import type { SeverityLevel } from '../../types/telemetry';

interface BadgeProps {
  children: React.ReactNode;
  variant?: SeverityLevel | 'cyan' | 'neutral' | 'active';
  size?: 'sm' | 'md';
  className?: string;
  pulsing?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
  pulsing = false,
}) => {
  const variantStyles: Record<string, string> = {
    crit: 'bg-[#FF3366]/15 text-[#FF3366] border-[#FF3366]/40 shadow-[0_0_8px_rgba(255,51,102,0.2)]',
    high: 'bg-[#FFB020]/15 text-[#FFB020] border-[#FFB020]/40 shadow-[0_0_8px_rgba(255,176,32,0.2)]',
    med: 'bg-[#00E5FF]/15 text-[#00E5FF] border-[#00E5FF]/40 shadow-[0_0_8px_rgba(0,229,255,0.2)]',
    low: 'bg-[#8899A6]/15 text-[#8899A6] border-[#8899A6]/40',
    stable: 'bg-[#00FFA3]/15 text-[#00FFA3] border-[#00FFA3]/40 shadow-[0_0_8px_rgba(0,255,163,0.2)]',
    optimal: 'bg-[#00FFA3]/15 text-[#00FFA3] border-[#00FFA3]/40 shadow-[0_0_8px_rgba(0,255,163,0.2)]',
    cyan: 'bg-[#00E5FF]/15 text-[#00E5FF] border-[#00E5FF]/40 shadow-[0_0_8px_rgba(0,229,255,0.2)]',
    active: 'bg-[#00FFA3]/20 text-[#00FFA3] border-[#00FFA3] shadow-[0_0_10px_rgba(0,255,163,0.3)]',
    neutral: 'bg-[#161D2B] text-[#8899A6] border-[#1F293D]',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 tracking-wider',
    md: 'text-xs px-2.5 py-1 tracking-widest',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono-numbers font-medium uppercase border chamfer-sm transition-all ${
        variantStyles[variant] || variantStyles.neutral
      } ${sizeStyles[size]} ${pulsing ? 'animate-pulse' : ''} ${className}`}
    >
      {children}
    </span>
  );
};
