import { MealDish, MonthlyDietPlan } from '../types';

export const LORETTA_DISHE_SUBSTITUTES = {
  salmon: [
    {
      originalIngredient: '150g Salmón fresco ($54 MXN)',
      substituteIngredient: '150g Atún aleta amarilla fresco o tilapia',
      amount: '150g',
      calories: 310,
      proteinG: 34,
      savingMxn: 34.00,
      notes: 'Misma proteína magra de alta biodisponibilidad y reduce el costo 60%.'
    },
    {
      originalIngredient: '150g Salmón fresco ($54 MXN)',
      substituteIngredient: '140g Pechuga de pollo a la plancha',
      amount: '140g',
      calories: 300,
      proteinG: 38,
      savingMxn: 34.40,
      notes: 'Opción económica de meal prep con idéntica proteína.'
    }
  ],
  quinoa: [
    {
      originalIngredient: '1 taza de Quinoa cocida ($9.50 MXN)',
      substituteIngredient: '1 taza de Arroz integral o blanco cocido',
      amount: '160g cocido',
      calories: 215,
      proteinG: 4.5,
      savingMxn: 7.50,
      notes: 'Carbohidrato complejo de menor costo por kilo en Costco.'
    }
  ],
  milanesaRes: [
    {
      originalIngredient: '150g Milanesa de res ($28.50 MXN)',
      substituteIngredient: '160g Pechuga de pollo asada',
      amount: '160g',
      calories: 260,
      proteinG: 48,
      savingMxn: 6.10,
      notes: 'Mayor porcentaje de proteína con menor grasa saturada.'
    }
  ],
  pavo: [
    {
      originalIngredient: '150g Pechuga de pavo ($37.50 MXN)',
      substituteIngredient: '160g Pechuga de pollo desmenuzada Kirkland',
      amount: '160g',
      calories: 260,
      proteinG: 48,
      savingMxn: 15.10,
      notes: 'Ahorro sustancial comprando pechuga congelada Kirkland en Costco.'
    }
  ],
  lecheAlmendras: [
    {
      originalIngredient: '1 taza Leche de almendras comercial ($9.50 MXN)',
      substituteIngredient: '1 taza Leche Lala 100 Deslactosada Light o Agua + Canela',
      amount: '240ml',
      calories: 80,
      proteinG: 13,
      savingMxn: 3.50,
      notes: 'Aporta 13g extra de proteína de suero natural por menor costo.'
    }
  ]
};

