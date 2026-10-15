import React from 'react';
import { Droplet, Plus } from 'lucide-react';

interface WaterTrackerProps {
  waterMl: number;
  targetMl: number;
  onAddWater: (amountMl: number) => void;
  onResetWater: () => void;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({
  waterMl,
  targetMl,
  onAddWater,
  onResetWater
}) => {
  const pct = Math.min(100, Math.round((waterMl / (targetMl || 2500)) * 100));

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] rounded-[22px] p-4.5 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Droplet className="w-4 h-4 text-[#00F0FF]" />
          <h4 className="text-[14px] font-semibold tracking-tight text-[#1C1C1E] dark:text-[#F5F5F7]">
            Hidratación Diaria
          </h4>
        </div>
        <button
          onClick={onResetWater}
          className="text-[11px] text-[#8E8E93] hover:text-[#00F0FF] transition-colors cursor-pointer"
        >
          Reiniciar
        </button>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-[26px] font-bold tracking-tight text-[#1C1C1E] dark:text-[#F5F5F7] font-mono tabular-nums leading-none">
            {(waterMl / 1000).toFixed(2)}
            <span className="text-[14px] font-medium text-[#8E8E93] ml-1">/ {(targetMl / 1000).toFixed(1)} L</span>
          </div>
          <span className="text-[12px] font-medium text-[#00C7BE] mt-1 block">
            {pct}% de tu meta atlética
          </span>
        </div>

        {/* Action Taps */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onAddWater(250)}
            className="px-2.5 py-1.5 rounded-xl bg-[#F2F2F7] hover:bg-[#E5E5EA] dark:bg-[#2C2C2E] dark:hover:bg-[#3A3A3C] text-[12px] font-semibold text-[#1C1C1E] dark:text-[#E5E5EA] transition-all cursor-pointer active:scale-95 flex items-center gap-1"
          >
            <Plus className="w-3 h-3 text-[#00F0FF]" />
            <span>250ml</span>
          </button>
          <button
            onClick={() => onAddWater(500)}
            className="px-2.5 py-1.5 rounded-xl bg-[#F2F2F7] hover:bg-[#E5E5EA] dark:bg-[#2C2C2E] dark:hover:bg-[#3A3A3C] text-[12px] font-semibold text-[#1C1C1E] dark:text-[#E5E5EA] transition-all cursor-pointer active:scale-95 flex items-center gap-1"
          >
            <Plus className="w-3 h-3 text-[#00F0FF]" />
            <span>500ml</span>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-[#E5E5EA] dark:bg-[#2C2C2E] h-1.5 rounded-full overflow-hidden mt-3">
        <div 
          className="bg-gradient-to-r from-[#00C7BE] to-[#00F0FF] h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};
