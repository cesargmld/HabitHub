import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Calendar, 
  Sparkles, 
  Check, 
  Trash2, 
  FolderArchive, 
  ExternalLink, 
  ShieldCheck, 
  Download, 
  HardDrive,
  Info,
  ChevronRight,
  Database
} from 'lucide-react';
import { MonthlyDietPlan, MealDish } from '../types';

interface DietUploadManagerProps {
  monthlyDiets: MonthlyDietPlan[];
  onAddMonthlyDiet: (diet: MonthlyDietPlan) => void;
  onDeleteMonthlyDiet: (dietId: string) => void;
  onApplyDietToPlanner: (diet: MonthlyDietPlan) => void;
  onExportBackup: () => void;
  onImportBackup: (jsonContent: string) => void;
}

export const DietUploadManager: React.FC<DietUploadManagerProps> = ({
  monthlyDiets,
  onAddMonthlyDiet,
  onDeleteMonthlyDiet,
  onApplyDietToPlanner,
  onExportBackup,
  onImportBackup
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [dietTitle, setDietTitle] = useState('');
  const [targetMonth, setTargetMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [dietText, setDietText] = useState('');
  const [nutritionistName, setNutritionistName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  // Group unique months available in library
  const availableMonths = Array.from(new Set(monthlyDiets.map(d => d.month))).sort().reverse();

  const filteredDiets = monthlyDiets.filter(d => {
    if (selectedMonth === 'all') return true;
    return d.month === selectedMonth;
  });

  const handleFileUpload = async (file: File) => {
    setErrorMsg(null);
    try {
      const text = await file.text();
      setDietText(text);
      if (!dietTitle) {
        setDietTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    } catch {
      setErrorMsg('No se pudo leer el archivo de texto. Intenta copiar y pegar el texto de tu dieta.');
    }
  };

  const handleProcessDietWithAi = async () => {
    if (!dietText.trim()) {
      setErrorMsg('Pega el texto de tu dieta o sube un archivo.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/parse-diet-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dietText,
          targetMonth
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al procesar dieta');

      const newMonthlyDiet: MonthlyDietPlan = {
        id: `monthly-diet-${Date.now()}`,
        title: dietTitle.trim() || data.title || `Dieta ${targetMonth}`,
        month: targetMonth,
        createdAt: new Date().toISOString(),
        targetCalories: Number(data.targetCalories) || 2200,
        proteinTargetG: Number(data.proteinTargetG) || 160,
        nutritionistName: nutritionistName.trim() || data.nutritionistName || 'Nutriólogo Deportivo',
        notes: data.notes || 'Plan mensual procesado con IA para Costco y H-E-B.',
        dishes: Array.isArray(data.dishes) ? data.dishes.map((d: any, idx: number) => ({
          id: `diet-dish-${Date.now()}-${idx}`,
          name: d.name,
          mealTime: d.mealTime || 'lunch',
          category: d.category || 'high_protein',
          calories: Number(d.calories) || 500,
          proteinG: Number(d.proteinG) || 40,
          carbsG: Number(d.carbsG) || 50,
          fatG: Number(d.fatG) || 12,
          costPerServingMxn: Number(d.costPerServingMxn) || 45,
          prepTimeMinutes: Number(d.prepTimeMinutes) || 15,
          recommendedStoreNotes: d.recommendedStoreNotes || 'Ingredientes clave en Costco y frescos en HEB',
          ingredients: Array.isArray(d.ingredients) ? d.ingredients : []
        })) : []
      };

      onAddMonthlyDiet(newMonthlyDiet);
      setShowUploadModal(false);
      setDietText('');
      setDietTitle('');
      setSuccessMsg(`¡Dieta "${newMonthlyDiet.title}" categorizada en ${targetMonth} y lista para usar!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al interpretar la dieta con IA.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackupFileSelected = async (file: File) => {
    try {
      const text = await file.text();
      onImportBackup(text);
      setSuccessMsg('¡Copia de seguridad restaurada con éxito!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch {
      setErrorMsg('Archivo de respaldo no válido.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Upload CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderArchive className="w-6 h-6 text-[#A1FF00]" />
            <span>Mis Dietas Categorizadas por Mes</span>
          </h2>
          <p className="text-xs text-[#8E8E93] mt-1">
            Sube planes nutricionales de tu especialista, organízalos por fecha y cárgalos a tu planificador con un solo toque.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-black bg-[#A1FF00] hover:bg-[#8FE000] rounded-full transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Upload className="w-4 h-4 stroke-[2.5]" />
            <span>Subir Nueva Dieta</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-lime-500/10 border border-lime-500/30 rounded-2xl text-lime-600 dark:text-[#A1FF00] text-xs flex items-center gap-2 font-medium">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Cloud Run vs Vercel & Data Privacy Card */}
      <div className="bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] rounded-[22px] p-4.5 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#00F0FF]" />
            <h4 className="text-[14px] font-semibold tracking-tight text-[#1C1C1E] dark:text-[#F5F5F7]">
              ¿Dónde se guarda tu información? (Cloud Run vs. Vercel)
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onExportBackup}
              className="text-[11px] font-semibold text-[#007AFF] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Respaldo</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#8E8E93]">
          <div className="p-3 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-black/[0.04] dark:border-white/[0.06]">
            <span className="font-bold text-[#1C1C1E] dark:text-[#F5F5F7] block mb-1">
              📱 Privacidad en tu Dispositivo (Offline Ready)
            </span>
            <p>
              Tus dietas, entrenamientos y pesos se guardan en el almacenamiento local indexado de tu navegador (localStorage). <strong>No se transfieren ni venden a terceros</strong>, asegurando privacidad médica total y carga instantánea sin internet.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-black/[0.04] dark:border-white/[0.06]">
            <span className="font-bold text-[#1C1C1E] dark:text-[#F5F5F7] block mb-1">
              ☁️ ¿Es mejor aquí en Google Cloud Run o en Vercel?
            </span>
            <p>
              <strong>Es ideal quedarte aquí en Google AI Studio (Cloud Run)</strong> porque ya tienes el motor full-stack con Express y la API Gemini integrada del lado del servidor de forma gratuita. En Vercel tendrías que configurar tus propias API keys y variables de entorno externas.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 text-[11px] text-[#8E8E93]">
          <span>Puedes respaldar o transferir tu historial a otro iPhone cuando quieras:</span>
          <button
            onClick={() => backupInputRef.current?.click()}
            className="text-[#007AFF] hover:underline font-semibold cursor-pointer"
          >
            Restaurar archivo JSON
          </button>
          <input
            ref={backupInputRef}
            type="file"
            accept=".json"
            onChange={(e) => e.target.files && e.target.files[0] && handleBackupFileSelected(e.target.files[0])}
            className="hidden"
          />
        </div>
      </div>

      {/* Month Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setSelectedMonth('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            selectedMonth === 'all'
              ? 'bg-[#1C1C1E] text-white dark:bg-[#F5F5F7] dark:text-black shadow-sm'
              : 'bg-[#F2F2F7] dark:bg-[#1C1C1E] text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
          }`}
        >
          Todos los Meses ({monthlyDiets.length})
        </button>
        {availableMonths.map(m => {
          const count = monthlyDiets.filter(d => d.month === m).length;
          const [yr, mo] = m.split('-');
          const monthName = new Date(Number(yr), Number(mo) - 1, 1).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });

          return (
            <button
              key={m}
              onClick={() => setSelectedMonth(m)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap capitalize transition-all cursor-pointer ${
                selectedMonth === m
                  ? 'bg-[#1C1C1E] text-white dark:bg-[#F5F5F7] dark:text-black shadow-sm'
                  : 'bg-[#F2F2F7] dark:bg-[#1C1C1E] text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
              }`}
            >
              {monthName} ({count})
            </button>
          );
        })}
      </div>

      {/* Monthly Diets Cards */}
      <div className="space-y-4">
        {filteredDiets.length === 0 ? (
          <div className="p-10 text-center border border-dashed border-[#E5E5EA] dark:border-[#2C2C2E] rounded-[24px]">
            <FolderArchive className="w-8 h-8 text-[#8E8E93] mx-auto mb-2" />
            <h4 className="text-sm font-bold text-[#1C1C1E] dark:text-white">
              No tienes dietas registradas para este periodo
            </h4>
            <p className="text-xs text-[#8E8E93] mt-1">
              Sube el texto o archivo de tu plan nutricional para clasificarlo automáticamente.
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="mt-3 px-4 py-2 text-xs font-bold bg-[#A1FF00] text-black rounded-full shadow-sm hover:bg-[#8FE000] cursor-pointer"
            >
              + Subir Dieta con IA
            </button>
          </div>
        ) : (
          filteredDiets.map(diet => {
            const [yr, mo] = diet.month.split('-');
            const monthLabel = new Date(Number(yr), Number(mo) - 1, 1).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });

            return (
              <div 
                key={diet.id}
                className="bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] rounded-[22px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none space-y-3.5 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#A1FF00] bg-[#A1FF00]/10 px-2.5 py-0.5 rounded-full">
                        {monthLabel}
                      </span>
                      {diet.nutritionistName && (
                        <span className="text-[11px] text-[#8E8E93]">
                          Por: {diet.nutritionistName}
                        </span>
                      )}
                    </div>
                    <h3 className="text-[16px] font-bold text-[#1C1C1E] dark:text-[#F5F5F7] tracking-tight mt-1">
                      {diet.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => onApplyDietToPlanner(diet)}
                      className="px-3.5 py-1.5 text-xs font-bold bg-[#A1FF00] hover:bg-[#8FE000] text-black rounded-full shadow-sm transition-all cursor-pointer active:scale-95"
                    >
                      Cargar en Plan Semanal
                    </button>
                    <button
                      onClick={() => onDeleteMonthlyDiet(diet.id)}
                      className="p-1.5 text-[#8E8E93] hover:text-[#FF453A] transition-colors rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {diet.notes && (
                  <p className="text-xs text-[#8E8E93] italic">
                    "{diet.notes}"
                  </p>
                )}

                {/* Macro Target Strip */}
                <div className="flex items-center gap-4 text-xs font-mono tabular-nums text-[#8E8E93] pt-1 border-t border-black/[0.04] dark:border-white/[0.06]">
                  <span>Objetivo: <strong className="text-[#1C1C1E] dark:text-white">{diet.targetCalories} kcal</strong>/día</span>
                  <span>·</span>
                  <span>Proteína: <strong className="text-[#00F0FF]">{diet.proteinTargetG}g</strong>/día</span>
                  <span>·</span>
                  <span>{diet.dishes.length} platillos extraídos</span>
                </div>

                {/* Dishes preview pill list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {diet.dishes.map((dish, i) => (
                    <div 
                      key={i} 
                      className="p-2 rounded-xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 text-xs flex items-center justify-between"
                    >
                      <span className="font-semibold text-[#1C1C1E] dark:text-[#E5E5EA] truncate mr-2">
                        {dish.name}
                      </span>
                      <span className="font-mono text-[11px] text-[#A1FF00] shrink-0 font-bold">
                        ${dish.costPerServingMxn.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Upload Diet Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.1] rounded-[26px] max-w-lg w-full p-6 space-y-4 shadow-2xl my-8 transition-colors">
            
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1C1C1E] dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#A1FF00]" />
                <span>Subir Plan Nutricional / Dieta</span>
              </h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#8E8E93]">
              Pega el texto que te mandó tu nutriólogo o sube un archivo de texto. La Inteligencia Artificial estructurará los platillos, macros e ingredientes para Costco y H-E-B.
            </p>

            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-[#FF453A] text-xs">
                {errorMsg}
              </div>
            )}

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#8E8E93] mb-1">
                    Mes de la Dieta
                  </label>
                  <input
                    type="month"
                    value={targetMonth}
                    onChange={(e) => setTargetMonth(e.target.value)}
                    className="w-full bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] text-[#1C1C1E] dark:text-white text-xs rounded-xl p-2.5 font-mono cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#8E8E93] mb-1">
                    Nombre o Especialista
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Lic. Nutrición Deportiva"
                    value={nutritionistName}
                    onChange={(e) => setNutritionistName(e.target.value)}
                    className="w-full bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] text-[#1C1C1E] dark:text-white text-xs rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#8E8E93] mb-1">
                  Título del Plan
                </label>
                <input
                  type="text"
                  placeholder="ej. Dieta de Recomposición Muscular"
                  value={dietTitle}
                  onChange={(e) => setDietTitle(e.target.value)}
                  className="w-full bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] text-[#1C1C1E] dark:text-white text-xs rounded-xl p-2.5"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-[#8E8E93]">
                    Contenido / Menú de la Dieta
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] text-[#007AFF] hover:underline cursor-pointer"
                  >
                    Subir archivo .txt / .json
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.json,.md,.csv"
                    onChange={(e) => e.target.files && e.target.files[0] && handleFileUpload(e.target.files[0])}
                    className="hidden"
                  />
                </div>
                <textarea
                  rows={6}
                  placeholder="Pega aquí tu menú, por ejemplo:
Desayuno: 200g de claras de huevo con 60g de avena y medio plátano.
Comida: 200g pechuga de pollo asada con taza de arroz jazmín y aguacate.
Cena: Atún en agua con 3 tortillas de maíz y verduras..."
                  value={dietText}
                  onChange={(e) => setDietText(e.target.value)}
                  className="w-full bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] text-[#1C1C1E] dark:text-white text-xs rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#A1FF00]"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleProcessDietWithAi}
                className="px-5 py-2.5 text-xs font-bold text-black bg-[#A1FF00] hover:bg-[#8FE000] rounded-full transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isProcessing ? 'Analizando con IA...' : 'Extraer y Clasificar Dieta'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
