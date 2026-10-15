import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Sparkles, 
  Search, 
  TrendingDown, 
  CheckCircle2,
  ScanLine
} from 'lucide-react';
import { SUPERMARKET_CATALOG } from '../data/supermarketCatalog';
import { OptimizationResult } from '../utils/groceryOptimizer';
import confetti from 'canvas-confetti';

interface SupermarketOptimizerProps {
  optimizationResult: OptimizationResult;
  onToggleItemCheck: (itemId: string) => void;
  onOptimizeWithAi: () => void;
  isAiLoading: boolean;
  onOpenBarcodeScanner?: () => void;
}

export const SupermarketOptimizer: React.FC<SupermarketOptimizerProps> = ({
  optimizationResult,
  onToggleItemCheck,
  onOptimizeWithAi,
  isAiLoading,
  onOpenBarcodeScanner
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'optimized_list' | 'price_catalog' | 'saving_guide'>('optimized_list');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState<string>('all');
  const [selectedStoreFilter, setSelectedStoreFilter] = useState<'all' | 'costco' | 'heb'>('all');
  const [localCheckedMap, setLocalCheckedMap] = useState<Record<string, boolean>>({});

  const {
    costcoItems,
    hebItems,
    allGroceryItems,
    totalCostMxn,
    costcoSubtotalMxn,
    hebSubtotalMxn,
    estimatedSavingsMxn,
    savingsPercentage,
    totalProteinGramsInCart,
    costPerGramProteinMxn
  } = optimizationResult;

  const toggleCheck = (id: string) => {
    setLocalCheckedMap(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
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

  const filteredCatalog = SUPERMARKET_CATALOG.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      p.notes?.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchesCat = catalogCategoryFilter === 'all' || p.category === catalogCategoryFilter;
    const matchesStore = selectedStoreFilter === 'all' || p.store === selectedStoreFilter;
    return matchesSearch && matchesCat && matchesStore;
  });

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-sky-500" />
            <span>Despensa Inteligente (Costco vs. H-E-B)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Canasta dividida automáticamente para no gastar de más en el supermercado mexicano.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenBarcodeScanner && (
            <button
              onClick={onOpenBarcodeScanner}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-[#A1FF00] hover:bg-[#8FE000] text-black rounded-2xl shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              <ScanLine className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Escáner Súper (HEB vs Costco)</span>
            </button>
          )}

          {/* Tab switch */}
          <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#12131A] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm self-start sm:self-auto">
            <button
              onClick={() => setActiveSubTab('optimized_list')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeSubTab === 'optimized_list' ? 'bg-lime-400 text-slate-950 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Lista de Compras
            </button>
            <button
              onClick={() => setActiveSubTab('price_catalog')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeSubTab === 'price_catalog' ? 'bg-lime-400 text-slate-950 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Catálogo de Precios
            </button>
            <button
              onClick={() => setActiveSubTab('saving_guide')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeSubTab === 'saving_guide' ? 'bg-lime-400 text-slate-950 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Guía de Ahorro
            </button>
          </div>
        </div>
      </div>

      {/* SUBTAB 1: OPTIMIZED LIST */}
      {activeSubTab === 'optimized_list' && (
        <div className="space-y-6">
          
          {/* Savings Metric Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Total Cart */}
            <div className="bg-white dark:bg-[#12131A] border border-slate-200/80 dark:border-white/5 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Total Canasta</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                  ${totalCostMxn.toFixed(2)}
                </span>
                <span className="text-xs text-slate-400 font-medium">MXN</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
                Costco + H-E-B combinados
              </p>
            </div>

            {/* Direct Savings */}
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
                Vs. compra tradicional menudeo
              </p>
            </div>

            {/* Protein Density */}
            <div className="bg-white dark:bg-[#12131A] border border-slate-200/80 dark:border-white/5 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] sm:text-xs text-orange-500 uppercase font-bold">Proteína Total</span>
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
                  <span className="text-slate-500 dark:text-slate-400 uppercase font-bold">En Tienda</span>
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
                  className="mt-1 text-[11px] font-bold text-lime-600 dark:text-lime-400 flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>¡Completado! 🎉</span>
                </button>
              )}
            </div>

          </div>

          {/* AI Optimizer CTA */}
          <div className="bg-gradient-to-r from-slate-100 via-sky-50 to-slate-100 dark:from-[#12131A] dark:via-sky-950/20 dark:to-[#12131A] border border-sky-300/60 dark:border-sky-500/20 rounded-3xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-500 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Optimizar despensa con Inteligencia Artificial
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Analiza tus ingredientes y sugiere sustitutos económicos entre Costco y H-E-B.
                </p>
              </div>
            </div>

            <button
              onClick={onOptimizeWithAi}
              disabled={isAiLoading}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer disabled:opacity-50"
            >
              {isAiLoading ? 'Analizando...' : 'Analizar Despensa con IA'}
            </button>
          </div>

          {/* Side by side: Canasta Costco vs Canasta H-E-B */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* CANASTA COSTCO */}
            <div className="bg-white dark:bg-[#12131A] border border-slate-200/80 dark:border-white/5 rounded-3xl p-5 space-y-4 shadow-sm transition-colors">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">Costco México</h3>
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">Mayoreo · Volumen Kirkland · Ahorro por kg</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                    ${costcoSubtotalMxn.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {costcoItems.length} insumos
                  </span>
                </div>
              </div>

              {costcoItems.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No hay artículos asignados a Costco para esta selección.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {costcoItems.map((item) => {
                    const isChecked = !!localCheckedMap[item.id];
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleCheck(item.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                          isChecked 
                            ? 'bg-slate-50 dark:bg-slate-900/30 border-slate-200/40 dark:border-white/5 opacity-60' 
                            : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200/70 dark:border-slate-800 hover:border-lime-500/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <button
                              type="button"
                              className="mt-0.5 text-slate-400 shrink-0"
                            >
                              {isChecked ? (
                                <CheckCircle2 className="w-4 h-4 text-lime-500" />
                              ) : (
                                <div className="w-4 h-4 rounded-md border border-slate-400 dark:border-slate-600" />
                              )}
                            </button>

                            <div>
                              <h5 className={`text-xs sm:text-sm font-bold ${isChecked ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                {item.name}
                              </h5>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                Presentación: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.packageDescription}</span>
                              </p>
                              <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1">
                                💡 {item.reason}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                              ${item.estimatedPriceMxn.toFixed(2)}
                            </span>
                            <div className="text-[10px] text-slate-400 font-mono">
                              ${item.costPer100gMxn.toFixed(2)} / 100g
                            </div>
                            {item.savingsMxn && item.savingsMxn > 0 && (
                              <span className="text-[10px] text-lime-600 dark:text-lime-400 font-mono font-bold block">
                                Ahorras ~${item.savingsMxn}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* CANASTA H-E-B */}
            <div className="bg-white dark:bg-[#12131A] border border-slate-200/80 dark:border-white/5 rounded-3xl p-5 space-y-4 shadow-sm transition-colors">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">H-E-B México</h3>
                    <span className="text-[11px] text-rose-600 dark:text-rose-400 font-bold">Frescura Óptima · Porciones Exactas · Cero Merma</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                    ${hebSubtotalMxn.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {hebItems.length} insumos
                  </span>
                </div>
              </div>

              {hebItems.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No hay artículos asignados a H-E-B para esta selección.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {hebItems.map((item) => {
                    const isChecked = !!localCheckedMap[item.id];
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleCheck(item.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                          isChecked 
                            ? 'bg-slate-50 dark:bg-slate-900/30 border-slate-200/40 dark:border-white/5 opacity-60' 
                            : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200/70 dark:border-slate-800 hover:border-lime-500/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <button
                              type="button"
                              className="mt-0.5 text-slate-400 shrink-0"
                            >
                              {isChecked ? (
                                <CheckCircle2 className="w-4 h-4 text-lime-500" />
                              ) : (
                                <div className="w-4 h-4 rounded-md border border-slate-400 dark:border-slate-600" />
                              )}
                            </button>

                            <div>
                              <h5 className={`text-xs sm:text-sm font-bold ${isChecked ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                {item.name}
                              </h5>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                Presentación: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.packageDescription}</span>
                              </p>
                              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
                                🌱 {item.reason}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                              ${item.estimatedPriceMxn.toFixed(2)}
                            </span>
                            <div className="text-[10px] text-slate-400 font-mono">
                              ${item.costPer100gMxn.toFixed(2)} / 100g
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* SUBTAB 2: PRICE CATALOG */}
      {activeSubTab === 'price_catalog' && (
        <div className="bg-white dark:bg-[#12131A] border border-slate-200/80 dark:border-white/5 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Precios Reales en México</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Precios normalizados por paquete y por kilogramo en Costco vs H-E-B.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar pollo, avena, atún..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-lime-500 w-44 sm:w-60"
                />
              </div>

              <select
                value={selectedStoreFilter}
                onChange={(e) => setSelectedStoreFilter(e.target.value as any)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl p-2 cursor-pointer"
              >
                <option value="all">Todas</option>
                <option value="costco">Solo Costco</option>
                <option value="heb">Solo H-E-B</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3.5">Producto & Marca</th>
                  <th className="py-3 px-3.5">Tienda</th>
                  <th className="py-3 px-3.5">Presentación</th>
                  <th className="py-3 px-3.5 text-right">Precio Paquete</th>
                  <th className="py-3 px-3.5 text-right">Precio / Kilo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredCatalog.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{prod.name}</div>
                      <div className="text-[11px] text-slate-400">{prod.brand}</div>
                    </td>
                    <td className="py-3 px-3.5">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        prod.store === 'costco' 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' 
                          : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                      }`}>
                        {prod.store === 'costco' ? 'Costco' : 'H-E-B'}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-500 dark:text-slate-400 text-[11px]">
                      {prod.packageDescription}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      ${prod.priceMxn.toFixed(2)}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
                      ${prod.unitPricePerKgMxn.toFixed(2)}/kg
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: SAVING GUIDE */}
      {activeSubTab === 'saving_guide' && (
        <div className="bg-white dark:bg-[#12131A] border border-slate-200/80 dark:border-white/5 rounded-3xl p-6 space-y-4 shadow-sm transition-colors text-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Estrategias de Ahorro y Despensa en México
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-bold text-blue-600 dark:text-blue-400 text-sm block">1. Qué comprar en Costco México</span>
              <p className="text-slate-600 dark:text-slate-300">
                Pechuga Kirkland 2.5kg al vacío (se descongela porción a porción), claras San Juan pack x4 botes ($198 MXN), avena integral de 4.5kg y frutos rojos congelados. Ahorro de más del 25% garantizado.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-bold text-rose-600 dark:text-rose-400 text-sm block">2. Qué comprar en H-E-B México</span>
              <p className="text-slate-600 dark:text-slate-300">
                Aguacate Hass en malla de 1kg (para que no se maduren todos juntos), espinaca hidropónica fresca, tortillas calientes de maíz nixtamalizado y verduras frescas al peso según tu semana.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
