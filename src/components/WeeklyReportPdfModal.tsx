import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Copy, 
  Check, 
  X, 
  Share2, 
  Flame, 
  Zap, 
  ShoppingCart, 
  Calendar,
  Watch,
  DollarSign,
  TrendingDown
} from 'lucide-react';
import { UserProfile, WorkoutRecord, MealPlanEntry } from '../types';
import { OptimizationResult } from '../utils/groceryOptimizer';

interface WeeklyReportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  allWorkouts: WorkoutRecord[];
  allMeals: MealPlanEntry[];
  currentDate: string;
  optimizationResult: any; // OptimizationResult
}

export const WeeklyReportPdfModal: React.FC<WeeklyReportPdfModalProps> = ({
  isOpen,
  onClose,
  profile,
  allWorkouts,
  allMeals,
  currentDate,
  optimizationResult
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Calculate 7-day period around currentDate
  const [yr, mo, dy] = currentDate.split('-').map(Number);
  const curr = new Date(yr, mo - 1, dy);
  
  // Get last 7 days
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(curr);
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const weekWorkouts = allWorkouts.filter(w => past7Days.includes(w.date));
  const weekMeals = allMeals.filter(m => past7Days.includes(m.date));

  // Metabolic calculations for the week
  const bmrDaily = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + (profile.gender === 'male' ? 5 : -161);
  const neatMultiplier = profile.activityLevel === 'sedentary' ? 1.2 : profile.activityLevel === 'light' ? 1.375 : profile.activityLevel === 'moderate' ? 1.55 : 1.725;
  const neatDaily = Math.round(bmrDaily * (neatMultiplier - 1));
  
  const totalWorkoutBurnedKcal = weekWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
  const totalTdeeWeekKcal = Math.round((bmrDaily + neatDaily) * 7 + totalWorkoutBurnedKcal);

  const totalCaloriesConsumed = weekMeals.reduce((sum, m) => sum + (m.dish.calories * (m.servings || 1)), 0);
  // If user only logged some days, extrapolate realistic baseline
  const estimatedConsumedWeek = totalCaloriesConsumed > 0 ? totalCaloriesConsumed : Math.round(profile.dailyCalorieTarget * 7);
  
  const netCaloricBalance = estimatedConsumedWeek - totalTdeeWeekKcal;
  const estimatedFatLossGrams = netCaloricBalance < 0 ? Math.round(Math.abs(netCaloricBalance) / 7.7) : 0;

  const totalWorkoutMinutes = weekWorkouts.reduce((sum, w) => sum + w.durationMinutes, 0);
  const totalWorkoutKm = weekWorkouts.reduce((sum, w) => sum + (w.distanceKm || 0), 0);

  // Group workouts by device
  const deviceCounts: Record<string, number> = {};
  weekWorkouts.forEach(w => {
    deviceCounts[w.deviceSource] = (deviceCounts[w.deviceSource] || 0) + 1;
  });

  const costcoItems = optimizationResult?.costcoItems || [];
  const hebItems = optimizationResult?.hebItems || [];
  const totalCostcoMxn = optimizationResult?.costcoSubtotalMxn || 0;
  const totalHebMxn = optimizationResult?.hebSubtotalMxn || 0;
  const totalSavingsMxn = optimizationResult?.totalEstimatedSavingsMxn || 0;

  // Format text for Apple Notes
  const generateAppleNotesText = () => {
    return `📋 REPORTE SEMANAL HABITHUB
Semana del ${past7Days[0]} al ${past7Days[6]}
Atleta: ${profile.name} (${profile.weightKg}kg · ${profile.goal === 'fat_loss' ? 'Déficit / Quema de Grasa' : 'Hipertrofia'})

⚡ BALANCE METABÓLICO SEMANAL
• Gasto Total (TDEE): ${totalTdeeWeekKcal.toLocaleString()} kcal
• Ingesta Estimada: ${estimatedConsumedWeek.toLocaleString()} kcal
• Balance Neto: ${netCaloricBalance > 0 ? `+${netCaloricBalance}` : netCaloricBalance} kcal (${netCaloricBalance < 0 ? `Déficit de ~${estimatedFatLossGrams}g grasa oxidada` : 'Superávit anabólico'})
• Meta Diaria: ${profile.dailyCalorieTarget} kcal · ${profile.proteinTargetG}g Proteína

🏃 ENTRENAMIENTOS (${weekWorkouts.length} sesiones)
• Tiempo Total Activo: ${Math.floor(totalWorkoutMinutes / 60)}h ${totalWorkoutMinutes % 60}m
• Distancia Acumulada: ${totalWorkoutKm.toFixed(1)} km
• Calorías de Ejercicio: ${totalWorkoutBurnedKcal.toLocaleString()} kcal
• Dispositivos: ${Object.entries(deviceCounts).map(([dev, count]) => `${dev} (${count})`).join(', ')}

🛒 LISTA DE SÚPER OPTIMIZADA
COSTCO MÉXICO (Subtotal: $${totalCostcoMxn.toFixed(2)} MXN):
${costcoItems.map((item: any) => `- [ ] ${item.name} (${item.packageDescription}) - $${item.estimatedPriceMxn} MXN`).join('\n') || '- [ ] Pechuga Kirkland 2.5kg - $279 MXN\n- [ ] Claras San Juan 4kg - $198 MXN\n- [ ] Avena Quaker 1.8kg - $89 MXN'}

H-E-B MÉXICO (Subtotal: $${totalHebMxn.toFixed(2)} MXN):
${hebItems.map((item: any) => `- [ ] ${item.name} (${item.packageDescription}) - $${item.estimatedPriceMxn} MXN`).join('\n') || '- [ ] Espinacas frescas 500g - $34 MXN\n- [ ] Aguacate Hass 1kg - $54 MXN\n- [ ] Arroz jazmín 1kg - $42 MXN'}

💰 AHORRO TOTAL ESTIMADO: $${totalSavingsMxn.toFixed(2)} MXN
— Generado con Habithub para iPhone`;
  };

  const handleCopyForNotes = () => {
    const text = generateAppleNotesText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.1] rounded-[28px] max-w-2xl w-full p-5 sm:p-7 shadow-2xl space-y-5 my-auto transition-colors">
        
        {/* Top Header & Actions */}
        <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#007AFF]/15 dark:bg-[#007AFF]/25 flex items-center justify-center text-[#007AFF]">
              <FileText className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-[#1C1C1E] dark:text-[#F5F5F7] tracking-tight">
                Reporte Semanal de Rendimiento & Despensa
              </h3>
              <p className="text-[11px] text-[#8E8E93]">
                {past7Days[0]} al {past7Days[6]} · Listo para PDF o Notas de iPhone
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-full bg-[#F2F2F7] hover:bg-[#E5E5EA] dark:bg-[#2C2C2E] dark:hover:bg-[#3A3A3C] text-[#1C1C1E] dark:text-[#F5F5F7] transition-colors cursor-pointer"
              title="Imprimir o Guardar como PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F2F2F7] hover:bg-[#E5E5EA] dark:bg-[#2C2C2E] dark:hover:bg-[#3A3A3C] flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet Preview */}
        <div id="printable-weekly-report" className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          
          {/* Header Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#F2F2F7] to-[#E5E5EA] dark:from-[#2C2C2E] dark:to-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  Habithub Health Summary
                </span>
                <h4 className="text-[18px] font-extrabold text-[#1C1C1E] dark:text-[#F5F5F7] tracking-tight">
                  {profile.name}
                </h4>
                <p className="text-[11px] text-[#8E8E93]">
                  {profile.weightKg} kg · {profile.heightCm} cm · Objetivo: {profile.goal === 'fat_loss' ? 'Déficit Calórico' : 'Hipertrofia'}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-[#8E8E93] block">
                  Balance Semanal
                </span>
                <span className={`text-[20px] font-extrabold font-mono tabular-nums ${
                  netCaloricBalance <= 0 ? 'text-white' : 'text-amber-500'
                }`}>
                  {netCaloricBalance <= 0 ? `${netCaloricBalance}` : `+${netCaloricBalance}`} kcal
                </span>
                {netCaloricBalance < 0 && (
                  <span className="text-[10px] font-bold text-white block">
                    ~{estimatedFatLossGrams}g grasa oxidada
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Metric Triplet: TDEE, Workouts, Groceries */}
          <div className="grid grid-cols-3 gap-2.5">
            
            <div className="p-3 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-black/[0.04] dark:border-white/[0.06]">
              <span className="text-[10px] font-bold uppercase text-[#FA114F] block">Gasto Total</span>
              <div className="text-[16px] font-extrabold font-mono text-[#1C1C1E] dark:text-white mt-0.5">
                {totalTdeeWeekKcal.toLocaleString()}
                <span className="text-[10px] font-normal text-[#8E8E93] ml-0.5">kcal</span>
              </div>
              <span className="text-[10px] text-[#8E8E93] block mt-0.5">
                BMR + NEAT + Deporte
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-black/[0.04] dark:border-white/[0.06]">
              <span className="text-[10px] font-bold uppercase text-slate-300 block">Entrenos</span>
              <div className="text-[16px] font-extrabold font-mono text-[#1C1C1E] dark:text-white mt-0.5">
                {Math.floor(totalWorkoutMinutes / 60)}h {totalWorkoutMinutes % 60}m
              </div>
              <span className="text-[10px] text-[#8E8E93] block mt-0.5">
                {weekWorkouts.length} sesiones ({totalWorkoutKm.toFixed(1)} km)
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-black/[0.04] dark:border-white/[0.06]">
              <span className="text-[10px] font-bold uppercase text-[#00F0FF] block">Ahorro Súper</span>
              <div className="text-[16px] font-extrabold font-mono text-[#1C1C1E] dark:text-white mt-0.5">
                ${totalSavingsMxn.toFixed(0)}
                <span className="text-[10px] font-normal text-[#8E8E93] ml-0.5">MXN</span>
              </div>
              <span className="text-[10px] text-[#8E8E93] block mt-0.5">
                Costco vs H-E-B Split
              </span>
            </div>

          </div>

          {/* Section: Workouts Breakdown */}
          <div className="space-y-2">
            <h5 className="text-[13px] font-bold text-[#1C1C1E] dark:text-[#F5F5F7] flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-slate-300" />
              <span>Entrenamientos de la Semana (Coros, Polar, Apple)</span>
            </h5>

            <div className="space-y-1.5">
              {weekWorkouts.length > 0 ? (
                weekWorkouts.map(w => (
                  <div
                    key={w.id}
                    className="p-2.5 bg-[#F2F2F7] dark:bg-[#2C2C2E]/40 rounded-xl flex items-center justify-between text-xs border border-black/[0.02] dark:border-white/[0.04]"
                  >
                    <div>
                      <span className="font-bold text-[#1C1C1E] dark:text-white block">{w.title}</span>
                      <span className="text-[10px] text-[#8E8E93]">
                        {w.date} · {w.deviceSource.toUpperCase()} · {w.durationMinutes} min
                        {w.avgHeartRate ? ` · ${w.avgHeartRate} bpm avg` : ''}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-[#FA114F] text-[13px]">
                      {w.caloriesBurned} kcal
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#8E8E93] p-2">Sin entrenamientos registrados en estos 7 días.</p>
              )}
            </div>
          </div>

          {/* Section: Optimized Grocery Shopping List */}
          <div className="space-y-2">
            <h5 className="text-[13px] font-bold text-[#1C1C1E] dark:text-[#F5F5F7] flex items-center gap-1.5">
              <ShoppingCart className="w-4 h-4 text-[#007AFF]" />
              <span>Lista de Compras Optimizada (Costco + H-E-B)</span>
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              
              {/* Costco */}
              <div className="p-3 bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 rounded-2xl space-y-1">
                <div className="flex items-center justify-between font-bold text-[#007AFF]">
                  <span>Costco México (Granel)</span>
                  <span className="font-mono">${totalCostcoMxn.toFixed(2)} MXN</span>
                </div>
                <div className="text-[11px] text-[#8E8E93] space-y-1 pt-1">
                  {costcoItems.slice(0, 4).map((item: any) => (
                    <div key={item.id} className="flex justify-between">
                      <span className="truncate pr-1">• {item.name}</span>
                      <span className="font-mono font-semibold shrink-0">${item.estimatedPriceMxn}</span>
                    </div>
                  ))}
                  {costcoItems.length === 0 && (
                    <p>• Pechuga Kirkland 2.5kg, Claras San Juan 4kg, Avena Quaker 1.8kg</p>
                  )}
                </div>
              </div>

              {/* HEB */}
              <div className="p-3 bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 rounded-2xl space-y-1">
                <div className="flex items-center justify-between font-bold text-[#FA114F]">
                  <span>H-E-B México (Frescos)</span>
                  <span className="font-mono">${totalHebMxn.toFixed(2)} MXN</span>
                </div>
                <div className="text-[11px] text-[#8E8E93] space-y-1 pt-1">
                  {hebItems.slice(0, 4).map((item: any) => (
                    <div key={item.id} className="flex justify-between">
                      <span className="truncate pr-1">• {item.name}</span>
                      <span className="font-mono font-semibold shrink-0">${item.estimatedPriceMxn}</span>
                    </div>
                  ))}
                  {hebItems.length === 0 && (
                    <p>• Espinacas frescas, Aguacate Hass, Arroz jazmín, Verduras</p>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Export CTAs */}
        <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.08] flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={handleCopyForNotes}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-[#1C1C1E] dark:text-[#F5F5F7] bg-[#F2F2F7] hover:bg-[#E5E5EA] dark:bg-[#2C2C2E] dark:hover:bg-[#3A3A3C] border border-black/[0.06] dark:border-white/[0.08] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span className="text-white font-bold">¡Copiado para Notas de iPhone!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar para Notas de iPhone</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold text-black bg-[#CCFF00] hover:bg-[#bbf000] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Guardar en PDF</span>
          </button>
        </div>

      </div>
    </div>
  );
};
