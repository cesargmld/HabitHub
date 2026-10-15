import React from 'react';
import { Heart } from 'lucide-react';
import { WorkoutRecord } from '../types';

interface HeartRateZonesProps {
  workouts: WorkoutRecord[];
  maxHrEstimate: number; // e.g. 220 - age
}

export const HeartRateZones: React.FC<HeartRateZonesProps> = ({ workouts, maxHrEstimate }) => {
  // Compute approximate minutes in zones based on average heart rate of recorded workouts
  const zones = [
    { name: 'Zona 1', range: '< 60%', label: 'Recuperación', color: '#60A5FA', minutes: 0 },
    { name: 'Zona 2', range: '60–70%', label: 'Quema de Grasa / Base', color: '#34D399', minutes: 0 },
    { name: 'Zona 3', range: '70–80%', label: 'Aeróbico / Tempo', color: '#FBBF24', minutes: 0 },
    { name: 'Zona 4', range: '80–90%', label: 'Umbral Anaeróbico', color: '#FB923C', minutes: 0 },
    { name: 'Zona 5', range: '> 90%', label: 'Máximo / VO2 Máx', color: '#F87171', minutes: 0 },
  ];

  workouts.forEach(w => {
    const hr = w.avgHeartRate || 135;
    const pct = hr / (maxHrEstimate || 190);
    const duration = w.durationMinutes;

    if (pct < 0.60) zones[0].minutes += duration;
    else if (pct < 0.70) zones[1].minutes += duration;
    else if (pct < 0.80) zones[2].minutes += duration;
    else if (pct < 0.90) zones[3].minutes += duration;
    else zones[4].minutes += duration;
  });

  const totalMin = zones.reduce((sum, z) => sum + z.minutes, 0);

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] rounded-[22px] p-4.5 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none transition-colors">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-[#FA114F]" />
          <h4 className="text-[14px] font-semibold tracking-tight text-[#1C1C1E] dark:text-[#F5F5F7]">
            Zonas de Frecuencia Cardíaca
          </h4>
        </div>
        <span className="text-[12px] font-medium text-[#8E8E93] tabular-nums">
          {totalMin} min registrados
        </span>
      </div>

      <div className="space-y-2.5">
        {zones.map((z, idx) => {
          const pctWidth = totalMin > 0 ? (z.minutes / totalMin) * 100 : 0;
          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: z.color }} />
                  <span className="font-medium text-[#1C1C1E] dark:text-[#E5E5EA]">{z.name}</span>
                  <span className="text-[11px] text-[#8E8E93]">· {z.label}</span>
                </div>
                <span className="font-mono tabular-nums text-[#8E8E93] text-[11px]">
                  {z.minutes} min ({Math.round(pctWidth)}%)
                </span>
              </div>
              <div className="w-full bg-[#E5E5EA] dark:bg-[#2C2C2E] h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pctWidth}%`, backgroundColor: z.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
