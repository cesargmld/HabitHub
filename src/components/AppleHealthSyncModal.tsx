import React, { useState, useRef } from 'react';
import { 
  Heart, 
  X, 
  Smartphone, 
  Check, 
  Sparkles, 
  Activity, 
  Watch, 
  Download, 
  Upload, 
  Share2, 
  Flame, 
  Footprints, 
  Clock, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { WorkoutRecord, AppleHealthMetrics } from '../types';
import { parseAppleHealthXML } from '../utils/fileParsers';

interface AppleHealthSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  userWeightKg: number;
  currentDate: string;
  onSyncMetrics: (metrics: { activeCalories: number; steps: number; exerciseMinutes: number; restingHeartRate?: number }) => void;
  onAddWorkouts: (workouts: WorkoutRecord[]) => void;
}

export const AppleHealthSyncModal: React.FC<AppleHealthSyncModalProps> = ({
  isOpen,
  onClose,
  userWeightKg,
  currentDate,
  onSyncMetrics,
  onAddWorkouts
}) => {
  const [activeTab, setActiveTab] = useState<'shortcut' | 'export_file' | 'direct_sync'>('shortcut');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSimulateDirectSync = async () => {
    setIsSyncing(true);
    setSyncStatus('Conectando con servicio Apple HealthKit...');
    setErrorStatus(null);

    try {
      const res = await fetch('/api/sync-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'Apple Health (iOS)',
          metrics: {
            activeCalories: 640,
            totalSteps: 9850,
            exerciseMinutes: 48,
            restingHeartRate: 56
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al sincronizar');

      onSyncMetrics({
        activeCalories: data.metrics.activeCalories,
        steps: data.metrics.totalSteps,
        exerciseMinutes: data.metrics.exerciseMinutes,
        restingHeartRate: data.metrics.restingHeartRate
      });

      setSyncStatus(`¡Sincronizado! +${data.metrics.activeCalories} kcal activas, ${data.metrics.totalSteps.toLocaleString()} pasos y ${data.metrics.exerciseMinutes} min de ejercicio.`);
    } catch (err: any) {
      setErrorStatus(err.message || 'No se pudo completar la sincronización');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAppleHealthFile = async (file: File) => {
    setIsSyncing(true);
    setErrorStatus(null);
    setSyncStatus('Procesando archivo nativo de Apple Health...');

    try {
      const text = await file.text();
      const workouts = parseAppleHealthXML(text, userWeightKg);

      if (workouts.length === 0) {
        throw new Error('No se detectaron entrenamientos en este archivo export.xml de Salud.');
      }

      // Convert parsed workouts to WorkoutRecord format
      const records: WorkoutRecord[] = workouts.map((w, idx) => ({
        id: `apple-w-${Date.now()}-${idx}`,
        date: w.date || currentDate,
        time: w.time || '08:00',
        title: w.title,
        deviceSource: 'apple_fitness',
        activityType: w.activityType,
        durationMinutes: w.durationMinutes,
        caloriesBurned: w.caloriesBurned,
        avgHeartRate: w.avgHeartRate,
        maxHeartRate: w.maxHeartRate,
        distanceKm: w.distanceKm,
        sourceFileName: file.name
      }));

      onAddWorkouts(records);
      const totalKcal = records.reduce((s, r) => s + r.caloriesBurned, 0);
      setSyncStatus(`¡${records.length} sesiones de Apple Watch importadas! (+${totalKcal} kcal añadidas a tu balance).`);
    } catch (err: any) {
      setErrorStatus(err.message || 'Error al interpretar el archivo de Apple Health');
    } finally {
      setIsSyncing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const copyShortcutConfig = () => {
    const shortcutInstructions = `Atajo de Apple iOS para sincronizar con HabitHub:
1. En tu iPhone abre la app "Atajos" (Shortcuts).
2. Agrega la acción "Obtener detalles de muestras de salud" (Calorías activas, Pasos, Entrenamientos de hoy).
3. Agrega la acción "Obtener contenido de URL":
   - URL: ${window.location.origin}/api/sync-health
   - Método: POST
   - Cuerpo: JSON con las variables de Salud.
4. Listo! Añádelo a tu pantalla de inicio o como widget en el iPhone para sincronizar en 1 toque.`;

    navigator.clipboard.writeText(shortcutInstructions);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#13151D] border border-white/10 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 my-auto transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/10 shadow-sm">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-[17px] font-black text-white tracking-tight">
                Conexión con Apple Salud
              </h3>
              <p className="text-[11px] text-[#8E92A4]">
                Apple Watch, Anillos de Actividad & HealthKit en tu iPhone
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#181B26] hover:bg-[#202433] flex items-center justify-center text-[#8E92A4] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1 bg-[#181B26] border border-white/5 rounded-2xl">
          <button
            onClick={() => setActiveTab('shortcut')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              activeTab === 'shortcut' 
                ? 'bg-[#CCFF00] text-black font-extrabold shadow-sm' 
                : 'text-[#8E92A4] hover:text-white'
            }`}
          >
            Atajo iOS (1 Toque)
          </button>
          <button
            onClick={() => setActiveTab('export_file')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              activeTab === 'export_file' 
                ? 'bg-[#CCFF00] text-black font-extrabold shadow-sm' 
                : 'text-[#8E92A4] hover:text-white'
            }`}
          >
            Archivo export.xml
          </button>
          <button
            onClick={() => setActiveTab('direct_sync')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              activeTab === 'direct_sync' 
                ? 'bg-[#CCFF00] text-black font-extrabold shadow-sm' 
                : 'text-[#8E92A4] hover:text-white'
            }`}
          >
            Simular Sync
          </button>
        </div>

        {syncStatus && (
          <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#CCFF00]" />
            <span>{syncStatus}</span>
          </div>
        )}

        {errorStatus && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-700 dark:text-[#FF453A] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorStatus}</span>
          </div>
        )}

        {/* TAB 1: APPLE SHORTCUTS (ATAJO DE 1 TOQUE) */}
        {activeTab === 'shortcut' && (
          <div className="space-y-3.5">
            <div className="p-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-black/[0.04] dark:border-white/[0.06] space-y-2">
              <span className="text-xs font-bold text-[#1C1C1E] dark:text-white flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#007AFF]" />
                <span>¿Cómo funciona la sincronización nativa en iPhone?</span>
              </span>
              <p className="text-xs text-[#8E8E93] leading-relaxed">
                Dado que los navegadores web por privacidad médica no pueden leer HealthKit sin permiso, Apple diseñó la app <strong>Atajos (Shortcuts)</strong>. Con un atajo de 1 toque, tu iPhone lee tus <strong>calorías activas, pasos y entrenamientos de tu Apple Watch</strong> y los manda a HabitHub al instante.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E8E93] block">
                Pasos de Instalación:
              </span>
              <ol className="text-xs space-y-2 text-[#1C1C1E] dark:text-slate-300 list-decimal list-inside bg-slate-50 dark:bg-white/[0.02] p-3.5 rounded-2xl border border-black/[0.04] dark:border-white/[0.06]">
                <li>Copia las instrucciones de integración con el botón inferior.</li>
                <li>Abre la app <strong>Atajos</strong> en tu iPhone y crea un atajo llamado <em>"Sincronizar Salud"</em>.</li>
                <li>Agrega la acción <strong>"Obtener muestras de Salud"</strong> y envía el resultado al webhook local de HabitHub.</li>
                <li>¡Coloca el botón en tu pantalla de inicio o widget para sincronizar con un toque al terminar tu día!</li>
              </ol>
            </div>

            <button
              onClick={copyShortcutConfig}
              className="w-full py-2.5 px-4 bg-[#007AFF] hover:bg-[#0051D5] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98 transition-all"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedLink ? '¡Instrucciones Copiadas al Portapapeles!' : 'Copiar Configuración del Atajo de iOS'}</span>
            </button>
          </div>
        )}

        {/* TAB 2: EXPORT.XML FILE FROM APPLE HEALTH */}
        {activeTab === 'export_file' && (
          <div className="space-y-3.5">
            <div className="p-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-black/[0.04] dark:border-white/[0.06] space-y-2">
              <span className="text-xs font-bold text-[#1C1C1E] dark:text-white flex items-center gap-1.5">
                <Download className="w-4 h-4 text-[#FA114F]" />
                <span>Exportación oficial de Salud en iOS</span>
              </span>
              <p className="text-xs text-[#8E8E93] leading-relaxed">
                En tu iPhone ve a la app <strong>Salud &gt; Toca tu Foto de Perfil &gt; Exportar todos los datos de salud</strong>. Se generará un archivo que contiene <strong>export.xml</strong> con todo tu historial de Apple Watch. Súbelo aquí:
              </p>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#E5E5EA] dark:border-[#2C2C2E] hover:border-[#FA114F] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-[#F2F2F7]/50 dark:bg-[#2C2C2E]/30"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xml,.zip"
                onChange={(e) => e.target.files && e.target.files[0] && handleAppleHealthFile(e.target.files[0])}
                className="hidden"
              />
              <Upload className="w-8 h-8 text-[#FA114F] mx-auto mb-2" />
              <p className="text-xs font-bold text-[#1C1C1E] dark:text-white">
                {isSyncing ? 'Extrayendo sesiones de Apple Health...' : 'Toca para seleccionar export.xml o arrástralo'}
              </p>
              <p className="text-[11px] text-[#8E8E93] mt-0.5">
                Compatible con exportaciones de Apple Watch Series 4 a Ultra 2
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: LIVE DIRECT SIMULATION */}
        {activeTab === 'direct_sync' && (
          <div className="space-y-3.5">
            <div className="p-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-black/[0.04] dark:border-white/[0.06] space-y-2">
              <span className="text-xs font-bold text-[#1C1C1E] dark:text-white flex items-center gap-1.5">
                <Watch className="w-4 h-4 text-slate-300" />
                <span>Sincronización Rápida en Vivo</span>
              </span>
              <p className="text-xs text-[#8E8E93] leading-relaxed">
                Simula o jala las métricas del día hacia los Anillos de Actividad de HabitHub mediante la API de servidor:
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="p-2.5 rounded-xl bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-black/[0.04] dark:border-white/[0.06]">
                <Flame className="w-4 h-4 text-[#FA114F] mx-auto mb-1" />
                <span className="text-[10px] text-[#8E8E93] block font-sans">Movimiento</span>
                <span className="text-xs font-bold text-[#FA114F]">+640 kcal</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-black/[0.04] dark:border-white/[0.06]">
                <Clock className="w-4 h-4 text-slate-300 mx-auto mb-1" />
                <span className="text-[10px] text-[#8E8E93] block font-sans">Ejercicio</span>
                <span className="text-xs font-bold text-white">48 min</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-black/[0.04] dark:border-white/[0.06]">
                <Footprints className="w-4 h-4 text-[#00F0FF] mx-auto mb-1" />
                <span className="text-[10px] text-[#8E8E93] block font-sans">Pasos</span>
                <span className="text-xs font-bold text-[#00F0FF]">9,850</span>
              </div>
            </div>

            <button
              onClick={handleSimulateDirectSync}
              disabled={isSyncing}
              className="w-full py-2.5 px-4 bg-[#CCFF00] hover:bg-[#bbf000] text-black text-xs font-extrabold rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSyncing ? 'Sincronizando con Salud...' : 'Sincronizar Métricas de Apple Salud Ahora'}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
