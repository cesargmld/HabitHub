import React, { useState, useRef, useEffect } from 'react';
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
  Database,
  Camera,
  Image as ImageIcon,
  RotateCcw
} from 'lucide-react';
import { MonthlyDietPlan, MealDish } from '../types';
import { fileToBase64 } from '../utils/fileParsers';

interface DietUploadManagerProps {
  monthlyDiets: MonthlyDietPlan[];
  onAddMonthlyDiet: (diet: MonthlyDietPlan) => void;
  onDeleteMonthlyDiet: (dietId: string) => void;
  onClearAllMonthlyDiets?: () => void;
  onApplyDietToPlanner: (diet: MonthlyDietPlan) => void;
  onExportBackup: () => void;
  onImportBackup: (jsonContent: string) => void;
}

export const DietUploadManager: React.FC<DietUploadManagerProps> = ({
  monthlyDiets,
  onAddMonthlyDiet,
  onDeleteMonthlyDiet,
  onClearAllMonthlyDiets,
  onApplyDietToPlanner,
  onExportBackup,
  onImportBackup
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadMode, setUploadMode] = useState<'document' | 'text'>('document');
  const [dietTitle, setDietTitle] = useState('');
  const [targetMonth, setTargetMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [dietText, setDietText] = useState('');
  const [dietImageBase64, setDietImageBase64] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFileSize, setSelectedFileSize] = useState<string | null>(null);
  const [isPdfFile, setIsPdfFile] = useState<boolean>(false);
  const [nutritionistName, setNutritionistName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  // Group unique months available in library
  const availableMonths = Array.from(new Set(monthlyDiets.map(d => d.month))).sort().reverse();

  const filteredDiets = monthlyDiets.filter(d => {
    if (selectedMonth === 'all') return true;
    return d.month === selectedMonth;
  });

  const handleClearSelectedFile = () => {
    setDietImageBase64(null);
    setSelectedFileName(null);
    setSelectedFileSize(null);
    setIsPdfFile(false);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleDocumentOrImageUpload = async (file: File) => {
    setErrorMsg(null);
    try {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isImg = file.type.startsWith('image/');

      if (!isPdf && !isImg) {
        setErrorMsg('Por favor selecciona un archivo PDF o imagen (JPG, PNG, WEBP).');
        return;
      }

      const base64 = await fileToBase64(file);
      setDietImageBase64(base64);
      setSelectedFileName(file.name);
      setSelectedFileSize((file.size / 1024).toFixed(0) + ' KB');
      setIsPdfFile(isPdf);
      setUploadMode('document');

      if (!dietTitle) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        setDietTitle(isPdf ? `Plan ${cleanName}` : `Dieta ${cleanName}`);
      }
    } catch {
      setErrorMsg('No se pudo procesar el archivo. Intenta de nuevo.');
    }
  };

  const handleFileUpload = async (file: File) => {
    setErrorMsg(null);
    try {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      if (file.type.startsWith('image/') || isPdf) {
        return handleDocumentOrImageUpload(file);
      }
      const text = await file.text();
      setDietText(text);
      setUploadMode('text');
      if (!dietTitle) {
        setDietTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    } catch {
      setErrorMsg('No se pudo leer el archivo. Intenta copiar y pegar el texto de tu dieta.');
    }
  };

  const handleProcessDietWithAi = async () => {
    if (uploadMode === 'text' && !dietText.trim()) {
      setErrorMsg('Pega el texto de tu dieta o sube un archivo.');
      return;
    }
    if (uploadMode === 'document' && !dietImageBase64) {
      setErrorMsg('Selecciona un documento PDF o foto de tu plan nutricional.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      let data: any;

      if (uploadMode === 'document') {
        const res = await fetch('/api/parse-diet-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: dietImageBase64,
            targetMonth
          })
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al procesar documento/foto de dieta');
      } else {
        const res = await fetch('/api/parse-diet-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dietText,
            targetMonth
          })
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al procesar texto de dieta');
      }

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
      handleClearSelectedFile();
      setDietTitle('');
      setSuccessMsg(`¡Dieta "${newMonthlyDiet.title}" analizada y agregada con éxito a ${targetMonth}!`);
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
            <FolderArchive className="w-6 h-6 text-slate-400" />
            <span>Mis Dietas Categorizadas por Mes</span>
          </h2>
          <p className="text-xs text-[#8E8E93] mt-1">
            Sube planes nutricionales (PDF o foto), organízalos por fecha y cárgalos a tu planificador con un solo toque.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onClearAllMonthlyDiets && monthlyDiets.length > 0 && (
            <button
              onClick={onClearAllMonthlyDiets}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-500 hover:text-rose-600 bg-rose-500/10 hover:bg-rose-500/15 rounded-full transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Borrar Todo (Comenzar de 0)</span>
            </button>
          )}
          <button
            onClick={() => {
              handleClearSelectedFile();
              setShowUploadModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white dark:text-black bg-[#1C1C1E] dark:bg-white hover:opacity-90 rounded-full transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Upload className="w-4 h-4 stroke-[2.5]" />
            <span>Subir Nueva Dieta</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl text-white text-xs flex items-center gap-2 font-medium">
          <Check className="w-4 h-4 shrink-0 text-[#007AFF]" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Cloud Run vs Vercel & Data Privacy Card */}
      <div className="bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] rounded-[22px] p-4.5 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-300" />
            <h4 className="text-[14px] font-semibold tracking-tight text-[#1C1C1E] dark:text-[#F5F5F7]">
              ¿Dónde se guarda tu información? (Almacenamiento Local vs. Servidor)
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onExportBackup}
              className="text-xs font-bold text-[#007AFF] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar JSON</span>
            </button>
            <span className="text-[#8E8E93]">·</span>
            <button
              onClick={() => backupInputRef.current?.click()}
              className="text-xs font-bold text-[#007AFF] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>Restaurar</span>
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

        <div className="p-3 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/50 border border-black/[0.04] dark:border-white/[0.06] flex items-center gap-2.5 text-xs text-[#8E8E93]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span>
            <strong className="text-[#1C1C1E] dark:text-[#F5F5F7]">100% Privado en tu Dispositivo:</strong> Tus planes se guardan en el almacenamiento local de tu navegador. Nada se envía a servidores de terceros ni se almacena en la nube.
          </span>
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
              Sube tu archivo PDF o captura de tu plan nutricional para clasificarlo automáticamente.
            </p>
            <button
              onClick={() => {
                handleClearSelectedFile();
                setShowUploadModal(true);
              }}
              className="mt-3 px-4 py-2 text-xs font-bold bg-[#1C1C1E] dark:bg-white text-white dark:text-black rounded-full shadow-sm hover:opacity-90 cursor-pointer active:scale-95"
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
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200 bg-white/10 px-2.5 py-0.5 rounded-full">
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
                      className="px-3.5 py-1.5 text-xs font-bold bg-[#1C1C1E] dark:bg-white text-white dark:text-black hover:opacity-90 rounded-full shadow-sm transition-all cursor-pointer active:scale-95"
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
                  <span>Proteína: <strong className="text-white">{diet.proteinTargetG}g</strong>/día</span>
                  <span>·</span>
                  <span>{diet.dishes.length} platillos extraídos</span>
                </div>

                {/* Dishes preview pill list with day badges */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">
                    Comidas del Plan por Día:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {diet.dishes.map((dish, i) => (
                      <div 
                        key={i} 
                        className="p-2.5 rounded-xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 text-xs flex items-center justify-between"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            {dish.assignedDay && (
                              <span className="px-1.5 py-0.2 rounded bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 text-[10px] font-extrabold uppercase">
                                {dish.assignedDay}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 uppercase font-bold">
                              {dish.mealTime === 'breakfast' ? 'Desayuno' : dish.mealTime === 'lunch' ? 'Comida' : 'Cena'}
                            </span>
                          </div>
                          <p className="font-semibold text-[#1C1C1E] dark:text-[#E5E5EA] truncate mt-0.5">
                            {dish.name}
                          </p>
                        </div>
                        <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 shrink-0 font-bold">
                          ${dish.costPerServingMxn.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Extracted Clinical Snacks */}
                {diet.snacks && diet.snacks.length > 0 && (
                  <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] space-y-1.5">
                    <span className="text-[11px] font-bold text-amber-500 uppercase flex items-center gap-1">
                      <span>Colaciones y Snacks del Plan ({diet.snacks.length})</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {diet.snacks.map((snack, sIdx) => (
                        <div key={sIdx} className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/10 text-[11px] text-slate-700 dark:text-slate-300">
                          • {snack}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extracted Clinical Recommendations */}
                {diet.recommendations && diet.recommendations.length > 0 && (
                  <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] space-y-1.5">
                    <span className="text-[11px] font-bold text-lime-600 dark:text-lime-400 uppercase flex items-center gap-1">
                      <span>Recomendaciones Clínicas de la Nutrióloga:</span>
                    </span>
                    <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400 list-disc list-inside">
                      {diet.recommendations.map((rec, rIdx) => (
                        <li key={rIdx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
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
                <Sparkles className="w-5 h-5 text-slate-300" />
                <span>Subir Plan Nutricional / Dieta con IA</span>
              </h3>
              <button 
                onClick={() => {
                  setShowUploadModal(false);
                  handleClearSelectedFile();
                }}
                className="text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Mode Switcher: PDF / Photo vs Text */}
            <div className="flex items-center gap-1 p-1 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-2xl">
              <button
                type="button"
                onClick={() => setUploadMode('document')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  uploadMode === 'document' 
                    ? 'bg-white dark:bg-[#3A3A3C] text-[#1C1C1E] dark:text-white shadow-sm' 
                    : 'text-[#8E8E93]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF / Foto de Dieta (IA)</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('text')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  uploadMode === 'text' 
                    ? 'bg-white dark:bg-[#3A3A3C] text-[#1C1C1E] dark:text-white shadow-sm' 
                    : 'text-[#8E8E93]'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Pegar Texto / Archivo</span>
              </button>
            </div>

            <p className="text-xs text-[#8E8E93]">
              {uploadMode === 'document' 
                ? 'Sube tu documento PDF o foto de tu dieta (WhatsApp, hoja clínica o PDF). La IA estructurará automáticamente los platillos, macros y lista de compras.'
                : 'Pega el texto que te mandó tu nutriólogo o sube un archivo de texto. La IA lo adaptará al formato del planificador.'
              }
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
                  placeholder="ej. Plan de Recomposición Muscular"
                  value={dietTitle}
                  onChange={(e) => setDietTitle(e.target.value)}
                  className="w-full bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] text-[#1C1C1E] dark:text-white text-xs rounded-xl p-2.5"
                />
              </div>

              {uploadMode === 'document' ? (
                <div>
                  <label className="block text-[11px] font-bold text-[#8E8E93] mb-1.5">
                    Archivo PDF o Imagen de tu Plan
                  </label>
                  
                  {!dietImageBase64 ? (
                    <div
                      onClick={() => imageInputRef.current?.click()}
                      className="border-2 border-dashed border-[#E5E5EA] dark:border-[#2C2C2E] hover:border-slate-400 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-[#F2F2F7]/50 dark:bg-[#2C2C2E]/30"
                    >
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="application/pdf,.pdf,image/png,image/jpeg,image/webp,image/heic"
                        onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                        onChange={(e) => e.target.files && e.target.files[0] && handleDocumentOrImageUpload(e.target.files[0])}
                        className="hidden"
                      />
                      <div className="flex items-center justify-center gap-2 mb-2 text-slate-400">
                        <FileText className="w-7 h-7" />
                        <Camera className="w-7 h-7" />
                      </div>
                      <p className="text-xs font-bold text-[#1C1C1E] dark:text-white">
                        Toca para subir tu PDF o foto de tu dieta
                      </p>
                      <p className="text-[11px] text-[#8E8E93] mt-0.5">
                        Formatos soportados: Documentos PDF, WhatsApp, JPG, PNG
                      </p>
                    </div>
                  ) : isPdfFile ? (
                    <div className="p-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-[#FF453A] font-black text-xs flex items-center justify-center shrink-0">
                          PDF
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-[#1C1C1E] dark:text-white truncate max-w-[200px] sm:max-w-xs">
                            {selectedFileName || 'Documento de Dieta.pdf'}
                          </p>
                          <p className="text-[11px] text-[#8E8E93]">
                            {selectedFileSize} · Listo para extraer con Gemini IA
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearSelectedFile}
                        className="p-1.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 text-[#8E8E93] hover:text-[#FF453A] text-xs flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Cambiar</span>
                      </button>
                    </div>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden border border-black/[0.06] dark:border-white/[0.1] bg-black max-h-48 flex items-center justify-center">
                      <img
                        src={dietImageBase64}
                        alt="Diet Preview"
                        className="object-contain max-h-48 w-full"
                      />
                      <button
                        type="button"
                        onClick={handleClearSelectedFile}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Cambiar</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
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
                    rows={5}
                    placeholder="Pega aquí tu menú, por ejemplo:
Desayuno: 200g de claras de huevo con 60g de avena y medio plátano.
Comida: 200g pechuga de pollo asada con taza de arroz jazmín y aguacate.
Cena: Atún en agua con 3 tortillas de maíz y verduras..."
                    value={dietText}
                    onChange={(e) => setDietText(e.target.value)}
                    className="w-full bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] text-[#1C1C1E] dark:text-white text-xs rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowUploadModal(false);
                  handleClearSelectedFile();
                }}
                className="px-4 py-2 text-xs font-semibold text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleProcessDietWithAi}
                className="px-5 py-2.5 text-xs font-bold text-white dark:text-black bg-[#1C1C1E] dark:bg-white hover:opacity-90 rounded-full transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-sm active:scale-95"
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
