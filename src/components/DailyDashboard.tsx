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
  onChangeDate: (date: string) => void;
  profile: UserProfile;
  dailySummary: DailySummary;
  dayMeals: MealPlanEntry[];
  dayWorkouts: WorkoutRecord[];
  allWorkouts: WorkoutRecord[];
  allMeals: MealPlanEntry[];
  waterMl: number;
  onAddWater: (amountMl: number) => void;
  onResetWater: () => void;
  onToggleMealEaten: (entryId: string) => void;
  onOpenQuickWorkout: () => void;
  onOpenAddMealModal: (mealTime?: 'breakfast' | 'lunch' | 'dinner' | 'afternoon_snack') => void;
  onDeleteWorkout: (id: string) => void;
  onDeleteMeal: (entryId: string) => void;
  onNavigateTab: (tab: 'dashboard' | 'planner' | 'monthly_diets' | 'supermarket' | 'workouts') => void;
  fastingState?: FastingState;
  onUpdateFastingState?: (state: FastingState) => void;
  onOpenBarcodeScanner?: () => void;
  onOpenWeeklyReport?: () => void;
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
  waterMl,
  onAddWater,
  onResetWater,
  onToggleMealEaten,
  onOpenQuickWorkout,
  onOpenAddMealModal,
  onDeleteWorkout,
  onDeleteMeal,
  onNavigateTab,
  fastingState,
  onUpdateFastingState,
  onOpenBarcodeScanner,
  onOpenWeeklyReport
}) => {
  const [heroViewMode, setHeroViewMode] = useState<'rings' | 'gauge'>('rings');
  const [showFastingWidget, setShowFastingWidget] = useState<boolean>(true);

  const [year, month, day] = currentDate.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const isToday = new Date().toISOString().split('T')[0] === currentDate;

  const formattedDateTitle = dateObj.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });

  const shiftDate = (days: number) => {
    const newDate = new Date(dateObj);
    newDate.setDate(newDate.getDate() + days);
    onChangeDate(newDate.toISOString().split('T')[0]);
  };

  const netBalance = dailySummary.netCaloricBalance;
  const isDeficit = netBalance <= 0;

  const totalWorkoutMinutes = dayWorkouts.reduce((sum, w) => sum + w.durationMinutes, 0);
  const totalWorkoutKm = dayWorkouts.reduce((sum, w) => sum + (w.distanceKm || 0), 0);

  // Group meals by slots
  const breakfastMeals = dayMeals.filter(m => m.dish.mealTime === 'breakfast');
  const lunchMeals = dayMeals.filter(m => m.dish.mealTime === 'lunch');
  const dinnerMeals = dayMeals.filter(m => m.dish.mealTime === 'dinner');
  const snackMeals = dayMeals.filter(m => m.dish.mealTime === 'morning_snack' || m.dish.mealTime === 'afternoon_snack');

  // Compute 7-day trend data for WeeklyTrendChart
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(dateObj);
    d.setDate(d.getDate() - (6 - i));
    const dStr = d.toISOString().split('T')[0];
    const dayWks = allWorkouts.filter(w => w.date === dStr);
    const dayMls = allMeals.filter(m => m.date === dStr);
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
      
      {/* Date Bar & iOS Header */}
      <div className="flex items-center justify-between bg-[#FFFFFF] dark:bg-[#1C1C1E] p-3 sm:p-4 rounded-[22px] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none transition-colors">
        <div className="flex items-center gap-2">
          <button
            onClick={() => shiftDate(-1)}
            title="Día anterior"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F2F2F7] hover:bg-[#E5E5EA] dark:bg-[#2C2C2E] dark:hover:bg-[#3A3A3C] text-[#1C1C1E] dark:text-[#F5F5F7] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] sm:text-[17px] font-bold capitalize text-[#1C1C1E] dark:text-[#F5F5F7] tracking-tight">
                {formattedDateTitle}
              </h2>
              {isToday && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#A1FF00] text-black uppercase tracking-tight">
                  Hoy
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#8E8E93] leading-none mt-0.5">
              Habithub · iOS Health Sync
            </p>
          </div>

          <button
            onClick={() => shiftDate(1)}
            title="Día siguiente"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F2F2F7] hover:bg-[#E5E5EA] dark:bg-[#2C2C2E] dark:hover:bg-[#3A3A3C] text-[#1C1C1E] dark:text-[#F5F5F7] transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {!isToday && (
            <button
              onClick={() => onChangeDate(new Date().toISOString().split('T')[0])}
              className="px-2.5 py-1 text-[11px] font-semibold text-[#007AFF] hover:text-[#0051D5] bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-full transition-colors cursor-pointer"
            >
              Hoy
            </button>
          )}

          {/* Mode Switcher: Rings vs Gauge */}
          <div className="flex items-center bg-[#F2F2F7] dark:bg-[#2C2C2E] p-0.5 rounded-full">
            <button
              onClick={() => setHeroViewMode('rings')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-full transition-all cursor-pointer ${
                heroViewMode === 'rings' 
                  ? 'bg-white dark:bg-[#3A3A3C] text-[#1C1C1E] dark:text-white shadow-sm' 
                  : 'text-[#8E8E93]'
              }`}
            >
              Anillos
            </button>
            <button
              onClick={() => setHeroViewMode('gauge')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-full transition-all cursor-pointer ${
                heroViewMode === 'gauge' 
                  ? 'bg-white dark:bg-[#3A3A3C] text-[#1C1C1E] dark:text-white shadow-sm' 
                  : 'text-[#8E8E93]'
              }`}
            >
              Arco
            </button>
          </div>
        </div>
      </div>

      {/* iOS Quick Actions Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {onOpenBarcodeScanner && (
          <button
            onClick={onOpenBarcodeScanner}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-[#FFFFFF] dark:bg-[#1C1C1E] hover:bg-[#F2F2F7] dark:hover:bg-[#2C2C2E] text-[#1C1C1E] dark:text-[#F5F5F7] border border-black/[0.06] dark:border-white/[0.08] shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0"
          >
            <ScanLine className="w-3.5 h-3.5 text-[#A1FF00]" />
            <span>Escáner Súper (HEB vs Costco)</span>
          </button>
        )}

        {onOpenWeeklyReport && (
          <button
            onClick={onOpenWeeklyReport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-[#FFFFFF] dark:bg-[#1C1C1E] hover:bg-[#F2F2F7] dark:hover:bg-[#2C2C2E] text-[#1C1C1E] dark:text-[#F5F5F7] border border-black/[0.06] dark:border-white/[0.08] shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0"
          >
            <FileText className="w-3.5 h-3.5 text-[#007AFF]" />
            <span>Reporte Semanal (PDF / Notas)</span>
          </button>
        )}

        <button
          onClick={() => onNavigateTab('monthly_diets')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-[#FFFFFF] dark:bg-[#1C1C1E] hover:bg-[#F2F2F7] dark:hover:bg-[#2C2C2E] text-[#1C1C1E] dark:text-[#F5F5F7] border border-black/[0.06] dark:border-white/[0.08] shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0"
        >
          <FolderArchive className="w-3.5 h-3.5 text-[#FF9500]" />
          <span>Dietas por Mes</span>
        </button>

        {fastingState && (
          <button
            onClick={() => setShowFastingWidget(prev => !prev)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0 ${
              fastingState.isActive
                ? 'bg-[#A1FF00]/15 border-[#A1FF00]/40 text-[#1C1C1E] dark:text-[#A1FF00] font-bold'
                : 'bg-[#FFFFFF] dark:bg-[#1C1C1E] text-[#8E8E93] border-black/[0.06] dark:border-white/[0.08]'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#FF9500]" />
            <span>Ayuno {fastingState.protocol} {fastingState.isActive ? '• En Curso' : ''}</span>
          </button>
        )}
      </div>

      {/* Hero Apple Activity Rings & Energy Card */}
      <div className="bg-[#FFFFFF] dark:bg-[#1C1C1E] rounded-[26px] p-5 sm:p-6 border border-black/[0.06] dark:border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors">
        
        {heroViewMode === 'rings' ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            
            {/* The 3 Iconic Apple Rings */}
            <div className="flex items-center justify-center shrink-0">
              <AppleActivityRings
                moveCurrent={dailySummary.totalExpenditureTdee}
                moveTarget={profile.dailyCalorieTarget + 400}
                exerciseCurrent={totalWorkoutMinutes}
                exerciseTarget={45}
                nutritionCurrent={dailySummary.proteinConsumedG}
                nutritionTarget={profile.proteinTargetG}
                size={175}
              />
            </div>

            {/* Apple Activity Rings Legend & Numbers */}
            <div className="flex-1 w-full space-y-3.5">
              
              {/* Ring 1: Move (TDEE Burned) */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FA114F]" />
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-[#FA114F]">
                      Movimiento (TDEE)
                    </span>
                  </div>
                  <div className="text-[22px] font-extrabold tracking-tight text-[#1C1C1E] dark:text-[#F5F5F7] font-mono tabular-nums leading-tight mt-0.5">
                    {dailySummary.totalExpenditureTdee}
                    <span className="text-[13px] font-medium text-[#8E8E93] ml-1">/ {profile.dailyCalorieTarget + 400} kcal</span>
                  </div>
                </div>
                <span className="text-[12px] font-bold text-[#FA114F] font-mono">
                  {Math.round((dailySummary.totalExpenditureTdee / (profile.dailyCalorieTarget + 400)) * 100)}%
                </span>
              </div>

              {/* Ring 2: Exercise (Minutes Active) */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#A1FF00]" />
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-[#A1FF00]">
                      Ejercicio Activo
                    </span>
                  </div>
                  <div className="text-[22px] font-extrabold tracking-tight text-[#1C1C1E] dark:text-[#F5F5F7] font-mono tabular-nums leading-tight mt-0.5">
                    {totalWorkoutMinutes}
                    <span className="text-[13px] font-medium text-[#8E8E93] ml-1">/ 45 min</span>
                  </div>
                </div>
                <span className="text-[12px] font-bold text-[#A1FF00] font-mono">
                  {Math.round((totalWorkoutMinutes / 45) * 100)}%
                </span>
              </div>

              {/* Ring 3: Nutrition / Protein */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF]" />
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-[#00F0FF]">
                      Proteína Diaria
                    </span>
                  </div>
                  <div className="text-[22px] font-extrabold tracking-tight text-[#1C1C1E] dark:text-[#F5F5F7] font-mono tabular-nums leading-tight mt-0.5">
                    {dailySummary.proteinConsumedG}
                    <span className="text-[13px] font-medium text-[#8E8E93] ml-1">/ {profile.proteinTargetG} g</span>
                  </div>
                </div>
                <span className="text-[12px] font-bold text-[#00F0FF] font-mono">
                  {Math.round((dailySummary.proteinConsumedG / profile.proteinTargetG) * 100)}%
                </span>
              </div>

            </div>

          </div>
        ) : (
          <div className="py-2">
            <div className="text-center max-w-sm mx-auto mb-1">
              <h3 className="text-[16px] font-bold text-[#1C1C1E] dark:text-white">
                Balance Calórico en Vivo
              </h3>
              <p className="text-[12px] text-[#8E8E93]">
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
        <div className="mt-4 pt-4 border-t border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between text-[12px]">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isDeficit ? 'bg-[#A1FF00]' : 'bg-[#FA114F]'}`} />
            <span className="font-semibold text-[#1C1C1E] dark:text-[#F5F5F7]">
              {isDeficit ? 'Déficit Metabólico Activo' : 'Superávit Calórico'}
            </span>
          </div>

          <div className="font-mono tabular-nums font-bold">
            <span className={isDeficit ? 'text-[#A1FF00]' : 'text-[#FA114F]'}>
              {netBalance > 0 ? `+${netBalance}` : netBalance} kcal netas
            </span>
          </div>
        </div>

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
        workouts={dayWorkouts}
        maxHrEstimate={220 - profile.age}
      />

      {/* Comidas del Día / Food Plan (iOS card list with subtle styling) */}
      <div className="bg-[#FFFFFF] dark:bg-[#1C1C1E] rounded-[26px] p-5 border border-black/[0.06] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none transition-colors">
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[16px] font-bold text-[#1C1C1E] dark:text-[#F5F5F7] tracking-tight">
              Comidas del Día
            </h3>
            <p className="text-[12px] text-[#8E8E93]">
              Toca para marcar consumido y sincronizar el balance en tiempo real
            </p>
          </div>

          <button
            onClick={() => onOpenAddMealModal()}
            className="flex items-center gap-1 px-3 py-1.5 text-[12px] font-bold text-black bg-[#A1FF00] hover:bg-[#8FE000] rounded-full transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Añadir</span>
          </button>
        </div>

        {/* Meal Slot Cards */}
        <div className="space-y-3">
          
          {/* Desayuno */}
          <div className="p-3.5 rounded-[20px] bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-black/[0.04] dark:border-white/[0.06]">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#8E8E93]">
                Desayuno · <span className="font-mono text-[#1C1C1E] dark:text-[#E5E5EA]">{breakfastMeals.reduce((s, m) => s + m.dish.calories, 0)} kcal</span>
              </span>
              <button
                onClick={() => onOpenAddMealModal('breakfast')}
                className="w-7 h-7 rounded-full bg-[#FFFFFF] dark:bg-[#3A3A3C] text-[#1C1C1E] dark:text-[#F5F5F7] flex items-center justify-center transition-colors cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {breakfastMeals.length === 0 ? (
              <p className="text-[12px] text-[#8E8E93] italic mt-2">
                Sin comida registrada en desayuno
              </p>
            ) : (
              <div className="mt-2.5 space-y-2">
                {breakfastMeals.map(entry => (
                  <div key={entry.id} className="flex items-center justify-between p-2.5 rounded-[16px] bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06]">
                    <button
                      onClick={() => onToggleMealEaten(entry.id)}
                      className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer"
                    >
                      {entry.eaten ? (
                        <CheckCircle2 className="w-5 h-5 text-[#A1FF00] shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#8E8E93] shrink-0" />
                      )}
                      <div className="min-w-0">
                        <span className={`text-[13px] font-semibold block truncate ${entry.eaten ? 'line-through text-[#8E8E93]' : 'text-[#1C1C1E] dark:text-[#F5F5F7]'}`}>
                          {entry.dish.name}
                        </span>
                        <span className="text-[11px] text-[#8E8E93] font-mono">
                          {entry.dish.calories} kcal · {entry.dish.proteinG}g P · ${entry.dish.costPerServingMxn.toFixed(2)} MXN
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={() => onDeleteMeal(entry.id)}
                      className="p-1 text-[#8E8E93] hover:text-[#FF453A] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comida / Almuerzo */}
          <div className="p-3.5 rounded-[20px] bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-black/[0.04] dark:border-white/[0.06]">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#8E8E93]">
                Comida / Almuerzo · <span className="font-mono text-[#1C1C1E] dark:text-[#E5E5EA]">{lunchMeals.reduce((s, m) => s + m.dish.calories, 0)} kcal</span>
              </span>
              <button
                onClick={() => onOpenAddMealModal('lunch')}
                className="w-7 h-7 rounded-full bg-[#FFFFFF] dark:bg-[#3A3A3C] text-[#1C1C1E] dark:text-[#F5F5F7] flex items-center justify-center transition-colors cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {lunchMeals.length === 0 ? (
              <p className="text-[12px] text-[#8E8E93] italic mt-2">
                Sin comida registrada en almuerzo
              </p>
            ) : (
              <div className="mt-2.5 space-y-2">
                {lunchMeals.map(entry => (
                  <div key={entry.id} className="flex items-center justify-between p-2.5 rounded-[16px] bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06]">
                    <button
                      onClick={() => onToggleMealEaten(entry.id)}
                      className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer"
                    >
                      {entry.eaten ? (
                        <CheckCircle2 className="w-5 h-5 text-[#A1FF00] shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#8E8E93] shrink-0" />
                      )}
                      <div className="min-w-0">
                        <span className={`text-[13px] font-semibold block truncate ${entry.eaten ? 'line-through text-[#8E8E93]' : 'text-[#1C1C1E] dark:text-[#F5F5F7]'}`}>
                          {entry.dish.name}
                        </span>
                        <span className="text-[11px] text-[#8E8E93] font-mono">
                          {entry.dish.calories} kcal · {entry.dish.proteinG}g P · ${entry.dish.costPerServingMxn.toFixed(2)} MXN
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={() => onDeleteMeal(entry.id)}
                      className="p-1 text-[#8E8E93] hover:text-[#FF453A] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cena */}
          <div className="p-3.5 rounded-[20px] bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-black/[0.04] dark:border-white/[0.06]">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#8E8E93]">
                Cena · <span className="font-mono text-[#1C1C1E] dark:text-[#E5E5EA]">{dinnerMeals.reduce((s, m) => s + m.dish.calories, 0)} kcal</span>
              </span>
              <button
                onClick={() => onOpenAddMealModal('dinner')}
                className="w-7 h-7 rounded-full bg-[#FFFFFF] dark:bg-[#3A3A3C] text-[#1C1C1E] dark:text-[#F5F5F7] flex items-center justify-center transition-colors cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {dinnerMeals.length === 0 ? (
              <p className="text-[12px] text-[#8E8E93] italic mt-2">
                Sin comida registrada en cena
              </p>
            ) : (
              <div className="mt-2.5 space-y-2">
                {dinnerMeals.map(entry => (
                  <div key={entry.id} className="flex items-center justify-between p-2.5 rounded-[16px] bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06]">
                    <button
                      onClick={() => onToggleMealEaten(entry.id)}
                      className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer"
                    >
                      {entry.eaten ? (
                        <CheckCircle2 className="w-5 h-5 text-[#A1FF00] shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#8E8E93] shrink-0" />
                      )}
                      <div className="min-w-0">
                        <span className={`text-[13px] font-semibold block truncate ${entry.eaten ? 'line-through text-[#8E8E93]' : 'text-[#1C1C1E] dark:text-[#F5F5F7]'}`}>
                          {entry.dish.name}
                        </span>
                        <span className="text-[11px] text-[#8E8E93] font-mono">
                          {entry.dish.calories} kcal · {entry.dish.proteinG}g P · ${entry.dish.costPerServingMxn.toFixed(2)} MXN
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={() => onDeleteMeal(entry.id)}
                      className="p-1 text-[#8E8E93] hover:text-[#FF453A] transition-colors cursor-pointer"
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
            <div className="p-3.5 rounded-[20px] bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-black/[0.04] dark:border-white/[0.06]">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#8E8E93]">
                Colaciones & Snacks
              </span>
              <div className="mt-2.5 space-y-2">
                {snackMeals.map(entry => (
                  <div key={entry.id} className="flex items-center justify-between p-2.5 rounded-[16px] bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06]">
                    <button
                      onClick={() => onToggleMealEaten(entry.id)}
                      className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer"
                    >
                      {entry.eaten ? (
                        <CheckCircle2 className="w-5 h-5 text-[#A1FF00] shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#8E8E93] shrink-0" />
                      )}
                      <div className="min-w-0">
                        <span className={`text-[13px] font-semibold block truncate ${entry.eaten ? 'line-through text-[#8E8E93]' : 'text-[#1C1C1E] dark:text-[#F5F5F7]'}`}>
                          {entry.dish.name}
                        </span>
                        <span className="text-[11px] text-[#8E8E93] font-mono">
                          {entry.dish.calories} kcal · {entry.dish.proteinG}g P · ${entry.dish.costPerServingMxn.toFixed(2)} MXN
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={() => onDeleteMeal(entry.id)}
                      className="p-1 text-[#8E8E93] hover:text-[#FF453A] transition-colors cursor-pointer"
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

      {/* Entrenamientos del Día Section */}
      <div className="bg-[#FFFFFF] dark:bg-[#1C1C1E] rounded-[26px] p-5 border border-black/[0.06] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none transition-colors">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Watch className="w-4 h-4 text-[#A1FF00]" />
            <h3 className="text-[16px] font-bold text-[#1C1C1E] dark:text-[#F5F5F7] tracking-tight">
              Entrenamientos Hoy
            </h3>
          </div>

          <button
            onClick={onOpenQuickWorkout}
            className="text-[12px] font-semibold text-[#007AFF] dark:text-[#0A84FF] hover:underline cursor-pointer"
          >
            + Registrar
          </button>
        </div>

        {dayWorkouts.length === 0 ? (
          <div className="py-6 text-center border border-dashed border-[#E5E5EA] dark:border-[#2C2C2E] rounded-[20px]">
            <Watch className="w-6 h-6 text-[#8E8E93] mx-auto mb-1.5" />
            <p className="text-[12px] text-[#8E8E93]">Sin sesiones de Coros / Polar / Apple Watch hoy.</p>
            <button
              onClick={onOpenQuickWorkout}
              className="mt-2 text-[12px] font-semibold text-[#007AFF] dark:text-[#0A84FF] hover:underline cursor-pointer"
            >
              + Agregar sesión
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {dayWorkouts.map(w => (
              <div 
                key={w.id} 
                className="p-3.5 rounded-[18px] bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#E5E5EA] dark:bg-[#3A3A3C] text-[#1C1C1E] dark:text-[#E5E5EA] uppercase">
                      {w.deviceSource}
                    </span>
                    {w.time && <span className="text-[11px] text-[#8E8E93] font-mono">{w.time}</span>}
                  </div>
                  <h5 className="text-[13px] font-bold text-[#1C1C1E] dark:text-[#F5F5F7] mt-0.5">
                    {w.title}
                  </h5>
                  <div className="flex items-center gap-2 text-[11px] text-[#8E8E93] font-mono mt-0.5">
                    <span>⏱️ {w.durationMinutes} min</span>
                    {w.distanceKm && <span>· 📏 {w.distanceKm} km</span>}
                    {w.avgHeartRate && <span>· ❤️ {w.avgHeartRate} bpm</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <div className="text-[16px] font-extrabold font-mono text-[#FA114F]">
                      +{w.caloriesBurned}
                    </div>
                    <span className="text-[10px] text-[#8E8E93] font-medium">kcal activas</span>
                  </div>
                  <button
                    onClick={() => onDeleteWorkout(w.id)}
                    className="p-1 text-[#8E8E93] hover:text-[#FF453A] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
