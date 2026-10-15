import { IngredientRequirement, MealDish, SupermarketProduct } from '../types';

export interface VerifiedStaplePrice {
  name: string;
  category: 'protein' | 'carbs' | 'vegetables' | 'fruits' | 'dairy' | 'healthy_fats' | 'supplements';
  isPerishable: boolean; // True = buy weekly/biweekly in HEB; False = buy monthly in Costco
  shelfLifeDays: number;
  stores: {
    costco?: {
      packageName: string;
      weightG: number;
      priceMxn: number;
      unitPricePerKgMxn: number;
    };
    heb: {
      packageName: string;
      weightG: number;
      priceMxn: number;
      unitPricePerKgMxn: number;
    };
    walmart?: {
      packageName: string;
      weightG: number;
      priceMxn: number;
      unitPricePerKgMxn: number;
    };
  };
  defaultGramsPriceMxn: number; // Price per gram
}

export const VERIFIED_STAPLES_MAP: Record<string, VerifiedStaplePrice> = {
  'pollo': {
    name: 'Pechuga de Pollo Sin Hueso Sin Piel',
    category: 'protein',
    isPerishable: false, // Kirkland comes frozen in sealed individual vacuum packs!
    shelfLifeDays: 90,
    stores: {
      costco: { packageName: 'Bolsa resellable 2.5kg Kirkland en porciones al vacío', weightG: 2500, priceMxn: 329, unitPricePerKgMxn: 131.60 },
      heb: { packageName: 'Charola fresca 900g Pechuga Natural H-E-B', weightG: 900, priceMxn: 148.50, unitPricePerKgMxn: 165.00 },
      walmart: { packageName: 'Bandeja fresca 1kg SuKarne / Pilgrim', weightG: 1000, priceMxn: 156.00, unitPricePerKgMxn: 156.00 }
    },
    defaultGramsPriceMxn: 0.14 // $140 / kg
  },
  'salmon': {
    name: 'Filete de Salmón del Atlántico Porcionado',
    category: 'protein',
    isPerishable: false, // Kirkland comes flash frozen in individual portions
    shelfLifeDays: 90,
    stores: {
      costco: { packageName: 'Bolsa 1.36kg Kirkland porciones individuales', weightG: 1360, priceMxn: 479, unitPricePerKgMxn: 352.20 },
      heb: { packageName: 'Filete fresco en charola por kg', weightG: 1000, priceMxn: 410, unitPricePerKgMxn: 410.00 },
      walmart: { packageName: 'Filete congelado Marketside 500g', weightG: 500, priceMxn: 215, unitPricePerKgMxn: 430.00 }
    },
    defaultGramsPriceMxn: 0.36
  },
  'pescado': {
    name: 'Filete de Tilapia / Pescado Blanco',
    category: 'protein',
    isPerishable: false,
    shelfLifeDays: 60,
    stores: {
      costco: { packageName: 'Bolsa 1.5kg filetes individuales Kirkland', weightG: 1500, priceMxn: 219, unitPricePerKgMxn: 146.00 },
      heb: { packageName: 'Filete fresco charola 600g', weightG: 600, priceMxn: 98, unitPricePerKgMxn: 163.33 },
      walmart: { packageName: 'Bolsa 1kg Marketside', weightG: 1000, priceMxn: 152, unitPricePerKgMxn: 152.00 }
    },
    defaultGramsPriceMxn: 0.145
  },
  'res': {
    name: 'Carne Magra de Res / Milanesa o Molida 90/10',
    category: 'protein',
    isPerishable: true,
    shelfLifeDays: 4,
    stores: {
      costco: { packageName: 'Charola mayoreo 2.2kg molida magra 90/10', weightG: 2200, priceMxn: 395, unitPricePerKgMxn: 179.55 },
      heb: { packageName: 'Milanesa pulpa blanca / bola de res 1kg', weightG: 1000, priceMxn: 215, unitPricePerKgMxn: 215.00 },
      walmart: { packageName: 'Carne molida especial 1kg', weightG: 1000, priceMxn: 198, unitPricePerKgMxn: 198.00 }
    },
    defaultGramsPriceMxn: 0.19
  },
  'pavo': {
    name: 'Pechuga o Carne Molida de Pavo',
    category: 'protein',
    isPerishable: true,
    shelfLifeDays: 5,
    stores: {
      costco: { packageName: 'Pechuga de pavo ahumada o molida congelada 1.5kg', weightG: 1500, priceMxn: 360, unitPricePerKgMxn: 240.00 },
      heb: { packageName: 'Carne molida de pavo 454g Butterball', weightG: 454, priceMxn: 92, unitPricePerKgMxn: 202.64 },
      walmart: { packageName: 'Pechuga de pavo San Rafael 250g', weightG: 250, priceMxn: 72, unitPricePerKgMxn: 288.00 }
    },
    defaultGramsPriceMxn: 0.25
  },
  'huevo': {
    name: 'Huevo Blanco Fresco Grande',
    category: 'protein',
    isPerishable: true,
    shelfLifeDays: 28,
    stores: {
      costco: { packageName: 'Caja 60 piezas San Juan (~3.6kg)', weightG: 3600, priceMxn: 195, unitPricePerKgMxn: 54.16 },
      heb: { packageName: 'Tapa 30 piezas San Juan', weightG: 1800, priceMxn: 102, unitPricePerKgMxn: 56.66 },
      walmart: { packageName: 'Paquete 30 piezas Bachoco', weightG: 1800, priceMxn: 98, unitPricePerKgMxn: 54.44 }
    },
    defaultGramsPriceMxn: 0.056 // ~$2.80 per 50g egg
  },
  'claras': {
    name: 'Claras de Huevo Pasteurizadas Líquidas',
    category: 'protein',
    isPerishable: true,
    shelfLifeDays: 25,
    stores: {
      costco: { packageName: 'Pack 4 botes de 1kg San Juan (4kg)', weightG: 4000, priceMxn: 198, unitPricePerKgMxn: 49.50 },
      heb: { packageName: 'Botella 1kg San Juan', weightG: 1000, priceMxn: 62, unitPricePerKgMxn: 62.00 },
      walmart: { packageName: 'Botella 1kg San Juan', weightG: 1000, priceMxn: 64, unitPricePerKgMxn: 64.00 }
    },
    defaultGramsPriceMxn: 0.048
  },
  'atun': {
    name: 'Atún en Agua en Lata (Dolores / Kirkland)',
    category: 'protein',
    isPerishable: false,
    shelfLifeDays: 730,
    stores: {
      costco: { packageName: 'Pack de 8 latas 198g Kirkland sólido', weightG: 1584, priceMxn: 269, unitPricePerKgMxn: 169.82 },
      heb: { packageName: 'Lata individual Dolores en agua 130g', weightG: 130, priceMxn: 21.50, unitPricePerKgMxn: 165.38 },
      walmart: { packageName: 'Pack 4 latas Dolores 130g', weightG: 520, priceMxn: 82, unitPricePerKgMxn: 157.69 }
    },
    defaultGramsPriceMxn: 0.17
  },
  'avena': {
    name: 'Avena en Hojuelas Grano Entero',
    category: 'carbs',
    isPerishable: false,
    shelfLifeDays: 365,
    stores: {
      costco: { packageName: 'Bolsa 2kg Quaker / Kirkland', weightG: 2000, priceMxn: 69, unitPricePerKgMxn: 34.50 },
      heb: { packageName: 'Bolsa 800g Quaker Old Fashioned', weightG: 800, priceMxn: 39, unitPricePerKgMxn: 48.75 },
      walmart: { packageName: 'Bolsa 1kg Great Value', weightG: 1000, priceMxn: 36, unitPricePerKgMxn: 36.00 }
    },
    defaultGramsPriceMxn: 0.035
  },
  'arroz': {
    name: 'Arroz Grano Entero (Crudo / Cocido)',
    category: 'carbs',
    isPerishable: false,
    shelfLifeDays: 365,
    stores: {
      costco: { packageName: 'Bolsa 5kg Arroz Jazmín o Morelos', weightG: 5000, priceMxn: 169, unitPricePerKgMxn: 33.80 },
      heb: { packageName: 'Bolsa 1kg Arroz Morelos H-E-B', weightG: 1000, priceMxn: 38, unitPricePerKgMxn: 38.00 },
      walmart: { packageName: 'Bolsa 900g Verde Valle', weightG: 900, priceMxn: 37, unitPricePerKgMxn: 41.11 }
    },
    defaultGramsPriceMxn: 0.013 // cocido rinde x3
  },
  'quinoa': {
    name: 'Quinoa Orgánica Blanca / Mixta',
    category: 'carbs',
    isPerishable: false,
    shelfLifeDays: 365,
    stores: {
      costco: { packageName: 'Bolsa 2kg Kirkland Orgánica', weightG: 2000, priceMxn: 219, unitPricePerKgMxn: 109.50 },
      heb: { packageName: 'Bolsa 500g Verde Valle', weightG: 500, priceMxn: 76, unitPricePerKgMxn: 152.00 },
      walmart: { packageName: 'Bolsa 450g Great Value', weightG: 450, priceMxn: 68, unitPricePerKgMxn: 151.11 }
    },
    defaultGramsPriceMxn: 0.052
  },
  'papa': {
    name: 'Papa Blanca / Galeana',
    category: 'carbs',
    isPerishable: true,
    shelfLifeDays: 14,
    stores: {
      costco: { packageName: 'Bolsa malla 4.5kg Papa Blanca', weightG: 4500, priceMxn: 129, unitPricePerKgMxn: 28.66 },
      heb: { packageName: 'Papa blanca a granel fresca 1kg', weightG: 1000, priceMxn: 34, unitPricePerKgMxn: 34.00 },
      walmart: { packageName: 'Papa blanca a granel 1kg', weightG: 1000, priceMxn: 32, unitPricePerKgMxn: 32.00 }
    },
    defaultGramsPriceMxn: 0.032
  },
  'camote': {
    name: 'Camote Amarillo / Naranja',
    category: 'carbs',
    isPerishable: true,
    shelfLifeDays: 14,
    stores: {
      heb: { packageName: 'Camote a granel por kg', weightG: 1000, priceMxn: 38, unitPricePerKgMxn: 38.00 },
      walmart: { packageName: 'Camote por kg', weightG: 1000, priceMxn: 36, unitPricePerKgMxn: 36.00 }
    },
    defaultGramsPriceMxn: 0.038
  },
  'tortilla': {
    name: 'Tortillas de Maíz Nixtamalizadas',
    category: 'carbs',
    isPerishable: true,
    shelfLifeDays: 7,
    stores: {
      costco: { packageName: 'Paquete 2kg Tortillas de maíz Milpa Real', weightG: 2000, priceMxn: 46, unitPricePerKgMxn: 23.00 },
      heb: { packageName: 'Kilo de tortilla de maíz calientita en tortillería H-E-B', weightG: 1000, priceMxn: 24, unitPricePerKgMxn: 24.00 },
      walmart: { packageName: 'Kilo de tortilla tortillería Walmart', weightG: 1000, priceMxn: 23, unitPricePerKgMxn: 23.00 }
    },
    defaultGramsPriceMxn: 0.024 // ~$0.65 per tortilla
  },
  'pan': {
    name: 'Pan Integral de Grano Entero (Oroweat / Cero Cero)',
    category: 'carbs',
    isPerishable: true,
    shelfLifeDays: 12,
    stores: {
      costco: { packageName: 'Twin pack 2 hogazas Oroweat 12 Granos (1.5kg)', weightG: 1500, priceMxn: 119, unitPricePerKgMxn: 79.33 },
      heb: { packageName: 'Bolsa 680g Bimbo Cero Cero o Oroweat', weightG: 680, priceMxn: 72, unitPricePerKgMxn: 105.88 },
      walmart: { packageName: 'Bolsa 680g Bimbo Cero Cero', weightG: 680, priceMxn: 69, unitPricePerKgMxn: 101.47 }
    },
    defaultGramsPriceMxn: 0.09 // ~$3.40 per slice
  },
  'ejotes': {
    name: 'Ejotes Tiernos Frescos',
    category: 'vegetables',
    isPerishable: true,
    shelfLifeDays: 5,
    stores: {
      heb: { packageName: 'Bolsa 500g ejote limpio seleccionado', weightG: 500, priceMxn: 24.50, unitPricePerKgMxn: 49.00 },
      walmart: { packageName: 'Ejote a granel por kg', weightG: 1000, priceMxn: 46, unitPricePerKgMxn: 46.00 }
    },
    defaultGramsPriceMxn: 0.048
  },
  'calabacita': {
    name: 'Calabacita Italiana Fresca',
    category: 'vegetables',
    isPerishable: true,
    shelfLifeDays: 6,
    stores: {
      heb: { packageName: 'Calabacita italiana a granel seleccionada', weightG: 1000, priceMxn: 34, unitPricePerKgMxn: 34.00 },
      walmart: { packageName: 'Calabacita a granel', weightG: 1000, priceMxn: 32, unitPricePerKgMxn: 32.00 }
    },
    defaultGramsPriceMxn: 0.034
  },
  'espinacas': {
    name: 'Espinacas Baby Frescas / Lavadas',
    category: 'vegetables',
    isPerishable: true,
    shelfLifeDays: 5,
    stores: {
      costco: { packageName: 'Domo gigante 454g espinaca baby orgánica', weightG: 454, priceMxn: 58, unitPricePerKgMxn: 127.75 },
      heb: { packageName: 'Domo 280g espinaca limpia seleccionada H-E-B', weightG: 280, priceMxn: 39, unitPricePerKgMxn: 139.28 },
      walmart: { packageName: 'Bolsa 250g Mr. Lucky', weightG: 250, priceMxn: 38, unitPricePerKgMxn: 152.00 }
    },
    defaultGramsPriceMxn: 0.12
  },
  'champinones': {
    name: 'Champiñones Frescos Rebanados',
    category: 'vegetables',
    isPerishable: true,
    shelfLifeDays: 4,
    stores: {
      costco: { packageName: 'Charola 680g champiñón rebanado', weightG: 680, priceMxn: 69, unitPricePerKgMxn: 101.47 },
      heb: { packageName: 'Charola 225g Monteblanco', weightG: 225, priceMxn: 26.50, unitPricePerKgMxn: 117.77 },
      walmart: { packageName: 'Charola 225g Hongos de México', weightG: 225, priceMxn: 27, unitPricePerKgMxn: 120.00 }
    },
    defaultGramsPriceMxn: 0.09
  },
  'aguacate': {
    name: 'Aguacate Hass Fresco',
    category: 'healthy_fats',
    isPerishable: true,
    shelfLifeDays: 5,
    stores: {
      costco: { packageName: 'Malla con 6 piezas grandes (~1.2kg)', weightG: 1200, priceMxn: 98, unitPricePerKgMxn: 81.66 },
      heb: { packageName: 'Aguacate Hass calidad Suprema por kg', weightG: 1000, priceMxn: 76, unitPricePerKgMxn: 76.00 },
      walmart: { packageName: 'Aguacate Hass por kg', weightG: 1000, priceMxn: 74, unitPricePerKgMxn: 74.00 }
    },
    defaultGramsPriceMxn: 0.076
  },
  'platano': {
    name: 'Plátano Tabasco / Chiapas',
    category: 'fruits',
    isPerishable: true,
    shelfLifeDays: 5,
    stores: {
      heb: { packageName: 'Plátano fresco por kg', weightG: 1000, priceMxn: 24, unitPricePerKgMxn: 24.00 },
      walmart: { packageName: 'Plátano por kg', weightG: 1000, priceMxn: 23, unitPricePerKgMxn: 23.00 }
    },
    defaultGramsPriceMxn: 0.024 // ~$3.00 per piece
  },
  'yogurt': {
    name: 'Yogurt Griego Natural Sin Azúcar',
    category: 'dairy',
    isPerishable: true,
    shelfLifeDays: 21,
    stores: {
      costco: { packageName: 'Bote doble Kirkland 2 x 907g (1.81kg)', weightG: 1814, priceMxn: 198, unitPricePerKgMxn: 109.15 },
      heb: { packageName: 'Bote 900g Fage 0% o Chobani', weightG: 900, priceMxn: 154, unitPricePerKgMxn: 171.11 },
      walmart: { packageName: 'Bote 800g Oikos Griego sin azúcar', weightG: 800, priceMxn: 115, unitPricePerKgMxn: 143.75 }
    },
    defaultGramsPriceMxn: 0.075
  },
  'lecheAlmendras': {
    name: 'Leche de Almendras Sin Azúcar (Silk / Kirkland)',
    category: 'dairy',
    isPerishable: false, // UHT box lasts months unopened
    shelfLifeDays: 180,
    stores: {
      costco: { packageName: 'Caja con 6 tetrapaks de 946ml (5.67L)', weightG: 5670, priceMxn: 219, unitPricePerKgMxn: 38.62 },
      heb: { packageName: 'Tetrapak 1 Litro Silk Almond sin azúcar', weightG: 1000, priceMxn: 45, unitPricePerKgMxn: 45.00 },
      walmart: { packageName: 'Tetrapak 1 Litro Nature\'s Heart', weightG: 1000, priceMxn: 44, unitPricePerKgMxn: 44.00 }
    },
    defaultGramsPriceMxn: 0.04
  },
  'proteina': {
    name: 'Proteína Whey Isolate / Gold Standard',
    category: 'supplements',
    isPerishable: false,
    shelfLifeDays: 730,
    stores: {
      costco: { packageName: 'Bote 2.27kg (74 scoops de 30g) Optimum Nutrition', weightG: 2270, priceMxn: 1299, unitPricePerKgMxn: 572.24 },
      heb: { packageName: 'Bote 907g Birdman Falcon o Dymatize', weightG: 907, priceMxn: 880, unitPricePerKgMxn: 970.23 }
    },
    defaultGramsPriceMxn: 0.63 // ~$19.00 per 30g scoop
  }
};

