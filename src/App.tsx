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
import { INITIAL_PRESET_MEALS } from './data/supermarketCatalog';
import { generateOptimizedGroceryList } from './utils/groceryOptimizer';
import { Plus, X, Utensils } from 'lucide-react';

const STORAGE_KEY_PROFILE = 'habithub_user_profile_v3';
const STORAGE_KEY_WORKOUTS = 'habithub_workouts_v3';
const STORAGE_KEY_DISHES = 'habithub_dishes_v3';
const STORAGE_KEY_MEALPLAN = 'habithub_mealplan_v3';
const STORAGE_KEY_THEME = 'habithub_theme_v3';
const STORAGE_KEY_MONTHLY_DIETS = 'habithub_monthly_diets_v3';
const STORAGE_KEY_FASTING = 'habithub_fasting_state_v3';

const INITIAL_MONTHLY_DIETS: MonthlyDietPlan[] = [
  {
    id: 'monthly-diet-1',
    title: 'Plan Hipertrofia & Rendimiento (Costco + HEB)',
    month: '2026-10',
    createdAt: '2026-10-01T08:00:00Z',
    targetCalories: 2450,
    proteinTargetG: 175,
    nutritionistName: 'Nutrióloga Mariana Ríos (Certificada ISSN)',
    notes: 'Dieta de alta biodisponibilidad proteica. Pechuga Kirkland y claras San Juan en Costco; aguacate, espinaca y frutos en H-E-B.',
    dishes: [
      INITIAL_PRESET_MEALS[0],
      INITIAL_PRESET_MEALS[1],
      INITIAL_PRESET_MEALS[2],
      INITIAL_PRESET_MEALS[3]
    ]
  },
  {
    id: 'monthly-diet-2',
    title: 'Plan Definición & Quema Grasa (Ayuno 16:8)',
    month: '2026-09',
    createdAt: '2026-09-01T08:00:00Z',
    targetCalories: 2050,
    proteinTargetG: 180,
    nutritionistName: 'Dr. Alejandro Cantú (Medicina Deportiva)',
    notes: 'Ventana de alimentación 12:00 a 20:00. Control estricto de carbohidratos en días de descanso.',
    dishes: [
      INITIAL_PRESET_MEALS[1],
      INITIAL_PRESET_MEALS[3],
      INITIAL_PRESET_MEALS[4]
    ]
  }
];

const INITIAL_FASTING_STATE: FastingState = {
  isActive: true,
  protocol: '16:8',
  startTime: new Date(Date.now() - 14.3 * 3600 * 1000).toISOString(),
  targetHours: 16,
  history: [
    {
      id: 'fast-h1',
      date: '2026-10-13',
      protocol: '16:8',
      startTime: '2026-10-12T20:00:00Z',
      endTime: '2026-10-13T12:05:00Z',
      durationHours: 16.1,
      completed: true
    },
    {
      id: 'fast-h2',
      date: '2026-10-12',
      protocol: '16:8',
      startTime: '2026-10-11T20:30:00Z',
      endTime: '2026-10-12T12:30:00Z',
      durationHours: 16.0,
      completed: true
    }
  ]
};

