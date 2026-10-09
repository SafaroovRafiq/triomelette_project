import React from 'react';

interface StatusBeaconProps {
  color?: 'emerald' | 'crimson' | 'amber' | 'cyan' | 'gray';
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const StatusBeacon: React.FC<StatusBeaconProps> = ({
  color = 'cyan',
  pulse = true,
  size = 'md',
  label,
  className = '',
}) => {
  const colorMap = {
    emerald: {
      dot: 'bg-[#00FFA3]',
      ring: 'bg-[#00FFA3]/40 border-[#00FFA3]',
      shadow: 'shadow-[0_0_8px_#00FFA3]',
    },
    crimson: {
      dot: 'bg-[#FF3366]',
      ring: 'bg-[#FF3366]/40 border-[#FF3366]',
      shadow: 'shadow-[0_0_8px_#FF3366]',
    },
    amber: {
      dot: 'bg-[#FFB020]',
      ring: 'bg-[#FFB020]/40 border-[#FFB020]',
      shadow: 'shadow-[0_0_8px_#FFB020]',
    },
    cyan: {
      dot: 'bg-[#00E5FF]',
      ring: 'bg-[#00E5FF]/40 border-[#00E5FF]',
      shadow: 'shadow-[0_0_8px_#00E5FF]',
    },
    gray: {
      dot: 'bg-[#8899A6]',
      ring: 'bg-[#8899A6]/30 border-[#8899A6]',
      shadow: 'shadow-[0_0_6px_#8899A6]',
    },
  };

  const sizeMap = {
    sm: { dot: 'w-1.5 h-1.5', ring: 'w-3 h-3' },
    md: { dot: 'w-2 h-2', ring: 'w-4 h-4' },
    lg: { dot: 'w-2.5 h-2.5', ring: 'w-5 h-5' },
  };

  const c = colorMap[color];
  const s = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className="relative flex items-center justify-center">
        {pulse && (
          <span
            className={`absolute rounded-full border opacity-75 animate-beacon ${s.ring} ${c.ring}`}
          />
        )}
        <span className={`relative rounded-full ${s.dot} ${c.dot} ${c.shadow}`} />
      </div>
      {label && <span className="text-xs uppercase tracking-wider font-mono-numbers">{label}</span>}
    </div>
  );
};
