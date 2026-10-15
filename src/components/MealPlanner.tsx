import React, { useState } from 'react';
import { 
  Calendar, 
  Plus, 
  Utensils, 
  Sparkles, 
  TrendingDown, 
  Clock, 
  Trash2
} from 'lucide-react';
import { MealDish, MealPlanEntry, MealTime } from '../types';

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
}

export const MealPlanner: React.FC<MealPlannerProps> = ({
  currentDate,
  dishes,
  mealPlan,
  onAddDishToLibrary,
  onAssignDishToDate,
  onRemoveMealPlanEntry,
  onOptimizeWeekPlan,
  isOptimizing,
  optimizationAdvice
}) => {
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [showNewDishModal, setShowNewDishModal] = useState<boolean>(false);

  // AI Generator state
  const [aiTargetCalories, setAiTargetCalories] = useState<number>(550);
  const [aiTargetProtein, setAiTargetProtein] = useState<number>(45);
  const [aiCategory, setAiCategory] = useState<string>('comida');
  const [aiIngredients, setAiIngredients] = useState<string>('pechuga de pollo, arroz, claras, aguacate');
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
    const dayNumber = d.getDate();
    return { dateStr, dayName, dayNumber };
  });

  const activeDate = weekDays[selectedDayOffset]?.dateStr || currentDate;
  const activeDateMeals = mealPlan.filter(m => m.date === activeDate);

  const dayCalories = activeDateMeals.reduce((sum, m) => sum + (m.dish.calories * (m.servings || 1)), 0);
  const dayProtein = activeDateMeals.reduce((sum, m) => sum + (m.dish.proteinG * (m.servings || 1)), 0);
  const dayCost = activeDateMeals.reduce((sum, m) => sum + (m.dish.costPerServingMxn * (m.servings || 1)), 0);

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
        mealTime: (aiCategory === 'desayuno' ? 'breakfast' : aiCategory === 'cena' ? 'dinner' : 'lunch') as MealTime,
        category: 'high_protein',
        calories: Number(data.calories) || 520,
        proteinG: Number(data.protein) || 45,
        carbsG: Number(data.carbs) || 50,
        fatG: Number(data.fat) || 12,
        costPerServingMxn: Number(data.costPerServingMxn) || 48.0,
        prepTimeMinutes: 15,
        recommendedStoreNotes: data.recommendedStore || 'Ingredientes clave en Costco y frescos en HEB',
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

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      
      {/* Top Header & CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Utensils className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
            <span>Plan Semanal & Recetas de Bajo Costo</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Diseña tus comidas para maximizar compras a granel de Costco y frescos de H-E-B, reduciendo el costo por porción.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-lime-400 hover:bg-lime-300 rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            <span>Generar Platillo con IA</span>
          </button>

          <button
            onClick={onOptimizeWeekPlan}
            disabled={isOptimizing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#12131A] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            <TrendingDown className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span>{isOptimizing ? 'Optimizando...' : 'Optimizar Ahorro'}</span>
          </button>
        </div>
      </div>

      {/* AI Advice Callout */}
      {optimizationAdvice.length > 0 && (
        <div className="bg-lime-50 dark:bg-lime-950/30 border border-lime-500/40 rounded-2xl p-4 transition-colors">
          <div className="flex items-center gap-2 text-lime-800 dark:text-lime-300 font-bold text-xs uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Estrategia de Optimización Semanal</span>
          </div>
          <ul className="space-y-1.5 text-xs text-lime-900 dark:text-lime-200/90 list-disc list-inside">
            {optimizationAdvice.map((advice, i) => (
              <li key={i}>{advice}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 7-Day Week Navigation Bar (Mobile Horizontally Scrollable) */}
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
          <h3 className="text-sm font-bold text-slate-900 dark:text-white capitalize">
            Platillos para el {weekDays[selectedDayOffset]?.dayName} {weekDays[selectedDayOffset]?.dayNumber}
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
              Selecciona cualquier platillo del catálogo para agregarlo rápidamente.
            </p>
          </div>
        ) : (
          activeDateMeals.map(entry => (
            <div 
              key={entry.id}
              className="bg-white dark:bg-[#12131A] border border-slate-200/80 dark:border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm transition-colors"
            >
              <div className="min-w-0">
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
                </div>

                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                  {entry.dish.name}
                </h4>

                <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono tabular-nums">
                  <span className="text-slate-900 dark:text-slate-200">{entry.dish.calories} kcal</span>
                  <span>·</span>
                  <span className="text-orange-500 font-bold">{entry.dish.proteinG}g P</span>
                  <span>·</span>
                  <span className="text-sky-500">{entry.dish.carbsG}g C</span>
                  <span>·</span>
                  <span className="text-amber-500">{entry.dish.fatG}g G</span>
                </div>

                {entry.dish.recommendedStoreNotes && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">
                    🛒 {entry.dish.recommendedStoreNotes}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <span className="text-xs text-slate-400 font-mono">
                  Prep: {entry.dish.prepTimeMinutes}m
                </span>
                <button
                  onClick={() => onRemoveMealPlanEntry(entry.id)}
                  title="Quitar del día"
                  className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors rounded-lg cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Catalog of Pre-Built Dishes */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Catálogo de Platillos de Alto Rendimiento</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Toca "Asignar" para programarlo en el día seleccionado ({weekDays[selectedDayOffset]?.dayName}).
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

                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono tabular-nums">
                  <span>{dish.calories} kcal</span>
                  <span>·</span>
                  <span className="text-orange-500 font-bold">{dish.proteinG}g P</span>
                  <span>·</span>
                  <span className="text-sky-500">{dish.carbsG}g C</span>
                  <span>·</span>
                  <span className="text-amber-500">{dish.fatG}g G</span>
                </div>

                {dish.recommendedStoreNotes && (
                  <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2">
                    🛒 {dish.recommendedStoreNotes}
                  </p>
                )}
              </div>

              <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  ⏱️ {dish.prepTimeMinutes} min
                </span>
                <button
                  onClick={() => onAssignDishToDate(dish, activeDate, dish.mealTime)}
                  className="px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-lime-400 hover:text-slate-950 text-slate-800 dark:text-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  + Asignar a {weekDays[selectedDayOffset]?.dayName}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: AI GENERATE DISH */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#12131A] border border-slate-200 dark:border-white/10 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-lime-500" />
                <span>Generador de Platillo con IA</span>
              </h3>
              <button 
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Genera una receta balanceada en costo y macros para Costco y H-E-B México.
            </p>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Calorías Objetivo
                  </label>
                  <input
                    type="number"
                    value={aiTargetCalories}
                    onChange={(e) => setAiTargetCalories(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Proteína Objetivo (g)
                  </label>
                  <input
                    type="number"
                    value={aiTargetProtein}
                    onChange={(e) => setAiTargetProtein(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Momento del Día
                </label>
                <select
                  value={aiCategory}
                  onChange={(e) => setAiCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl p-2.5 cursor-pointer"
                >
                  <option value="desayuno">Desayuno</option>
                  <option value="comida">Comida / Almuerzo</option>
                  <option value="cena">Cena</option>
                  <option value="colacion">Colación / Snack</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ingredientes en Casa o Preferidos
                </label>
                <input
                  type="text"
                  value={aiIngredients}
                  onChange={(e) => setAiIngredients(e.target.value)}
                  placeholder="ej. pollo, claras, aguacate, frijoles"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl p-2.5"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isGeneratingAiDish}
                onClick={handleGenerateAiDish}
                className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-lime-400 hover:bg-lime-300 rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGeneratingAiDish ? 'Creando con IA...' : 'Generar y Asignar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE MANUAL DISH */}
      {showNewDishModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#12131A] border border-slate-200 dark:border-white/10 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Nuevo Platillo Personalizado</h3>
              <button 
                onClick={() => setShowNewDishModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateManualDish} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre del Platillo
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Fajitas de Pollo con Pimientos"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Horario Habitual
                  </label>
                  <select
                    value={dishMealTime}
                    onChange={(e) => setDishMealTime(e.target.value as MealTime)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl p-2.5 cursor-pointer"
                  >
                    <option value="breakfast">Desayuno</option>
                    <option value="morning_snack">Colación</option>
                    <option value="lunch">Comida</option>
                    <option value="afternoon_snack">Merienda</option>
                    <option value="dinner">Cena</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Costo Estimado ($ MXN)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={dishCost}
                    onChange={(e) => setDishCost(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Calorías</label>
                  <input
                    type="number"
                    value={dishCalories}
                    onChange={(e) => setDishCalories(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-orange-500 mb-1">Prot (g)</label>
                  <input
                    type="number"
                    value={dishProtein}
                    onChange={(e) => setDishProtein(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-sky-500 mb-1">Carb (g)</label>
                  <input
                    type="number"
                    value={dishCarbs}
                    onChange={(e) => setDishCarbs(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-amber-500 mb-1">Grasa (g)</label>
                  <input
                    type="number"
                    value={dishFat}
                    onChange={(e) => setDishFat(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ingredientes
                </label>
                <input
                  type="text"
                  value={dishIngredientsText}
                  onChange={(e) => setDishIngredientsText(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl p-2.5"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewDishModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-lime-400 hover:bg-lime-300 rounded-xl transition-colors cursor-pointer"
                >
                  Guardar Platillo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
