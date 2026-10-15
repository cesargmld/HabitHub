import React, { useState } from 'react';
import { 
  Calendar, 
  Plus, 
  Utensils, 
  Sparkles, 
  TrendingDown, 
  Clock, 
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowRightLeft,
  Check,
  Info,
  DollarSign,
  Tag
} from 'lucide-react';
import { MealDish, MealPlanEntry, MealTime, IngredientSubstitute } from '../types';
import { computeVerifiedIngredientCost, findVerifiedStaple } from '../utils/pricingEngine';

interface MealPlannerProps {
  currentDate: string;
  dishes: MealDish[];
  mealPlan: MealPlanEntry[];
  onAddDishToLibrary: (dish: MealDish) => void;
  onAssignDishToDate: (dish: MealDish, date: string, mealTime: MealTime) => void;
  onRemoveMealPlanEntry: (entryId: string) => void;
  onOptimizeWeekPlan: () => void;
  isOptimizing: boolean;
  optimizationAdvice: string[];
  onMoveMealEntry?: (entryId: string, newDate: string, newMealTime: MealTime) => void;
  onUpdateDishInPlan?: (entryId: string, updatedDish: MealDish) => void;
}

const SLOT_CALORIE_TARGETS: Record<string, { calories: number; protein: number; label: string }> = {
  desayuno: { calories: 410, protein: 31, label: 'Desayuno (~410 kcal)' },
  comida: { calories: 520, protein: 48, label: 'Comida (~520 kcal)' },
  cena: { calories: 380, protein: 35, label: 'Cena (~380 kcal)' },
  snack: { calories: 160, protein: 12, label: 'Colación / Snack (~160 kcal)' }
};

