import React, { useState } from 'react';
import { User, X, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';
import { calculateBMR, getNeatMultiplier } from '../utils/calorieEngine';

interface UserProfileModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (profile: UserProfile) => void;
  onLoadDemoPlan?: () => void;
  onResetAllData?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSaveProfile,
  onLoadDemoPlan,
  onResetAllData,
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);

  if (!isOpen) return null;

  const currentBmr = calculateBMR(formData);
  const baselineTdee = Math.round(currentBmr * getNeatMultiplier(formData.activityLevel));

  const handleAutoCalculateMacros = () => {
    const proteinG = Math.round(formData.weightKg * 2.0);
    const fatG = Math.round(formData.weightKg * 0.9);
    const proteinCals = proteinG * 4;
    const fatCals = fatG * 9;
    const remainingCals = Math.max(0, formData.dailyCalorieTarget - proteinCals - fatCals);
    const carbsG = Math.round(remainingCals / 4);

    setFormData(prev => ({
      ...prev,
      proteinTargetG: proteinG,
      fatTargetG: fatG,
      carbsTargetG: carbsG
    }));
  };

  const handleGoalSelect = (goal: UserProfile['goal']) => {
    let target = baselineTdee;
    if (goal === 'fat_loss') target = baselineTdee - 450;
    if (goal === 'muscle_gain') target = baselineTdee + 300;

    setFormData(prev => ({
      ...prev,
      goal,
      dailyCalorieTarget: target
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#12131A] border border-slate-200 dark:border-white/10 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl my-8 transition-colors">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-lime-500" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Perfil Atlético & Metas</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Sexo</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl p-2.5 cursor-pointer"
              >
                <option value="male">Hombre</option>
                <option value="female">Mujer</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Edad</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl p-2.5 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                value={formData.weightKg}
                onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl p-2.5 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Estatura (cm)</label>
              <input
                type="number"
                value={formData.heightCm}
                onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl p-2.5 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Actividad Base (NEAT)</label>
              <select
                value={formData.activityLevel}
                onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value as any })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl p-2.5 cursor-pointer"
              >
                <option value="sedentary">Sedentario (Escritorio)</option>
                <option value="light">Ligero (1-3k pasos)</option>
                <option value="moderate">Moderado (5-8k pasos)</option>
                <option value="very_active">Muy activo (De pie)</option>
              </select>
            </div>
          </div>

          {/* BMR Info Banner */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-slate-500">BMR (Mifflin-St Jeor): </span>
              <span className="text-slate-900 dark:text-white font-bold">{currentBmr} kcal</span>
            </div>
            <div>
              <span className="text-slate-500">Basal + NEAT: </span>
              <span className="text-lime-600 dark:text-lime-400 font-bold">{baselineTdee} kcal</span>
            </div>
          </div>

          {/* Goal Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Objetivo Físico
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: 'fat_loss', label: '🔥 Déficit (Grasa)' },
                { id: 'maintenance', label: '⚖️ Mantener' },
                { id: 'muscle_gain', label: '💪 Ganancia' },
              ].map(g => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleGoalSelect(g.id as any)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    formData.goal === g.id
                      ? 'bg-lime-400/20 border-lime-500 text-slate-950 dark:text-lime-400 font-bold'
                      : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Targets & Macros */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900 dark:text-white">
                Metas Diarias de Macros
              </label>
              <button
                type="button"
                onClick={handleAutoCalculateMacros}
                className="text-[11px] text-lime-600 dark:text-lime-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-calcular (2g prot/kg)</span>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">Calorías</label>
                <input
                  type="number"
                  value={formData.dailyCalorieTarget}
                  onChange={(e) => setFormData({ ...formData, dailyCalorieTarget: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl p-2 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-orange-500 font-bold mb-0.5">Proteína (g)</label>
                <input
                  type="number"
                  value={formData.proteinTargetG}
                  onChange={(e) => setFormData({ ...formData, proteinTargetG: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl p-2 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-sky-500 font-bold mb-0.5">Carbos (g)</label>
                <input
                  type="number"
                  value={formData.carbsTargetG}
                  onChange={(e) => setFormData({ ...formData, carbsTargetG: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl p-2 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-amber-500 font-bold mb-0.5">Grasas (g)</label>
                <input
                  type="number"
                  value={formData.fatTargetG}
                  onChange={(e) => setFormData({ ...formData, fatTargetG: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl p-2 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Grocery Budget & Preference */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Presupuesto Súper Semanal ($ MXN)
              </label>
              <input
                type="number"
                value={formData.weeklyBudgetMxn}
                onChange={(e) => setFormData({ ...formData, weeklyBudgetMxn: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl p-2.5 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Preferencia de Tiendas
              </label>
              <select
                value={formData.preferredStore}
                onChange={(e) => setFormData({ ...formData, preferredStore: e.target.value as any })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl p-2.5 cursor-pointer"
              >
                <option value="all">Costco + H-E-B (Recomendado)</option>
                <option value="costco">Solo Costco (Mayoreo)</option>
                <option value="heb">Solo H-E-B (Frescos)</option>
              </select>
            </div>
          </div>

          {/* Reset Actions */}
          {onResetAllData && (
            <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">¿Deseas empezar completamente desde cero?</span>
              <button
                type="button"
                onClick={() => { onResetAllData(); onClose(); }}
                className="text-xs text-[#FF453A] hover:underline font-bold cursor-pointer"
              >
                🗑️ Restablecer todo a 0
              </button>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-slate-950 bg-lime-400 hover:bg-lime-300 rounded-xl transition-colors cursor-pointer"
            >
              Guardar Cambios
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