// 21 Main dishes strictly from Lic. Loretta Regina Peña García - Plan 838
export const LORETTA_MEAL_DISHES: MealDish[] = [
  // --- LUNES ---
  {
    id: 'loretta-desayuno-lunes',
    name: 'Avena con Proteína y Plátano',
    mealTime: 'breakfast',
    category: 'high_protein',
    assignedDay: 'Lunes',
    dayOfWeek: 1,
    calories: 410,
    proteinG: 31,
    carbsG: 57,
    fatG: 6,
    costPerServingMxn: 32.90,
    prepTimeMinutes: 10,
    recommendedStoreNotes: 'Avena Quaker y Proteína Whey en Costco; leche almendras y plátano en H-E-B',
    instructions: 'Hervir ½ taza de avena en hojuelas con 1 taza de leche de almendras. Retirar del fuego y agregar poco a poquito 1 scoop de proteína en polvo mezclando bien. Servir con 1 pieza de plátano en rebanadas.',
    ingredients: [
      { name: 'Avena en hojuelas', amount: 40, unit: 'g', preferredStore: 'costco', estimatedCostMxn: 1.40 },
      { name: 'Leche de almendras sin azúcar', amount: 240, unit: 'ml', preferredStore: 'heb', estimatedCostMxn: 9.50 },
      { name: 'Proteína Whey en polvo', amount: 30, unit: 'g', preferredStore: 'costco', estimatedCostMxn: 19.00 },
      { name: 'Plátano Tabasco', amount: 1, unit: 'pza', preferredStore: 'heb', estimatedCostMxn: 3.00 }
    ],
    substitutes: LORETTA_DISHE_SUBSTITUTES.lecheAlmendras
  },
  {
    id: 'loretta-comida-lunes',
    name: 'Pechuga a la Plancha con Verduras y Arroz Cocido',
    mealTime: 'lunch',
    category: 'high_protein',
    assignedDay: 'Lunes',
    dayOfWeek: 1,
    calories: 522,
    proteinG: 57,
    carbsG: 55,
    fatG: 6.5,
    costPerServingMxn: 35.20,
    prepTimeMinutes: 20,
    recommendedStoreNotes: 'Pechuga congelada Kirkland en Costco; ejotes y champiñones frescos en H-E-B',
    instructions: 'Cocinar 160g de pechuga de pollo a la plancha con 1 cdta de aceite de aguacate/oliva y sal. Saltear 1 taza de ejotes y 1 taza de champiñones. Servir con 1 taza de arroz cocido.',
    ingredients: [
      { name: 'Pechuga de pollo', amount: 160, unit: 'g', preferredStore: 'costco', estimatedCostMxn: 22.40 },
      { name: 'Ejotes cocidos', amount: 100, unit: 'g', preferredStore: 'heb', estimatedCostMxn: 4.80 },
      { name: 'Champiñones frescos', amount: 70, unit: 'g', preferredStore: 'heb', estimatedCostMxn: 6.00 },
      { name: 'Arroz blanco cocido', amount: 160, unit: 'g', preferredStore: 'costco', estimatedCostMxn: 2.00 }
    ]
  },
  {
    id: 'loretta-cena-lunes',
    name: 'Omelette de Claras con Espinacas y Pan Integral',
    mealTime: 'dinner',
    category: 'high_protein',
    assignedDay: 'Lunes',
    dayOfWeek: 1,
    calories: 297,
    proteinG: 28,
    carbsG: 16,
    fatG: 11.3,
    costPerServingMxn: 17.50,
    prepTimeMinutes: 12,
    recommendedStoreNotes: 'Huevos San Juan y claras pasteurizadas en Costco; espinaca en H-E-B',
    instructions: 'Formar omelette batiendo 2 huevos enteros + ½ taza de claras líquidas. Rellenar en el sartén con 1 taza de espinacas picadas. Acompañar con 1 rebanada de pan integral tostado.',
    ingredients: [
      { name: 'Huevo fresco San Juan', amount: 2, unit: 'pza', preferredStore: 'costco', estimatedCostMxn: 5.60 },
      { name: 'Claras de huevo San Juan', amount: 120, unit: 'g', preferredStore: 'costco', estimatedCostMxn: 4.80 },
      { name: 'Espinacas frescas picadas', amount: 30, unit: 'g', preferredStore: 'heb', estimatedCostMxn: 3.50 },
      { name: 'Pan integral', amount: 1, unit: 'pza', preferredStore: 'heb', estimatedCostMxn: 3.60 }
    ]
  },

  // --- MARTES ---
  {
    id: 'loretta-desayuno-martes',
    name: 'Avena con Proteína y Plátano',
    mealTime: 'breakfast',
    category: 'high_protein',
    assignedDay: 'Martes',
    dayOfWeek: 2,
    calories: 410,
    proteinG: 31,
    carbsG: 57,
    fatG: 6,
    costPerServingMxn: 32.90,
    prepTimeMinutes: 10,
    recommendedStoreNotes: 'Avena Quaker y Proteína Whey en Costco; leche almendras y plátano en H-E-B',
    instructions: 'Hervir ½ taza de avena con 1 taza de leche de almendras; incorporar 1 scoop de proteína. Decorar con 1 plátano en rodajas.',
    ingredients: [
      { name: 'Avena en hojuelas', amount: 40, unit: 'g', preferredStore: 'costco', estimatedCostMxn: 1.40 },
      { name: 'Leche de almendras sin azúcar', amount: 240, unit: 'ml', preferredStore: 'heb', estimatedCostMxn: 9.50 },
      { name: 'Proteína Whey en polvo', amount: 30, unit: 'g', preferredStore: 'costco', estimatedCostMxn: 19.00 },
      { name: 'Plátano Tabasco', amount: 1, unit: 'pza', preferredStore: 'heb', estimatedCostMxn: 3.00 }
    ],
    substitutes: LORETTA_DISHE_SUBSTITUTES.lecheAlmendras
  },
  {
    id: 'loretta-comida-martes',
    name: 'Bowl de Pavo con Quinoa, Calabacita y Aguacate',
    mealTime: 'lunch',
    category: 'high_protein',
    assignedDay: 'Martes',
    dayOfWeek: 2,
    calories: 505,
    proteinG: 46,
    carbsG: 50,
    fatG: 13.2,
    costPerServingMxn: 53.30,
    prepTimeMinutes: 20,
    recommendedStoreNotes: 'Pavo molido/pechuga en Costco o H-E-B; aguacate hass en H-E-B',
    instructions: 'Cocinar 150g de carne magra de pavo a la plancha. Servir en bowl sobre 1 taza de quinoa o cous cous cocido, zanahoria y calabacita cocida al vapor, y 30g de aguacate fresco.',
    ingredients: [
      { name: 'Pechuga o carne molida de pavo', amount: 150, unit: 'g', preferredStore: 'costco', estimatedCostMxn: 37.50 },
      { name: 'Quinoa cocida', amount: 180, unit: 'g', preferredStore: 'costco', estimatedCostMxn: 9.50 },
      { name: 'Zanahoria y calabacita cocida', amount: 120, unit: 'g', preferredStore: 'heb', estimatedCostMxn: 4.00 },
      { name: 'Aguacate Hass', amount: 30, unit: 'g', preferredStore: 'heb', estimatedCostMxn: 2.30 }
    ],
    substitutes: [...LORETTA_DISHE_SUBSTITUTES.quinoa, ...LORETTA_DISHE_SUBSTITUTES.pavo]
  },
  {
    id: 'loretta-cena-martes',
    name: 'Quesadillas de Pollo con Mozzarella y Calabacita Asada',
    mealTime: 'dinner',
    category: 'high_protein',
    assignedDay: 'Martes',
    dayOfWeek: 2,
    calories: 397,
    proteinG: 42,
    carbsG: 30,
    fatG: 12.2,
    costPerServingMxn: 25.30,
    prepTimeMinutes: 15,
    recommendedStoreNotes: 'Queso mozzarella Kirkland en Costco; tortillas de maíz y calabacita en H-E-B',
    instructions: 'Calentar 2 tortillas de maíz con 100g de pollo desmenuzado y 30g de queso mozzarella bajo en grasa. Acompañar en el plato con 1 calabacita asada en rodajas.',
    ingredients: [
      { name: 'Tortillas de maíz', amount: 2, unit: 'pza', preferredStore: 'heb', estimatedCostMxn: 1.40 },
      { name: 'Pechuga de pollo desmenuzada', amount: 100, unit: 'g', preferredStore: 'costco', estimatedCostMxn: 14.00 },
      { name: 'Queso mozzarella bajo en grasa', amount: 30, unit: 'g', preferredStore: 'costco', estimatedCostMxn: 5.50 },
      { name: 'Calabacita asada', amount: 1, unit: 'pza', preferredStore: 'heb', estimatedCostMxn: 4.40 }
    ]
  },

  // --- MIÉRCOLES ---
  {
    id: 'loretta-desayuno-miercoles',
    name: 'Avena con Proteína y Plátano',
    mealTime: 'breakfast',
    category: 'high_protein',
    assignedDay: 'Miércoles',
    dayOfWeek: 3,
    calories: 410,
    proteinG: 31,
    carbsG: 57,
    fatG: 6,
    costPerServingMxn: 32.90,
    prepTimeMinutes: 10,
    recommendedStoreNotes: 'Avena Quaker y Proteína Whey en Costco; leche almendras y plátano en H-E-B',
    instructions: 'Hervir ½ taza de avena con 1 taza de leche de almendras; añadir 1 scoop de proteína y acompañar con 1 plátano en rebanadas.',
    ingredients: [
      { name: 'Avena en hojuelas', amount: 40, unit: 'g', preferredStore: 'costco', estimatedCostMxn: 1.40 },
      { name: 'Leche de almendras sin azúcar', amount: 240, unit: 'ml', preferredStore: 'heb', estimatedCostMxn: 9.50 },
      { name: 'Proteína Whey en polvo', amount: 30, unit: 'g', preferredStore: 'costco', estimatedCostMxn: 19.00 },
      { name: 'Plátano Tabasco', amount: 1, unit: 'pza', preferredStore: 'heb', estimatedCostMxn: 3.00 }
    ],
    substitutes: LORETTA_DISHE_SUBSTITUTES.lecheAlmendras
  },
  {
    id: 'loretta-comida-miercoles',
    name: 'Carne de Res a la Plancha con Papa al Horno y Ejotes',
    mealTime: 'lunch',
    category: 'high_protein',
    assignedDay: 'Miércoles',
    dayOfWeek: 3,
    calories: 465,
    proteinG: 44,
    carbsG: 38,
    fatG: 15.4,
    costPerServingMxn: 40.10,
    prepTimeMinutes: 25,
    recommendedStoreNotes: 'Milanesa magra de res en Costco; papa blanca y ejotes frescos en H-E-B',
    instructions: 'Asar 150g de milanesa magra de res a la plancha con sal y hierbas finas. Servir con 1 papa mediana cocida con 1 cdta de ghee/mantequilla y sal, acompañada de 1 taza de ejotes cocidos.',
    ingredients: [
      { name: 'Milanesa magra de res', amount: 150, unit: 'g', preferredStore: 'costco', estimatedCostMxn: 28.50 },
      { name: 'Papa mediana cocida', amount: 1, unit: 'pza', preferredStore: 'heb', estimatedCostMxn: 4.80 },
      { name: 'Ghee o mantequilla', amount: 5, unit: 'g', preferredStore: 'costco', estimatedCostMxn: 2.00 },
      { name: 'Ejotes cocidos', amount: 100, unit: 'g', preferredStore: 'heb', estimatedCostMxn: 4.80 }
    ],
    substitutes: LORETTA_DISHE_SUBSTITUTES.milanesaRes
  },
  {
    id: 'loretta-cena-miercoles',
    name: 'Tortitas de Atún con Huevo y Ejotes Cocidos',
    mealTime: 'dinner',
    category: 'low_cost',
    assignedDay: 'Miércoles',
    dayOfWeek: 3,
    calories: 262,
    proteinG: 33,
    carbsG: 8,
    fatG: 11.0,
    costPerServingMxn: 29.55,
    prepTimeMinutes: 15,
    recommendedStoreNotes: 'Atún Dolores en Costco (pack 8); huevo San Juan y ejotes en H-E-B',
    instructions: 'Mezclar 1 lata de atún bien drenada con 1 huevo entero. Formar bolitas/tortitas y dorar en sartén con 1 cdta de aceite de aguacate u oliva. Acompañar con 1 taza de ejotes cocidos.',
    ingredients: [
      { name: 'Atún en agua en lata', amount: 100, unit: 'g', preferredStore: 'costco', estimatedCostMxn: 20.50 },
      { name: 'Huevo fresco San Juan', amount: 1, unit: 'pza', preferredStore: 'costco', estimatedCostMxn: 2.80 },
      { name: 'Aceite de aguacate u oliva', amount: 5, unit: 'ml', preferredStore: 'costco', estimatedCostMxn: 1.45 },
      { name: 'Ejotes cocidos', amount: 100, unit: 'g', preferredStore: 'heb', estimatedCostMxn: 4.80 }
    ]
  },

  // --- JUEVES ---
  {
    id: 'loretta-desayuno-jueves',
    name: 'Avena con Proteína y Plátano',
    mealTime: 'breakfast',
    category: 'high_protein',
    assignedDay: 'Jueves',
    dayOfWeek: 4,
    calories: 410,
    proteinG: 31,
    carbsG: 57,
    fatG: 6,
    costPerServingMxn: 32.90,
    prepTimeMinutes: 10,
    recommendedStoreNotes: 'Avena Quaker y Proteína Whey en Costco; leche almendras y plátano en H-E-B',
    instructions: 'Hervir ½ taza de avena con 1 taza de leche de almendras y 1 scoop de proteína. Acompañar con 1 plátano en rebanadas.',
    ingredients: [
      { name: 'Avena en hojuelas', amount: 40, unit: 'g', preferredStore: 'costco', estimatedCostMxn: 1.40 },
      { name: 'Leche de almendras sin azúcar', amount: 240, unit: 'ml', preferredStore: 'heb', estimatedCostMxn: 9.50 },
      { name: 'Proteína Whey en polvo', amount: 30, unit: 'g', preferredStore: 'costco', estimatedCostMxn: 19.00 },
      { name: 'Plátano Tabasco', amount: 1, unit: 'pza', preferredStore: 'heb', estimatedCostMxn: 3.00 }
    ],
    substitutes: LORETTA_DISHE_SUBSTITUTES.lecheAlmendras
  },
  {
    id: 'loretta-comida-jueves',
    name: 'Tacos de Pollo con Calabacita Asada',
    mealTime: 'lunch',
    category: 'high_protein',
    assignedDay: 'Jueves',
    dayOfWeek: 4,
    calories: 390,
    proteinG: 50,
    carbsG: 29,
    fatG: 7.2,
    costPerServingMxn: 26.80,
    prepTimeMinutes: 15,
    recommendedStoreNotes: 'Pechuga de pollo en Costco; tortillas de maíz y calabacita en H-E-B',
    instructions: 'Servir 150g de pechuga de pollo desmenuzada en 2 tortillas de maíz calientitas. Acompañar con 1 calabacita asada con sal al gusto.',
    ingredients: [
      { name: 'Pechuga de pollo desmenuzada', amount: 150, unit: 'g', preferredStore: 'costco', estimatedCostMxn: 21.00 },
      { name: 'Tortillas de maíz', amount: 2, unit: 'pza', preferredStore: 'heb', estimatedCostMxn: 1.40 },
      { name: 'Calabacita asada', amount: 1, unit: 'pza', preferredStore: 'heb', estimatedCostMxn: 4.40 }
    ]
  },
  {
    id: 'loretta-cena-jueves',
    name: 'Ensalada de Pollo con Yogurt Griego y Pan Tostado',
    mealTime: 'dinner',
    category: 'high_protein',
    assignedDay: 'Jueves',
    dayOfWeek: 4,
    calories: 406,
    proteinG: 49,
    carbsG: 29,
    fatG: 8.7,
    costPerServingMxn: 29.00,
    prepTimeMinutes: 15,
    recommendedStoreNotes: 'Pollo y yogurt griego en Costco; verduras y pan tostado en H-E-B',
    instructions: 'Mezclar 140g de pechuga desmenuzada con cubitos de zanahoria y papa cocida, aderezar con 1 cdta de mayonesa baja en grasa y 1 cda de yogurt griego. Servir con 1 rebanada de pan tostado.',
    ingredients: [
      { name: 'Pechuga de pollo desmenuzada', amount: 140, unit: 'g', preferredStore: 'costco', estimatedCostMxn: 19.60 },
      { name: 'Zanahoria y papa cocida en cubitos', amount: 100, unit: 'g', preferredStore: 'heb', estimatedCostMxn: 3.00 },
      { name: 'Mayonesa light y yogurt griego', amount: 20, unit: 'g', preferredStore: 'costco', estimatedCostMxn: 2.80 },
      { name: 'Pan integral tostado', amount: 1, unit: 'pza', preferredStore: 'heb', estimatedCostMxn: 3.60 }
    ]
  },

  // --- VIERNES ---
  {
    id: 'loretta-desayuno-viernes',
    name: 'Avena con Proteína y Plátano',
    mealTime: 'breakfast',
    category: 'high_protein',
    assignedDay: 'Viernes',
    dayOfWeek: 5,
    calories: 410,
    proteinG: 31,
    carbsG: 57,
    fatG: 6,
    costPerServingMxn: 32.90,
    prepTimeMinutes: 10,
    recommendedStoreNotes: 'Avena Quaker y Proteína Whey en Costco; leche almendras y plátano en H-E-B',
    instructions: 'Hervir ½ taza de avena con 1 taza de leche de almendras y 1 scoop de proteína. Servir con 1 plátano en rebanadas.',
    ingredients: [
      { name: 'Avena en hojuelas', amount: 40, unit: 'g', preferredStore: 'costco', estimatedCostMxn: 1.40 },
      { name: 'Leche de almendras sin azúcar', amount: 240, unit: 'ml', preferredStore: 'heb', estimatedCostMxn: 9.50 },
      { name: 'Proteína Whey en polvo', amount: 30, unit: 'g', preferredStore: 'costco', estimatedCostMxn: 19.00 },
      { name: 'Plátano Tabasco', amount: 1, unit: 'pza', preferredStore: 'heb', estimatedCostMxn: 3.00 }
    ],
    substitutes: LORETTA_DISHE_SUBSTITUTES.lecheAlmendras
  },
  {
    id: 'loretta-comida-viernes',
    name: 'Bowl de Salmón con Arroz, Ejotes y Zanahoria',
    mealTime: 'lunch',
    category: 'high_protein',
    assignedDay: 'Viernes',
    dayOfWeek: 5,
    calories: 571,
    proteinG: 39,
    carbsG: 57,
    fatG: 19.7,
    costPerServingMxn: 60.40,
    prepTimeMinutes: 20,
    recommendedStoreNotes: 'Salmón congelado Kirkland y arroz en Costco; ejotes y zanahoria en H-E-B',
    instructions: 'Cocinar 150g de salmón en cubitos al sartén o airfryer. Montar sobre 1 taza de arroz blanco cocido con ½ taza de ejotes cocidos y 1 zanahoria al vapor.',
    ingredients: [
      { name: 'Filete de salmón fresco', amount: 150, unit: 'g', preferredStore: 'costco', estimatedCostMxn: 54.00 },
      { name: 'Arroz blanco cocido', amount: 160, unit: 'g', preferredStore: 'costco', estimatedCostMxn: 2.00 },
      { name: 'Ejotes cocidos', amount: 50, unit: 'g', preferredStore: 'heb', estimatedCostMxn: 2.40 },
      { name: 'Zanahoria al vapor', amount: 80, unit: 'g', preferredStore: 'heb', estimatedCostMxn: 2.00 }
    ],
    substitutes: LORETTA_DISHE_SUBSTITUTES.salmon
  },
  {
    id: 'loretta-cena-viernes',
    name: 'Caldo de Pollo con Arroz, Chayote y Zanahoria',
    mealTime: 'dinner',
    category: 'high_protein',
    assignedDay: 'Viernes',
    dayOfWeek: 5,
    calories: 370,
    proteinG: 46,
    carbsG: 31,
    fatG: 5.4,
    costPerServingMxn: 24.10,
    prepTimeMinutes: 20,
    recommendedStoreNotes: 'Pollo en Costco; chayote y zanahoria frescos en H-E-B',
    instructions: 'Hervir 140g de pechuga con chayote y zanahoria en cubitos en caldo sazonado ligero. Servir caliente con ½ taza de arroz cocido.',
    ingredients: [
      { name: 'Pechuga de pollo desmenuzada', amount: 140, unit: 'g', preferredStore: 'costco', estimatedCostMxn: 19.60 },
      { name: 'Chayote y zanahoria', amount: 120, unit: 'g', preferredStore: 'heb', estimatedCostMxn: 3.50 },
      { name: 'Arroz blanco cocido', amount: 80, unit: 'g', preferredStore: 'costco', estimatedCostMxn: 1.00 }
    ]
  },

  // --- SÁBADO ---
  {
    id: 'loretta-desayuno-sabado',
    name: 'Avena con Proteína y Plátano',
    mealTime: 'breakfast',
    category: 'high_protein',
    assignedDay: 'Sábado',
    dayOfWeek: 6,
    calories: 410,
    proteinG: 31,
    carbsG: 57,
    fatG: 6,
    costPerServingMxn: 32.90,
    prepTimeMinutes: 10,
    recommendedStoreNotes: 'Avena Quaker y Proteína Whey en Costco; leche almendras y plátano en H-E-B',
    instructions: 'Hervir ½ taza de avena con 1 taza de leche de almendras y 1 scoop de proteína. Acompañar con 1 plátano en rodajas.',
    ingredients: [
      { name: 'Avena en hojuelas', amount: 40, unit: 'g', preferredStore: 'costco', estimatedCostMxn: 1.40 },
      { name: 'Leche de almendras sin azúcar', amount: 240, unit: 'ml', preferredStore: 'heb', estimatedCostMxn: 9.50 },
      { name: 'Proteína Whey en polvo', amount: 30, unit: 'g', preferredStore: 'costco', estimatedCostMxn: 19.00 },
      { name: 'Plátano Tabasco', amount: 1, unit: 'pza', preferredStore: 'heb', estimatedCostMxn: 3.00 }
    ],
    substitutes: LORETTA_DISHE_SUBSTITUTES.lecheAlmendras
  },
  {
    id: 'loretta-comida-sabado',
    name: 'Tacos de Pescado con Salsa Cremosa de Aguacate',
    mealTime: 'lunch',
    category: 'high_protein',
    assignedDay: 'Sábado',
    dayOfWeek: 6,
    calories: 409,
    proteinG: 39,
    carbsG: 41,
    fatG: 10.0,
    costPerServingMxn: 29.40,
    prepTimeMinutes: 20,
    recommendedStoreNotes: 'Filete de pescado en Costco o H-E-B; tortillas de maíz, aguacate y yogurt en H-E-B',
    instructions: 'Asar 120g de filete de pescado blanco con sal. Servir en 3 tortillas de maíz. Bañar con la salsa cremosa (licuar ¼ taza yogurt griego + 1 taza espinacas + ¼ pieza de aguacate + agua y sal).',
    ingredients: [
      { name: 'Filete de pescado blanco / tilapia', amount: 120, unit: 'g', preferredStore: 'costco', estimatedCostMxn: 17.50 },
      { name: 'Tortillas de maíz', amount: 3, unit: 'pza', preferredStore: 'heb', estimatedCostMxn: 2.10 },
      { name: 'Yogurt griego natural', amount: 60, unit: 'g', preferredStore: 'costco', estimatedCostMxn: 4.50 },
      { name: 'Espinacas frescas', amount: 30, unit: 'g', preferredStore: 'heb', estimatedCostMxn: 2.50 },
      { name: 'Aguacate Hass', amount: 35, unit: 'g', preferredStore: 'heb', estimatedCostMxn: 2.80 }
    ]
  },
  {
    id: 'loretta-cena-sabado',
    name: 'Huevos Revueltos con Papa, Champiñones y Aguacate',
    mealTime: 'dinner',
    category: 'high_protein',
    assignedDay: 'Sábado',
    dayOfWeek: 6,
    calories: 395,
    proteinG: 30,
    carbsG: 34,
    fatG: 14.8,
    costPerServingMxn: 23.20,
    prepTimeMinutes: 15,
    recommendedStoreNotes: 'Huevos y claras en Costco; papa, champiñones y aguacate en H-E-B',
    instructions: 'Revolver 2 huevos enteros + ½ taza de claras en sartén con 140g de papa cocida en cubitos y 1 taza de champiñones rebanados. Acompañar con 30g de aguacate fresco.',
    ingredients: [
      { name: 'Huevo fresco San Juan', amount: 2, unit: 'pza', preferredStore: 'costco', estimatedCostMxn: 5.60 },
      { name: 'Claras de huevo San Juan', amount: 120, unit: 'g', preferredStore: 'costco', estimatedCostMxn: 4.80 },
      { name: 'Papa cocida en cubitos', amount: 140, unit: 'g', preferredStore: 'heb', estimatedCostMxn: 4.50 },
      { name: 'Champiñones frescos', amount: 70, unit: 'g', preferredStore: 'heb', estimatedCostMxn: 6.00 },
      { name: 'Aguacate Hass', amount: 30, unit: 'g', preferredStore: 'heb', estimatedCostMxn: 2.30 }
    ]
  },

  // --- DOMINGO ---
  {
    id: 'loretta-desayuno-domingo',
    name: 'Avena con Proteína y Plátano',
    mealTime: 'breakfast',
    category: 'high_protein',
    assignedDay: 'Domingo',
    dayOfWeek: 0,
    calories: 410,
    proteinG: 31,
    carbsG: 57,
    fatG: 6,
    costPerServingMxn: 32.90,
    prepTimeMinutes: 10,
    recommendedStoreNotes: 'Avena Quaker y Proteína Whey en Costco; leche almendras y plátano en H-E-B',
    instructions: 'Hervir ½ taza de avena con 1 taza de leche de almendras y 1 scoop de proteína. Acompañar con 1 plátano en rebanadas.',
    ingredients: [
      { name: 'Avena en hojuelas', amount: 40, unit: 'g', preferredStore: 'costco', estimatedCostMxn: 1.40 },
      { name: 'Leche de almendras sin azúcar', amount: 240, unit: 'ml', preferredStore: 'heb', estimatedCostMxn: 9.50 },
      { name: 'Proteína Whey en polvo', amount: 30, unit: 'g', preferredStore: 'costco', estimatedCostMxn: 19.00 },
      { name: 'Plátano Tabasco', amount: 1, unit: 'pza', preferredStore: 'heb', estimatedCostMxn: 3.00 }
    ],
    substitutes: LORETTA_DISHE_SUBSTITUTES.lecheAlmendras
  },
  {
    id: 'loretta-comida-domingo',
    name: 'Hamburguesa Casera Sin Pan con Bastones de Papa/Camote',
    mealTime: 'lunch',
    category: 'high_protein',
    assignedDay: 'Domingo',
    dayOfWeek: 0,
    calories: 434,
    proteinG: 41,
    carbsG: 28,
    fatG: 16.0,
    costPerServingMxn: 33.90,
    prepTimeMinutes: 25,
    recommendedStoreNotes: 'Carne molida magra 90/10 en Costco; huevo, papa o camote en H-E-B',
    instructions: 'Formar carne de hamburguesa mezclando 140g de carne molida magra con 1 huevo y sal. Cocinar a la plancha. Acompañar con 140g de bastones de papa o camote horneados o en freidora de aire.',
    ingredients: [
      { name: 'Carne molida magra de res 90/10', amount: 140, unit: 'g', preferredStore: 'costco', estimatedCostMxn: 26.60 },
      { name: 'Huevo fresco San Juan', amount: 1, unit: 'pza', preferredStore: 'costco', estimatedCostMxn: 2.80 },
      { name: 'Papa o camote en bastones', amount: 140, unit: 'g', preferredStore: 'heb', estimatedCostMxn: 4.50 }
    ]
  },
  {
    id: 'loretta-cena-domingo',
    name: 'Tacos de Pavo con Espinacas, Champiñones y Aguacate',
    mealTime: 'dinner',
    category: 'high_protein',
    assignedDay: 'Domingo',
    dayOfWeek: 0,
    calories: 375,
    proteinG: 40,
    carbsG: 30,
    fatG: 10.7,
    costPerServingMxn: 45.20,
    prepTimeMinutes: 15,
    recommendedStoreNotes: 'Pechuga de pavo en Costco; espinaca, champiñones, tortillas y aguacate en H-E-B',
    instructions: 'Cocinar 140g de pechuga de pavo salteada con 1 taza de espinacas picadas y champiñones. Servir en 2 tortillas de maíz con 30g de aguacate.',
    ingredients: [
      { name: 'Pechuga o carne de pavo', amount: 140, unit: 'g', preferredStore: 'costco', estimatedCostMxn: 35.00 },
      { name: 'Espinacas y champiñones salteados', amount: 70, unit: 'g', preferredStore: 'heb', estimatedCostMxn: 6.50 },
      { name: 'Tortillas de maíz', amount: 2, unit: 'pza', preferredStore: 'heb', estimatedCostMxn: 1.40 },
      { name: 'Aguacate Hass', amount: 30, unit: 'g', preferredStore: 'heb', estimatedCostMxn: 2.30 }
    ],
    substitutes: LORETTA_DISHE_SUBSTITUTES.pavo
  }
];

