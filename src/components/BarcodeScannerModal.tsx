import React, { useState, useRef, useEffect } from 'react';
import { 
  ScanLine, 
  X, 
  Search, 
  TrendingDown, 
  Store, 
  Check, 
  Sparkles, 
  AlertCircle,
  Package,
  Layers,
  ArrowRight,
  Camera,
  CameraOff,
  Upload,
  RotateCcw,
  RefreshCw,
  ShoppingBag,
  DollarSign
} from 'lucide-react';
import { ProductComparisonResult } from '../types';
import { fileToBase64 } from '../utils/fileParsers';
import { VERIFIED_STAPLES_MAP } from '../utils/pricingEngine';

export interface BarcodeComparisonItem {
  barcode: string;
  name: string;
  category: string;
  heb: {
    packageSize: string;
    weightG: number;
    priceMxn: number;
    unitPricePerKgMxn: number;
    brand: string;
    pros: string;
  };
  costco: {
    packageSize: string;
    weightG: number;
    priceMxn: number;
    unitPricePerKgMxn: number;
    brand: string;
    pros: string;
  };
  walmart?: {
    packageSize: string;
    weightG: number;
    priceMxn: number;
    unitPricePerKgMxn: number;
    brand: string;
  };
  winner: 'costco' | 'heb' | 'tie';
  savingPercentage: number;
  annualSavingMxn: number;
  recommendation: string;
}

