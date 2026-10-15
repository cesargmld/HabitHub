import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialise server-side Gemini client
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// AI Route: Optimize Groceries and Diet Costs
app.post('/api/optimize-diet', async (req, res) => {
  try {
    const { meals, userBudgetGoal, targetStorePreference } = req.body;
    
    if (!ai) {
      // Fallback response if no API key is provided
      return res.json({
        optimizedSuggestions: [
          {
            title: "Compra a Granel en Costco México",
            description: "Adquiere pechuga de pollo Kirkland (bolsa 2.5kg a ~$320 MXN) y claras de huevo San Juan (paquete 4x1kg a ~$195 MXN). Ahorro estimado de 28% comparado con porciones individuales.",
            store: "Costco",
            estimatedSavingMxn: 135
          },
          {
            title: "Verduras y Frescos en H-E-B",
            description: "Para espinacas, jitomate saladette, aguacate hass y calabacita, compra en H-E-B los días de mercado o marca propia Economax/Hill Country Fare para evitar merma por caducidad.",
            store: "HEB",
            estimatedSavingMxn: 85
          },
          {
            title: "Avena y Frutos Secos",
            description: "La avena Quaker 1.8kg y nuez pecana o almendras Kirkland en Costco tienen el costo por 100g más bajo del mercado mexicano.",
            store: "Costco",
            estimatedSavingMxn: 90
          }
        ],
        recipeTweaks: [
          "Sustituir filete de salmón por atún fresco de temporada o tilapia en las cenas de lunes a miércoles para reducir $180 MXN manteniendo 32g de proteína.",
          "Preparar arroz jazmín o camote al vapor en lote dominical (meal prep) para congelar porciones exactas y evitar desperdicio."
        ],
        totalPotentialSavingsMxn: 310
      });
    }

    const prompt = `Actúa como un experto en nutrición deportiva y compras inteligentes en supermercados de México (específicamente Costco y H-E-B).
El usuario tiene el siguiente plan de comidas semanal:
${JSON.stringify(meals, null, 2)}
Preferencia de tienda o presupuesto: ${userBudgetGoal || 'Maximizar ahorro y balance calórico/proteico'} ${targetStorePreference || ''}

Analiza los ingredientes necesarios y devuelve un JSON estricto con:
1. "optimizedSuggestions": array de objetos con { "title": string, "description": string, "store": "Costco" | "HEB" | "Ambas", "estimatedSavingMxn": number }
2. "recipeTweaks": array de strings con sugerencias específicas de platillos o sustituciones inteligentes para no gastar de más sin perder macros.
3. "totalPotentialSavingsMxn": number aproximado en pesos mexicanos.

Responde ÚNICAMENTE con JSON válido sin bloques markdown adicionales.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error optimizing diet:', error);
    return res.status(500).json({ error: error.message || 'Error al optimizar comidas' });
  }
});

// AI Route: Generate Smart High-Protein Budget Dish
app.post('/api/generate-dish', async (req, res) => {
  try {
    const { targetCalories, targetProtein, category, ingredientsAtHome } = req.body;

    if (!ai) {
      return res.json({
        name: "Bowl de Pollo Crispy con Arroz y Aguacate",
        category: category || "comida",
        calories: Number(targetCalories) || 520,
        protein: Number(targetProtein) || 45,
        carbs: 55,
        fat: 14,
        costPerServingMxn: 48.50,
        recommendedStore: "Costco (Pollo) + HEB (Aguacate)",
        ingredients: [
          { name: "Pechuga de pollo Kirkland", amount: "180g", store: "Costco" },
          { name: "Arroz blanco cocido", amount: "150g", store: "HEB" },
          { name: "Aguacate Hass", amount: "50g (medio)", store: "HEB" },
          { name: "Salsa de soya y especias", amount: "15ml", store: "HEB" }
        ],
        instructions: "Dorar la pechuga a la plancha con paprika y sal. Servir sobre arroz tibio con rebanadas de aguacate."
      });
    }

    const prompt = `Crea un platillo fitness optimizado en costo para el mercado mexicano (Costco / H-E-B).
Objetivos:
- Calorías aproximadas: ${targetCalories || 500} kcal
- Proteína aproximada: ${targetProtein || 40} g
- Categoría de comida: ${category || 'almuerzo'}
- Ingredientes disponibles o preferidos: ${ingredientsAtHome || 'pollo, huevo, avena, verduras'}

Devuelve un JSON estricto con:
{
  "name": string (nombre apetitoso),
  "category": string,
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "costPerServingMxn": number (en pesos mexicanos, típicamente entre $30 y $80 MXN),
  "recommendedStore": string,
  "ingredients": [
    { "name": string, "amount": string, "store": "Costco" | "HEB" }
  ],
  "instructions": string
}
Responde ÚNICAMENTE con JSON válido.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating dish:', error);
    return res.status(500).json({ error: error.message || 'Error al generar platillo' });
  }
});

