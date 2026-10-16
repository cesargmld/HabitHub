import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Zap, 
  Trash2, 
  Clock, 
  Activity, 
  Droplet, 
  ScanLine, 
  FileText, 
  FolderArchive,
  Calendar
} from 'lucide-react';
import { UserProfile, WorkoutRecord, MealPlanEntry, DailySummary, FastingState } from '../types';
import { ArcGauge } from './ArcGauge';
import { AppleActivityRings } from './AppleActivityRings';
import { HeartRateZones } from './HeartRateZones';
import { WeeklyTrendChart } from './WeeklyTrendChart';

interface DailyDashboardProps {
  currentDate: string;
  onChangeDate?: (date: string) => void;
  profile: UserProfile;
  dailySummary: DailySummary;
  dayMeals?: MealPlanEntry[];
  dayWorkouts?: WorkoutRecord[];
  allWorkouts?: WorkoutRecord[];
  allMeals?: MealPlanEntry[];
  workouts?: WorkoutRecord[];
  mealPlan?: MealPlanEntry[];
  waterMl: number;
  onAddWater: (amountMl: number) => void;
  onResetWater: () => void;
  onToggleMealEaten: (entryId: string) => void;
  onOpenQuickWorkout?: () => void;
  onOpenAddMealModal: (mealTime?: 'breakfast' | 'lunch' | 'dinner' | 'afternoon_snack') => void;
  onDeleteWorkout?: (id: string) => void;
  onDeleteMeal?: (entryId: string) => void;
  onDeleteMealEntry?: (entryId: string) => void;
  onNavigateTab?: (tab: 'dashboard' | 'planner' | 'monthly_diets' | 'supermarket' | 'workouts') => void;
  fastingState?: FastingState;
  onUpdateFastingState?: (state: FastingState) => void;
  onOpenBarcodeScanner?: () => void;
  onOpenWeeklyReport?: () => void;
  onOpenAppleHealthModal?: () => void;
  onLoadDemoPlan?: () => void;
}