export default function App() {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [currentDate, setCurrentDate] = useState<string>(todayStr);
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'planner' | 'monthly_diets' | 'supermarket' | 'workouts'>('dashboard');

  // Theme State: 'light' or 'dark'
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    if (saved === 'light' || saved === 'dark') return saved;
    // Default to dark as shown in user's UI inspiration
    return 'dark';
  });

  // Apply theme class to <html> element
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

  // 1. User Profile State
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEFAULT_USER_PROFILE;
  });

  // 2. Workouts State (Preloaded with sample athletic workouts from Coros and Apple Fitness)
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
    return INITIAL_PRESET_MEALS;
  });

  // 4. Meal Plan State
  const [mealPlan, setMealPlan] = useState<MealPlanEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MEALPLAN);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      {
        id: `mp-init-1`,
        date: todayStr,
        dayOfWeek: new Date().getDay(),
        dish: INITIAL_PRESET_MEALS[0], // Omelette de claras y avena
        servings: 1,
        eaten: true
      },
      {
        id: `mp-init-2`,
        date: todayStr,
        dayOfWeek: new Date().getDay(),
        dish: INITIAL_PRESET_MEALS[1], // Bowl de pollo y arroz
        servings: 1,
        eaten: true
      },
      {
        id: `mp-init-3`,
        date: todayStr,
        dayOfWeek: new Date().getDay(),
        dish: INITIAL_PRESET_MEALS[3], // Batido anabólico
        servings: 1,
        eaten: false
      },
      {
        id: `mp-init-4`,
        date: todayStr,
        dayOfWeek: new Date().getDay(),
        dish: INITIAL_PRESET_MEALS[4], // Tacos de atún
        servings: 1,
        eaten: false
      }
    ];
  });

  // UI Modals
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddMealModalOpen, setIsAddMealModalOpen] = useState(false);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [isWeeklyReportOpen, setIsWeeklyReportOpen] = useState(false);
  const [isAiOptimizing, setIsAiOptimizing] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string[]>([]);
  const [selectedMealTimeForAdd, setSelectedMealTimeForAdd] = useState<MealTime>('lunch');

  // 5. Monthly Diets State
  const [monthlyDiets, setMonthlyDiets] = useState<MonthlyDietPlan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MONTHLY_DIETS);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_MONTHLY_DIETS;
  });

  // 6. Fasting State (Intermittent Fasting 16:8 or 18:6)
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

  // Water hydration state per day (ml)
  const [waterRecords, setWaterRecords] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('personal_hub_water_v2');
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
      localStorage.setItem('personal_hub_water_v2', JSON.stringify(updated));
      return updated;
    });
  };

  const handleResetWater = () => {
    setWaterRecords(prev => {
      const updated = {
        ...prev,
        [currentDate]: 0
      };
      localStorage.setItem('personal_hub_water_v2', JSON.stringify(updated));
      return updated;
    });
  };

  // Real-time calculation of daily energy expenditure and calorie deficit
  const dailySummary = useMemo(() => {
    return calculateDailySummary(currentDate, profile, workouts, mealPlan);
  }, [currentDate, profile, workouts, mealPlan]);

  // Real-time calculation of grocery optimization (Costco vs H-E-B)
  const optimizationResult = useMemo(() => {
    return generateOptimizedGroceryList(mealPlan, profile.preferredStore);
  }, [mealPlan, profile.preferredStore]);

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
      id: `mp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date,
      dayOfWeek,
      dish: { ...dish, mealTime },
      servings: 1,
      eaten: false
    };

    setMealPlan(prev => [...prev, newEntry]);
    setIsAddMealModalOpen(false);
  };

  // Handlers for Monthly Diets
  const handleAddMonthlyDiet = (diet: MonthlyDietPlan) => {
    setMonthlyDiets(prev => [diet, ...prev]);
  };

  const handleDeleteMonthlyDiet = (dietId: string) => {
    setMonthlyDiets(prev => prev.filter(d => d.id !== dietId));
  };

  const handleApplyDietToPlanner = (diet: MonthlyDietPlan) => {
    // 1. Add any novel dishes to the library
    setDishes(prev => {
      const existingNames = new Set(prev.map(d => d.name.toLowerCase()));
      const novel = diet.dishes.filter(d => !existingNames.has(d.name.toLowerCase()));
      return [...novel, ...prev];
    });

    // 2. Populate next 7 days in meal plan using these dishes
    if (diet.dishes.length > 0) {
      const [y, m, d] = currentDate.split('-').map(Number);
      const newEntries: MealPlanEntry[] = [];
      for (let i = 0; i < 7; i++) {
        const targetDateObj = new Date(y, m - 1, d + i);
        const dateStr = targetDateObj.toISOString().split('T')[0];
        const dayOfWeek = targetDateObj.getDay();

        diet.dishes.forEach((dish, idx) => {
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
      version: 'habithub-v3',
      exportDate: new Date().toISOString(),
      profile,
      workouts,
      dishes,
      mealPlan,
      monthlyDiets,
      fastingState,
      waterRecords
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
      if (Array.isArray(data.workouts)) setWorkouts(data.workouts);
      if (Array.isArray(data.dishes)) setDishes(data.dishes);
      if (Array.isArray(data.mealPlan)) setMealPlan(data.mealPlan);
      if (Array.isArray(data.monthlyDiets)) setMonthlyDiets(data.monthlyDiets);
      if (data.fastingState) setFastingState(data.fastingState);
      if (data.waterRecords) setWaterRecords(data.waterRecords);
    } catch (e) {
      console.error('Invalid backup file', e);
    }
  };

  const handleSelectProductFromScanner = (productName: string, store: 'costco' | 'heb', price: number) => {
    setIsBarcodeScannerOpen(false);
    const quickDish: MealDish = {
      id: `dish-scan-${Date.now()}`,
      name: `${productName} (${store.toUpperCase()})`,
      mealTime: 'lunch',
      category: 'high_protein',
      calories: 380,
      proteinG: 35,
      carbsG: 12,
      fatG: 9,
      costPerServingMxn: price > 100 ? price / 4 : price,
      prepTimeMinutes: 10,
      ingredients: [
        { name: productName, amount: 250, unit: 'g', preferredStore: store, estimatedCostMxn: price }
      ],
      recommendedStoreNotes: `Comprado en ${store === 'costco' ? 'Costco por volumen' : 'H-E-B fresco'}`
    };
    handleAddDishToLibrary(quickDish);
    handleAssignDishToDate(quickDish, currentDate, 'lunch');
  };

  const handleOpenAddMealForSlot = (mealTime?: 'breakfast' | 'lunch' | 'dinner' | 'afternoon_snack') => {
    if (mealTime) setSelectedMealTimeForAdd(mealTime);
    setIsAddMealModalOpen(true);
  };

  // AI Grocery Optimization call
  const handleOptimizeWithAi = async () => {
    setIsAiOptimizing(true);
    try {
      const res = await fetch('/api/optimize-diet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meals: mealPlan.map(m => ({
            name: m.dish.name,
            ingredients: m.dish.ingredients,
            cost: m.dish.costPerServingMxn
          })),
          userBudgetGoal: `Meta semanal de $${profile.weeklyBudgetMxn} MXN`,
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
      setAiAdvice([
        "Compra la pechuga Kirkland de 2.5kg en Costco y congela en porciones individuales para ahorrar 28% comparado con bandejas frescas.",
        "Adquiere espinacas y aguacate en H-E-B en cantidad semanal para evitar merma y desperdicio.",
        "Usa claras líquidas San Juan en Costco ($198 MXN por 4kg) para el costo más bajo de proteína pura en México."
      ]);
    } finally {
      setIsAiOptimizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090A0F] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Bar with Branding, Greeting & Theme Toggle */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenQuickWorkout={() => setCurrentTab('workouts')}
        onOpenProfile={() => setIsProfileOpen(true)}
        userName={profile.name}
        theme={theme}
        onToggleTheme={toggleTheme}
        todayDateStr={todayStr}
        onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
        onOpenWeeklyReport={() => setIsWeeklyReportOpen(true)}
      />

      {/* Main Responsive Viewport */}
      <main className="flex-1 max-w-4xl lg:max-w-6xl w-full mx-auto px-3.5 sm:px-6 py-4 sm:py-6">
        
        {currentTab === 'dashboard' && (
          <DailyDashboard
            currentDate={currentDate}
            onChangeDate={setCurrentDate}
            profile={profile}
            dailySummary={dailySummary}
            dayMeals={mealPlan.filter(m => m.date === currentDate)}
            dayWorkouts={workouts.filter(w => w.date === currentDate)}
            allWorkouts={workouts}
            allMeals={mealPlan}
            waterMl={currentWaterMl}
            onAddWater={handleAddWater}
            onResetWater={handleResetWater}
            onToggleMealEaten={handleToggleMealEaten}
            onOpenQuickWorkout={() => setCurrentTab('workouts')}
            onOpenAddMealModal={handleOpenAddMealForSlot}
            onDeleteWorkout={handleDeleteWorkout}
            onDeleteMeal={handleDeleteMealEntry}
            onNavigateTab={setCurrentTab}
            fastingState={fastingState}
            onUpdateFastingState={setFastingState}
            onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
            onOpenWeeklyReport={() => setIsWeeklyReportOpen(true)}
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
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#12131A] border border-slate-200 dark:border-white/10 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Utensils className="w-5 h-5 text-lime-500" />
                <span>Asignar Platillo al Día ({currentDate})</span>
              </h3>
              <button
                onClick={() => setIsAddMealModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
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
                    className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedMealTimeForAdd === mt.id
                        ? 'bg-lime-400 text-slate-950 border-lime-500 font-bold shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {mt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Selecciona un Platillo del Catálogo
              </label>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {dishes.map((dish) => (
                  <div
                    key={dish.id}
                    onClick={() => handleAssignDishToDate(dish, currentDate, selectedMealTimeForAdd)}
                    className="p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{dish.name}</h5>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono tabular-nums">
                        <span>{dish.calories} kcal</span>
                        <span>·</span>
                        <span className="text-orange-500 font-bold">{dish.proteinG}g P</span>
                        <span>·</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">${dish.costPerServingMxn.toFixed(2)} MXN</span>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-bold rounded-xl shadow-sm">
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

      {/* Modal: Weekly Athletic & Caloric Report in PDF / iOS Notes */}
      <WeeklyReportPdfModal
        isOpen={isWeeklyReportOpen}
        onClose={() => setIsWeeklyReportOpen(false)}
        profile={profile}
        allWorkouts={workouts}
        allMeals={mealPlan}
        currentDate={currentDate}
        optimizationResult={optimizationResult}
      />

    </div>
  );
}