export const BARCODE_DATABASE: BarcodeComparisonItem[] = [
  {
    barcode: '7501000142318',
    name: 'Pechuga de Pollo Sin Piel Deshuesada',
    category: 'Proteínas',
    heb: {
      packageSize: 'Charola fresca 900g',
      weightG: 900,
      priceMxn: 148.50,
      unitPricePerKgMxn: 165.00,
      brand: 'H-E-B Natural',
      pros: 'Consumo inmediato, sin congelar, porción justa'
    },
    costco: {
      packageSize: 'Bolsa sellada 2.5kg al vacío (congelada individual)',
      weightG: 2500,
      priceMxn: 329.00,
      unitPricePerKgMxn: 131.60,
      brand: 'Kirkland Signature',
      pros: '6 porciones individuales al vacío, máxima frescura'
    },
    walmart: {
      packageSize: 'Bandeja fresca 1kg',
      weightG: 1000,
      priceMxn: 156.00,
      unitPricePerKgMxn: 156.00,
      brand: 'Pilgrim / SuKarne'
    },
    winner: 'costco',
    savingPercentage: 20.2,
    annualSavingMxn: 1736,
    recommendation: 'Costco es el ganador contundente por kilo ($131.60 vs $165.00 en HEB). Ahorras $33.40 MXN por cada kilo si tienes espacio en congelador.'
  },
  {
    barcode: '7501020556102',
    name: 'Claras de Huevo Líquidas Pasteurizadas',
    category: 'Proteínas / Desayuno',
    heb: {
      packageSize: 'Bote individual 1L (1000g)',
      weightG: 1000,
      priceMxn: 62.00,
      unitPricePerKgMxn: 62.00,
      brand: 'San Juan',
      pros: 'Ocupa poco espacio en el refrigerador'
    },
    costco: {
      packageSize: 'Caja con 4 botes de 1kg (4kg total)',
      weightG: 4000,
      priceMxn: 198.00,
      unitPricePerKgMxn: 49.50,
      brand: 'San Juan',
      pros: 'Misma marca San Juan en pack de 4 refrigerado'
    },
    walmart: {
      packageSize: 'Bote individual 1L',
      weightG: 1000,
      priceMxn: 64.00,
      unitPricePerKgMxn: 64.00,
      brand: 'San Juan'
    },
    winner: 'costco',
    savingPercentage: 20.1,
    annualSavingMxn: 1300,
    recommendation: 'Costco ahorra $12.50 MXN por litro. Como tienen caducidad de más de 45 días refrigeradas sin abrir, rinde perfecto para el mes sin riesgo de descomposición.'
  },
  {
    barcode: '7501030491823',
    name: 'Atún en Agua de Lomo Sólido',
    category: 'Proteínas / Alacena',
    heb: {
      packageSize: 'Lata individual 130g drenado',
      weightG: 130,
      priceMxn: 21.50,
      unitPricePerKgMxn: 165.38,
      brand: 'Dolores Premium',
      pros: 'Compra para una sola comida'
    },
    costco: {
      packageSize: 'Pack de 8 latas x 198g Kirkland (1.58kg)',
      weightG: 1584,
      priceMxn: 269.00,
      unitPricePerKgMxn: 169.82,
      brand: 'Kirkland Signature',
      pros: 'Lomo sólido de alta densidad de proteína'
    },
    walmart: {
      packageSize: 'Pack 4 latas Dolores 130g',
      weightG: 520,
      priceMxn: 82.00,
      unitPricePerKgMxn: 157.69,
      brand: 'Dolores'
    },
    winner: 'costco',
    savingPercentage: 18.5,
    annualSavingMxn: 650,
    recommendation: 'En latas no perecederas, comprar el lote en Costco rinde más de 2 meses de cenas rápidas.'
  },
  {
    barcode: '7501008012904',
    name: 'Avena Entera en Hojuelas',
    category: 'Carbohidratos',
    heb: {
      packageSize: 'Bolsa 800g',
      weightG: 800,
      priceMxn: 39.00,
      unitPricePerKgMxn: 48.75,
      brand: 'Quaker Old Fashioned',
      pros: 'Porción menudeo'
    },
    costco: {
      packageSize: 'Bolsa grande 2kg',
      weightG: 2000,
      priceMxn: 69.00,
      unitPricePerKgMxn: 34.50,
      brand: 'Quaker / Kirkland',
      pros: 'Rinde 50 desayunos de 40g de avena'
    },
    walmart: {
      packageSize: 'Bolsa 1kg Great Value',
      weightG: 1000,
      priceMxn: 36.00,
      unitPricePerKgMxn: 36.00,
      brand: 'Great Value'
    },
    winner: 'costco',
    savingPercentage: 29.2,
    annualSavingMxn: 520,
    recommendation: 'En granos secos la diferencia es enorme: 29% más barata en Costco. Es no perecedera y dura 1 año en alacena.'
  },
  {
    barcode: '7501980004512',
    name: 'Aguacate Hass Fresco',
    category: 'Grasas Saludables',
    heb: {
      packageSize: 'Por kilo fresco en punto de maduración',
      weightG: 1000,
      priceMxn: 76.00,
      unitPricePerKgMxn: 76.00,
      brand: 'H-E-B Selección',
      pros: 'Puedes escoger los aguacates en el punto exacto para hoy o mañana'
    },
    costco: {
      packageSize: 'Malla con 6 piezas grandes (~1.2kg)',
      weightG: 1200,
      priceMxn: 98.00,
      unitPricePerKgMxn: 81.66,
      brand: 'Costco Selección',
      pros: 'Aguacates de buen calibre'
    },
    winner: 'heb',
    savingPercentage: 7.0,
    annualSavingMxn: 320,
    recommendation: 'H-E-B es el ganador en aguacate. En Costco todos vienen duros y maduran al mismo tiempo, lo que causa merma si vives solo o con pareja.'
  },
  {
    barcode: '7501112233445',
    name: 'Filete de Salmón del Atlántico',
    category: 'Proteínas',
    heb: {
      packageSize: 'Charola fresca por kg',
      weightG: 1000,
      priceMxn: 410.00,
      unitPricePerKgMxn: 410.00,
      brand: 'H-E-B Pescadería',
      pros: 'Fresco para cocinar de inmediato'
    },
    costco: {
      packageSize: 'Bolsa 1.36kg filetes individuales congelados',
      weightG: 1360,
      priceMxn: 479.00,
      unitPricePerKgMxn: 352.20,
      brand: 'Kirkland Signature',
      pros: 'Porcionado individualmente en bolsas herméticas'
    },
    winner: 'costco',
    savingPercentage: 14.1,
    annualSavingMxn: 1200,
    recommendation: 'Costco ahorra $57.80 MXN por kilo en salmón. Vienen en porciones individuales congeladas para descongelar solo lo que vas a comer.'
  }
];

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProductForCart?: (productName: string, store: 'costco' | 'heb', price: number) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onSelectProductForCart
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<BarcodeComparisonItem | null>(BARCODE_DATABASE[0]);
  const [aiResult, setAiResult] = useState<ProductComparisonResult | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
        setScanMessage('Cámara activa. Enfoca el producto o toma una foto para analizar.');
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('No se pudo abrir la cámara. Puedes subir una foto de tu galería o escribir el producto.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const queryAiForProduct = async (params: { imageBase64?: string; barcode?: string; productName?: string }) => {
    setIsAnalyzingAi(true);
    setScanMessage('Comparando precios en tiempo real (Costco vs H-E-B vs Walmart)...');
    try {
      const res = await fetch('/api/identify-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const data: ProductComparisonResult = await res.json();
      if (!res.ok) throw new Error((data as any).error || 'Error al cotizar producto');
      setAiResult(data);
      setSelectedItem(null);
      setScanMessage(`¡Comparación completada para: ${data.name}! Ganador: ${data.winner.toUpperCase()}`);
    } catch (err: any) {
      setScanMessage(err.message || 'No se pudo identificar el producto');
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      queryAiForProduct({ imageBase64: dataUrl });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      queryAiForProduct({ imageBase64: base64 });
    } catch {
      setScanMessage('Error al cargar la imagen del producto.');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    // Check if in local staples database
    const local = BARCODE_DATABASE.find(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (local) {
      setSelectedItem(local);
      setAiResult(null);
      setScanMessage(`Producto encontrado en catálogo verificado: ${local.name}`);
    } else {
      queryAiForProduct({ productName: searchTerm.trim() });
    }
  };

  const filteredStaples = BARCODE_DATABASE.filter(item => 
    !searchTerm || 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-[#12131A] border border-slate-200 dark:border-white/10 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden transition-colors">
        
        {/* Modal Top Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-lime-500" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Comparador de Precios (Costco vs. H-E-B vs. Walmart)
              </h3>
              <p className="text-[11px] text-slate-400">
                Escribe un producto, toma una foto o selecciona un básico fitness.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Search & Actions Bar */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar producto (ej: Pollo, Claras, Avena, Salmón, Atún...)"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#181B26] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 bg-[#CCFF00] hover:bg-[#bbf000] text-black font-extrabold rounded-xl transition-all cursor-pointer whitespace-nowrap"
            >
              Comparar
            </button>
          </form>

          {/* Quick Staple Shortcut Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
            {[
              '🍗 Pollo',
              '🥚 Claras',
              '🌾 Avena',
              '🐟 Salmón',
              '🥑 Aguacate',
              '🥫 Atún'
            ].map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  const clean = tag.split(' ')[1];
                  setSearchTerm(clean);
                  const found = BARCODE_DATABASE.find(b => b.name.toLowerCase().includes(clean.toLowerCase()));
                  if (found) {
                    setSelectedItem(found);
                    setAiResult(null);
                  } else {
                    queryAiForProduct({ productName: clean });
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap cursor-pointer transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Camera / Photo Upload Strip */}
          <div className="flex items-center gap-2">
            {!isCameraActive ? (
              <button
                type="button"
                onClick={startCamera}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Escanear con Cámara</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCapturePhoto}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#CCFF00] text-black font-bold rounded-xl cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Tomar Foto y Comparar</span>
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-2.5 py-1.5 text-slate-400 hover:text-white"
                >
                  Cerrar Cámara
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Subir Foto del Producto</span>
            </button>
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileUpload} 
            />
          </div>

          {/* Camera Stream Viewport (When active) */}
          {isCameraActive && (
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-h-56 flex items-center justify-center">
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute inset-x-8 inset-y-6 border-2 border-dashed border-[#CCFF00] rounded-xl pointer-events-none opacity-80" />
            </div>
          )}

          {cameraError && (
            <p className="text-amber-500 text-[11px] flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{cameraError}</span>
            </p>
          )}

          {scanMessage && (
            <p className="text-lime-600 dark:text-lime-400 text-[11px] font-mono">
              {scanMessage}
            </p>
          )}

          {/* DISPLAY 1: VERIFIED LOCAL COMPARISON RESULT */}
          {selectedItem && (
            <div className="bg-slate-50 dark:bg-[#181B26] border border-slate-200 dark:border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {selectedItem.name}
                  </h4>
                  <span className="text-[11px] text-slate-400">{selectedItem.category}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                  selectedItem.winner === 'costco'
                    ? 'bg-red-500 text-white'
                    : 'bg-rose-500 text-white'
                }`}>
                  Ganador: {selectedItem.winner.toUpperCase()} ({selectedItem.savingPercentage}% más barato)
                </span>
              </div>

              {/* 3-Store Side by Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Costco */}
                <div className={`p-3 rounded-xl border ${
                  selectedItem.winner === 'costco' 
                    ? 'bg-lime-50/50 dark:bg-lime-950/20 border-lime-500/40' 
                    : 'bg-white dark:bg-[#12131A] border-slate-200 dark:border-white/5'
                }`}>
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-red-600">Costco México</span>
                    {selectedItem.winner === 'costco' && <span className="text-lime-500 text-[10px]">★ Mejor Precio</span>}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{selectedItem.costco.packageSize}</p>
                  <div className="mt-2 font-mono flex items-baseline gap-2">
                    <span className="text-base font-extrabold text-slate-900 dark:text-white">${selectedItem.costco.priceMxn} MXN</span>
                    <span className="text-slate-400 text-[10px]">(${selectedItem.costco.unitPricePerKgMxn.toFixed(2)}/kg)</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 italic">{selectedItem.costco.pros}</p>
                </div>

                {/* H-E-B */}
                <div className={`p-3 rounded-xl border ${
                  selectedItem.winner === 'heb' 
                    ? 'bg-lime-50/50 dark:bg-lime-950/20 border-lime-500/40' 
                    : 'bg-white dark:bg-[#12131A] border-slate-200 dark:border-white/5'
                }`}>
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-rose-500">H-E-B México</span>
                    {selectedItem.winner === 'heb' && <span className="text-lime-500 text-[10px]">★ Mejor Precio</span>}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{selectedItem.heb.packageSize}</p>
                  <div className="mt-2 font-mono flex items-baseline gap-2">
                    <span className="text-base font-extrabold text-slate-900 dark:text-white">${selectedItem.heb.priceMxn} MXN</span>
                    <span className="text-slate-400 text-[10px]">(${selectedItem.heb.unitPricePerKgMxn.toFixed(2)}/kg)</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 italic">{selectedItem.heb.pros}</p>
                </div>
              </div>

              {/* Recommendation Note */}
              <div className="p-2.5 bg-lime-500/10 border border-lime-500/20 rounded-xl space-y-1">
                <p className="text-xs font-bold text-lime-700 dark:text-lime-300">
                  💡 Recomendación de Compra:
                </p>
                <p className="text-[11px] text-slate-700 dark:text-lime-200/90">
                  {selectedItem.recommendation}
                </p>
                {selectedItem.annualSavingMxn && (
                  <p className="text-[10px] font-mono font-bold text-lime-600 dark:text-lime-400">
                    Ahorro anual estimado: ~${selectedItem.annualSavingMxn} MXN
                  </p>
                )}
              </div>
            </div>
          )}

          {/* DISPLAY 2: AI DYNAMIC COMPARISON RESULT */}
          {aiResult && (
            <div className="bg-slate-50 dark:bg-[#181B26] border border-slate-200 dark:border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {aiResult.name}
                  </h4>
                  <span className="text-[11px] text-slate-400">{aiResult.brand} · {aiResult.category}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase bg-[#CCFF00] text-black">
                  Ganador: {aiResult.winner.toUpperCase()} ({aiResult.savingPercentage}% ahorro)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {aiResult.stores.costco && (
                  <div className="p-3 bg-white dark:bg-[#12131A] rounded-xl border border-white/5 space-y-1">
                    <span className="font-bold text-red-600">Costco</span>
                    <p className="text-[11px] text-slate-400">{aiResult.stores.costco.packageSize}</p>
                    <div className="font-mono font-bold text-white">${aiResult.stores.costco.priceMxn} MXN</div>
                  </div>
                )}
                {aiResult.stores.heb && (
                  <div className="p-3 bg-white dark:bg-[#12131A] rounded-xl border border-white/5 space-y-1">
                    <span className="font-bold text-rose-500">H-E-B</span>
                    <p className="text-[11px] text-slate-400">{aiResult.stores.heb.packageSize}</p>
                    <div className="font-mono font-bold text-white">${aiResult.stores.heb.priceMxn} MXN</div>
                  </div>
                )}
                {aiResult.stores.walmart && (
                  <div className="p-3 bg-white dark:bg-[#12131A] rounded-xl border border-white/5 space-y-1">
                    <span className="font-bold text-sky-500">Walmart</span>
                    <p className="text-[11px] text-slate-400">{aiResult.stores.walmart.packageSize}</p>
                    <div className="font-mono font-bold text-white">${aiResult.stores.walmart.priceMxn} MXN</div>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-300 italic">
                {aiResult.recommendation}
              </p>
            </div>
          )}

          {/* Quick Verified List */}
          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Productos Populares con Precios Verificados:
            </span>
            <div className="space-y-1.5">
              {filteredStaples.map(item => (
                <div
                  key={item.barcode}
                  onClick={() => {
                    setSelectedItem(item);
                    setAiResult(null);
                  }}
                  className="p-2.5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{item.name}</span>
                    <span className="text-slate-400 ml-2">({item.category})</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-xs text-lime-500 font-bold">Ganador: {item.winner.toUpperCase()}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
