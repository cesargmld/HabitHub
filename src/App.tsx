import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { DailyDashboard } from './components/DailyDashboard';
import { WorkoutTracker } from './components/WorkoutTracker';
import { MealPlanner } from './components/MealPlanner';
import { SupermarketOptimizer } from './components/SupermarketOptimizer';
import { UserProfileModal } from './components/UserProfileModal';
import { DietUploadManager } from './components/DietUploadManager';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { WeeklyReportPdfModal } from './components/WeeklyReportPdfModal';
import { AppleHealthSyncModal } from './components/AppleHealthSyncModal';
import { 
  UserProfile, 
  WorkoutRecord, 
  MealDish, 
  MealPlanEntry, 
  MealTime,
  MonthlyDietPlan,
  FastingState
} from './types';
import { DEFAULT_USER_PROFILE, calculateDailySummary } from './utils/calorieEngine';
import { LORETTA_MONTHLY_PLAN, LORETTA_MEAL_DISHES } from './data/lorettaDietPlan';
import { generateOptimizedGroceryList } from './utils/groceryOptimizer';
import { Plus, X, Utensils } from 'lucide-react';

const STORAGE_KEY_PROFILE = 'habithub_user_profile_v4';
const STORAGE_KEY_WORKOUTS = 'habithub_workouts_v4';
const STORAGE_KEY_DISHES = 'habithub_dishes_v4';
const STORAGE_KEY_MEALPLAN = 'habithub_mealplan_v4';
const STORAGE_KEY_THEME = 'habithub_theme_v4';
const STORAGE_KEY_MONTHLY_DIETS = 'habithub_monthly_diets_v4';
const STORAGE_KEY_FASTING = 'habithub_fasting_state_v4';
const STORAGE_KEY_COOKING_DAYS = 'habithub_cooking_days_v4';
const STORAGE_KEY_TIMEFRAME = 'habithub_timeframe_v4';

const INITIAL_MONTHLY_DIETS: MonthlyDietPlan[] = [
  LORETTA_MONTHLY_PLAN
];

const INITIAL_FASTING_STATE: FastingState = {
  isActive: true,
  protocol: '16:8',
  startTime: new Date(Date.now() - 14.3 * 3600 * 1000).toISOString(),
  targetHours: 16,
  history: [
    {
      id: 'fast-h1',
      date: '2026-10-14',
      protocol: '16:8',
      startTime: '2026-10-13T20:00:00Z',
      endTime: '2026-10-14T12:05:00Z',
      durationHours: 16.1,
      completed: true
    },
    {
      id: 'fast-h2',
      date: '2026-10-13',
      protocol: '16:8',
      startTime: '2026-10-12T20:30:00Z',
      endTime: '2026-10-13T12:30:00Z',
      durationHours: 16.0,
      completed: true
    }
  ]
};

// Helper to build initial weekly meal plan from Loretta's 21 meals mapped across Mon-Sun
function buildLorettaWeekPlan(currentDateStr: string): MealPlanEntry[] {
  const [currYear, currMonth, currDay] = currentDateStr.split('-').map(Number);
  const baseDate = new Date(currYear, currMonth - 1, currDay);
  const dayOfWeekNow = baseDate.getDay();
  const distanceToMonday = dayOfWeekNow === 0 ? -6 : 1 - dayOfWeekNow;
  const monday = new Date(baseDate);
  monday.setDate(monday.getDate() + distanceToMonday);

  const dayNamesMapping = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const entries: MealPlanEntry[] = [];

  for (let i = 0; i < 7; i++) {
    const targetDateObj = new Date(monday);
    targetDateObj.setDate(targetDateObj.getDate() + i);
    const dateStr = targetDateObj.toISOString().split('T')[0];
    const dayOfWeek = targetDateObj.getDay(); // 0=Dom, 1=Lun, 2=Mar...
    const expectedDayName = dayNamesMapping[i];

    // Find dishes for this day
    const dayDishes = LORETTA_MEAL_DISHES.filter(d => d.assignedDay === expectedDayName);

    dayDishes.forEach((dish, idx) => {
      entries.push({
        id: `mp-loretta-${dateStr}-${dish.mealTime}-${idx}`,
        date: dateStr,
        dayOfWeek,
        dish,
        servings: 1,
        eaten: dateStr < currentDateStr || (dateStr === currentDateStr && idx === 0)
      });
    });
  }

  return entries;
}

