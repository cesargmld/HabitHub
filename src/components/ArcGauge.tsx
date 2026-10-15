import React from 'react';

interface ArcGaugeProps {
  value: number; // current value
  min: number;   // e.g. -1000
  max: number;   // e.g. +1000
  target: number;
  label: string; // e.g. "DÉFICIT ACTIVO"
  unit: string;  // e.g. "kcal netas"
  mode: 'deficit' | 'surplus' | 'neutral';
}

export const ArcGauge: React.FC<ArcGaugeProps> = ({
  value,
  min,
  max,
  label,
  unit,
  mode
}) => {
  // Radius and center coordinates for a 240x140 SVG
  const cx = 120;
  const cy = 110;
  const r = 85;

  // Semicircle arc length = PI * r
  const arcLength = Math.PI * r;

  // Normalize value between 0 and 1
  const clampedVal = Math.max(min, Math.min(max, value));
  const progress = (clampedVal - min) / (max - min || 1);
  const strokeDashoffset = arcLength * (1 - progress);

  // Calculate indicator dot position on the arc (from 180deg to 0deg)
  const angleRad = Math.PI - progress * Math.PI;
  const dotX = cx + r * Math.cos(angleRad);
  const dotY = cy - r * Math.sin(angleRad);

  const activeColor = 
    mode === 'deficit' ? '#84CC16' : // Vibrant Lime Green
    mode === 'surplus' ? '#F97316' : // Vibrant Amber/Orange
    '#06B6D4'; // Cyan

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <svg 
        viewBox="0 0 240 135" 
        className="w-full max-w-[280px] h-auto overflow-visible"
      >
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#84CC16" />
            <stop offset="50%" stopColor="#A3E635" />
            <stop offset="100%" stopColor={mode === 'surplus' ? '#F97316' : '#22C55E'} />
          </linearGradient>

          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background track (dotted / muted semicircle) */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          className="text-slate-200 dark:text-slate-800/90"
        />

        {/* Small radial tick dashes */}
        <path
          d={`M ${cx - r + 8} ${cy} A ${r - 8} ${r - 8} 0 0 1 ${cx + r - 8} ${cy}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="2 8"
          className="text-slate-300 dark:text-slate-700"
        />

        {/* Active colored arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-out"
          filter="url(#glow)"
        />

        {/* Thumb Dot on the track */}
        <circle
          cx={dotX}
          cy={dotY}
          r="6.5"
          fill="#FFFFFF"
          stroke={activeColor}
          strokeWidth="3.5"
          className="transition-all duration-700 ease-out drop-shadow-md"
        />

        {/* Min, Mid and Max Labels */}
        <text x={cx - r - 6} y={cy + 16} fontSize="10" fill="currentColor" textAnchor="middle" className="text-slate-400 dark:text-slate-500 font-mono font-medium">
          {min}
        </text>
        <text x={cx} y={cy - r - 8} fontSize="10" fill="currentColor" textAnchor="middle" className="text-slate-400 dark:text-slate-500 font-mono font-medium">
          0
        </text>
        <text x={cx + r + 6} y={cy + 16} fontSize="10" fill="currentColor" textAnchor="middle" className="text-slate-400 dark:text-slate-500 font-mono font-medium">
          +{max}
        </text>
      </svg>

      {/* Centered Text Elements (inside the arc) */}
      <div className="absolute top-[52px] flex flex-col items-center text-center">
        <span className="text-[11px] font-bold tracking-wider uppercase text-lime-600 dark:text-lime-400">
          {label}
        </span>
        <div className="text-3xl font-extrabold font-mono tabular-nums tracking-tight text-slate-900 dark:text-white mt-0.5">
          {value > 0 ? `+${value}` : value}
        </div>
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 -mt-0.5">
          {unit}
        </span>
      </div>
    </div>
  );
};