export const LORETTA_SNACK_OPTIONS = [
  'Yogurt griego natural (150g) + 1 pieza de pera',
  '½ taza de queso cottage + 1 pieza de rice cake Saníssimo',
  '1 pieza de plátano con 1 cda de crema de cacahuate natural',
  '1 manzana + 40 gr de cubitos de queso fresco o panela',
  '1 rebanada de pan integral con 40 gr de pechuga de pavo',
  '1-2 rice cakes con 30 gr de aguacate hass fresco',
  '1 pieza de manzana cocida con ½ taza de yogurt griego',
  '1 tostada horneada con ¼ de taza de queso cottage'
];

export const LORETTA_RECOMMENDATIONS = [
  'Medir las porciones estrictamente con báscula para alimentos, tazas y cucharas medidoras.',
  'Para cocinar utilizar aceite de aguacate, oliva o rocío PAM (no libre: máximo 1 cdta).',
  'Evitar estrictamente cocinar con aceite de maíz, mantequilla regular o manteca.',
  'Evitar consumo de refrescos y bebidas gaseosas.',
  'Evitar alimentos con preparaciones fritas o altas en grasa.',
  'Evitar condimentos irritantes: pimienta, paprika, comino, pimentón, ajo en polvo, cebolla en polvo.',
  'Evitar vegetales en crudo (preferir al vapor, asados o cocidos).',
  'Evitar salsas de tomate industrializadas y picante.',
  'Evitar cafeína y alcohol durante el protocolo nutricional.'
];

export const LORETTA_MONTHLY_PLAN: MonthlyDietPlan = {
  id: 'diet-loretta-plan-838',
  title: 'Plan 838 Plan de alimentación',
  month: '2026-10',
  createdAt: '2026-10-15T12:00:00Z',
  nutritionistName: 'Lic. Loretta Regina Peña García (cambiando__habitos · 81 2912 8949)',
  targetCalories: 1650,
  proteinTargetG: 145,
  notes: 'Plan clínico personalizado de alta biodisponibilidad proteica. Diseñado con desayunos estándar, comidas balanceadas y cenas ligeras antiinflamatorias.',
  dishes: LORETTA_MEAL_DISHES,
  recommendations: LORETTA_RECOMMENDATIONS,
  snacks: LORETTA_SNACK_OPTIONS
};