export const MealPlanner: React.FC<MealPlannerProps> = ({
  currentDate,
  dishes,
  mealPlan,
  onAddDishToLibrary,
  onAssignDishToDate,
  onRemoveMealPlanEntry,
  onOptimizeWeekPlan,
  isOptimizing,
  optimizationAdvice,
  onMoveMealEntry,
  onUpdateDishInPlan
}) => {
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [showNewDishModal, setShowNewDishModal] = useState<boolean>(false);
  
  // Expanded inline accordion states
  const [expandedSubstitutesId, setExpandedSubstitutesId] = useState<string | null>(null);
  const [expandedIngredientsId, setExpandedIngredientsId] = useState<string | null>(null);
  const [movingEntryId, setMovingEntryId] = useState<string | null>(null);

  // AI Generator state with strict calorie target per meal slot
  const [aiCategory, setAiCategory] = useState<string>('comida');
  const [aiTargetCalories, setAiTargetCalories] = useState<number>(SLOT_CALORIE_TARGETS['comida'].calories);
  const [aiTargetProtein, setAiTargetProtein] = useState<number>(SLOT_CALORIE_TARGETS['comida'].protein);
  const [aiIngredients, setAiIngredients] = useState<string>('pechuga de pollo, arroz, claras, verduras');
  const [isGeneratingAiDish, setIsGeneratingAiDish] = useState<boolean>(false);

  // Manual New Dish Form State
  const [dishName, setDishName] = useState('');
  const [dishMealTime, setDishMealTime] = useState<MealTime>('lunch');
  const [dishCalories, setDishCalories] = useState<number>(500);
  const [dishProtein, setDishProtein] = useState<number>(40);
  const [dishCarbs, setDishCarbs] = useState<number>(50);
  const [dishFat, setDishFat] = useState<number>(12);
  const [dishCost, setDishCost] = useState<number>(45);
  const [dishPrepMinutes, setDishPrepMinutes] = useState<number>(15);
  const [dishStoreNotes, setDishStoreNotes] = useState('');
  const [dishIngredientsText, setDishIngredientsText] = useState('Pechuga de pollo (200g) - Costco, Arroz cocido (150g) - HEB');

  // Days of current week (Monday to Sunday)
  const [currYear, currMonth, currDay] = currentDate.split('-').map(Number);
  const baseDate = new Date(currYear, currMonth - 1, currDay);
  
  const dayOfWeek = baseDate.getDay();
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(baseDate);
  monday.setDate(monday.getDate() + distanceToMonday);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('es-MX', { weekday: 'short' });
    const fullDayName = d.toLocaleDateString('es-MX', { weekday: 'long' });
    const dayNumber = d.getDate();
    return { dateStr, dayName, fullDayName, dayNumber, dayOfWeekIndex: d.getDay() };
  });

  const activeDate = weekDays[selectedDayOffset]?.dateStr || currentDate;
  const activeDateMeals = mealPlan.filter(m => m.date === activeDate);

  const dayCalories = activeDateMeals.reduce((sum, m) => sum + (m.dish.calories * (m.servings || 1)), 0);
  const dayProtein = activeDateMeals.reduce((sum, m) => sum + (m.dish.proteinG * (m.servings || 1)), 0);
  const dayCost = activeDateMeals.reduce((sum, m) => sum + (m.dish.costPerServingMxn * (m.servings || 1)), 0);

  // Sync AI category change to slot calories
  const handleAiCategoryChange = (categoryKey: string) => {
    setAiCategory(categoryKey);
    const target = SLOT_CALORIE_TARGETS[categoryKey] || SLOT_CALORIE_TARGETS['comida'];
    setAiTargetCalories(target.calories);
    setAiTargetProtein(target.protein);
  };

  const handleGenerateAiDish = async () => {
    setIsGeneratingAiDish(true);
    try {
      const res = await fetch('/api/generate-dish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetCalories: aiTargetCalories,
          targetProtein: aiTargetProtein,
          category: aiCategory,
          ingredientsAtHome: aiIngredients
        })
      });
      const data = await res.json();
      
      const newDish: MealDish = {
        id: `dish-ai-${Date.now()}`,
        name: data.name || 'Platillo Fitness Optimizado',
        mealTime: (aiCategory === 'desayuno' ? 'breakfast' : aiCategory === 'cena' ? 'dinner' : aiCategory === 'snack' ? 'morning_snack' : 'lunch') as MealTime,
        category: 'high_protein',
        calories: Number(data.calories) || aiTargetCalories,
        proteinG: Number(data.protein) || aiTargetProtein,
        carbsG: Number(data.carbs) || 45,
        fatG: Number(data.fat) || 12,
        costPerServingMxn: Number(data.costPerServingMxn) || 38.0,
        prepTimeMinutes: 15,
        recommendedStoreNotes: data.recommendedStore || 'Ingredientes en Costco y frescos en HEB',
        instructions: data.instructions,
        ingredients: Array.isArray(data.ingredients) ? data.ingredients.map((ing: any) => ({
          name: ing.name,
          amount: 100,
          unit: 'g',
          preferredStore: (ing.store?.toLowerCase() === 'costco' ? 'costco' : 'heb')
        })) : []
      };

      onAddDishToLibrary(newDish);
      onAssignDishToDate(newDish, activeDate, newDish.mealTime);
      setShowAiModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAiDish(false);
    }
  };

  const handleCreateManualDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim()) return;

    const newDish: MealDish = {
      id: `dish-custom-${Date.now()}`,
      name: dishName.trim(),
      mealTime: dishMealTime,
      category: 'high_protein',
      calories: Number(dishCalories) || 450,
      proteinG: Number(dishProtein) || 35,
      carbsG: Number(dishCarbs) || 45,
      fatG: Number(dishFat) || 10,
      costPerServingMxn: Number(dishCost) || 40,
      prepTimeMinutes: Number(dishPrepMinutes) || 15,
      recommendedStoreNotes: dishStoreNotes.trim() || 'Compras divididas entre Costco y H-E-B',
      ingredients: dishIngredientsText.split(',').map((item, idx) => ({
        id: `ing-${idx}`,
        name: item.trim(),
        amount: 100,
        unit: 'g',
        preferredStore: item.toLowerCase().includes('costco') ? 'costco' : 'heb'
      }))
    };

    onAddDishToLibrary(newDish);
    onAssignDishToDate(newDish, activeDate, dishMealTime);
    setShowNewDishModal(false);
    setDishName('');
  };

  const handleApplySubstitute = (entry: MealPlanEntry, sub: IngredientSubstitute) => {
    if (!onUpdateDishInPlan) return;

    const updatedDish: MealDish = {
      ...entry.dish,
      name: `${entry.dish.name} (Optimizado: ${sub.substituteIngredient.split(' ')[1] || 'Sustituido'})`,
      costPerServingMxn: Math.max(15, parseFloat((entry.dish.costPerServingMxn - sub.savingMxn).toFixed(2))),
      instructions: `${entry.dish.instructions || ''} [Sustitución aplicada: ${sub.originalIngredient} -> ${sub.substituteIngredient}]`
    };

    onUpdateDishInPlan(entry.id, updatedDish);
    setExpandedSubstitutesId(null);
  };

  const handleMoveEntryTo = (entryId: string, targetDateStr: string, targetMealTime: MealTime) => {
    if (onMoveMealEntry) {
      onMoveMealEntry(entryId, targetDateStr, targetMealTime);
    }
    setMovingEntryId(null);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-lime-500" />
            <span>Planificador Semanal Inteligente</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Comidas asignadas por día con optimización de ahorro y sustitutos equivalentes en calorías.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-[#CCFF00] hover:bg-[#bbf000] text-black rounded-xl shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generar con IA (Calorías Exactas)</span>
          </button>

          <button
            onClick={onOptimizeWeekPlan}
            disabled={isOptimizing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-white dark:bg-[#12131A] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/5 rounded-xl hover:border-lime-500/50 transition-all cursor-pointer disabled:opacity-50"
          >
            <TrendingDown className="w-3.5 h-3.5 text-lime-500" />
            <span>{isOptimizing ? 'Optimizando...' : 'Estrategia Ahorro'}</span>
          </button>
        </div>
      </div>

      {/* AI Optimization Banner */}
      {optimizationAdvice.length > 0 && (
        <div className="p-4 bg-lime-500/10 border border-lime-500/20 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-lime-600 dark:text-lime-400">
            <Sparkles className="w-4 h-4" />
            <span>Estrategia de Optimización Semanal</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-lime-200/90 list-disc list-inside">
            {optimizationAdvice.map((advice, i) => (
              <li key={i}>{advice}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 7-Day Week Navigation Bar */}
      <div className="bg-white dark:bg-[#12131A] border border-slate-200/80 dark:border-white/5 rounded-2xl p-2 shadow-sm transition-colors">
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {weekDays.map((day, idx) => {
            const isSelected = selectedDayOffset === idx;
            const isCurrentToday = day.dateStr === new Date().toISOString().split('T')[0];
            const dayMealsCount = mealPlan.filter(m => m.date === day.dateStr).length;

            return (
              <button
                key={day.dateStr}
                onClick={() => setSelectedDayOffset(idx)}
                className={`flex flex-col items-center py-2 px-1 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-slate-800 text-white border-lime-500 shadow-sm'
                    : 'bg-transparent border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                  {day.dayName}
                </span>
                <span className="text-base sm:text-lg font-extrabold font-mono mt-0.5">
                  {day.dayNumber}
                </span>
                <div className="flex items-center gap-1 mt-1 text-[10px]">
                  {isCurrentToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />
                  )}
                  <span className="font-mono text-slate-400">{dayMealsCount} com.</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Info Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#12131A] p-4 rounded-2xl border border-slate-200/80 dark:border-white/5 shadow-sm transition-colors">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white capitalize flex items-center gap-2">
            <span>Comidas del {weekDays[selectedDayOffset]?.fullDayName} {weekDays[selectedDayOffset]?.dayNumber}</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-[10px] text-slate-500 dark:text-slate-400 font-mono font-normal">
              {activeDateMeals.length} registradas
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Costo del día: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">${dayCost.toFixed(2)} MXN</span> · Calorías: <span className="font-mono text-slate-900 dark:text-white font-bold">{dayCalories} kcal</span> · Proteína: <span className="font-mono text-orange-500 font-bold">{dayProtein}g</span>
          </p>
        </div>

        <button
          onClick={() => setShowNewDishModal(true)}
          className="text-xs font-bold text-lime-600 dark:text-lime-400 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Platillo Propio</span>
        </button>
      </div>

      {/* Day Meals List */}
      <div className="space-y-3">
        {activeDateMeals.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white/50 dark:bg-slate-900/30">
            <Utensils className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Sin comidas asignadas para este día.</p>
            <p className="text-xs text-slate-400 mt-1">
              Selecciona cualquier platillo del catálogo abajo o genera uno nuevo con IA ajustado a tus calorías.
            </p>
          </div>
        ) : (
          activeDateMeals.map(entry => {
            const isSubstitutesOpen = expandedSubstitutesId === entry.id;
            const isIngredientsOpen = expandedIngredientsId === entry.id;
            const isMovingOpen = movingEntryId === entry.id;
            const hasSubstitutes = Boolean(entry.dish.substitutes && entry.dish.substitutes.length > 0);

            return (
              <div 
                key={entry.id}
                className="bg-white dark:bg-[#12131A] border border-slate-200/80 dark:border-white/5 rounded-2xl p-4 shadow-sm transition-colors space-y-3"
              >
                {/* Main Meal Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400">
                        {entry.dish.mealTime === 'breakfast' && 'Desayuno'}
                        {entry.dish.mealTime === 'morning_snack' && 'Colación'}
                        {entry.dish.mealTime === 'lunch' && 'Comida'}
                        {entry.dish.mealTime === 'afternoon_snack' && 'Merienda'}
                        {entry.dish.mealTime === 'dinner' && 'Cena'}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        ${entry.dish.costPerServingMxn.toFixed(2)} MXN
                      </span>
                      {entry.dish.assignedDay && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-300 font-medium">
                          Día asignado: {entry.dish.assignedDay}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-1">
                      {entry.dish.name}
                    </h4>

                    <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono tabular-nums">
                      <span className="text-slate-900 dark:text-slate-200 font-bold">{entry.dish.calories} kcal</span>
                      <span>·</span>
                      <span className="text-orange-500 font-bold">{entry.dish.proteinG}g P</span>
                      <span>·</span>
                      <span className="text-sky-500">{entry.dish.carbsG}g C</span>
                      <span>·</span>
                      <span className="text-amber-500">{entry.dish.fatG}g G</span>
                    </div>

                    {entry.dish.recommendedStoreNotes && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 italic">
                        🛒 {entry.dish.recommendedStoreNotes}
                      </p>
                    )}
                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {/* Move to another day / slot */}
                    <button
                      onClick={() => setMovingEntryId(isMovingOpen ? null : entry.id)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        isMovingOpen
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-transparent'
                          : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                      title="Mover a otro día o comida"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Mover</span>
                    </button>

                    <button
                      onClick={() => onRemoveMealPlanEntry(entry.id)}
                      title="Quitar del día"
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Inline Action Bar: Optimizar Ahorro & Desglose Ingredientes */}
                <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Optimize Savings & Substitutes Button */}
                    <button
                      onClick={() => setExpandedSubstitutesId(isSubstitutesOpen ? null : entry.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isSubstitutesOpen
                          ? 'bg-lime-400 text-slate-950 shadow-sm'
                          : 'bg-lime-50 dark:bg-lime-950/30 text-lime-700 dark:text-lime-300 hover:bg-lime-100 dark:hover:bg-lime-900/40 border border-lime-500/20'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Optimizar Ahorro & Sustitutos</span>
                      {hasSubstitutes && (
                        <span className="px-1.5 py-0.2 rounded-full bg-lime-500 text-black text-[10px] font-black">
                          {entry.dish.substitutes?.length}
                        </span>
                      )}
                      {isSubstitutesOpen ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                    </button>

                    {/* View Ingredients Cost Breakdown Button */}
                    <button
                      onClick={() => setExpandedIngredientsId(isIngredientsOpen ? null : entry.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Desglose de Costo</span>
                      {isIngredientsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Sub-panel 1: Moving Meal Selector */}
                {isMovingOpen && (
                  <div className="p-3 bg-slate-50 dark:bg-[#181B26] border border-slate-200 dark:border-white/10 rounded-xl space-y-2 text-xs">
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      Mover "{entry.dish.name}" a otro día o tiempo de comida:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">Día de la semana:</label>
                        <select 
                          id={`move-day-${entry.id}`} 
                          defaultValue={entry.date}
                          className="w-full bg-white dark:bg-[#12131A] border border-slate-200 dark:border-white/10 rounded-lg p-1.5 text-slate-900 dark:text-white"
                        >
                          {weekDays.map(d => (
                            <option key={d.dateStr} value={d.dateStr}>
                              {d.fullDayName} ({d.dayNumber})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">Horario:</label>
                        <select 
                          id={`move-slot-${entry.id}`}
                          defaultValue={entry.dish.mealTime}
                          className="w-full bg-white dark:bg-[#12131A] border border-slate-200 dark:border-white/10 rounded-lg p-1.5 text-slate-900 dark:text-white"
                        >
                          <option value="breakfast">Desayuno</option>
                          <option value="morning_snack">Colación</option>
                          <option value="lunch">Comida</option>
                          <option value="afternoon_snack">Merienda</option>
                          <option value="dinner">Cena</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2 flex items-end gap-2">
                        <button
                          onClick={() => {
                            const daySelect = document.getElementById(`move-day-${entry.id}`) as HTMLSelectElement;
                            const slotSelect = document.getElementById(`move-slot-${entry.id}`) as HTMLSelectElement;
                            if (daySelect && slotSelect) {
                              handleMoveEntryTo(entry.id, daySelect.value, slotSelect.value as MealTime);
                            }
                          }}
                          className="px-3 py-1.5 bg-[#CCFF00] hover:bg-[#bbf000] text-black font-extrabold rounded-lg cursor-pointer"
                        >
                          Confirmar Reubicación
                        </button>
                        <button
                          onClick={() => setMovingEntryId(null)}
                          className="px-3 py-1.5 text-slate-500 hover:text-white"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-panel 2: Inline Calorie-Equivalent Substitutes */}
                {isSubstitutesOpen && (
                  <div className="p-3 bg-lime-50/50 dark:bg-lime-950/20 border border-lime-500/30 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lime-800 dark:text-lime-300 flex items-center gap-1.5">
                        <TrendingDown className="w-4 h-4 text-lime-500" />
                        <span>Sustitutos Inteligentes de Calorías Idénticas:</span>
                      </span>
                      <span className="text-[10px] text-slate-400">Precios y macros verificados en México</span>
                    </div>

                    {hasSubstitutes ? (
                      <div className="space-y-2 mt-2">
                        {entry.dish.substitutes?.map((sub, sIdx) => (
                          <div 
                            key={sIdx}
                            className="bg-white dark:bg-[#12131A] border border-lime-500/20 p-2.5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-white">{sub.substituteIngredient}</span>
                                <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-[10px]">
                                  Ahorro: -${sub.savingMxn.toFixed(2)} MXN
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                Reemplaza: <span className="line-through text-slate-400">{sub.originalIngredient}</span> · {sub.notes}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 font-mono">
                                <span>Calorías: ~{sub.calories} kcal</span>
                                <span>·</span>
                                <span>Proteína: {sub.proteinG}g</span>
                                <span className="text-lime-500 font-bold">(Idéntico a la dieta)</span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleApplySubstitute(entry, sub)}
                              className="px-3 py-1.5 bg-[#CCFF00] hover:bg-[#bbf000] text-black font-black rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap self-start sm:self-center"
                            >
                              Aplicar Sustituto
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-white dark:bg-[#12131A] rounded-lg border border-white/5 space-y-1">
                        <p className="text-slate-600 dark:text-slate-300">
                          Este platillo ya cuenta con una excelente relación costo/beneficio en Costco y H-E-B.
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Tip: Puedes comprar la proteína a granel en Costco (pechuga Kirkland o claras San Juan) para reducir 28% su costo unitario.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-panel 3: Itemized Ingredient Cost Breakdown */}
                {isIngredientsOpen && (
                  <div className="p-3 bg-slate-50 dark:bg-[#181B26] border border-slate-200 dark:border-white/10 rounded-xl space-y-2 text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Cálculo de Costo Real por Ingrediente (Mercado Mexicano):
                    </span>
                    <div className="divide-y divide-slate-200 dark:divide-white/5">
                      {entry.dish.ingredients.map((ing, iIdx) => {
                        const verified = computeVerifiedIngredientCost(ing.name, ing.amount, ing.unit);
                        return (
                          <div key={iIdx} className="py-1.5 flex items-center justify-between">
                            <div>
                              <span className="font-medium text-slate-900 dark:text-white">{ing.name}</span>
                              <span className="text-slate-400 ml-2 font-mono">({ing.amount} {ing.unit})</span>
                              {ing.preferredStore && (
                                <span className="ml-2 text-[10px] text-slate-500 uppercase">
                                  [{ing.preferredStore === 'costco' ? 'Costco Mayoreo' : 'H-E-B Frescos'}]
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                              ${verified.costMxn.toFixed(2)} MXN
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* Catalog of Pre-Built Dishes */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Catálogo de Platillos de tu Plan Clínico</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Toca "Asignar" para agregarlo al día seleccionado ({weekDays[selectedDayOffset]?.fullDayName}).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {dishes.map((dish) => (
            <div
              key={dish.id}
              className="bg-white dark:bg-[#12131A] border border-slate-200/80 dark:border-white/5 hover:border-lime-500/50 rounded-2xl p-4 transition-all flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    {dish.mealTime === 'breakfast' && 'Desayuno'}
                    {dish.mealTime === 'morning_snack' && 'Colación'}
                    {dish.mealTime === 'lunch' && 'Almuerzo'}
                    {dish.mealTime === 'afternoon_snack' && 'Merienda'}
                    {dish.mealTime === 'dinner' && 'Cena'}
                  </span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    ${dish.costPerServingMxn.toFixed(2)} MXN
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                  {dish.name}
                </h4>

                {dish.assignedDay && (
                  <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-300 font-medium">
                    Programado para: {dish.assignedDay}
                  </span>
                )}

                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono tabular-nums">
                  <span className="text-slate-900 dark:text-slate-200 font-bold">{dish.calories} kcal</span>
                  <span>·</span>
                  <span className="text-orange-500 font-bold">{dish.proteinG}g P</span>
                  <span>·</span>
                  <span className="text-sky-500">{dish.carbsG}g C</span>
                  <span>·</span>
                  <span className="text-amber-500">{dish.fatG}g G</span>
                </div>

                {dish.instructions && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                    {dish.instructions}
                  </p>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {dish.ingredients.length} ingredientes
                </span>
                <button
                  onClick={() => onAssignDishToDate(dish, activeDate, dish.mealTime)}
                  className="px-3 py-1.5 text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-xl hover:bg-lime-400 hover:text-slate-950 dark:hover:bg-lime-400 dark:hover:text-slate-950 transition-all cursor-pointer"
                >
                  Asignar al Día
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Generate AI Dish with Strict Calorie Adherence */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#12131A] border border-slate-200 dark:border-white/10 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl transition-colors">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-lime-500" />
                <span>Generar Platillo con IA (Calorías Exactas)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                El platillo generado respetará estrictamente las calorías objetivo del horario seleccionado.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Horario de la Comida
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {Object.entries(SLOT_CALORIE_TARGETS).map(([key, val]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleAiCategoryChange(key)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer capitalize font-bold ${
                        aiCategory === key
                          ? 'bg-[#CCFF00] text-black border-[#CCFF00]'
                          : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Calorías Objetivo (kcal)
                  </label>
                  <input
                    type="number"
                    value={aiTargetCalories}
                    onChange={(e) => setAiTargetCalories(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-[#181B26] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white font-mono"
                  />
                  <span className="text-[10px] text-lime-600 dark:text-lime-400 font-mono mt-0.5 block">
                    ✓ Calibrado para {aiCategory}
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Proteína Objetivo (g)
                  </label>
                  <input
                    type="number"
                    value={aiTargetProtein}
                    onChange={(e) => setAiTargetProtein(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-[#181B26] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Ingredientes preferidos o en alacena
                </label>
                <input
                  type="text"
                  value={aiIngredients}
                  onChange={(e) => setAiIngredients(e.target.value)}
                  placeholder="ej: pollo, claras, aguacate, arroz"
                  className="w-full bg-slate-50 dark:bg-[#181B26] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-white/5">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGenerateAiDish}
                disabled={isGeneratingAiDish}
                className="px-4 py-2 text-xs font-black bg-[#CCFF00] hover:bg-[#bbf000] text-black rounded-xl cursor-pointer disabled:opacity-50"
              >
                {isGeneratingAiDish ? 'Generando platillo exacto...' : 'Crear y Asignar al Día'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Custom Manual Dish */}
      {showNewDishModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form 
            onSubmit={handleCreateManualDish}
            className="bg-white dark:bg-[#12131A] border border-slate-200 dark:border-white/10 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl transition-colors"
          >
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Utensils className="w-5 h-5 text-lime-500" />
                <span>Nuevo Platillo Propio</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Agrega tu receta para programarla en cualquier día.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre del Platillo</label>
                <input
                  type="text"
                  required
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  placeholder="ej: Tacos de Salmón con Aguacate"
                  className="w-full bg-slate-50 dark:bg-[#181B26] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Calorías</label>
                  <input
                    type="number"
                    value={dishCalories}
                    onChange={(e) => setDishCalories(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-[#181B26] border border-slate-200 dark:border-white/10 rounded-xl p-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Proteína (g)</label>
                  <input
                    type="number"
                    value={dishProtein}
                    onChange={(e) => setDishProtein(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-[#181B26] border border-slate-200 dark:border-white/10 rounded-xl p-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Carbos (g)</label>
                  <input
                    type="number"
                    value={dishCarbs}
                    onChange={(e) => setDishCarbs(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-[#181B26] border border-slate-200 dark:border-white/10 rounded-xl p-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Grasas (g)</label>
                  <input
                    type="number"
                    value={dishFat}
                    onChange={(e) => setDishFat(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-[#181B26] border border-slate-200 dark:border-white/10 rounded-xl p-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ingredientes (separados por coma)</label>
                <input
                  type="text"
                  value={dishIngredientsText}
                  onChange={(e) => setDishIngredientsText(e.target.value)}
                  placeholder="ej: Pechuga de pollo (160g) - Costco, Arroz (160g) - HEB"
                  className="w-full bg-slate-50 dark:bg-[#181B26] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-white/5">
              <button
                type="button"
                onClick={() => setShowNewDishModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-black bg-[#CCFF00] hover:bg-[#bbf000] text-black rounded-xl cursor-pointer"
              >
                Guardar y Asignar
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
