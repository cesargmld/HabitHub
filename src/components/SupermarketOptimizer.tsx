import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Sparkles, 
  Search, 
  TrendingDown, 
  CheckCircle2,
  ScanLine,
  Calendar,
  Layers,
  Clock,
  AlertTriangle,
  Package,
  Store,
  DollarSign
} from 'lucide-react';
import { SUPERMARKET_CATALOG } from '../data/supermarketCatalog';
import { OptimizationResult } from '../utils/groceryOptimizer';
import { findVerifiedStaple } from '../utils/pricingEngine';
import confetti from 'canvas-confetti';

interface SupermarketOptimizerProps {
  optimizationResult: OptimizationResult;
  selectedDays: string[];
  onChangeSelectedDays: (days: string[]) => void;
  timeframeMultiplier: number;
  onChangeTimeframeMultiplier: (multiplier: number) => void;
  onToggleItemCheck: (itemId: string) => void;
  onOptimizeWithAi: () => void;
  isAiLoading: boolean;
  onOpenBarcodeScanner?: () => void;
}

const ALL_DAYS_LIST = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const SupermarketOptimizer: React.FC<SupermarketOptimizerProps> = ({
  optimizationResult,
  selectedDays,
  onChangeSelectedDays,
  timeframeMultiplier,
  onChangeTimeframeMultiplier,
  onToggleItemCheck,
  onOptimizeWithAi,
  isAiLoading,
  onOpenBarcodeScanner
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'optimized_list' | 'perishable_split' | 'price_catalog'>('optimized_list');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [localCheckedMap, setLocalCheckedMap] = useState<Record<string, boolean>>({});

  const {
    costcoItems,
    hebItems,
    allGroceryItems,
    perishableItems,
    bulkPantryItems,
    totalCostMxn,
    costcoSubtotalMxn,
    hebSubtotalMxn,
    estimatedSavingsMxn,
    savingsPercentage,
    totalProteinGramsInCart,
    costPerGramProteinMxn,
    totalMealsCookedCount
  } = optimizationResult;

  const toggleCheck = (id: string) => {
    setLocalCheckedMap(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    onToggleItemCheck(id);
  };

  const checkedCount = allGroceryItems.filter(item => localCheckedMap[item.id]).length;
  const isAllChecked = allGroceryItems.length > 0 && checkedCount === allGroceryItems.length;

  const handleCelebrateCompletion = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleToggleDay = (dayName: string) => {
    if (selectedDays.includes(dayName)) {
      if (selectedDays.length === 1) return; // Keep at least one
      onChangeSelectedDays(selectedDays.filter(d => d !== dayName));
    } else {
      onChangeSelectedDays([...selectedDays, dayName]);
    }
  };

  const handleSelectPresetDays = (preset: 'all' | 'workdays' | 'weekend') => {
    if (preset === 'all') onChangeSelectedDays(ALL_DAYS_LIST);
    if (preset === 'workdays') onChangeSelectedDays(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']);
    if (preset === 'weekend') onChangeSelectedDays(['Sábado', 'Domingo']);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-sky-500" />
            <span>Despensa Inteligente (Costco vs. H-E-B)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Canasta de compra traducida exclusivamente de las comidas de tu plan, dividida por tiendas y frescura.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenBarcodeScanner && (
            <button
              onClick={onOpenBarcodeScanner}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-black bg-[#CCFF00] hover:bg-[#bbf000] text-black rounded-xl shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              <ScanLine className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Escáner / Comparador de Precios</span>
            </button>
          )}

          {/* Subtab navigation */}
          <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#12131A] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm self-start sm:self-auto">
            <button
              onClick={() => setActiveSubTab('optimized_list')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeSubTab === 'optimized_list' ? 'bg-lime-400 text-slate-950 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Lista por Tienda
            </button>
            <button
              onClick={() => setActiveSubTab('perishable_split')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeSubTab === 'perishable_split' ? 'bg-lime-400 text-slate-950 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Perecederos vs Granel
            </button>
            <button
              onClick={() => setActiveSubTab('price_catalog')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeSubTab === 'price_catalog' ? 'bg-lime-400 text-slate-950 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Catálogo de Precios
            </button>
          </div>
        </div>
      </div>

      {/* Control Panel: Cooking Days Selector & Timeframe Multiplier */}
      <div className="bg-white dark:bg-[#12131A] border border-slate-200/80 dark:border-white/5 rounded-2xl p-4 shadow-sm space-y-4">
        
        {/* Row 1: Timeframe Multiplier */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-lime-500" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Periodo de Compra:
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {[
              { mult: 1, label: '1 Semana (x1)', desc: 'Consumo Semanal' },
              { mult: 2, label: '1 Quincena (x2)', desc: 'Consumo Quincenal' },
              { mult: 4, label: '1 Mes (x4)', desc: 'Consumo Mensual' }
            ].map(t => (
              <button
                key={t.mult}
                onClick={() => onChangeTimeframeMultiplier(t.mult)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  timeframeMultiplier === t.mult
                    ? 'bg-[#CCFF00] text-black shadow-sm'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Cooking Days Selector */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Días de Comida a Calcular en el Súper:
              </span>
              <span className="text-[11px] text-slate-400">
                ({selectedDays.length} días · {totalMealsCookedCount} comidas calculadas)
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handleSelectPresetDays('all')}
                className="px-2 py-1 text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Toda la semana
              </button>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <button
                onClick={() => handleSelectPresetDays('workdays')}
                className="px-2 py-1 text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                L - V
              </button>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <button
                onClick={() => handleSelectPresetDays('weekend')}
                className="px-2 py-1 text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                S - D
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
            {ALL_DAYS_LIST.map(day => {
              const isChecked = selectedDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleToggleDay(day)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-transparent shadow-sm'
                      : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500 hover:border-slate-400'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Savings & Total Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Grand Total */}
        <div className="bg-white dark:bg-[#12131A] border border-slate-200/80 dark:border-white/5 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">
            Gran Total {timeframeMultiplier === 1 ? 'Semanal' : timeframeMultiplier === 2 ? 'Quincenal' : 'Mensual'}
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
              ${totalCostMxn.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 font-medium">MXN</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
            Costco (${costcoSubtotalMxn}) + H-E-B (${hebSubtotalMxn})
          </p>
        </div>

        {/* Estimated Savings */}
        <div className="bg-lime-50 dark:bg-lime-950/20 border border-lime-500/30 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] sm:text-xs text-lime-700 dark:text-lime-300 uppercase font-bold flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Ahorro Estimado</span>
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-extrabold text-lime-600 dark:text-lime-400 font-mono tabular-nums">
              -${estimatedSavingsMxn.toFixed(2)}
            </span>
            <span className="text-xs text-lime-700 dark:text-lime-300 font-bold">({savingsPercentage}%)</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-lime-800/80 dark:text-lime-300/80 mt-0.5 truncate">
            Vs. comprar todo al menudeo
          </p>
        </div>

        {/* Total Protein In Basket */}
        <div className="bg-white dark:bg-[#12131A] border border-slate-200/80 dark:border-white/5 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] sm:text-xs text-orange-500 uppercase font-bold">Proteína en Canasta</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
              {totalProteinGramsInCart}g
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
            Costo: <span className="font-mono text-orange-500 font-bold">${costPerGramProteinMxn} MXN</span>/g
          </p>
        </div>

        {/* Checklist Progress */}
        <div className="bg-white dark:bg-[#12131A] border border-slate-200/80 dark:border-white/5 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500 dark:text-slate-400 uppercase font-bold">Comprado en Súper</span>
              <span className="font-mono tabular-nums text-slate-900 dark:text-white font-bold">{checkedCount}/{allGroceryItems.length}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5">
              <div 
                className="bg-lime-500 h-full transition-all duration-300"
                style={{ width: `${allGroceryItems.length > 0 ? (checkedCount / allGroceryItems.length) * 100 : 0}%` }}
              />
            </div>
          </div>
          
          {isAllChecked && (
            <button
              onClick={handleCelebrateCompletion}
              className="mt-2 text-[11px] font-bold text-lime-600 dark:text-lime-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>¡Canasta completa! Celebrar 🎉</span>
            </button>
          )}
        </div>

      </div>

      {/* SUBTAB 1: OPTIMIZED STORE LIST (COSTCO VS HEB) */}
      {activeSubTab === 'optimized_list' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* COSTCO COLUMN */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-600" />
                <h3 className="font-bold text-slate-900 dark:text-white">Costco México (Mayoreo y Despensa)</h3>
              </div>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                Subtotal: ${costcoSubtotalMxn.toFixed(2)} MXN
              </span>
            </div>

            {costcoItems.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 dark:border-white/5 rounded-2xl text-xs text-slate-400">
                No hay compras de mayoreo para los días seleccionados.
              </div>
            ) : (
              <div className="space-y-2.5">
                {costcoItems.map(item => {
                  const isChecked = Boolean(localCheckedMap[item.id]);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleCheck(item.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isChecked
                          ? 'bg-slate-50 dark:bg-white/5 border-transparent opacity-60'
                          : 'bg-white dark:bg-[#12131A] border-slate-200/80 dark:border-white/5 hover:border-lime-500/40 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-1 w-4 h-4 rounded text-lime-500 focus:ring-lime-400 cursor-pointer"
                        />
                        <div className="min-w-0">
                          <h4 className={`text-sm font-bold text-slate-900 dark:text-white truncate ${isChecked ? 'line-through text-slate-400' : ''}`}>
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {item.packageDescription}
                          </p>
                          <p className="text-[10px] text-lime-600 dark:text-lime-400 font-medium mt-1">
                            {item.reason}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono text-sm font-extrabold text-slate-900 dark:text-white">
                          ${item.estimatedPriceMxn.toFixed(2)}
                        </span>
                        {item.savingsMxn && (
                          <div className="text-[10px] text-lime-600 dark:text-lime-400 font-mono font-bold">
                            Ahorras: -${item.savingsMxn.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* H-E-B COLUMN */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <h3 className="font-bold text-slate-900 dark:text-white">H-E-B México (Frescos y Vegetales)</h3>
              </div>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                Subtotal: ${hebSubtotalMxn.toFixed(2)} MXN
              </span>
            </div>

            {hebItems.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 dark:border-white/5 rounded-2xl text-xs text-slate-400">
                No hay productos frescos para los días seleccionados.
              </div>
            ) : (
              <div className="space-y-2.5">
                {hebItems.map(item => {
                  const isChecked = Boolean(localCheckedMap[item.id]);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleCheck(item.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isChecked
                          ? 'bg-slate-50 dark:bg-white/5 border-transparent opacity-60'
                          : 'bg-white dark:bg-[#12131A] border-slate-200/80 dark:border-white/5 hover:border-lime-500/40 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-1 w-4 h-4 rounded text-lime-500 focus:ring-lime-400 cursor-pointer"
                        />
                        <div className="min-w-0">
                          <h4 className={`text-sm font-bold text-slate-900 dark:text-white truncate ${isChecked ? 'line-through text-slate-400' : ''}`}>
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {item.packageDescription}
                          </p>
                          <p className="text-[10px] text-sky-600 dark:text-sky-400 font-medium mt-1">
                            {item.reason}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono text-sm font-extrabold text-slate-900 dark:text-white">
                          ${item.estimatedPriceMxn.toFixed(2)}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Frescura semanal
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* SUBTAB 2: PERISHABLES VS BULK PANTRY SPLIT */}
      {activeSubTab === 'perishable_split' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* PERISHABLE SECTION */}
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-500/30 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>🥬 Perecederos (Comprar por Semana / Quincena en H-E-B)</span>
              </div>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                Vida útil de 4 a 7 días. Compra únicamente lo necesario para los días seleccionados para evitar que se echen a perder en tu refrigerador.
              </p>
            </div>

            <div className="space-y-2">
              {perishableItems.map(item => (
                <div 
                  key={item.id}
                  className="p-3 bg-white dark:bg-[#12131A] border border-slate-200 dark:border-white/5 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{item.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {item.neededWeightG}g requeridos · Caducidad estimada: ~{item.shelfLifeDays || 6} días
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      ${item.estimatedPriceMxn.toFixed(2)} MXN
                    </span>
                    <span className="block text-[10px] text-rose-500 font-medium">H-E-B Frescos</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BULK PANTRY SECTION */}
          <div className="space-y-4">
            <div className="p-3 bg-sky-50 dark:bg-sky-950/20 border border-sky-500/30 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700 dark:text-sky-300">
                <Package className="w-4 h-4 text-sky-500" />
                <span>📦 No Perecederos / Mayoreo (Comprar por Mes en Costco)</span>
              </div>
              <p className="text-[11px] text-sky-800/80 dark:text-sky-300/80">
                Alimentos no perecederos o empaques individuales al vacío congelados. Compra a granel mensualmente para el menor costo por kilo de México.
              </p>
            </div>

            <div className="space-y-2">
              {bulkPantryItems.map(item => (
                <div 
                  key={item.id}
                  className="p-3 bg-white dark:bg-[#12131A] border border-slate-200 dark:border-white/5 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{item.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {item.packageDescription} · Vida útil: meses
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      ${item.estimatedPriceMxn.toFixed(2)} MXN
                    </span>
                    <span className="block text-[10px] text-lime-500 font-medium">Costco Mayoreo</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SUBTAB 3: PRICE CATALOG (DIRECT CONSEQUENCE OF SHOPPING LIST) */}
      {activeSubTab === 'price_catalog' && (
        <div className="space-y-6">
          
          <div className="p-4 bg-white dark:bg-[#12131A] border border-slate-200 dark:border-white/5 rounded-2xl space-y-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Store className="w-4 h-4 text-lime-500" />
                <span>Comparativa de Precios Real: Canasta Activa vs. Supermercados en México</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Esta comparativa se deriva directamente de los ingredientes de las comidas que tienes activas esta semana.
              </p>
            </div>

            <div className="space-y-3 divide-y divide-slate-100 dark:divide-white/5">
              {allGroceryItems.map(item => {
                const staple = findVerifiedStaple(item.name);
                return (
                  <div key={item.id} className="pt-3 first:pt-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</h4>
                        <span className="text-[11px] text-slate-400 font-mono">Consumo calculado: {item.neededWeightG}g</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
                        item.recommendedStore === 'costco'
                          ? 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-300'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300'
                      }`}>
                        Tienda Ganadora: {item.recommendedStore.toUpperCase()}
                      </span>
                    </div>

                    {staple ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        {/* Costco */}
                        <div className={`p-2.5 rounded-xl border ${
                          item.recommendedStore === 'costco'
                            ? 'bg-lime-50/50 dark:bg-lime-950/20 border-lime-500/40'
                            : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5'
                        }`}>
                          <div className="flex justify-between font-bold">
                            <span className="text-red-600">Costco México</span>
                            {item.recommendedStore === 'costco' && <span className="text-lime-500">★ Mejor Opción</span>}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{staple.stores.costco?.packageName || 'Mayoreo disponible'}</p>
                          <div className="mt-1 font-mono">
                            <span className="font-extrabold text-slate-900 dark:text-white">${staple.stores.costco?.priceMxn || item.estimatedPriceMxn} MXN</span>
                            <span className="text-slate-400 text-[10px]"> (${staple.stores.costco?.unitPricePerKgMxn || (item.costPer100gMxn * 10)}/kg)</span>
                          </div>
                        </div>

                        {/* H-E-B */}
                        <div className={`p-2.5 rounded-xl border ${
                          item.recommendedStore === 'heb'
                            ? 'bg-lime-50/50 dark:bg-lime-950/20 border-lime-500/40'
                            : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5'
                        }`}>
                          <div className="flex justify-between font-bold">
                            <span className="text-rose-500">H-E-B México</span>
                            {item.recommendedStore === 'heb' && <span className="text-lime-500">★ Mejor Frescura</span>}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{staple.stores.heb?.packageName || 'Porción seleccionada'}</p>
                          <div className="mt-1 font-mono">
                            <span className="font-extrabold text-slate-900 dark:text-white">${staple.stores.heb?.priceMxn || item.alternativePriceMxn} MXN</span>
                            <span className="text-slate-400 text-[10px]"> (${staple.stores.heb?.unitPricePerKgMxn || 165}/kg)</span>
                          </div>
                        </div>

                        {/* Walmart */}
                        <div className="p-2.5 rounded-xl border bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5">
                          <span className="font-bold text-sky-600">Walmart México</span>
                          <p className="text-[11px] text-slate-500 mt-0.5">{staple.stores.walmart?.packageName || 'Presentación retail'}</p>
                          <div className="mt-1 font-mono">
                            <span className="font-extrabold text-slate-900 dark:text-white">${staple.stores.walmart?.priceMxn || Math.round(item.estimatedPriceMxn * 1.15)} MXN</span>
                            <span className="text-slate-400 text-[10px]"> (${staple.stores.walmart?.unitPricePerKgMxn || 160}/kg)</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">
                        {item.reason} · Precio estimado: ${item.estimatedPriceMxn.toFixed(2)} MXN
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
