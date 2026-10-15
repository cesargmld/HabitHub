import React, { useState } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { SupermarketProduct } from '../types';

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
      packageSize: 'Bandeja fresca 800g',
      weightG: 800,
      priceMxn: 124.00,
      unitPricePerKgMxn: 155.00,
      brand: 'H-E-B Natural',
      pros: 'Consumo inmediato, sin congelar, porción pequeña'
    },
    costco: {
      packageSize: 'Bolsa sellada 2.5kg (congelada individual)',
      weightG: 2500,
      priceMxn: 279.00,
      unitPricePerKgMxn: 111.60,
      brand: 'Kirkland Signature',
      pros: 'Viene en porciones individuales al vacío, máxima frescura'
    },
    winner: 'costco',
    savingPercentage: 28.0,
    annualSavingMxn: 2256,
    recommendation: 'Costco es el claro ganador. Ahorras $43.40 MXN por cada kilo. Para un atleta que consume 1kg semanal, son más de $2,200 MXN al año.'
  },
  {
    barcode: '7501020556102',
    name: 'Claras de Huevo Líquidas Pasteurizadas',
    category: 'Proteínas / Desayuno',
    heb: {
      packageSize: 'Bote individual 1kg',
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
      pros: 'Misma marca de primera, caja refrigerada sellada'
    },
    winner: 'costco',
    savingPercentage: 20.2,
    annualSavingMxn: 1300,
    recommendation: 'Costco ahorra $12.50 MXN por litro. Como tienen caducidad de más de 45 días en frío, rinde perfecto para el mes sin riesgo de merma.'
  },
  {
    barcode: '7501030491823',
    name: 'Atún en Agua de Lomo Sólido',
    category: 'Proteínas / Alacena',
    heb: {
      packageSize: 'Lata individual 140g',
      weightG: 140,
      priceMxn: 23.50,
      unitPricePerKgMxn: 167.85,
      brand: 'Dolores Premium',
      pros: 'Compra exacta para un solo día'
    },
    costco: {
      packageSize: 'Pack de 8 latas x 140g (1.12kg)',
      weightG: 1120,
      priceMxn: 148.00,
      unitPricePerKgMxn: 132.14,
      brand: 'Dolores Premium',
      pros: 'Alacena no perecedera con caducidad de 3 años'
    },
    winner: 'costco',
    savingPercentage: 21.3,
    annualSavingMxn: 740,
    recommendation: 'El atún no caduca pronto. El pack de Costco te regala prácticamente 2 latas gratis respecto a comprarlas sueltas en H-E-B.'
  },
  {
    barcode: '7501008012904',
    name: 'Avena Entera en Hojuelas',
    category: 'Carbohidratos Complejos',
    heb: {
      packageSize: 'Bolsa 475g',
      weightG: 475,
      priceMxn: 34.00,
      unitPricePerKgMxn: 71.58,
      brand: 'Quaker Old Fashioned',
      pros: 'Fácil de guardar'
    },
    costco: {
      packageSize: 'Bolsa grande 1.8kg',
      weightG: 1800,
      priceMxn: 89.00,
      unitPricePerKgMxn: 49.44,
      brand: 'Quaker Old Fashioned',
      pros: 'Rinde 45 porciones de 40g de avena'
    },
    winner: 'costco',
    savingPercentage: 30.9,
    annualSavingMxn: 680,
    recommendation: 'En granos secos la diferencia es abismal: 31% más barata en Costco. Es el carbohidrato con mayor densidad nutricional por peso gastado.'
  },
  {
    barcode: '7501980004512',
    name: 'Aguacate Hass de Temporada',
    category: 'Grasas Saludables',
    heb: {
      packageSize: 'Malla 1kg (4-5 piezas en punto de maduración)',
      weightG: 1000,
      priceMxn: 54.00,
      unitPricePerKgMxn: 54.00,
      brand: 'H-E-B Frescos Selección',
      pros: 'Puedes escoger el grado de madurez exacto para hoy o mañana'
    },
    costco: {
      packageSize: 'Bolsa grande 2.2kg (8-10 piezas verdes)',
      weightG: 2200,
      priceMxn: 132.00,
      unitPricePerKgMxn: 60.00,
      brand: 'Hass Exportación',
      pros: 'Piezas calibre grande'
    },
    winner: 'heb',
    savingPercentage: 10.0,
    annualSavingMxn: 416,
    recommendation: 'Gana H-E-B por precio y nula merma. En Costco maduran todos al mismo tiempo y se suele desperdiciar el 30% si no cocinas para una familia grande.'
  },
  {
    barcode: '7501438901235',
    name: 'Proteína Whey Isolate 100%',
    category: 'Suplementos',
    heb: {
      packageSize: 'Bote 900g (30 servicios)',
      weightG: 900,
      priceMxn: 799.00,
      unitPricePerKgMxn: 887.77,
      brand: 'Optimum Nutrition / Sascha',
      pros: 'Menor desembolso inicial de contado'
    },
    costco: {
      packageSize: 'Bolsa 2.4kg (80 servicios)',
      weightG: 2400,
      priceMxn: 1349.00,
      unitPricePerKgMxn: 562.08,
      brand: 'Kirkland Signature / Optimum Nutrition',
      pros: 'Costo por servicio: $16.80 MXN vs $26.60 MXN'
    },
    winner: 'costco',
    savingPercentage: 36.7,
    annualSavingMxn: 3560,
    recommendation: 'Costco arrasa con 36.7% de ahorro. Pagas $16.80 MXN por scoop en lugar de $26.60 en H-E-B. Al año son más de $3,500 MXN en el bolsillo.'
  },
  {
    barcode: '7501112233445',
    name: 'Crema de Cacahuate 100% Natural Sin Azúcar',
    category: 'Grasas Saludables',
    heb: {
      packageSize: 'Frasco 450g',
      weightG: 450,
      priceMxn: 78.00,
      unitPricePerKgMxn: 173.33,
      brand: 'Aladino Natural / HEB Organics',
      pros: 'Frasco de vidrio mediano'
    },
    costco: {
      packageSize: 'Pack de 2 botes x 1kg (2kg total)',
      weightG: 2000,
      priceMxn: 239.00,
      unitPricePerKgMxn: 119.50,
      brand: 'Kirkland Signature Orgánica',
      pros: 'Solo cacahuate y sal marina de Valencia'
    },
    winner: 'costco',
    savingPercentage: 31.0,
    annualSavingMxn: 920,
    recommendation: 'Kirkland en Costco te ahorra 31%. Dura meses en el refrigerador sin echarse a perder. Excelente densidad calórica para corredores y atletas.'
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
  const [isScanningSimulation, setIsScanningSimulation] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredItems = BARCODE_DATABASE.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.barcode.includes(searchTerm) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const simulateCameraScan = (item: BarcodeComparisonItem) => {
    setIsScanningSimulation(true);
    setScanMessage(`Escaneando código de barras [${item.barcode}]...`);
    setTimeout(() => {
      setSelectedItem(item);
      setIsScanningSimulation(false);
      setScanMessage(`¡Producto detectado: ${item.name}!`);
      setTimeout(() => setScanMessage(null), 3000);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.1] rounded-[28px] max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 my-auto transition-colors">
        
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#A1FF00]/15 dark:bg-[#A1FF00]/20 flex items-center justify-center text-black dark:text-[#A1FF00]">
              <ScanLine className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-[#1C1C1E] dark:text-[#F5F5F7] tracking-tight">
                Escáner & Comparador de Súper
              </h3>
              <p className="text-[11px] text-[#8E8E93]">
                H-E-B (paquete individual) vs. Costco (caja volumen)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F2F2F7] hover:bg-[#E5E5EA] dark:bg-[#2C2C2E] dark:hover:bg-[#3A3A3C] flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Optical Scanner Viewport Simulation */}
        <div className="relative bg-black rounded-2xl p-4 overflow-hidden border border-white/10 text-white flex flex-col items-center justify-center min-h-[140px]">
          {/* Laser line animation */}
          <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-transparent via-[#FA114F] to-transparent shadow-[0_0_12px_#FA114F] animate-pulse" />
          
          {/* Corner brackets */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#A1FF00]" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#A1FF00]" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#A1FF00]" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#A1FF00]" />

          <ScanLine className="w-7 h-7 text-[#A1FF00] mb-2 animate-bounce opacity-80" />
          <span className="text-[12px] font-mono tracking-wider uppercase text-slate-300">
            {isScanningSimulation ? 'Leyendo código láser...' : 'Enfoca código de barras o busca abajo'}
          </span>
          {selectedItem && (
            <span className="text-[10px] text-[#A1FF00] font-mono mt-1">
              Último escaneo: {selectedItem.barcode}
            </span>
          )}
        </div>

        {scanMessage && (
          <div className="p-2.5 rounded-xl bg-[#A1FF00]/15 border border-[#A1FF00]/30 text-xs font-semibold text-[#1C1C1E] dark:text-[#A1FF00] text-center">
            {scanMessage}
          </div>
        )}

        {/* Quick Barcode / Product Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8E93]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código de barras o producto (ej: Pechuga, Huevos, Avena...)"
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-black/[0.04] dark:border-white/[0.08] rounded-full text-[#1C1C1E] dark:text-white placeholder-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-[#A1FF00]"
          />
        </div>

        {/* Quick Chips for Common Fitness Supermarket Items */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {BARCODE_DATABASE.map(item => (
            <button
              key={item.barcode}
              onClick={() => simulateCameraScan(item)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-full whitespace-nowrap transition-all cursor-pointer ${
                selectedItem?.barcode === item.barcode
                  ? 'bg-[#1C1C1E] text-white dark:bg-[#A1FF00] dark:text-black shadow-sm'
                  : 'bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
              }`}
            >
              {item.name.split(' ')[0]} {item.name.split(' ')[1] || ''}
            </button>
          ))}
        </div>

        {/* Comparative Result Breakdown Card */}
        {selectedItem && (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#007AFF]">
                  {selectedItem.category} · EAN {selectedItem.barcode}
                </span>
                <h4 className="text-[15px] font-bold text-[#1C1C1E] dark:text-[#F5F5F7] tracking-tight">
                  {selectedItem.name}
                </h4>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#A1FF00]/20 text-[#1C1C1E] dark:text-[#A1FF00]">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Ahorras {selectedItem.savingPercentage}%</span>
                </span>
              </div>
            </div>

            {/* Side-by-side: HEB vs Costco */}
            <div className="grid grid-cols-2 gap-2.5">
              
              {/* Option 1: H-E-B */}
              <div className={`p-3 rounded-2xl border transition-all ${
                selectedItem.winner === 'heb'
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border-black/[0.04] dark:border-white/[0.06]'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-[#FA114F] uppercase tracking-wide">
                    H-E-B México
                  </span>
                  {selectedItem.winner === 'heb' && (
                    <span className="text-[9px] font-bold uppercase bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">
                      Recomendado
                    </span>
                  )}
                </div>
                <div className="text-[18px] font-extrabold text-[#1C1C1E] dark:text-[#F5F5F7] font-mono tabular-nums leading-tight">
                  ${selectedItem.heb.priceMxn.toFixed(2)}
                  <span className="text-[10px] font-normal text-[#8E8E93] ml-1">MXN</span>
                </div>
                <p className="text-[10px] text-[#8E8E93] mt-0.5">{selectedItem.heb.packageSize}</p>
                <div className="mt-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.06] text-[10px] font-mono">
                  <span className="text-[#8E8E93]">Unitario: </span>
                  <span className="font-bold text-[#1C1C1E] dark:text-white">
                    ${selectedItem.heb.unitPricePerKgMxn.toFixed(2)}/kg
                  </span>
                </div>
                <p className="text-[10px] text-[#8E8E93] mt-1 line-clamp-2">
                  {selectedItem.heb.pros}
                </p>
                
                {onSelectProductForCart && (
                  <button
                    onClick={() => onSelectProductForCart(selectedItem.name, 'heb', selectedItem.heb.priceMxn)}
                    className="w-full mt-2 py-1.5 px-2 bg-white dark:bg-[#3A3A3C] hover:bg-[#E5E5EA] text-[#1C1C1E] dark:text-white text-[10px] font-bold rounded-xl border border-black/5 dark:border-white/10 transition-colors cursor-pointer"
                  >
                    Elegir H-E-B
                  </button>
                )}
              </div>

              {/* Option 2: Costco */}
              <div className={`p-3 rounded-2xl border transition-all ${
                selectedItem.winner === 'costco'
                  ? 'bg-[#A1FF00]/10 border-[#A1FF00]/30'
                  : 'bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border-black/[0.04] dark:border-white/[0.06]'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-[#007AFF] uppercase tracking-wide">
                    Costco México
                  </span>
                  {selectedItem.winner === 'costco' && (
                    <span className="text-[9px] font-bold uppercase bg-[#A1FF00] text-black px-1.5 py-0.5 rounded-full">
                      Recomendado
                    </span>
                  )}
                </div>
                <div className="text-[18px] font-extrabold text-[#1C1C1E] dark:text-[#F5F5F7] font-mono tabular-nums leading-tight">
                  ${selectedItem.costco.priceMxn.toFixed(2)}
                  <span className="text-[10px] font-normal text-[#8E8E93] ml-1">MXN</span>
                </div>
                <p className="text-[10px] text-[#8E8E93] mt-0.5">{selectedItem.costco.packageSize}</p>
                <div className="mt-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.06] text-[10px] font-mono">
                  <span className="text-[#8E8E93]">Unitario: </span>
                  <span className="font-bold text-[#A1FF00]">
                    ${selectedItem.costco.unitPricePerKgMxn.toFixed(2)}/kg
                  </span>
                </div>
                <p className="text-[10px] text-[#8E8E93] mt-1 line-clamp-2">
                  {selectedItem.costco.pros}
                </p>

                {onSelectProductForCart && (
                  <button
                    onClick={() => onSelectProductForCart(selectedItem.name, 'costco', selectedItem.costco.priceMxn)}
                    className="w-full mt-2 py-1.5 px-2 bg-[#A1FF00] hover:bg-[#8FE000] text-black text-[10px] font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Elegir Costco
                  </button>
                )}
              </div>

            </div>

            {/* Smart Verdict Box */}
            <div className="p-3 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-2xl border border-black/[0.04] dark:border-white/[0.08] flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#A1FF00] shrink-0 mt-0.5" />
              <div className="text-[11px] text-[#1C1C1E] dark:text-[#F5F5F7] leading-relaxed">
                <span className="font-bold">Veredicto del Optimizador: </span>
                {selectedItem.recommendation}
                <span className="block font-bold text-emerald-600 dark:text-[#A1FF00] mt-1">
                  💰 Ahorro anual proyectado para tu consumo: ${selectedItem.annualSavingMxn.toLocaleString()} MXN
                </span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