export function findVerifiedStaple(name: string): VerifiedStaplePrice | null {
  const lower = name.toLowerCase();
  for (const [key, staple] of Object.entries(VERIFIED_STAPLES_MAP)) {
    if (lower.includes(key)) return staple;
  }
  // Alternate keywords
  if (lower.includes('pechuga') || lower.includes('pollo')) return VERIFIED_STAPLES_MAP['pollo'];
  if (lower.includes('salmon') || lower.includes('salmón')) return VERIFIED_STAPLES_MAP['salmon'];
  if (lower.includes('pescado') || lower.includes('tilapia')) return VERIFIED_STAPLES_MAP['pescado'];
  if (lower.includes('carne') || lower.includes('res') || lower.includes('milanesa') || lower.includes('molida')) return VERIFIED_STAPLES_MAP['res'];
  if (lower.includes('pavo')) return VERIFIED_STAPLES_MAP['pavo'];
  if (lower.includes('huevo') && !lower.includes('clara')) return VERIFIED_STAPLES_MAP['huevo'];
  if (lower.includes('clara')) return VERIFIED_STAPLES_MAP['claras'];
  if (lower.includes('atun') || lower.includes('atún')) return VERIFIED_STAPLES_MAP['atun'];
  if (lower.includes('avena')) return VERIFIED_STAPLES_MAP['avena'];
  if (lower.includes('arroz')) return VERIFIED_STAPLES_MAP['arroz'];
  if (lower.includes('quinoa')) return VERIFIED_STAPLES_MAP['quinoa'];
  if (lower.includes('papa')) return VERIFIED_STAPLES_MAP['papa'];
  if (lower.includes('camote')) return VERIFIED_STAPLES_MAP['camote'];
  if (lower.includes('tortilla')) return VERIFIED_STAPLES_MAP['tortilla'];
  if (lower.includes('pan')) return VERIFIED_STAPLES_MAP['pan'];
  if (lower.includes('ejote')) return VERIFIED_STAPLES_MAP['ejotes'];
  if (lower.includes('calabacita') || lower.includes('calabaza')) return VERIFIED_STAPLES_MAP['calabacita'];
  if (lower.includes('espinaca')) return VERIFIED_STAPLES_MAP['espinacas'];
  if (lower.includes('champiñon') || lower.includes('champiñón') || lower.includes('hongo')) return VERIFIED_STAPLES_MAP['champinones'];
  if (lower.includes('aguacate')) return VERIFIED_STAPLES_MAP['aguacate'];
  if (lower.includes('platano') || lower.includes('plátano')) return VERIFIED_STAPLES_MAP['platano'];
  if (lower.includes('yogurt') || lower.includes('yogur')) return VERIFIED_STAPLES_MAP['yogurt'];
  if (lower.includes('almendra') || lower.includes('leche')) return VERIFIED_STAPLES_MAP['lecheAlmendras'];
  if (lower.includes('proteina') || lower.includes('proteína') || lower.includes('scoop') || lower.includes('whey')) return VERIFIED_STAPLES_MAP['proteina'];

  return null;
}

export function computeVerifiedIngredientCost(name: string, amount: number, unit: string): { costMxn: number; staple: VerifiedStaplePrice | null } {
  const staple = findVerifiedStaple(name);
  if (!staple) {
    // Default fallback estimation
    const grams = unit === 'g' || unit === 'ml' ? amount : unit === 'pza' ? amount * 60 : 100;
    return { costMxn: parseFloat((grams * 0.05).toFixed(2)), staple: null };
  }

  let grams = amount;
  if (unit === 'pza') grams = amount * 50;
  if (unit === 'taza') grams = amount * 240;
  if (unit === 'cda') grams = amount * 15;
  if (unit === 'ml') grams = amount;

  const cost = parseFloat((grams * staple.defaultGramsPriceMxn).toFixed(2));
  return { costMxn: Math.max(0.50, cost), staple };
}