// AI Route: Parse Uploaded Diet Text / PDF Contents
app.post('/api/parse-diet-text', async (req, res) => {
  try {
    const { dietText, targetMonth } = req.body;

    if (!dietText || !dietText.trim()) {
      return res.status(400).json({ error: 'Texto de dieta requerido' });
    }

    if (!ai) {
      // Fallback mock parsed dishes
      return res.json({
        title: `Plan Nutricional ${targetMonth || 'Mensual'}`,
        nutritionistName: 'Nutriólogo Deportivo',
        targetCalories: 2350,
        proteinTargetG: 170,
        notes: 'Plan enfocado en recomposición y compras a granel en Costco y frescos en H-E-B.',
        dishes: [
          {
            name: 'Pechuga a la Plancha con Arroz Jazmín y Brócoli',
            mealTime: 'lunch',
            category: 'high_protein',
            calories: 580,
            proteinG: 48,
            carbsG: 60,
            fatG: 12,
            costPerServingMxn: 46.50,
            prepTimeMinutes: 20,
            recommendedStoreNotes: 'Pollo Kirkland en Costco y brócoli fresco en H-E-B',
            ingredients: [
              { name: 'Pechuga de Pollo Kirkland', amount: 200, unit: 'g', preferredStore: 'costco' },
              { name: 'Arroz Jazmín Cocido', amount: 180, unit: 'g', preferredStore: 'costco' },
              { name: 'Brócoli al Vapor', amount: 120, unit: 'g', preferredStore: 'heb' }
            ]
          },
          {
            name: 'Hotcakes de Avena con Claras y Berries',
            mealTime: 'breakfast',
            category: 'high_protein',
            calories: 460,
            proteinG: 36,
            carbsG: 55,
            fatG: 8,
            costPerServingMxn: 32.00,
            prepTimeMinutes: 12,
            recommendedStoreNotes: 'Avena y claras San Juan en Costco',
            ingredients: [
              { name: 'Claras de Huevo San Juan', amount: 200, unit: 'g', preferredStore: 'costco' },
              { name: 'Avena en Hojuelas', amount: 60, unit: 'g', preferredStore: 'costco' },
              { name: 'Frutos Rojos Congelados', amount: 80, unit: 'g', preferredStore: 'costco' }
            ]
          }
        ]
      });
    }

    const prompt = `Actúa como un nutriólogo experto y extractor de datos clínicos y deportivos.
El usuario subió el siguiente texto de su plan de alimentación / dieta mensual:
---
${dietText.slice(0, 4000)}
---

Extrae y normaliza los platillos para el mercado mexicano (Costco / H-E-B).
Devuelve un JSON estricto con:
{
  "title": string (nombre del plan, ej: "Dieta Hipertrofia Octubre"),
  "nutritionistName": string (si se menciona o "Especialista"),
  "targetCalories": number (promedio diario estimado),
  "proteinTargetG": number (promedio diario de proteína en g),
  "notes": string (resumen de 1-2 líneas),
  "dishes": [
    {
      "name": string,
      "mealTime": "breakfast" | "lunch" | "dinner" | "morning_snack" | "afternoon_snack",
      "category": "high_protein" | "low_cost" | "quick_prep",
      "calories": number,
      "proteinG": number,
      "carbsG": number,
      "fatG": number,
      "costPerServingMxn": number (en pesos mexicanos aproximado),
      "prepTimeMinutes": number,
      "recommendedStoreNotes": string,
      "ingredients": [
        { "name": string, "amount": number, "unit": "g" | "ml" | "pza", "preferredStore": "costco" | "heb" }
      ]
    }
  ]
}

Responde ÚNICAMENTE con el objeto JSON válido.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error parsing diet text:', error);
    return res.status(500).json({ error: error.message || 'Error al procesar dieta con IA' });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`NutriSpend server running on http://localhost:${PORT}`);
  });
}

startServer();