export const DailyDashboard: React.FC<DailyDashboardProps> = ({
  currentDate,
  onChangeDate,
  profile,
  dailySummary,
  dayMeals,
  dayWorkouts,
  allWorkouts,
  allMeals,
  workouts,
  mealPlan,
  waterMl,
  onAddWater,
  onResetWater,
  onToggleMealEaten,
  onOpenQuickWorkout,
  onOpenAddMealModal,
  onDeleteWorkout,
  onDeleteMeal,
  onDeleteMealEntry,
  onNavigateTab,
  fastingState,
  onUpdateFastingState,
  onOpenBarcodeScanner,
  onOpenWeeklyReport,
  onOpenAppleHealthModal
}) => {
  const [heroViewMode, setHeroViewMode] = useState<'rings' | 'gauge'>('rings');

  // Schedule mode: Fractional eating every 4 hours (ideal for gastritis/digestion) vs optional Fasting
  const [scheduleMode, setScheduleMode] = useState<'fractional_4h' | 'fasting'>(() => {
    const saved = localStorage.getItem('habithub_schedule_mode_v5');
    if (saved === 'fasting' || saved === 'fractional_4h') return saved;
    return 'fractional_4h';
  });

  const [lastMealTimestamp, setLastMealTimestamp] = useState<string>(() => {
    return localStorage.getItem('habithub_last_meal_time_v5') || new Date().toISOString();
  });

  const hoursSinceLastMeal = Math.max(0, (Date.now() - new Date(lastMealTimestamp).getTime()) / (3600 * 1000));
  const fastingHours = fastingState && fastingState.startTime 
    ? Math.max(0, (Date.now() - new Date(fastingState.startTime).getTime()) / (3600 * 1000))
    : 0;

  const handleLogMealTimeNow = () => {
    const nowIso = new Date().toISOString();
    setLastMealTimestamp(nowIso);
    localStorage.setItem('habithub_last_meal_time_v5', nowIso);
  };

  const handleSwitchScheduleMode = (mode: 'fractional_4h' | 'fasting') => {
    setScheduleMode(mode);
    localStorage.setItem('habithub_schedule_mode_v5', mode);
  };

  const effectiveAllWorkouts = allWorkouts || workouts || [];
  const effectiveAllMeals = allMeals || mealPlan || [];
  const effectiveDayWorkouts = dayWorkouts || effectiveAllWorkouts.filter(w => w.date === currentDate);
  const effectiveDayMeals = dayMeals || effectiveAllMeals.filter(m => m.date === currentDate);

  const [year, month, day] = currentDate.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const isToday = new Date().toISOString().split('T')[0] === currentDate;

  const formattedDateTitle = dateObj.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });

  const shiftDate = (days: number) => {
    if (!onChangeDate) return;
    const newDate = new Date(dateObj);
    newDate.setDate(newDate.getDate() + days);
    onChangeDate(newDate.toISOString().split('T')[0]);
  };

  // Real data calculations (STRICTLY 0 when no workouts are recorded)
  const totalWorkoutMinutes = effectiveDayWorkouts.reduce((sum, w) => sum + w.durationMinutes, 0);
  const activeWorkoutCalories = effectiveDayWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
  const realSteps = effectiveDayWorkouts.reduce((sum, w) => {
    if (w.distanceKm) return sum + Math.round(w.distanceKm * 1250);
    return sum + (w.durationMinutes * 120);
  }, 0);

  const netBalance = dailySummary.netCaloricBalance;
  const isDeficit = netBalance <= 0;

  // Group meals by slots
  const breakfastMeals = effectiveDayMeals.filter(m => m.dish.mealTime === 'breakfast');
  const lunchMeals = effectiveDayMeals.filter(m => m.dish.mealTime === 'lunch');
  const dinnerMeals = effectiveDayMeals.filter(m => m.dish.mealTime === 'dinner');
  const snackMeals = effectiveDayMeals.filter(m => m.dish.mealTime === 'morning_snack' || m.dish.mealTime === 'afternoon_snack');

  const handleDeleteMealItem = onDeleteMeal || onDeleteMealEntry || (() => {});

  // Compute 7-day trend data for WeeklyTrendChart
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(dateObj);
    d.setDate(d.getDate() - (6 - i));
    const dStr = d.toISOString().split('T')[0];
    const dayWks = effectiveAllWorkouts.filter(w => w.date === dStr);
    const dayMls = effectiveAllMeals.filter(m => m.date === dStr);
    const burned = dailySummary.bmr + dailySummary.neat + dayWks.reduce((s, w) => s + (w.caloriesBurned || 0), 0);
    const consumed = dayMls.reduce((s, m) => s + (m.dish.calories * (m.servings || 1)), 0);

    return {
      dayName: d.toLocaleDateString('es-MX', { weekday: 'narrow' }),
      dayNumber: d.getDate(),
      burned,
      consumed: consumed > 0 ? consumed : 0,
      isToday: dStr === currentDate
    };
  });

  return (
    <div className="space-y-5 pb-28 md:pb-12">
      
      {/* Date Bar: Responsive for iPhone and iPad */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#13151D]/90 backdrop-blur-xl p-3 sm:p-4 rounded-2xl border border-white/[0.06] transition-colors">
        <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => shiftDate(-1)}
              title="Día anterior"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1A1D27] hover:bg-[#222634] text-[#8E92A4] hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] sm:text-[17px] font-bold capitalize text-white tracking-tight">
                  {formattedDateTitle}
                </h2>
                {isToday && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#A1FF00] text-black uppercase tracking-tight shadow-sm">
                    Hoy
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#7E8494] leading-none mt-0.5">
                HabitHub Athletic Track · Sincronizado
              </p>
            </div>

            <button
              onClick={() => shiftDate(1)}
              title="Día siguiente"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1A1D27] hover:bg-[#222634] text-[#8E92A4] hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5">
          {!isToday && (
            <button
              onClick={() => onChangeDate && onChangeDate(new Date().toISOString().split('T')[0])}
              className="px-3 py-1 text-xs font-black text-black bg-[#A1FF00] hover:bg-[#8FE000] rounded-full transition-colors cursor-pointer shadow-sm active:scale-95"
            >
              Hoy
            </button>
          )}

          {/* Mode Switcher: Rings vs Gauge */}
          <div className="flex items-center bg-[#1A1D27] p-0.5 rounded-full border border-white/5">
            <button
              onClick={() => setHeroViewMode('rings')}
              className={`px-3 py-1 text-[11px] font-bold rounded-full transition-all cursor-pointer ${
                heroViewMode === 'rings' 
                  ? 'bg-[#A1FF00] text-black shadow-sm font-black' 
                  : 'text-[#8E92A4] hover:text-white'
              }`}
            >
              Anillos
            </button>
            <button
              onClick={() => setHeroViewMode('gauge')}
              className={`px-3 py-1 text-[11px] font-bold rounded-full transition-all cursor-pointer ${
                heroViewMode === 'gauge' 
                  ? 'bg-[#A1FF00] text-black shadow-sm font-black' 
                  : 'text-[#8E92A4] hover:text-white'
              }`}
            >
              Balance
            </button>
          </div>
        </div>
      </div>

      {/* Daily Activity Card */}
      <div className="bg-[#13151D]/90 backdrop-blur-2xl rounded-3xl p-4 sm:p-6 border border-white/[0.06] shadow-sm transition-colors">
        
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[17px] font-black text-white tracking-tight">
            Daily Activity
          </h3>
          <button
            onClick={() => onNavigateTab && onNavigateTab('workouts')}
            className="text-xs font-bold text-[#A1FF00] hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>Ver detalles</span>
            <span>&gt;</span>
          </button>
        </div>

        {heroViewMode === 'rings' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-center">
            
            {/* Concentric Athletic Rings (Starts at 0 if no workouts logged) */}
            <div className="flex flex-col items-center justify-center order-1 md:order-2 py-2">
              <AppleActivityRings
                moveCurrent={activeWorkoutCalories}
                moveTarget={500}
                exerciseCurrent={totalWorkoutMinutes}
                exerciseTarget={45}
                nutritionCurrent={dailySummary.proteinConsumedG}
                nutritionTarget={profile.proteinTargetG}
                size={185}
              />
              {/* Ring Indicator Badges */}
              <div className="flex items-center gap-3 mt-3 text-[11px] font-bold">
                <span className="flex items-center gap-1.5 text-[#FF1255]">
                  <span className="w-2 h-2 rounded-full bg-[#FF1255]" />
                  <span>Movimiento</span>
                </span>
                <span className="flex items-center gap-1.5 text-[#A1FF00]">
                  <span className="w-2 h-2 rounded-full bg-[#A1FF00]" />
                  <span>Ejercicio</span>
                </span>
                <span className="flex items-center gap-1.5 text-[#00F0FF]">
                  <span className="w-2 h-2 rounded-full bg-[#00F0FF]" />
                  <span>Nutrición</span>
                </span>
              </div>
            </div>

            {/* Apple 2x2 Metric Cards Grid (Real Data: 0 if no workouts recorded) */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 order-2 md:order-1 w-full">
              
              {/* Card 1: Pasos Reales */}
              <div className="bg-[#181B26]/80 border border-white/5 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#8E92A4]">Pasos</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-white/5 text-slate-300">
                    {realSteps > 0 ? Math.min(100, Math.round((realSteps / 15000) * 100)) : 0}%
                  </span>
                </div>
                <div className="mt-2">
                  <div className="text-base sm:text-lg font-black font-mono text-white tabular-nums">
                    {realSteps.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-[#656A7B] font-mono">meta 15 000</div>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full mt-2.5 overflow-hidden">
                  <div 
                    className="bg-[#FF1255] h-full rounded-full transition-all" 
                    style={{ width: `${realSteps > 0 ? Math.min(100, Math.round((realSteps / 15000) * 100)) : 0}%` }}
                  />
                </div>
              </div>

              {/* Card 2: Calorías Activas de Entrenamiento */}
              <div className="bg-[#181B26]/80 border border-white/5 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#8E92A4]">Gasto Activo</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-white/5 text-slate-300">
                    {activeWorkoutCalories > 0 ? Math.min(100, Math.round((activeWorkoutCalories / 500) * 100)) : 0}%
                  </span>
                </div>
                <div className="mt-2">
                  <div className="text-base sm:text-lg font-black font-mono text-white tabular-nums">
                    {activeWorkoutCalories} <span className="text-xs font-normal text-[#8E92A4]">kcal</span>
                  </div>
                  <div className="text-[10px] text-[#656A7B] font-mono">meta 500 kcal</div>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full mt-2.5 overflow-hidden">
                  <div 
                    className="bg-[#A1FF00] h-full rounded-full transition-all" 
                    style={{ width: `${activeWorkoutCalories > 0 ? Math.min(100, Math.round((activeWorkoutCalories / 500) * 100)) : 0}%` }}
                  />
                </div>
              </div>

              {/* Card 3: Hidratación */}
              <div className="bg-[#181B26]/80 border border-white/5 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#8E92A4]">Agua</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-white/5 text-slate-300">
                    {Math.min(100, Math.round((waterMl / 2500) * 100))}%
                  </span>
                </div>
                <div className="mt-2">
                  <div className="text-base sm:text-lg font-black font-mono text-white tabular-nums">
                    {(waterMl / 1000).toFixed(1).replace('.', ',')} <span className="text-xs font-normal text-[#8E92A4]">L</span>
                  </div>
                  <div className="text-[10px] text-[#656A7B] font-mono">meta 2,5 L</div>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full mt-2.5 overflow-hidden">
                  <div 
                    className="bg-[#00F0FF] h-full rounded-full transition-all" 
                    style={{ width: `${Math.min(100, Math.round((waterMl / 2500) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Card 4: Ritmo de Comidas */}
              <div className="bg-[#181B26]/80 border border-white/5 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#8E92A4]">
                    {scheduleMode === 'fractional_4h' ? 'Comida c/4h' : 'Ayuno 16:8'}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-white/5 text-[#A1FF00]">
                    Activo
                  </span>
                </div>
                <div className="mt-2">
                  <div className="text-base sm:text-lg font-black font-mono text-white tabular-nums">
                    {scheduleMode === 'fractional_4h' ? `${hoursSinceLastMeal.toFixed(1)} h` : `${fastingHours.toFixed(1)} h`}
                  </div>
                  <div className="text-[10px] text-[#656A7B] font-mono">
                    {scheduleMode === 'fractional_4h' ? 'meta cada 4 h' : 'meta 16 h'}
                  </div>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full mt-2.5 overflow-hidden">
                  <div 
                    className="bg-[#A1FF00] h-full rounded-full transition-all" 
                    style={{ width: `${Math.min(100, Math.round(((scheduleMode === 'fractional_4h' ? hoursSinceLastMeal / 4 : fastingHours / 16)) * 100))}%` }}
                  />
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="py-2">
            <div className="text-center max-w-sm mx-auto mb-1">
              <h3 className="text-base font-bold text-white">
                Balance Calórico en Vivo
              </h3>
              <p className="text-xs text-[#8E92A4]">
                Gasto ({dailySummary.totalExpenditureTdee} kcal) vs Consumido ({dailySummary.caloriesConsumed} kcal)
              </p>
            </div>
            <ArcGauge
              value={netBalance}
              min={-1200}
              max={1200}
              target={0}
              label={isDeficit ? "Déficit Quema de Grasa" : "Superávit Calórico"}
              unit="kcal netas"
              mode={isDeficit ? "deficit" : "surplus"}
            />
          </div>
        )}

        {/* Real-time Net Calorie Strip */}
        <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isDeficit ? 'bg-[#A1FF00]' : 'bg-[#FF5722]'}`} />
            <span className="font-semibold text-white">
              {isDeficit ? 'Déficit Metabólico Activo' : 'Superávit Calórico'}
            </span>
          </div>

          <div className="font-mono tabular-nums font-bold">
            <span className={isDeficit ? 'text-[#A1FF00]' : 'text-[#FF5722]'}>
              {netBalance > 0 ? `+${netBalance}` : netBalance} kcal netas
            </span>
          </div>
        </div>

      </div>

      {/* Quick Actions Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {onOpenAppleHealthModal && (
          <button
            onClick={onOpenAppleHealthModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-[#13151D] hover:bg-[#1A1D27] text-white border border-white/[0.06] hover:border-[#FF1255]/60 shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0"
          >
            <Activity className="w-3.5 h-3.5 text-[#FF1255]" />
            <span>Apple Salud Sync</span>
          </button>
        )}

        {onOpenBarcodeScanner && (
          <button
            onClick={onOpenBarcodeScanner}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-[#13151D] hover:bg-[#1A1D27] text-white border border-white/[0.06] hover:border-[#00F0FF]/60 shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0"
          >
            <ScanLine className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>Comparador Súper (Costco vs HEB)</span>
          </button>
        )}

        {onOpenWeeklyReport && (
          <button
            onClick={onOpenWeeklyReport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-[#13151D] hover:bg-[#1A1D27] text-white border border-white/[0.06] hover:border-amber-400/60 shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Reporte Semanal PDF</span>
          </button>
        )}

        <button
          onClick={() => onNavigateTab && onNavigateTab('monthly_diets')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-[#13151D] hover:bg-[#1A1D27] text-white border border-white/[0.06] hover:border-[#A1FF00]/60 shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0"
        >
          <FolderArchive className="w-3.5 h-3.5 text-[#A1FF00]" />
          <span>Dietas por Mes</span>
        </button>
      </div>

      {/* Accessible Split Section: Hidratación & Ritmo de Comidas (Gastritis c/4h o Ayuno) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Card 1: Hidratación Interactiva */}
        <div className="bg-[#13151D]/90 backdrop-blur-2xl border border-white/[0.06] rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/25 flex items-center justify-center text-[#00F0FF]">
                <Droplet className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Hidratación Diaria</h4>
                <p className="text-[11px] text-[#8E92A4]">Meta recomendada: 2,500 ml</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white/5 text-[#00F0FF]">
              {Math.min(100, Math.round((waterMl / 2500) * 100))}%
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black font-mono text-white tabular-nums">
                {waterMl.toLocaleString()}
              </span>
              <span className="text-xs text-[#8E92A4] font-semibold">/ 2,500 ml</span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#00F0FF] to-[#007AFF] h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round((waterMl / 2500) * 100))}%` }}
              />
            </div>
          </div>

          {/* Quick Water Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onAddWater(250)}
              className="flex-1 py-2 px-2.5 rounded-xl bg-[#1A1D27] hover:bg-[#222634] text-white text-xs font-bold transition-all cursor-pointer active:scale-95 border border-white/5 text-center"
            >
              +250 ml
            </button>
            <button
              onClick={() => onAddWater(500)}
              className="flex-1 py-2 px-2.5 rounded-xl bg-[#1A1D27] hover:bg-[#222634] text-[#00F0FF] text-xs font-bold transition-all cursor-pointer active:scale-95 border border-white/5 text-center"
            >
              +500 ml
            </button>
            <button
              onClick={onResetWater}
              title="Reiniciar a 0 ml"
              className="py-2 px-3 rounded-xl bg-[#1A1D27] hover:bg-rose-500/20 text-[#6F7485] hover:text-rose-400 text-xs font-semibold transition-all cursor-pointer active:scale-95 border border-white/5"
            >
              Reiniciar
            </button>
          </div>
        </div>

        {/* Card 2: Ritmo Nutricional & Horarios (Comidas cada 4h para Gastritis o Ayuno) */}
        <div className="bg-[#13151D]/90 backdrop-blur-2xl border border-white/[0.06] rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#A1FF00]/10 border border-[#A1FF00]/25 flex items-center justify-center text-[#A1FF00]">
                <Clock className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Ritmo de Comidas & Ventana</h4>
                <p className="text-[11px] text-[#8E92A4]">Control gástrico y tiempo entre ingestas</p>
              </div>
            </div>

            {/* Mode Selector */}
            <div className="flex items-center bg-[#181B26] p-0.5 rounded-xl border border-white/5 text-[10px]">
              <button
                onClick={() => handleSwitchScheduleMode('fractional_4h')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  scheduleMode === 'fractional_4h' 
                    ? 'bg-[#A1FF00] text-black shadow-sm font-black' 
                    : 'text-[#8E92A4] hover:text-white'
                }`}
              >
                Cada 4h
              </button>
              <button
                onClick={() => handleSwitchScheduleMode('fasting')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  scheduleMode === 'fasting' 
                    ? 'bg-[#A1FF00] text-black shadow-sm font-black' 
                    : 'text-[#8E92A4] hover:text-white'
                }`}
              >
                Ayuno
              </button>
            </div>
          </div>

          <div>
            {scheduleMode === 'fractional_4h' ? (
              <div>
                <span className="text-[11px] text-[#A1FF00] font-bold uppercase tracking-wider block">
                  Régimen Fraccionado (Recomendado para Gastritis)
                </span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-white tabular-nums">
                    {hoursSinceLastMeal.toFixed(1)} <span className="text-xs font-normal text-[#8E92A4]">horas desde última ingesta</span>
                  </span>
                </div>
                <p className="text-[11px] text-[#8E92A4] mt-1">
                  {hoursSinceLastMeal >= 4 
                    ? '⚠️ Han pasado más de 4 horas. Momento sugerido para tu siguiente porción/colación.'
                    : `Siguiente comida sugerida en aprox. ${(4 - hoursSinceLastMeal).toFixed(1)} horas.`}
                </p>
              </div>
            ) : (
              <div>
                <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider block">
                  Protocolo de Ayuno ({fastingState?.protocol || '16:8'})
                </span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-white tabular-nums">
                    {fastingHours.toFixed(1)} <span className="text-xs font-normal text-[#8E92A4]">/ {fastingState?.targetHours || 16} h</span>
                  </span>
                </div>
                <p className="text-[11px] text-[#8E92A4] mt-1">
                  Ventana de ayuno activo. Consume líquidos sin calorías.
                </p>
              </div>
            )}
          </div>

          <div className="pt-1">
            <button
              onClick={handleLogMealTimeNow}
              className="w-full py-2 px-3 rounded-xl bg-white/[0.06] hover:bg-white/10 text-white text-xs font-bold transition-all cursor-pointer active:scale-95 border border-white/10 flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#A1FF00]" />
              <span>Marcar Ingesta Ahora (Reiniciar Intervalo)</span>
            </button>
          </div>
        </div>

      </div>

      {/* Entrenamientos del Día */}
      <div className="bg-[#13151D]/90 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 border border-white/[0.06] shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#A1FF00]" />
            <h3 className="text-[17px] font-black text-white tracking-tight">
              Entrenamientos del Día
            </h3>
            <span className="text-xs text-[#8E92A4] font-mono">
              ({effectiveDayWorkouts.length})
            </span>
          </div>

          {onOpenQuickWorkout && (
            <button
              onClick={onOpenQuickWorkout}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-black text-black bg-[#A1FF00] hover:bg-[#8FE000] rounded-full transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Registrar Entreno</span>
            </button>
          )}
        </div>

        {effectiveDayWorkouts.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl space-y-1.5">
            <p className="text-xs font-bold text-white">
              No hay entrenamientos registrados hoy ({formattedDateTitle}).
            </p>
            <p className="text-[11px] text-[#8E92A4] max-w-md mx-auto">
              Tus calorías activas y pasos permanecen en 0 hasta registrar una sesión manual o subir archivo de Coros, Polar o Apple Watch.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {effectiveDayWorkouts.map(w => (
              <div key={w.id} className="p-3.5 rounded-2xl bg-[#181B26] border border-white/5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-[#A1FF00]">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{w.title}</h4>
                    <span className="text-[11px] text-[#8E92A4] font-mono">
                      {w.durationMinutes} min · <strong className="text-white">{w.caloriesBurned} kcal</strong> {w.distanceKm ? `· ${w.distanceKm} km` : ''} {w.avgHeartRate ? `· ${w.avgHeartRate} bpm` : ''}
                    </span>
                  </div>
                </div>
                {onDeleteWorkout && (
                  <button
                    onClick={() => onDeleteWorkout(w.id)}
                    className="p-1.5 text-[#656A7B] hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2-Column Responsive Split: Trends & Heart Rate Training Zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WeeklyTrendChart trendData={trendData} />
        <HeartRateZones
          workouts={effectiveDayWorkouts}
          maxHrEstimate={220 - (profile?.age || 25)}
        />
      </div>

      {/* Comidas del Día / Food Plan */}
      <div className="bg-[#13151D]/90 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 border border-white/[0.06] shadow-sm transition-colors">
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[17px] font-black text-white tracking-tight">
              Comidas del Día
            </h3>
            <p className="text-xs text-[#8E92A4]">
              Toca para marcar consumido y sincronizar balance en tiempo real
            </p>
          </div>

          <button
            onClick={() => onOpenAddMealModal()}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-black text-black bg-[#A1FF00] hover:bg-[#8FE000] rounded-full transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Añadir</span>
          </button>
        </div>

        {/* Meal Slot Cards */}
        <div className="space-y-3">
          
          {/* Desayuno */}
          <div className="p-4 rounded-2xl bg-[#181B26] border border-white/[0.04]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8E92A4]">
                Desayuno · <span className="font-mono text-white font-black">{breakfastMeals.reduce((s, m) => s + m.dish.calories, 0)} kcal</span>
              </span>
              <button
                onClick={() => onOpenAddMealModal('breakfast')}
                className="w-7 h-7 rounded-full bg-[#202433] hover:bg-[#2A2F42] text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {breakfastMeals.length === 0 ? (
              <p className="text-xs text-[#6F7485] italic mt-2">
                Sin comida registrada en desayuno
              </p>
            ) : (
              <div className="mt-2.5 space-y-2">
                {breakfastMeals.map(entry => (
                  <div key={entry.id} className="flex items-center justify-between p-3 rounded-xl bg-[#13151D] border border-white/[0.04]">
                    <button
                      onClick={() => onToggleMealEaten(entry.id)}
                      className="flex items-center gap-3 min-w-0 text-left cursor-pointer"
                    >
                      {entry.eaten ? (
                        <CheckCircle2 className="w-5 h-5 text-[#A1FF00] shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#656A7B] shrink-0" />
                      )}
                      <div className="min-w-0">
                        <span className={`text-sm font-bold block truncate ${entry.eaten ? 'line-through text-[#6F7485]' : 'text-white'}`}>
                          {entry.dish.name}
                        </span>
                        <span className="text-[11px] text-[#8E92A4] font-mono">
                          {entry.dish.calories} kcal · <span className="text-[#A1FF00] font-bold">{entry.dish.proteinG}g P</span> · {entry.dish.carbsG}g C
                        </span>
                        {(entry.dish.nutritionistName || entry.dish.sourceDocument) && (
                          <span className="text-sky-400 font-semibold block text-[10px] mt-0.5">
                            📋 {entry.dish.nutritionistName || entry.dish.sourceDocument}
                          </span>
                        )}
                      </div>
                    </button>
                    <button
                      onClick={() => handleDeleteMealItem(entry.id)}
                      className="p-1.5 text-[#6F7485] hover:text-[#FF453A] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comida / Almuerzo */}
          <div className="p-4 rounded-2xl bg-[#181B26] border border-white/[0.04]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8E92A4]">
                Comida / Almuerzo · <span className="font-mono text-white font-black">{lunchMeals.reduce((s, m) => s + m.dish.calories, 0)} kcal</span>
              </span>
              <button
                onClick={() => onOpenAddMealModal('lunch')}
                className="w-7 h-7 rounded-full bg-[#202433] hover:bg-[#2A2F42] text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {lunchMeals.length === 0 ? (
              <p className="text-xs text-[#6F7485] italic mt-2">
                Sin comida registrada en almuerzo
              </p>
            ) : (
              <div className="mt-2.5 space-y-2">
                {lunchMeals.map(entry => (
                  <div key={entry.id} className="flex items-center justify-between p-3 rounded-xl bg-[#13151D] border border-white/[0.04]">
                    <button
                      onClick={() => onToggleMealEaten(entry.id)}
                      className="flex items-center gap-3 min-w-0 text-left cursor-pointer"
                    >
                      {entry.eaten ? (
                        <CheckCircle2 className="w-5 h-5 text-[#A1FF00] shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#656A7B] shrink-0" />
                      )}
                      <div className="min-w-0">
                        <span className={`text-sm font-bold block truncate ${entry.eaten ? 'line-through text-[#6F7485]' : 'text-white'}`}>
                          {entry.dish.name}
                        </span>
                        <span className="text-[11px] text-[#8E92A4] font-mono">
                          {entry.dish.calories} kcal · <span className="text-[#A1FF00] font-bold">{entry.dish.proteinG}g P</span> · {entry.dish.carbsG}g C
                        </span>
                        {(entry.dish.nutritionistName || entry.dish.sourceDocument) && (
                          <span className="text-sky-400 font-semibold block text-[10px] mt-0.5">
                            📋 {entry.dish.nutritionistName || entry.dish.sourceDocument}
                          </span>
                        )}
                      </div>
                    </button>
                    <button
                      onClick={() => handleDeleteMealItem(entry.id)}
                      className="p-1.5 text-[#6F7485] hover:text-[#FF453A] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cena */}
          <div className="p-4 rounded-2xl bg-[#181B26] border border-white/[0.04]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8E92A4]">
                Cena · <span className="font-mono text-white font-black">{dinnerMeals.reduce((s, m) => s + m.dish.calories, 0)} kcal</span>
              </span>
              <button
                onClick={() => onOpenAddMealModal('dinner')}
                className="w-7 h-7 rounded-full bg-[#202433] hover:bg-[#2A2F42] text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {dinnerMeals.length === 0 ? (
              <p className="text-xs text-[#6F7485] italic mt-2">
                Sin comida registrada en cena
              </p>
            ) : (
              <div className="mt-2.5 space-y-2">
                {dinnerMeals.map(entry => (
                  <div key={entry.id} className="flex items-center justify-between p-3 rounded-xl bg-[#13151D] border border-white/[0.04]">
                    <button
                      onClick={() => onToggleMealEaten(entry.id)}
                      className="flex items-center gap-3 min-w-0 text-left cursor-pointer"
                    >
                      {entry.eaten ? (
                        <CheckCircle2 className="w-5 h-5 text-[#A1FF00] shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#656A7B] shrink-0" />
                      )}
                      <div className="min-w-0">
                        <span className={`text-sm font-bold block truncate ${entry.eaten ? 'line-through text-[#6F7485]' : 'text-white'}`}>
                          {entry.dish.name}
                        </span>
                        <span className="text-[11px] text-[#8E92A4] font-mono">
                          {entry.dish.calories} kcal · <span className="text-[#A1FF00] font-bold">{entry.dish.proteinG}g P</span> · {entry.dish.carbsG}g C
                        </span>
                        {(entry.dish.nutritionistName || entry.dish.sourceDocument) && (
                          <span className="text-sky-400 font-semibold block text-[10px] mt-0.5">
                            📋 {entry.dish.nutritionistName || entry.dish.sourceDocument}
                          </span>
                        )}
                      </div>
                    </button>
                    <button
                      onClick={() => handleDeleteMealItem(entry.id)}
                      className="p-1.5 text-[#6F7485] hover:text-[#FF453A] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Colaciones */}
          {snackMeals.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#181B26] border border-white/[0.04]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8E92A4]">
                Colaciones & Snacks
              </span>
              <div className="mt-2.5 space-y-2">
                {snackMeals.map(entry => (
                  <div key={entry.id} className="flex items-center justify-between p-3 rounded-xl bg-[#13151D] border border-white/[0.04]">
                    <button
                      onClick={() => onToggleMealEaten(entry.id)}
                      className="flex items-center gap-3 min-w-0 text-left cursor-pointer"
                    >
                      {entry.eaten ? (
                        <CheckCircle2 className="w-5 h-5 text-[#A1FF00] shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#656A7B] shrink-0" />
                      )}
                      <div className="min-w-0">
                        <span className={`text-sm font-bold block truncate ${entry.eaten ? 'line-through text-[#6F7485]' : 'text-white'}`}>
                          {entry.dish.name}
                        </span>
                        <span className="text-[11px] text-[#8E92A4] font-mono">
                          {entry.dish.calories} kcal · <span className="text-[#A1FF00] font-bold">{entry.dish.proteinG}g P</span> · {entry.dish.carbsG}g C
                        </span>
                        {(entry.dish.nutritionistName || entry.dish.sourceDocument) && (
                          <span className="text-sky-400 font-semibold block text-[10px] mt-0.5">
                            📋 {entry.dish.nutritionistName || entry.dish.sourceDocument}
                          </span>
                        )}
                      </div>
                    </button>
                    <button
                      onClick={() => handleDeleteMealItem(entry.id)}
                      className="p-1.5 text-[#6F7485] hover:text-[#FF453A] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
