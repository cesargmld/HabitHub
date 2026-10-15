import React from 'react';
import { TrendingUp, BarChart2 } from 'lucide-react';

interface DayTrendPoint {
  dayName: string;
  dayNumber: number;
  burned: number;
  consumed: number;
  isToday: boolean;
}

interface WeeklyTrendChartProps {
  trendData: DayTrendPoint[];
}

export const WeeklyTrendChart: React.FC<WeeklyTrendChartProps> = ({ trendData }) => {
  const maxVal = Math.max(
    3000,
    ...trendData.map(d => Math.max(d.burned, d.consumed))
  );

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] rounded-[22px] p-4.5 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none transition-colors">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-[#A1FF00]" />
          <h4 className="text-[14px] font-semibold tracking-tight text-[#1C1C1E] dark:text-[#F5F5F7]">
            Tendencia Energética Semanal
          </h4>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-medium">
          <span className="flex items-center gap-1 text-[#FA114F]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FA114F]" /> Gasto
          </span>
          <span className="flex items-center gap-1 text-[#00F0FF]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]" /> Ingesta
          </span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 pt-2 items-end h-32">
        {trendData.map((d, i) => {
          const burnedHeight = Math.max(8, Math.round((d.burned / maxVal) * 95));
          const consumedHeight = Math.max(8, Math.round((d.consumed / maxVal) * 95));

          return (
            <div key={i} className="flex flex-col items-center justify-end h-full group">
              <div className="flex items-end gap-1 w-full justify-center h-24 mb-1.5">
                {/* Burned Bar (Coral Red) */}
                <div
                  className="w-2.5 sm:w-3 rounded-full bg-gradient-to-t from-[#FF1255] to-[#FA114F] opacity-90 transition-all duration-500"
                  style={{ height: `${burnedHeight}%` }}
                  title={`${d.dayName}: ${d.burned} kcal quemadas`}
                />
                {/* Consumed Bar (Cyan) */}
                <div
                  className="w-2.5 sm:w-3 rounded-full bg-gradient-to-t from-[#00C7BE] to-[#00F0FF] opacity-80 transition-all duration-500"
                  style={{ height: `${consumedHeight}%` }}
                  title={`${d.dayName}: ${d.consumed} kcal consumidas`}
                />
              </div>

              {/* Day Label */}
              <span className={`text-[10px] uppercase font-bold tracking-tight ${
                d.isToday ? 'text-[#A1FF00]' : 'text-[#8E8E93]'
              }`}>
                {d.dayName}
              </span>
              <span className={`text-[11px] font-mono leading-none ${
                d.isToday ? 'text-[#1C1C1E] dark:text-[#F5F5F7] font-bold' : 'text-[#8E8E93]'
              }`}>
                {d.dayNumber}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
