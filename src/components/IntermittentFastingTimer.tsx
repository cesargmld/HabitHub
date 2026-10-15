import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Clock, 
  Play, 
  Square, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  Activity, 
  Zap, 
  Info,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FastingState, FastingSession } from '../types';

interface IntermittentFastingTimerProps {
  fastingState: FastingState;
  onUpdateFastingState: (state: FastingState) => void;
  onFastingCalorieBonusCalculated?: (bonusKcal: number) => void;
}

export const IntermittentFastingTimer: React.FC<IntermittentFastingTimerProps> = ({
  fastingState,
  onUpdateFastingState,
  onFastingCalorieBonusCalculated
}) => {
  const [now, setNow] = useState<number>(Date.now());
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [customStartOffsetHours, setCustomStartOffsetHours] = useState<number>(0);

  // Tick clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { isActive, protocol, startTime, targetHours, history } = fastingState;

  const startTimestamp = startTime ? new Date(startTime).getTime() : now;
  const elapsedMs = isActive ? Math.max(0, now - startTimestamp) : 0;
  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  const elapsedHours = elapsedSeconds / 3600;

  const targetSeconds = targetHours * 3600;
  const progressRatio = Math.min(1, elapsedSeconds / targetSeconds);
  const progressPercentage = Math.round(progressRatio * 100);

  const remainingSeconds = Math.max(0, targetSeconds - elapsedSeconds);
  const remainingHours = Math.floor(remainingSeconds / 3600);
  const remainingMins = Math.floor((remainingSeconds % 3600) / 60);
  const remainingSecs = remainingSeconds % 60;

  const displayElapsedHours = Math.floor(elapsedSeconds / 3600);
  const displayElapsedMins = Math.floor((elapsedSeconds % 3600) / 60);
  const displayElapsedSecs = elapsedSeconds % 60;

  // Metabolic stages of intermittent fasting
  const getMetabolicStage = (hours: number) => {
    if (hours < 4) {
      return {
        title: 'Digestión & Almacenamiento',
        desc: 'Insulina elevada, el cuerpo utiliza glucosa reciente para energía inmediata.',
        color: '#FF9500',
        badge: 'Fase 1 (0-4h)',
        fatBurnRate: 'Baja (0.1g/min)'
      };
    } else if (hours < 12) {
      return {
        title: 'Descenso Glucémico',
        desc: 'Los niveles de insulina bajan a nivel basal. Comienza el vaciado de glucógeno hepático.',
        color: '#FFCC00',
        badge: 'Fase 2 (4-12h)',
        fatBurnRate: 'Moderada (0.3g/min)'
      };
    } else if (hours < 16) {
      return {
        title: 'Quema Activa de Grasa (Lipólisis)',
        desc: 'Glucógeno agotado. El cuerpo moviliza ácidos grasos como combustible primario.',
        color: '#A1FF00',
        badge: 'Fase 3 (12-16h)',
        fatBurnRate: 'Máxima (0.6g/min)'
      };
    } else if (hours < 18) {
      return {
        title: 'Cetosis Celular & Hormona GH',
        desc: 'Pico de cetonas séricas y elevación de la hormona de crecimiento que preserva músculo.',
        color: '#00F0FF',
        badge: 'Fase 4 (16-18h)',
        fatBurnRate: 'Alta cetogénica (0.7g/min)'
      };
    } else {
      return {
        title: 'Autofagia & Reciclaje Celular',
        desc: 'Limpieza de mitocondrias y proteínas senescentes dañadas, longevidad óptima.',
        color: '#BF5AF2',
        badge: 'Fase 5 (18h+)',
        fatBurnRate: 'Autofagia y lipólisis profunda'
      };
    }
  };

  const currentStage = getMetabolicStage(elapsedHours);

  // Estimated caloric bonus from enhanced fat oxidation during deep fasting (>12h)
  const fastingFatBonusKcal = elapsedHours > 12 
    ? Math.round((elapsedHours - 12) * 45) // ~45 kcal/h extra fat oxidation
    : 0;

  useEffect(() => {
    if (onFastingCalorieBonusCalculated) {
      onFastingCalorieBonusCalculated(fastingFatBonusKcal);
    }
  }, [fastingFatBonusKcal, onFastingCalorieBonusCalculated]);

  // Protocol change
  const handleSelectProtocol = (p: '16:8' | '18:6' | '20:4' | '14:10') => {
    const hoursMap: Record<string, number> = {
      '14:10': 14,
      '16:8': 16,
      '18:6': 18,
      '20:4': 20
    };
    onUpdateFastingState({
      ...fastingState,
      protocol: p,
      targetHours: hoursMap[p]
    });
  };

  // Start Fasting
  const handleStartFast = (offsetHours: number = 0) => {
    const start = new Date(Date.now() - offsetHours * 3600 * 1000).toISOString();
    onUpdateFastingState({
      ...fastingState,
      isActive: true,
      startTime: start
    });
  };

  // End Fasting
  const handleEndFast = () => {
    if (!startTime) return;
    const completed = elapsedHours >= targetHours;
    if (completed) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 }
      });
    }

    const session: FastingSession = {
      id: `fast-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      protocol,
      startTime,
      endTime: new Date().toISOString(),
      durationHours: Number(elapsedHours.toFixed(1)),
      completed
    };

    onUpdateFastingState({
      ...fastingState,
      isActive: false,
      startTime: '',
      history: [session, ...(history || [])]
    });
  };

  // SVG Circular Meter Config
  const radius = 62;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * progressRatio);

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] rounded-[26px] p-5 sm:p-6 shadow-[0_2px_16px_rgba(0,0,0,0.03)] dark:shadow-none space-y-5 transition-colors">
      
      {/* Top Protocol Bar & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#FF9500]/15 dark:bg-[#FF9500]/25 flex items-center justify-center text-[#FF9500]">
            <Clock className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-bold text-[#1C1C1E] dark:text-[#F5F5F7] tracking-tight">
                Ayuno Intermitente
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                isActive 
                  ? 'bg-[#A1FF00]/20 text-black dark:text-[#A1FF00]' 
                  : 'bg-[#8E8E93]/20 text-[#8E8E93]'
              }`}>
                {isActive ? 'Ayuno Activo' : 'Ventana de Comida'}
              </span>
            </div>
            <p className="text-[11px] text-[#8E8E93]">
              Cronómetro metabólico sincronizado con tu gasto calórico
            </p>
          </div>
        </div>

        {/* Protocol Selector Chips */}
        <div className="flex items-center gap-1 bg-[#F2F2F7] dark:bg-[#2C2C2E] p-0.5 rounded-full self-start sm:self-auto">
          {(['16:8', '18:6', '20:4', '14:10'] as const).map((p) => (
            <button
              key={p}
              disabled={isActive}
              onClick={() => handleSelectProtocol(p)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-full transition-all cursor-pointer ${
                protocol === p
                  ? 'bg-white dark:bg-[#3A3A3C] text-[#1C1C1E] dark:text-[#FF9500] shadow-sm font-bold'
                  : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white disabled:opacity-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Main Circle Timer & Live Stats Grid */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-1">
        
        {/* Apple Style Circular Progress Ring */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg width="150" height="150" className="transform -rotate-90">
            {/* Background track */}
            <circle
              cx="75"
              cy="75"
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-[#F2F2F7] dark:text-[#2C2C2E]"
              fill="transparent"
            />
            {/* Animated progress stroke */}
            <circle
              cx="75"
              cy="75"
              r={radius}
              stroke="url(#fastingGradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-linear"
            />
            <defs>
              <linearGradient id="fastingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF9500" />
                <stop offset="70%" stopColor="#A1FF00" />
                <stop offset="100%" stopColor="#00F0FF" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Digital Clock Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {isActive ? (
              <>
                <span className="text-[20px] font-extrabold tracking-tight font-mono text-[#1C1C1E] dark:text-[#F5F5F7] tabular-nums leading-none">
                  {String(displayElapsedHours).padStart(2, '0')}:{String(displayElapsedMins).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-[#8E8E93] font-mono mt-0.5">
                  de {targetHours}h meta
                </span>
                <span className="text-[11px] font-bold text-[#A1FF00] font-mono mt-1">
                  {progressPercentage}%
                </span>
              </>
            ) : (
              <>
                <Flame className="w-6 h-6 text-[#FF9500] mb-0.5" />
                <span className="text-[11px] font-bold text-[#1C1C1E] dark:text-[#F5F5F7]">
                  {protocol}
                </span>
                <span className="text-[9px] text-[#8E8E93]">
                  Listo para iniciar
                </span>
              </>
            )}
          </div>
        </div>

        {/* Current Metabolic Phase & Bonus Burn */}
        <div className="flex-1 w-full space-y-3">
          
          <div className="p-3.5 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-black/[0.04] dark:border-white/[0.06] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A1FF00]">
                {isActive ? currentStage.badge : 'Protocolo Seleccionado'}
              </span>
              <span className="text-[10px] font-mono text-[#8E8E93]">
                {isActive 
                  ? remainingSeconds > 0 
                    ? `Faltan ${remainingHours}h ${remainingMins}m`
                    : '¡Meta alcanzada!' 
                  : `${targetHours} horas de ayuno`}
              </span>
            </div>

            <h4 className="text-[14px] font-bold text-[#1C1C1E] dark:text-[#F5F5F7] tracking-tight flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#A1FF00]" />
              <span>{isActive ? currentStage.title : `Plan de Ayuno ${protocol}`}</span>
            </h4>
            
            <p className="text-[11px] text-[#8E8E93] leading-relaxed">
              {isActive 
                ? currentStage.desc 
                : '16 horas de reposo digestivo + 8 horas de ventana para cubrir tus macros del día.'}
            </p>

            {isActive && (
              <div className="pt-2 mt-1 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-[11px]">
                <span className="text-[#8E8E93]">Tasa de oxidación lipídica:</span>
                <span className="font-bold text-[#A1FF00] font-mono">{currentStage.fatBurnRate}</span>
              </div>
            )}
          </div>

          {/* Metabolic Bonus Indicator */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
              <Zap className="w-3.5 h-3.5" />
              <span className="font-semibold text-[11px]">Bono metabólico por ayuno profundo:</span>
            </div>
            <span className="font-extrabold text-[12px] font-mono text-amber-600 dark:text-amber-400">
              +{fastingFatBonusKcal} kcal
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {!isActive ? (
              <>
                <button
                  onClick={() => handleStartFast(0)}
                  className="flex-1 py-2 px-3 text-xs font-bold text-black bg-[#A1FF00] hover:bg-[#8FE000] active:scale-95 rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>Iniciar Ayuno Ahora</span>
                </button>

                <button
                  onClick={() => handleStartFast(2)}
                  title="Inició hace 2 horas"
                  className="py-2 px-3 text-[11px] font-semibold text-[#1C1C1E] dark:text-[#F5F5F7] bg-[#F2F2F7] dark:bg-[#2C2C2E] hover:bg-[#E5E5EA] rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                >
                  Inició hace 2h
                </button>
              </>
            ) : (
              <button
                onClick={handleEndFast}
                className="flex-1 py-2 px-3 text-xs font-bold text-white bg-[#FA114F] hover:bg-[#E00E44] active:scale-95 rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>Terminar Ayuno y Guardar</span>
              </button>
            )}

            {history && history.length > 0 && (
              <button
                onClick={() => setShowHistoryModal(true)}
                className="py-2 px-3 text-[11px] font-semibold text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-xl transition-colors cursor-pointer"
              >
                Historial ({history.length})
              </button>
            )}
          </div>

        </div>

      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-black/10 dark:border-white/10">
            <div className="flex items-center justify-between">
              <h4 className="text-[16px] font-bold text-[#1C1C1E] dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-[#A1FF00]" />
                <span>Historial de Ayunos Registrados</span>
              </h4>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-xs font-bold text-[#8E8E93] hover:text-black dark:hover:text-white cursor-pointer"
              >
                Cerrar
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {history.map((s) => (
                <div
                  key={s.id}
                  className="p-3 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-2xl flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#1C1C1E] dark:text-white">
                        {s.protocol}
                      </span>
                      {s.completed ? (
                        <span className="text-[9px] font-bold text-emerald-600 dark:text-[#A1FF00] bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                          Completado
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-[#8E8E93] bg-black/5 px-1.5 py-0.5 rounded-full">
                          Parcial
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#8E8E93] block mt-0.5">
                      {s.date}
                    </span>
                  </div>
                  <span className="text-[13px] font-mono font-bold text-[#1C1C1E] dark:text-white">
                    {s.durationHours} hrs
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
