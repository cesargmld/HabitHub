import React, { useState, useRef, useEffect } from 'react';
import { 
  Zap, 
  Upload, 
  Watch, 
  Calendar, 
  Clock, 
  Flame, 
  Heart, 
  Route, 
  CheckCircle2, 
  AlertCircle,
  Trash2,
  FileText,
  Camera,
  Sparkles,
  Image as ImageIcon,
  Share2,
  Smartphone,
  Check,
  RotateCcw
} from 'lucide-react';
import { WorkoutRecord, ActivityType, DeviceSource, UserProfile, WorkoutScreenshotResult } from '../types';
import { parseWorkoutFile, fileToBase64, compressImageFile } from '../utils/fileParsers';
import { estimateWorkoutCalories } from '../utils/calorieEngine';

interface WorkoutTrackerProps {
  workouts: WorkoutRecord[];
  onAddWorkout: (workout: Omit<WorkoutRecord, 'id'>) => void;
  onDeleteWorkout: (id: string) => void;
  profile: UserProfile;
  currentDate: string;
}

export const WorkoutTracker: React.FC<WorkoutTrackerProps> = ({
  workouts,
  onAddWorkout,
  onDeleteWorkout,
  profile,
  currentDate
}) => {
  const [activeTab, setActiveTab] = useState<'screenshot' | 'log' | 'import' | 'history'>('screenshot');
  
  // Manual Log Form State
  const [date, setDate] = useState(currentDate);
  const [time, setTime] = useState('07:30');
  const [title, setTitle] = useState('');
  const [deviceSource, setDeviceSource] = useState<DeviceSource>('strava');
  const [activityType, setActivityType] = useState<ActivityType>('running');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [caloriesBurnedInput, setCaloriesBurnedInput] = useState<string>('');
  const [avgHeartRate, setAvgHeartRate] = useState<string>('');
  const [distanceKm, setDistanceKm] = useState<string>('');
  const [notes, setNotes] = useState('');
  
  // File upload state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Screenshot upload state
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isAnalyzingScreenshot, setIsAnalyzingScreenshot] = useState(false);
  const [extractedWorkout, setExtractedWorkout] = useState<WorkoutScreenshotResult | null>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  // Auto-calculated calorie estimate if input is blank
  const autoEstimatedCalories = estimateWorkoutCalories(
    activityType,
    Number(durationMinutes) || 30,
    profile.weightKg,
    avgHeartRate ? Number(avgHeartRate) : undefined
  );

  // Global paste handler to paste screenshot directly from clipboard (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.items) {
        for (let i = 0; i < e.clipboardData.items.length; i++) {
          const item = e.clipboardData.items[i];
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
              setActiveTab('screenshot');
              processScreenshotFile(file);
              break;
            }
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [profile.weightKg]);

  const sanitizeDateStr = (d?: string, fallback = currentDate): string => {
    if (!d) return fallback;
    const match = String(d).match(/\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
    const parsed = new Date(d);
    if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
    return fallback;
  };

  const sanitizeTimeStr = (t?: string, fallback = '08:00'): string => {
    if (!t) return fallback;
    const match = String(t).match(/(\d{1,2}):(\d{2})/);
    if (match) {
      const hh = match[1].padStart(2, '0');
      const mm = match[2];
      return `${hh}:${mm}`;
    }
    return fallback;
  };

  const processScreenshotFile = async (file: File) => {
    setUploadError(null);
    setUploadSuccess(null);
    setIsAnalyzingScreenshot(true);

    try {
      // Compress image to max 1280px / JPEG for instant mobile upload and to stay well below Vercel limits
      const base64 = await compressImageFile(file);
      setScreenshotPreview(base64);

      const res = await fetch('/api/parse-workout-screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          userWeightKg: profile.weightKg
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Error al analizar captura');

      const extracted: WorkoutScreenshotResult = {
        title: data?.title || 'Entrenamiento detectado',
        deviceSource: data?.deviceSource || 'strava',
        activityType: data?.activityType || 'running',
        durationMinutes: Number(data?.durationMinutes) || 45,
        caloriesBurned: Number(data?.caloriesBurned) || 450,
        avgHeartRate: data?.avgHeartRate ? Number(data.avgHeartRate) : undefined,
        maxHeartRate: data?.maxHeartRate ? Number(data.maxHeartRate) : undefined,
        distanceKm: data?.distanceKm ? Number(data.distanceKm) : undefined,
        elevationGainM: data?.elevationGainM ? Number(data.elevationGainM) : undefined,
        paceMinPerKm: data?.paceMinPerKm || undefined,
        date: sanitizeDateStr(data?.date, currentDate),
        time: sanitizeTimeStr(data?.time, '08:00'),
        confidenceNotes: data?.confidenceNotes,
        detectedApp: data?.detectedApp || 'Fitness App'
      };

      setExtractedWorkout(extracted);
      setUploadSuccess(`¡Captura de ${extracted.detectedApp || 'entrenamiento'} procesada con éxito! Revisa y confirma.`);
    } catch (err: any) {
      setUploadError(err.message || 'Error al procesar la captura de pantalla.');
    } finally {
      setIsAnalyzingScreenshot(false);
      try {
        if (screenshotInputRef.current) screenshotInputRef.current.value = '';
      } catch {}
    }
  };

  const handleConfirmScreenshotWorkout = () => {
    if (!extractedWorkout) return;
    onAddWorkout({
      date: extractedWorkout.date || currentDate,
      time: extractedWorkout.time || '08:00',
      title: extractedWorkout.title,
      deviceSource: extractedWorkout.deviceSource,
      activityType: extractedWorkout.activityType,
      durationMinutes: extractedWorkout.durationMinutes,
      caloriesBurned: extractedWorkout.caloriesBurned,
      avgHeartRate: extractedWorkout.avgHeartRate,
      maxHeartRate: extractedWorkout.maxHeartRate,
      distanceKm: extractedWorkout.distanceKm,
      elevationGainM: extractedWorkout.elevationGainM,
      paceMinPerKm: extractedWorkout.paceMinPerKm,
      notes: extractedWorkout.confidenceNotes,
      screenshotUrl: screenshotPreview || undefined
    });

    setUploadSuccess(`¡${extractedWorkout.title} guardado! +${extractedWorkout.caloriesBurned} kcal añadidas a tu gasto diario.`);
    setExtractedWorkout(null);
    setScreenshotPreview(null);
    setTimeout(() => setUploadSuccess(null), 4000);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCalories = caloriesBurnedInput ? Number(caloriesBurnedInput) : autoEstimatedCalories;
    
    const defaultTitle = 
      activityType === 'running' ? 'Carrera Continua' :
      activityType === 'trail_running' ? 'Trail en Montaña' :
      activityType === 'cycling_road' ? 'Rodada de Ruta' :
      activityType === 'cycling_indoor' ? 'Sesión en Rodillo / Spinning' :
      activityType === 'strength_training' ? 'Entrenamiento de Fuerza' :
      activityType === 'hiit' ? 'Sesión HIIT / WOD' :
      activityType === 'swimming' ? 'Natación' : 'Entrenamiento';

    onAddWorkout({
      date,
      time,
      title: title.trim() || defaultTitle,
      deviceSource,
      activityType,
      durationMinutes: Number(durationMinutes) || 40,
      caloriesBurned: finalCalories,
      avgHeartRate: avgHeartRate ? Number(avgHeartRate) : undefined,
      distanceKm: distanceKm ? Number(distanceKm) : undefined,
      notes: notes.trim() || undefined
    });

    setTitle('');
    setCaloriesBurnedInput('');
    setAvgHeartRate('');
    setDistanceKm('');
    setNotes('');
    setUploadSuccess('¡Entrenamiento registrado y gasto calórico actualizado!');
    setTimeout(() => setUploadSuccess(null), 3500);
  };

  const processFile = async (file: File) => {
    setUploadError(null);
    setUploadSuccess(null);

    // If an image was dropped or selected in the file tab, seamlessly route to screenshot analyzer
    if (file.type.startsWith('image/') || /\.(png|jpe?g|webp|heic|bmp|tiff)$/i.test(file.name)) {
      setActiveTab('screenshot');
      return processScreenshotFile(file);
    }

    setIsProcessingFile(true);

    try {
      const parsed = await parseWorkoutFile(file, profile.weightKg);
      onAddWorkout({
        date: parsed.date || date,
        time: parsed.time || time,
        title: parsed.title,
        deviceSource: parsed.deviceSource,
        activityType: parsed.activityType,
        durationMinutes: parsed.durationMinutes,
        caloriesBurned: parsed.caloriesBurned,
        avgHeartRate: parsed.avgHeartRate,
        maxHeartRate: parsed.maxHeartRate,
        distanceKm: parsed.distanceKm,
        elevationGainM: parsed.elevationGainM,
        sourceFileName: file.name
      });

      setUploadSuccess(`Archivo "${file.name}" importado con éxito: +${parsed.caloriesBurned} kcal añadidas`);
    } catch (err: any) {
      setUploadError(err.message || 'Error al procesar archivo');
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/') || /\.(png|jpe?g|webp|heic|bmp|tiff)$/i.test(file.name)) {
        setActiveTab('screenshot');
        processScreenshotFile(file);
      } else {
        processFile(file);
      }
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-lime-500" />
            <span>Entrenamientos & Gasto Activo</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Soporta sesiones de Coros Pace/Apex, Polar Flow, Apple Watch y formatos .TCX/.GPX/.JSON
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[#13151D] border border-white/5 rounded-full shadow-sm self-start sm:self-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('screenshot')}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'screenshot' ? 'bg-white text-black font-bold shadow-sm' : 'text-[#8E92A4] hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Captura con IA</span>
          </button>
          <button
            onClick={() => setActiveTab('log')}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'log' ? 'bg-white text-black font-bold shadow-sm' : 'text-[#8E92A4] hover:text-white'
            }`}
          >
            Registro Rápido
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'import' ? 'bg-white text-black font-bold shadow-sm' : 'text-[#8E92A4] hover:text-white'
            }`}
          >
            Archivos / Apple Health
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'history' ? 'bg-white text-black font-bold shadow-sm' : 'text-[#8E92A4] hover:text-white'
            }`}
          >
            Historial ({workouts.length})
          </button>
        </div>
      </div>

      {uploadSuccess && (
        <div className="p-3.5 bg-lime-50 dark:bg-lime-950/40 border border-lime-500/40 rounded-2xl text-lime-700 dark:text-lime-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {uploadError && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-500/40 rounded-2xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* TAB 0: SCREENSHOT SCANNER AI */}
      {activeTab === 'screenshot' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#12131A] border border-slate-200/80 dark:border-white/5 rounded-3xl p-5 sm:p-7 shadow-md dark:shadow-black/40 space-y-5">
            <div className="max-w-xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200 bg-white/10 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                Visión Multimodal Gemini
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-slate-300" />
                <span>Analizar Captura de Pantalla de Cualquier App</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Toma captura a tu sesión en <strong>Strava</strong>, <strong>Nike Run Club</strong>, <strong>Apple Fitness</strong>, <strong>Garmin</strong>, <strong>Whoop</strong>, <strong>Coros</strong> o <strong>Polar</strong>. Súbela o pégala con <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[10px]">Ctrl+V</kbd>.
              </p>
            </div>

            {/* Dropzone / Upload Target */}
            {!screenshotPreview ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => screenshotInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
                  isDragging 
                    ? 'border-slate-400 bg-white/5' 
                    : 'border-slate-300 dark:border-white/10 hover:border-slate-400 bg-slate-50/60 dark:bg-white/[0.02]'
                }`}
              >
                <input
                  ref={screenshotInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && e.target.files[0] && processScreenshotFile(e.target.files[0])}
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-3xl bg-white/10 text-white flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Camera className="w-7 h-7" />
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Toca para seleccionar captura de tu galería o arrástrala
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  💡 También puedes copiar la captura y pegarla aquí directamente (<span className="text-slate-300 font-mono">Ctrl+V / Cmd+V</span>)
                </p>

                {/* Supported app badges */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-5 max-w-md mx-auto">
                  {['Strava', 'Nike Run Club', 'Apple Fitness', 'Garmin Connect', 'Polar Flow', 'Coros', 'Whoop', 'Zwift'].map(app => (
                    <span key={app} className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-200/60 dark:bg-white/5 text-slate-600 dark:text-slate-300">
                      {app}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {isAnalyzingScreenshot ? (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-white/5 space-y-3">
                    <div className="w-10 h-10 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin mx-auto" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Gemini Vision analizando captura...
                    </h4>
                    <p className="text-xs text-slate-500">
                      Detectando app, duración, calorías quemadas, ritmo, frecuencia cardíaca y distancia.
                    </p>
                  </div>
                ) : extractedWorkout ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Thumbnail preview */}
                    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-black flex items-center justify-center max-h-80">
                      <img
                        src={screenshotPreview}
                        alt="Screenshot Preview"
                        className="object-contain max-h-80 w-full"
                      />
                    </div>

                    {/* Extracted Details & Confirmation */}
                    <div className="md:col-span-2 space-y-3.5 bg-slate-50 dark:bg-slate-900/40 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white uppercase">
                            {extractedWorkout.detectedApp || extractedWorkout.deviceSource}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            {extractedWorkout.date} · {extractedWorkout.time}
                          </span>
                        </div>
                        <button
                          onClick={() => { setExtractedWorkout(null); setScreenshotPreview(null); }}
                          className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Cambiar imagen</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                          Título del Entrenamiento
                        </label>
                        <input
                          type="text"
                          value={extractedWorkout.title}
                          onChange={(e) => setExtractedWorkout({ ...extractedWorkout, title: e.target.value })}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold rounded-xl px-3 py-2"
                        />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                          <span className="text-[10px] text-slate-400 block font-sans uppercase">Tiempo</span>
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {extractedWorkout.durationMinutes} min
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                          <span className="text-[10px] text-orange-500 block font-sans uppercase">Calorías</span>
                          <span className="text-sm font-extrabold text-orange-500">
                            +{extractedWorkout.caloriesBurned} kcal
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                          <span className="text-[10px] text-slate-400 block font-sans uppercase">Distancia</span>
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {extractedWorkout.distanceKm ? `${extractedWorkout.distanceKm} km` : 'N/A'}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                          <span className="text-[10px] text-rose-500 block font-sans uppercase">FC Media</span>
                          <span className="text-sm font-extrabold text-rose-500">
                            {extractedWorkout.avgHeartRate ? `${extractedWorkout.avgHeartRate} bpm` : 'N/A'}
                          </span>
                        </div>
                      </div>

                      {extractedWorkout.confidenceNotes && (
                        <p className="text-[11px] text-slate-500 italic">
                          💡 {extractedWorkout.confidenceNotes}
                        </p>
                      )}

                      <div className="pt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={handleConfirmScreenshotWorkout}
                          className="w-full sm:w-auto px-6 py-2.5 bg-[#1C1C1E] dark:bg-white text-white dark:text-black font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-95"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Guardar Entrenamiento (+{extractedWorkout.caloriesBurned} kcal)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 1: QUICK LOG FORM */}
      {activeTab === 'log' && (
        <div className="bg-white dark:bg-[#12131A] border border-slate-200/80 dark:border-white/5 rounded-3xl p-5 sm:p-7 shadow-md dark:shadow-black/40">
          <form onSubmit={handleManualSubmit} className="space-y-5">
            
            {/* Device preset selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Dispositivo de Registro
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'coros', label: 'Coros (Pace/Apex)' },
                  { id: 'polar', label: 'Polar (Vantage/Pacer)' },
                  { id: 'apple_fitness', label: 'Apple Watch Fitness' },
                  { id: 'manual', label: 'Manual / Garmin' }
                ].map((device) => (
                  <button
                    key={device.id}
                    type="button"
                    onClick={() => setDeviceSource(device.id as DeviceSource)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center cursor-pointer ${
                      deviceSource === device.id
                        ? 'bg-lime-400/20 border-lime-500 text-lime-700 dark:text-lime-400 font-bold'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {device.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sport selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Disciplina Deportiva
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { id: 'running', label: '🏃 Carrera en Ruta' },
                  { id: 'trail_running', label: '⛰️ Trail Running' },
                  { id: 'cycling_road', label: '🚴 Ciclismo' },
                  { id: 'cycling_indoor', label: '🚴 Rodillo Indoor' },
                  { id: 'strength_training', label: '🏋️ Gimnasio / Fuerza' },
                  { id: 'hiit', label: '⚡ HIIT / Funcional' },
                  { id: 'swimming', label: '🏊 Natación' },
                  { id: 'walking', label: '🚶 Caminata' },
                ].map((sport) => (
                  <button
                    key={sport.id}
                    type="button"
                    onClick={() => setActivityType(sport.id as ActivityType)}
                    className={`p-2.5 rounded-xl border transition-all text-left truncate cursor-pointer ${
                      activityType === sport.id
                        ? 'bg-slate-100 dark:bg-slate-800 border-lime-500 text-slate-900 dark:text-white font-bold'
                        : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {sport.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date, Time, Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Fecha del Entrenamiento
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-lime-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Hora de Inicio
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-lime-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Duración (Minutos)
                </label>
                <input
                  type="number"
                  min="1"
                  max="600"
                  required
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2.5 font-mono tabular-nums focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
              </div>
            </div>

            {/* Calories Burned, Heart Rate, Distance */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Calorías Quemadas (kcal)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder={`Estimado: ~${autoEstimatedCalories} kcal`}
                  value={caloriesBurnedInput}
                  onChange={(e) => setCaloriesBurnedInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2.5 font-mono tabular-nums focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Auto-calculado: {autoEstimatedCalories} kcal según peso ({profile.weightKg}kg).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  FC Promedio (BPM, Opcional)
                </label>
                <input
                  type="number"
                  placeholder="ej. 148"
                  value={avgHeartRate}
                  onChange={(e) => setAvgHeartRate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2.5 font-mono tabular-nums focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Distancia (km, Opcional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="ej. 10.5"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2.5 font-mono tabular-nums focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
              </div>
            </div>

            {/* Custom Title & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Nombre de la Sesión (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="ej. Series 5x1000m o Pierna Pesada"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Notas de Sensación (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="ej. RPE 7/10, buena recuperación"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3 bg-lime-400 hover:bg-lime-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-md shadow-lime-500/25 transition-all cursor-pointer active:scale-98"
              >
                + Guardar Entrenamiento y Recalcular TDEE
              </button>
            </div>

          </form>
        </div>
      )}

      {/* TAB 2: FILE IMPORT DRAG & DROP */}
      {activeTab === 'import' && (
        <div className="bg-white dark:bg-[#12131A] border border-slate-200/80 dark:border-white/5 rounded-3xl p-6 space-y-6 shadow-md dark:shadow-black/40">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Importador Directo de Actividades</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Exporta tu archivo desde <strong>Coros</strong>, <strong>Polar Flow</strong> o <strong>Apple Fitness</strong> (.tcx, .gpx o .json) y súbelo aquí. El sistema procesará calorías quemadas, frecuencia cardíaca y duración al instante.
            </p>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
              isDragging 
                ? 'border-lime-500 bg-lime-500/10' 
                : 'border-slate-300 dark:border-slate-700 hover:border-lime-500 bg-slate-50 dark:bg-slate-900/40'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".tcx,.gpx,.json,.xml"
              onChange={(e) => e.target.files && e.target.files[0] && processFile(e.target.files[0])}
              className="hidden"
            />

            <Upload className="w-10 h-10 text-lime-500 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {isProcessingFile ? 'Analizando archivo deportivo...' : 'Toca para elegir archivo o arrástralo'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Formatos compatibles: .TCX, .GPX, .JSON (Coros, Polar, Apple Watch, Garmin)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-orange-500 block mb-1">Coros Training Hub</span>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Abre cualquier actividad en Coros App &gt; Exportar datos &gt; .TCX o .GPX.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-sky-500 block mb-1">Polar Flow</span>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                polarflow.com &gt; Sesión de entrenamiento &gt; Más &gt; Exportar sesión (.TCX).
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-lime-600 dark:text-lime-400 block mb-1">Apple Watch / Fitness</span>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Usa HealthFit o exportación de Apple Health para generar archivos TCX/GPX.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WORKOUT HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-[#12131A] border border-slate-200/80 dark:border-white/5 rounded-3xl p-6 shadow-md dark:shadow-black/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Historial de Entrenamientos</h3>
            <span className="text-xs text-slate-500 font-mono">
              Total sesiones: {workouts.length}
            </span>
          </div>

          {workouts.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400">
              <Watch className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-600 mb-2" />
              <p className="text-sm">No hay sesiones de entrenamiento registradas aún.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {workouts
                .slice()
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((w) => (
                  <div key={w.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-500 font-medium">{w.date}</span>
                        {w.time && <span className="text-xs text-slate-400 font-mono">· {w.time}</span>}
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase">
                          {w.deviceSource}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                        {w.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono tabular-nums">
                        <span>⏱️ {w.durationMinutes} min</span>
                        {w.distanceKm && <span>· 📏 {w.distanceKm} km</span>}
                        {w.avgHeartRate && <span>· ❤️ {w.avgHeartRate} bpm</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-extrabold text-orange-500 dark:text-orange-400 font-mono tabular-nums">
                          +{w.caloriesBurned} kcal
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteWorkout(w.id)}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