export default function App() {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [currentDate, setCurrentDate] = useState<string>(todayStr);
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'planner' | 'monthly_diets' | 'supermarket' | 'workouts'>('dashboard');

  // Supermarket cooking days and timeframe state
  const [selectedCookingDays, setSelectedCookingDays] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_COOKING_DAYS);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  });

  const [timeframeMultiplier, setTimeframeMultiplier] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TIMEFRAME);
    if (saved) {
      const parsed = Number(saved);
      if (parsed === 1 || parsed === 2 || parsed === 4) return parsed;
    }
    return 1; // 1 = 1 semana
  });

  // Theme State: 'light' or 'dark'
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // 1. User Profile State (Synchronized to 1650 kcal from Loretta's plan)
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      ...DEFAULT_USER_PROFILE,
      dailyCalorieTarget: 1650,
      proteinTargetG: 145,
      carbsTargetG: 160,
      fatTargetG: 45
    };
  });

  // 2. Workouts State
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_WORKOUTS);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      {
        id: 'w-sample-1',
        date: todayStr,
        time: '06:45',
        title: 'Rodaje Matutino Z2 (10k)',
        deviceSource: 'coros',
        activityType: 'running',
        durationMinutes: 52,
        caloriesBurned: 640,
        avgHeartRate: 142,
        maxHeartRate: 158,
        distanceKm: 10.2,
        notes: 'Ritmo suave en zona aeróbica pura con Coros Pace'
      },
      {
        id: 'w-sample-2',
        date: todayStr,
        time: '18:30',
        title: 'Fuerza Empuje / Hipertrofia',
        deviceSource: 'apple_fitness',
        activityType: 'strength_training',
        durationMinutes: 45,
        caloriesBurned: 280,
        avgHeartRate: 118,
        notes: 'Press banca, fondos y hombro con Apple Watch'
      }
    ];
  });

  // 3. Dishes Library State
  const [dishes, setDishes] = useState<MealDish[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DISHES);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return LORETTA_MEAL_DISHES;
  });

  // 4. Meal Plan State: initialized with Loretta's meals distributed over Monday-Sunday
  const [mealPlan, setMealPlan] = useState<MealPlanEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MEALPLAN);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return buildLorettaWeekPlan(todayStr);
  });

  // UI Modals
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddMealModalOpen, setIsAddMealModalOpen] = useState(false);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [isWeeklyReportOpen, setIsWeeklyReportOpen] = useState(false);
  const [isAppleHealthModalOpen, setIsAppleHealthModalOpen] = useState(false);
  const [isAiOptimizing, setIsAiOptimizing] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string[]>([]);
  const [selectedMealTimeForAdd, setSelectedMealTimeForAdd] = useState<MealTime>('lunch');

  // 5. Monthly Diets State: Default to Loretta's plan
  const [monthlyDiets, setMonthlyDiets] = useState<MonthlyDietPlan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MONTHLY_DIETS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return INITIAL_MONTHLY_DIETS;
  });

  // 6. Fasting State
  const [fastingState, setFastingState] = useState<FastingState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_FASTING);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_FASTING_STATE;
  });

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_WORKOUTS, JSON.stringify(workouts));
  }, [workouts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DISHES, JSON.stringify(dishes));
  }, [dishes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MEALPLAN, JSON.stringify(mealPlan));
  }, [mealPlan]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MONTHLY_DIETS, JSON.stringify(monthlyDiets));
  }, [monthlyDiets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FASTING, JSON.stringify(fastingState));
  }, [fastingState]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COOKING_DAYS, JSON.stringify(selectedCookingDays));
  }, [selectedCookingDays]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TIMEFRAME, String(timeframeMultiplier));
  }, [timeframeMultiplier]);

  // Water hydration state per day (ml)
  const [waterRecords, setWaterRecords] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('personal_hub_water_v3');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return { [todayStr]: 1750 };
  });

  const currentWaterMl = waterRecords[currentDate] || 0;

  const handleAddWater = (amountMl: number) => {
    setWaterRecords(prev => {
      const updated = {
        ...prev,
        [currentDate]: (prev[currentDate] || 0) + amountMl
      };
      localStorage.setItem('personal_hub_water_v3', JSON.stringify(updated));
      return updated;
    });
  };

  const handleResetWater = () => {
    setWaterRecords(prev => {
      const updated = {
        ...prev,
        [currentDate]: 0
      };
      localStorage.setItem('personal_hub_water_v3', JSON.stringify(updated));
      return updated;
    });
  };

  // Real-time calculation of daily energy expenditure
  const dailySummary = useMemo(() => {
    return calculateDailySummary(currentDate, profile, workouts, mealPlan);
  }, [currentDate, profile, workouts, mealPlan]);

  // Real-time calculation of grocery optimization based on active cooking days & timeframe
  const optimizationResult = useMemo(() => {
    return generateOptimizedGroceryList(mealPlan, profile.preferredStore, timeframeMultiplier, selectedCookingDays);
  }, [mealPlan, profile.preferredStore, timeframeMultiplier, selectedCookingDays]);

  // Handlers for Workouts
  const handleAddWorkout = (newWorkoutData: Omit<WorkoutRecord, 'id'>) => {
    const newRecord: WorkoutRecord = {
      ...newWorkoutData,
      id: `w-${Date.now()}`
    };
    setWorkouts(prev => [newRecord, ...prev]);
  };

  const handleDeleteWorkout = (id: string) => {
    setWorkouts(prev => prev.filter(w => w.id !== id));
  };

  // Handlers for Meals
  const handleToggleMealEaten = (entryId: string) => {
    setMealPlan(prev => prev.map(m => m.id === entryId ? { ...m, eaten: !m.eaten } : m));
  };

  const handleDeleteMealEntry = (entryId: string) => {
    setMealPlan(prev => prev.filter(m => m.id !== entryId));
  };

  const handleAddDishToLibrary = (dish: MealDish) => {
    setDishes(prev => [dish, ...prev]);
  };

  const handleAssignDishToDate = (dish: MealDish, date: string, mealTime: MealTime) => {
    const [y, m, d] = date.split('-').map(Number);
    const dayOfWeek = new Date(y, m - 1, d).getDay();
    const newEntry: MealPlanEntry = {
      id: `mp-${Date.now()}`,
      date,
      dayOfWeek,
      dish: {
        ...dish,
        mealTime
      },
      servings: 1,
      eaten: false
    };
    setMealPlan(prev => [...prev, newEntry]);
    setIsAddMealModalOpen(false);
  };

  const handleMoveMealEntry = (entryId: string, newDate: string, newMealTime: MealTime) => {
    setMealPlan(prev => prev.map(entry => {
      if (entry.id === entryId) {
        const [y, m, d] = newDate.split('-').map(Number);
        const dayOfWeek = new Date(y, m - 1, d).getDay();
        return {
          ...entry,
          date: newDate,
          dayOfWeek,
          dish: {
            ...entry.dish,
            mealTime: newMealTime
          }
        };
      }
      return entry;
    }));
  };

  const handleUpdateDishInPlan = (entryId: string, updatedDish: MealDish) => {
    setMealPlan(prev => prev.map(entry => {
      if (entry.id === entryId) {
        return {
          ...entry,
          dish: updatedDish
        };
      }
      return entry;
    }));
  };

  // Handlers for Monthly Diets
  const handleAddMonthlyDiet = (diet: MonthlyDietPlan) => {
    setMonthlyDiets(prev => [diet, ...prev]);
  };

  const handleDeleteMonthlyDiet = (dietId: string) => {
    setMonthlyDiets(prev => prev.filter(d => d.id !== dietId));
  };

  // Apply diet to weekly planner: Maps each dish to its designated day of week
  const handleApplyDietToPlanner = (diet: MonthlyDietPlan) => {
    // 1. Add novel dishes to the library
    setDishes(prev => {
      const existingNames = new Set(prev.map(d => d.name.toLowerCase()));
      const novel = diet.dishes.filter(d => !existingNames.has(d.name.toLowerCase()));
      return [...novel, ...prev];
    });

    // 2. Populate week days matching their designated assignedDay or dayOfWeek
    if (diet.dishes.length > 0) {
      const [currYear, currMonth, currDay] = currentDate.split('-').map(Number);
      const baseDate = new Date(currYear, currMonth - 1, currDay);
      const dayOfWeekNow = baseDate.getDay();
      const distanceToMonday = dayOfWeekNow === 0 ? -6 : 1 - dayOfWeekNow;
      const monday = new Date(baseDate);
      monday.setDate(monday.getDate() + distanceToMonday);

      const dayNamesMapping = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
      const newEntries: MealPlanEntry[] = [];

      for (let i = 0; i < 7; i++) {
        const targetDateObj = new Date(monday);
        targetDateObj.setDate(targetDateObj.getDate() + i);
        const dateStr = targetDateObj.toISOString().split('T')[0];
        const dayOfWeek = targetDateObj.getDay();
        const expectedDayName = dayNamesMapping[i];

        // Find meals specifically assigned to this day
        const dayDishes = diet.dishes.filter(d => {
          if (d.assignedDay) {
            return d.assignedDay.toLowerCase().includes(expectedDayName.toLowerCase().slice(0, 3));
          }
          if (d.dayOfWeek !== undefined) {
            return d.dayOfWeek === dayOfWeek;
          }
          return false;
        });

        const dishesToAssign = dayDishes.length > 0 ? dayDishes : diet.dishes.slice(0, 3);

        dishesToAssign.forEach((dish, idx) => {
          newEntries.push({
            id: `mp-diet-${Date.now()}-${i}-${idx}`,
            date: dateStr,
            dayOfWeek,
            dish,
            servings: 1,
            eaten: false
          });
        });
      }

      setMealPlan(prev => {
        const replacedDates = new Set(newEntries.map(e => e.date));
        return [...prev.filter(e => !replacedDates.has(e.date)), ...newEntries];
      });
    }

    // 3. Update profile macro targets
    if (diet.targetCalories) {
      setProfile(prev => ({
        ...prev,
        dailyCalorieTarget: diet.targetCalories,
        proteinTargetG: diet.proteinTargetG || prev.proteinTargetG
      }));
    }

    setCurrentTab('planner');
  };

  // Full Database Backup Export & Import (JSON)
  const handleExportBackup = () => {
    const fullBackup = {
      version: 'habithub-v4',
      exportDate: new Date().toISOString(),
      profile,
      workouts,
      dishes,
      mealPlan,
      monthlyDiets,
      fastingState,
      waterRecords,
      selectedCookingDays,
      timeframeMultiplier
    };
    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habithub_backup_${todayStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (jsonContent: string) => {
    try {
      const data = JSON.parse(jsonContent);
      if (data.profile) setProfile(data.profile);
      if (data.workouts) setWorkouts(data.workouts);
      if (data.dishes) setDishes(data.dishes);
      if (data.mealPlan) setMealPlan(data.mealPlan);
      if (data.monthlyDiets) setMonthlyDiets(data.monthlyDiets);
      if (data.fastingState) setFastingState(data.fastingState);
      if (data.waterRecords) setWaterRecords(data.waterRecords);
      if (data.selectedCookingDays) setSelectedCookingDays(data.selectedCookingDays);
      if (data.timeframeMultiplier) setTimeframeMultiplier(data.timeframeMultiplier);
    } catch (err) {
      console.error('Error importing backup:', err);
    }
  };

  // AI Optimization for Whole Week
  const handleOptimizeWithAi = async () => {
    setIsAiOptimizing(true);
    try {
      const res = await fetch('/api/optimize-diet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meals: mealPlan.map(m => ({
            name: m.dish.name,
            cost: m.dish.costPerServingMxn,
            ingredients: m.dish.ingredients
          })),
          userBudgetGoal: `Mantener presupuesto con compras en Costco y H-E-B para ${selectedCookingDays.length} días de cocina.`,
          targetStorePreference: profile.preferredStore
        })
      });

      const data = await res.json();
      if (data.recipeTweaks && Array.isArray(data.recipeTweaks)) {
        setAiAdvice(data.recipeTweaks);
      } else if (data.optimizedSuggestions) {
        setAiAdvice(data.optimizedSuggestions.map((s: any) => `${s.title}: ${s.description}`));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiOptimizing(false);
    }
  };

  const handleSelectProductFromScanner = (productName: string, store: 'costco' | 'heb', price: number) => {
    const customDish: MealDish = {
      id: `dish-scan-${Date.now()}`,
      name: `${productName} (${store.toUpperCase()})`,
      mealTime: 'lunch',
      category: 'high_protein',
      calories: 450,
      proteinG: 40,
      carbsG: 30,
      fatG: 10,
      costPerServingMxn: price,
      prepTimeMinutes: 10,
      ingredients: [
        { name: productName, amount: 200, unit: 'g', preferredStore: store }
      ]
    };
    handleAddDishToLibrary(customDish);
    handleAssignDishToDate(customDish, currentDate, 'lunch');
    setIsBarcodeScannerOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0B0E] text-slate-900 dark:text-slate-100 flex flex-col antialiased transition-colors duration-200">
      
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentDate={currentDate}
        onChangeDate={setCurrentDate}
        onOpenProfileModal={() => setIsProfileOpen(true)}
        onOpenWeeklyReport={() => setIsWeeklyReportOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6">
        
        {currentTab === 'dashboard' && (
          <DailyDashboard
            currentDate={currentDate}
            profile={profile}
            workouts={workouts}
            mealPlan={mealPlan}
            dailySummary={dailySummary}
            onToggleMealEaten={handleToggleMealEaten}
            onDeleteMealEntry={handleDeleteMealEntry}
            onOpenAddMealModal={() => setIsAddMealModalOpen(true)}
            fastingState={fastingState}
            onUpdateFastingState={setFastingState}
            waterMl={currentWaterMl}
            onAddWater={handleAddWater}
            onResetWater={handleResetWater}
            onOpenAppleHealthModal={() => setIsAppleHealthModalOpen(true)}
          />
        )}

        {currentTab === 'planner' && (
          <MealPlanner
            currentDate={currentDate}
            dishes={dishes}
            mealPlan={mealPlan}
            onAddDishToLibrary={handleAddDishToLibrary}
            onAssignDishToDate={handleAssignDishToDate}
            onRemoveMealPlanEntry={handleDeleteMealEntry}
            onOptimizeWeekPlan={handleOptimizeWithAi}
            isOptimizing={isAiOptimizing}
            optimizationAdvice={aiAdvice}
            onMoveMealEntry={handleMoveMealEntry}
            onUpdateDishInPlan={handleUpdateDishInPlan}
          />
        )}

        {currentTab === 'monthly_diets' && (
          <DietUploadManager
            monthlyDiets={monthlyDiets}
            onAddMonthlyDiet={handleAddMonthlyDiet}
            onDeleteMonthlyDiet={handleDeleteMonthlyDiet}
            onApplyDietToPlanner={handleApplyDietToPlanner}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
          />
        )}

        {currentTab === 'supermarket' && (
          <SupermarketOptimizer
            optimizationResult={optimizationResult}
            selectedDays={selectedCookingDays}
            onChangeSelectedDays={setSelectedCookingDays}
            timeframeMultiplier={timeframeMultiplier}
            onChangeTimeframeMultiplier={setTimeframeMultiplier}
            onToggleItemCheck={(_id) => {}}
            onOptimizeWithAi={handleOptimizeWithAi}
            isAiLoading={isAiOptimizing}
            onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
          />
        )}

        {currentTab === 'workouts' && (
          <WorkoutTracker
            workouts={workouts}
            onAddWorkout={handleAddWorkout}
            onDeleteWorkout={handleDeleteWorkout}
            profile={profile}
            currentDate={currentDate}
          />
        )}

      </main>

      {/* Modal: Quick Add Meal to Current Date */}
      {isAddMealModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#13151D] border border-white/10 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Utensils className="w-5 h-5 text-[#CCFF00]" />
                <span>Asignar Platillo al Día ({currentDate})</span>
              </h3>
              <button
                onClick={() => setIsAddMealModalOpen(false)}
                className="text-[#8E92A4] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8E92A4] mb-1.5">
                Horario de la Comida
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-xs">
                {[
                  { id: 'breakfast', label: 'Desayuno' },
                  { id: 'morning_snack', label: 'Colación' },
                  { id: 'lunch', label: 'Comida' },
                  { id: 'afternoon_snack', label: 'Merienda' },
                  { id: 'dinner', label: 'Cena' }
                ].map((mt) => (
                  <button
                    key={mt.id}
                    type="button"
                    onClick={() => setSelectedMealTimeForAdd(mt.id as MealTime)}
                    className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                      selectedMealTimeForAdd === mt.id
                        ? 'bg-[#CCFF00] text-black border-[#CCFF00] shadow-neon-sm'
                        : 'bg-[#181B26] border-white/5 text-[#8E92A4] hover:text-white'
                    }`}
                  >
                    {mt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8E92A4] mb-2">
                Selecciona un Platillo del Catálogo Clínico
              </label>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {dishes.map((dish) => (
                  <div
                    key={dish.id}
                    onClick={() => handleAssignDishToDate(dish, currentDate, selectedMealTimeForAdd)}
                    className="p-3 bg-[#181B26] hover:bg-[#1E2232] border border-white/5 rounded-2xl transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <h5 className="text-xs sm:text-sm font-bold text-white">{dish.name}</h5>
                      <div className="flex items-center gap-2 text-[11px] text-[#8E92A4] mt-1 font-mono tabular-nums">
                        <span>{dish.calories} kcal</span>
                        <span>·</span>
                        <span className="text-[#FF9500] font-bold">{dish.proteinG}g P</span>
                        <span>·</span>
                        <span className="text-[#CCFF00] font-bold">${dish.costPerServingMxn.toFixed(2)} MXN</span>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 bg-[#CCFF00] hover:bg-[#b8e600] text-black text-xs font-black rounded-xl shadow-neon-sm">
                      Elegir
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modal: User Profile & Calorie Engine Settings */}
      <UserProfileModal
        profile={profile}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onSaveProfile={setProfile}
      />

      {/* Modal: Barcode & Quick Supermarket Scanner (HEB vs Costco) */}
      <BarcodeScannerModal
        isOpen={isBarcodeScannerOpen}
        onClose={() => setIsBarcodeScannerOpen(false)}
        onSelectProductForCart={handleSelectProductFromScanner}
      />

      {/* Modal: Weekly Athletic & Caloric Report in PDF */}
      <WeeklyReportPdfModal
        isOpen={isWeeklyReportOpen}
        onClose={() => setIsWeeklyReportOpen(false)}
        profile={profile}
        allWorkouts={workouts}
        allMeals={mealPlan}
        currentDate={currentDate}
        optimizationResult={optimizationResult}
      />

      {/* Modal: Native Apple Health Sync */}
      <AppleHealthSyncModal
        isOpen={isAppleHealthModalOpen}
        onClose={() => setIsAppleHealthModalOpen(false)}
        onImportMetrics={(metrics) => {
          if (metrics.activeCalories) {
            handleAddWorkout({
              date: metrics.date,
              time: '20:00',
              title: 'Actividad Diaria Apple Health',
              deviceSource: 'apple_fitness',
              activityType: 'walking',
              durationMinutes: metrics.exerciseMinutes || 45,
              caloriesBurned: metrics.activeCalories,
              notes: `Sincronizado vía Apple Health: ${metrics.totalSteps.toLocaleString()} pasos, FC reposo ${metrics.restingHeartRate || 60} bpm.`
            });
          }
        }}
      />

    </div>
  );
}
