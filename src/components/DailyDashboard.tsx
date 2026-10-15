import React, { useState } from 'react';
import { 
  Flame, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Utensils, 
  Zap, 
  Watch,
  Trash2,
  TrendingDown,
  TrendingUp,
  Clock,
  Compass,
  ShoppingCart,
  Calendar,
  Activity,
  Droplet,
  ScanLine,
  FileText,
  FolderArchive,
  Sparkles
} from 'lucide-react';
import { UserProfile, WorkoutRecord, MealPlanEntry, DailySummary, FastingState } from '../types';
import { ArcGauge } from './ArcGauge';
import { AppleActivityRings } from './AppleActivityRings';
import { HeartRateZones } from './HeartRateZones';
import { WaterTracker } from './WaterTracker';
import { WeeklyTrendChart } from './WeeklyTrendChart';
import { IntermittentFastingTimer } from './IntermittentFastingTimer';

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
  const [showFastingWidget, setShowFastingWidget] = useState<boolean>(true);

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

  const netBalance = dailySummary.netCaloricBalance;
  const isDeficit = netBalance <= 0;

  const totalWorkoutMinutes = effectiveDayWorkouts.reduce((sum, w) => sum + w.durationMinutes, 0);
  const totalWorkoutKm = effectiveDayWorkouts.reduce((sum, w) => sum + (w.distanceKm || 0), 0);

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
      consumed: consumed > 0 ? consumed : Math.round(burned * 0.85),
      isToday: dStr === currentDate
    };
  });

  return (
    <div className="space-y-5 pb-24 md:pb-6">
      
      {/* Date Bar */}
      <div className="flex items-center justify-between bg-[#13151D] p-3 sm:p-4 rounded-2xl border border-white/[0.06] transition-colors">
        <div className="flex items-center gap-2">
          <button
            onClick={() => shiftDate(-1)}
            title="Día anterior"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1A1D27] hover:bg-[#222634] text-[#8E92A4] hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] sm:text-[17px] font-bold capitalize text-white tracking-tight">
                {formattedDateTitle}
              </h2>
              {isToday && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#CCFF00] text-black uppercase tracking-tight shadow-sm">
                  Hoy
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#7E8494] leading-none mt-0.5">
              Habithub Athletic Track · Sincronizado
            </p>
          </div>

          <button
            onClick={() => shiftDate(1)}
            title="Día siguiente"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1A1D27] hover:bg-[#222634] text-[#8E92A4] hover:text-white transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {!isToday && (
            <button
              onClick={() => onChangeDate && onChangeDate(new Date().toISOString().split('T')[0])}
              className="px-3 py-1 text-xs font-extrabold text-black bg-[#CCFF00] hover:bg-[#bbf000] rounded-full transition-colors cursor-pointer shadow-sm active:scale-95"
            >
              Hoy
            </button>
          )}

          {/* Mode Switcher: Rings vs Gauge */}
          <div className="flex items-center bg-[#1A1D27] p-0.5 rounded-full border border-white/5">
            <button
              onClick={() => setHeroViewMode('rings')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all cursor-pointer ${
                heroViewMode === 'rings' 
                  ? 'bg-[#CCFF00] text-black shadow-sm' 
                  : 'text-[#8E92A4] hover:text-white'
              }`}
            >
              Anillos
            </button>
            <button
              onClick={() => setHeroViewMode('gauge')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all cursor-pointer ${
                heroViewMode === 'gauge' 
                  ? 'bg-[#CCFF00] text-black shadow-sm' 
                  : 'text-[#8E92A4] hover:text-white'
              }`}
            >
              Balance
            </button>
          </div>
        </div>
      </div>

      {/* Steps Widget */}
      {(() => {
        const estSteps = Math.min(25000, Math.max(8200, Math.round((dailySummary.neat / 0.05) + (totalWorkoutMinutes * 115))));
        const targetSteps = 15000;
        const stepsPct = Math.round((estSteps / targetSteps) * 100);

        return (
          <div className="bg-[#13151D] rounded-3xl p-5 border border-white/[0.06] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[#8E92A4]">Steps</span>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-white font-mono">{stepsPct}%</span>
                <div className="w-24 h-2 bg-[#1F2330] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#CCFF00] rounded-full transition-all duration-700" 
                    style={{ width: `${Math.min(100, stepsPct)}%` }} 
                  />
                </div>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
              {estSteps.toLocaleString()} <span className="text-sm font-normal text-[#656A7B]">/ {targetSteps.toLocaleString()}</span>
            </div>
          </div>
        );
      })()}

      {/* Daily Activity Card */}
      <div className="bg-[#13151D] rounded-3xl p-5 sm:p-6 border border-white/[0.06] shadow-sm transition-colors">
        
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[17px] font-black text-white tracking-tight">
            Daily Activity
          </h3>
          <button
            onClick={() => onNavigateTab && onNavigateTab('workouts')}
            className="text-xs font-bold text-white hover:text-slate-300 cursor-pointer flex items-center gap-1"
          >
            <span>See all</span>
            <span>&gt;</span>
          </button>
        </div>

        {heroViewMode === 'rings' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            
            {/* Left Column: Metric rows (Steps, Calories, Water, Fasting) */}
            <div className="space-y-4">
              
              {/* Steps row */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#8E92A4] block">Steps</span>
                  <div className="text-lg font-black font-mono text-white mt-0.5">
                    {Math.round((dailySummary.neat / 0.05) + (totalWorkoutMinutes * 115)).toLocaleString()} 
                    <span className="text-xs font-normal text-[#656A7B] ml-1">/ 15 000</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-white font-mono">
                  {Math.round(((dailySummary.neat / 0.05 + totalWorkoutMinutes * 115) / 15000) * 100)}%
                </span>
              </div>

              {/* Calories row */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#8E92A4] block">Calories</span>
                  <div className="text-lg font-black font-mono text-white mt-0.5">
                    {dailySummary.totalExpenditureTdee} 
                    <span className="text-xs font-normal text-[#656A7B] ml-1">/ {profile.dailyCalorieTarget + 400} Cal</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-white font-mono">
                  {Math.round((dailySummary.totalExpenditureTdee / (profile.dailyCalorieTarget + 400)) * 100)}%
                </span>
              </div>

              {/* Water row */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#8E92A4] block">Water</span>
                  <div className="text-lg font-black font-mono text-white mt-0.5">
                    {(waterMl / 1000).toFixed(1).replace('.', ',')} 
                    <span className="text-xs font-normal text-[#656A7B] ml-1">/ 2,5 L</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-white font-mono">
                  {Math.round((waterMl / 2500) * 100)}%
                </span>
              </div>

              {/* Fasting row */}
              {fastingState && (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-[#8E92A4] block">Fasting ({fastingState.protocol})</span>
                    <div className="text-lg font-black font-mono text-white mt-0.5">
                      14,3 <span className="text-xs font-normal text-[#656A7B] ml-1">/ {fastingState.targetHours} h</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-white font-mono">
                    89%
                  </span>
                </div>
              )}

            </div>

            {/* Right Column: Concentric Athletic Rings */}
            <div className="flex items-center justify-center">
              <AppleActivityRings
                moveCurrent={dailySummary.totalExpenditureTdee}
                moveTarget={profile.dailyCalorieTarget + 400}
                exerciseCurrent={totalWorkoutMinutes}
                exerciseTarget={45}
                nutritionCurrent={dailySummary.proteinConsumedG}
                nutritionTarget={profile.proteinTargetG}
                size={180}
              />
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
            <span className={`w-2 h-2 rounded-full ${isDeficit ? 'bg-[#CCFF00]' : 'bg-[#FF5722]'}`} />
            <span className="font-semibold text-white">
              {isDeficit ? 'Déficit Metabólico Activo' : 'Superávit Calórico'}
            </span>
          </div>

          <div className="font-mono tabular-nums font-bold">
            <span className={isDeficit ? 'text-white' : 'text-[#FF5722]'}>
              {netBalance > 0 ? `+${netBalance}` : netBalance} kcal netas
            </span>
          </div>
        </div>

      </div>

      {/* Athletic Quick Actions Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {onOpenAppleHealthModal && (
          <button
            onClick={onOpenAppleHealthModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-[#13151D] hover:bg-[#1A1D27] text-white border border-white/[0.06] hover:border-[#CCFF00] shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0"
          >
            <Activity className="w-3.5 h-3.5 text-[#CCFF00]" />
            <span>Apple Salud Sync</span>
          </button>
        )}

        {onOpenBarcodeScanner && (
          <button
            onClick={onOpenBarcodeScanner}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-[#13151D] hover:bg-[#1A1D27] text-white border border-white/[0.06] hover:border-[#00F0FF] shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0"
          >
            <ScanLine className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>Comparador Súper (Costco vs HEB vs Walmart)</span>
          </button>
        )}

        {onOpenWeeklyReport && (
          <button
            onClick={onOpenWeeklyReport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-[#13151D] hover:bg-[#1A1D27] text-white border border-white/[0.06] hover:border-[#FF9500] shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0"
          >
            <FileText className="w-3.5 h-3.5 text-[#FF9500]" />
            <span>Reporte Semanal PDF</span>
          </button>
        )}

        <button
          onClick={() => onNavigateTab && onNavigateTab('monthly_diets')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-[#13151D] hover:bg-[#1A1D27] text-white border border-white/[0.06] shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0"
        >
          <FolderArchive className="w-3.5 h-3.5 text-[#CCFF00]" />
          <span>Dietas por Mes</span>
        </button>

        {fastingState && (
          <button
            onClick={() => setShowFastingWidget(prev => !prev)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0 ${
              fastingState.isActive
                ? 'bg-[#CCFF00]/15 border-[#CCFF00]/40 text-[#CCFF00]'
                : 'bg-[#13151D] text-[#8E8E93] border-white/[0.06]'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#FF9500]" />
            <span>Ayuno {fastingState.protocol} {fastingState.isActive ? '• En Curso' : ''}</span>
          </button>
        )}
      </div>

      {/* Intermittent Fasting Widget (16:8 or 18:6 Circular Timer) */}
      {fastingState && onUpdateFastingState && showFastingWidget && (
        <IntermittentFastingTimer
          fastingState={fastingState}
          onUpdateFastingState={onUpdateFastingState}
        />
      )}

      {/* 2-Column Responsive Split: Trends & Hydration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WeeklyTrendChart trendData={trendData} />
        <WaterTracker
          waterMl={waterMl}
          targetMl={3000}
          onAddWater={onAddWater}
          onResetWater={onResetWater}
        />
      </div>

      {/* Heart Rate Training Zones (Coros, Polar, Apple Watch) */}
      <HeartRateZones
        workouts={effectiveDayWorkouts}
        maxHrEstimate={220 - (profile?.age || 25)}
      />

      {/* Comidas del Día / Food Plan */}
      <div className="bg-[#13151D] rounded-3xl p-5 sm:p-6 border border-white/[0.06] shadow-sm transition-colors">
        
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
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-black text-black bg-[#CCFF00] hover:bg-[#bbf000] rounded-full transition-all cursor-pointer shadow-sm active:scale-95"
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
                        <CheckCircle2 className="w-5 h-5 text-[#CCFF00] shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#656A7B] shrink-0" />
                      )}
                      <div className="min-w-0">
                        <span className={`text-sm font-bold block truncate ${entry.eaten ? 'line-through text-[#6F7485]' : 'text-white'}`}>
                          {entry.dish.name}
                        </span>
                        <span className="text-[11px] text-[#8E92A4] font-mono">
                          {entry.dish.calories} kcal · <span className="text-[#FF9500] font-bold">{entry.dish.proteinG}g P</span> · ${entry.dish.costPerServingMxn.toFixed(2)} MXN
                        </span>
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
                        <CheckCircle2 className="w-5 h-5 text-[#CCFF00] shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#656A7B] shrink-0" />
                      )}
                      <div className="min-w-0">
                        <span className={`text-sm font-bold block truncate ${entry.eaten ? 'line-through text-[#6F7485]' : 'text-white'}`}>
                          {entry.dish.name}
                        </span>
                        <span className="text-[11px] text-[#8E92A4] font-mono">
                          {entry.dish.calories} kcal · <span className="text-[#FF9500] font-bold">{entry.dish.proteinG}g P</span> · ${entry.dish.costPerServingMxn.toFixed(2)} MXN
                        </span>
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
                        <CheckCircle2 className="w-5 h-5 text-[#CCFF00] shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#656A7B] shrink-0" />
                      )}
                      <div className="min-w-0">
                        <span className={`text-sm font-bold block truncate ${entry.eaten ? 'line-through text-[#6F7485]' : 'text-white'}`}>
                          {entry.dish.name}
                        </span>
                        <span className="text-[11px] text-[#8E92A4] font-mono">
                          {entry.dish.calories} kcal · <span className="text-[#FF9500] font-bold">{entry.dish.proteinG}g P</span> · ${entry.dish.costPerServingMxn.toFixed(2)} MXN
                        </span>
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
                        <CheckCircle2 className="w-5 h-5 text-[#CCFF00] shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#656A7B] shrink-0" />
                      )}
                      <div className="min-w-0">
                        <span className={`text-sm font-bold block truncate ${entry.eaten ? 'line-through text-[#6F7485]' : 'text-white'}`}>
                          {entry.dish.name}
                        </span>
                        <span className="text-[11px] text-[#8E92A4] font-mono">
                          {entry.dish.calories} kcal · <span className="text-[#FF9500] font-bold">{entry.dish.proteinG}g P</span> · ${entry.dish.costPerServingMxn.toFixed(2)} MXN
                        </span>
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

      {/* Workouts Widget */}
      <div className="bg-[#13151D] rounded-3xl p-5 sm:p-6 border border-white/[0.06] shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-[17px] font-black text-white tracking-tight">
              Workouts
            </h3>
          </div>

          <button
            onClick={() => onNavigateTab && onNavigateTab('workouts')}
            className="text-xs font-bold text-white hover:text-slate-300 cursor-pointer flex items-center gap-1"
          >
            <span>See all</span>
            <span>&gt;</span>
          </button>
        </div>

        {effectiveDayWorkouts.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-white/10 rounded-2xl bg-[#181B26]/50">
            <Watch className="w-7 h-7 text-[#6F7485] mx-auto mb-2" />
            <p className="text-xs text-[#8E92A4]">Sin entrenamientos registrados hoy.</p>
            {onOpenQuickWorkout && (
              <button
                onClick={onOpenQuickWorkout}
                className="mt-3 px-4 py-2 text-xs font-bold text-black bg-[#CCFF00] hover:bg-[#bbf000] rounded-full transition-all cursor-pointer shadow-sm"
              >
                + Registrar Sesión / Captura
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {effectiveDayWorkouts.map(w => (
              <div 
                key={w.id} 
                className="p-4 rounded-2xl bg-[#181B26] border border-white/[0.04] flex items-center justify-between gap-3 hover:border-white/10 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Athletic Activity Icon Circle */}
                  <div className="w-10 h-10 rounded-full bg-[#13151D] border border-white/10 flex items-center justify-center text-white shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <h5 className="text-sm font-black text-white truncate">
                      {w.title}
                    </h5>
                    <div className="flex items-center gap-2 text-xs text-[#8E92A4] font-mono mt-0.5">
                      {w.distanceKm ? (
                        <span className="font-bold text-white">{w.distanceKm} km</span>
                      ) : (
                        <span className="font-bold text-white">{w.durationMinutes} min</span>
                      )}
                      <span>·</span>
                      <span className="capitalize">{w.deviceSource}</span>
                      <span>·</span>
                      <span className="text-slate-400">Today &gt;</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-base font-black font-mono text-white">
                      +{w.caloriesBurned}
                    </div>
                    <span className="text-[10px] text-[#7E8494] font-medium block">kcal activas</span>
                  </div>
                  {onDeleteWorkout && (
                    <button
                      onClick={() => onDeleteWorkout(w.id)}
                      className="p-1.5 text-[#6F7485] hover:text-[#FF453A] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
