# NutriSpend & FitTrack: Optimizador de Dieta, Supermercado y Gasto Calórico en Tiempo Real

Plataforma integral de nutrición, optimización de despensa inteligente (comparativa de precios reales y presentaciones entre HEB, Costco y Walmart México) y seguimiento atlético diario con cálculo del gasto calórico total (TDEE = BMR + NEAT + Entrenamientos Coros/Polar/Apple Fitness) en tiempo real con historial por días.

## User Review & Critical Decisions

> [!IMPORTANT]
> A continuación se detallan las decisiones clave confirmadas en la fase de clarificación y los estándares arquitectónicos del sistema:

- **Confirmed Decision 1 (Entrenamientos)**: Registro manual ágil con perfiles preconfigurados (Coros Pace/Apex, Polar Vantage/Pacer, Apple Watch Workouts con zonas de FC, potencia y ritmo) sumado a un analizador/importador en el navegador para archivos **FIT, TCX, GPX** y resúmenes exportados.
- **Confirmed Decision 2 (Comparativa de Súper)**: Catálogo inteligente curado de supermercados mexicanos (HEB, Costco México, Walmart) con precios reales por empaque y costo normalizado por 100g/unidad, complementado con un optimizador inteligente (asistente Gemini) para consolidar listas y sustituir ingredientes costosos.
- **Confirmed Decision 3 (Organización de Dieta)**: Planificador semanal con control de macros (proteínas, carbohidratos, grasas), buscador de recetas de alto rendimiento y generador de platillos "bajo costo / alto valor biológico" que maximizan compras a granel de Costco y compras frescas de HEB.
- **Open Decision / Parámetros Metabólicos**: Cálculo de TDEE basado en **Mifflin-St Jeor** con factor de actividad basal + gasto activo acumulativo en tiempo real por cada sesión registrada en el día.

---

## 1. Overview & Core Concept

### What It Does
1. **Planificador Nutricional & Macros**: Creación y edición de comidas por tiempos (desayuno, colación, comida, merienda, cena), con desglose de calorías, macronutrientes y lista de ingredientes específicos.
2. **Generador y Optimizador de Despensa (HEB vs. Costco vs. Walmart)**: A partir de los platillos seleccionados para la semana, calcula la lista exacta de compras. Analiza qué conviene comprar en **Costco** (volumen/mayoreo: pechuga de pollo Kirkland, avena, claras, frutos secos, proteína) vs **HEB** (vegetales frescos, condimentos, lácteos de consumo inmediato) vs **Walmart**, mostrando el ahorro estimado y el costo por porción.
3. **Registro Atlético Multidispositivo (Coros, Polar, Apple Fitness)**:
   - Presets directos por marca con métricas de duración, distancia, frecuencia cardíaca promedio/máx, y calorías activas.
   - Importador de archivos `.tcx`, `.gpx`, `.fit` y exportes de Apple Health (XML/JSON), extrayendo automáticamente calorías quemadas, elevación y tiempo activo.
4. **Balance Calórico Dinámico en Tiempo Real**:
   - Gasto Total Diario ($TDEE = BMR + NEAT + \text{Gasto Entrenamientos Hoy}$).
   - Ingesta calórica registrada vs. meta.
   - Balance neto en tiempo real con indicador visual de déficit o superávit calórico según el objetivo (pérdida de grasa, ganancia muscular o recomposición).
5. **Historial Diario Persistente**: Navegación por fechas y calendario con resumen de calorías, entrenamientos, menú consumido y presupuesto ejercido.

### Target Audience & Persona
Atletas de resistencia, practicantes de gimnasio, corredores, ciclistas y personas activas en México que quieren cuadrar sus calorías y macros sin gastar una fortuna en el súper ni desperdiciar comida.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Dashboard Diario (Vista Principal)**:
   - Selector de fecha (Hoy, ayer, fechas anteriores con calendario emergente).
   - Barra de balance calórico en tiempo real: Ingesta (kcal) - Gasto ($BMR + NEAT + \text{Actividad}$) = Balance Neto.
   - Bloques rápidos de comidas del día y entrenamientos completados hoy con botón para registro inmediato.
2. **Registro de Entrenamientos**:
   - Pestaña o modal de registro con selección de dispositivo (Coros, Polar, Apple Watch) y tipo de deporte (Running, Trail Running, Ciclismo ruta/indoor, Natación, Fuerza funcional, HIIT).
   - Zona de arrastrar y soltar (Drag & Drop) para archivos `.fit`, `.tcx`, `.gpx` o exportes de datos.
   - Cálculo automático del gasto calórico por frecuencia cardíaca y peso del usuario si no viene precalculado.
3. **Planificador Semanal & Recetas**:
   - Vista por días de la semana (Lunes a Domingo) para asignar platillos a desayuno, almuerzo, comida, snack y cena.
   - Botón "Optimizar Comidas para Ahorro": reorganiza recetas para reutilizar ingredientes clave y evitar mermas.
4. **Despensa & Comparador de Súper (HEB vs Costco vs Walmart)**:
   - Desglose inteligente de canasta:
     - **Canasta Costco**: productos donde el mayoreo reduce el costo por gramo $\ge 25\%$.
     - **Canasta HEB**: productos frescos, variedad local y porciones menores.
   - Checklist interactivo para ir al supermercado y tachar compras con subtotales por tienda en pesos mexicanos ($ MXN).
   - Optimizador con IA (Gemini): sugerencias de sustitutos más económicos (ej. tilapia vs salmón, pechuga con hueso vs filete, marcas propias Hill Country Fare / Kirkland).

### Visual Identity & Theme Tokens
Siguiendo las directrices del **Universal Frontend Design Constitution** y **SaaS & Dashboards**:
- **Aesthetic Direction**: Interfaz deportiva y analítica de alto rendimiento, limpia, con contraste técnico y precisión tipográfica.
- **Paleta de Colores (60-30-10 Rule)**:
  - `60% Neutral Canvas`: Slate profundo y descansado (`#0F172A` o superficie clara `#F8FAFC` con soporte modo claro/oscuro de alta fidelidad).
  - `30% Estructural`: Contenedores neutros con bordes hairline (`border-slate-200 dark:border-slate-800/80`), fondos sutiles (`bg-slate-900/60` / `bg-white`).
  - `10% Acentos Semánticos Activos`:
    - Acento Atlético / Energía: Ámbar cálido / Naranja deportivo (`#EA580C` / `#F97316`) y Verde metabólico (`#10B981`) para balances controlados.
    - Tiendas: Marcadores visuales sutiles (HEB rojo corporativo sutil, Costco azul marino sutil, Walmart azul cielo sutil).
- **Tipografía**:
  - Títulos y Navegación: `Plus Jakarta Sans` / `Outfit` para jerarquía deportiva moderna.
  - Métricas, Cronómetros y Moneda: Monospace tabular estricto (`tabular-nums font-mono`) para evitar saltos de línea y desalineación en balances calóricos y precios.
- **Top Bar Contract**:
  - Marca en 1 sola línea: `NutriSpend`
  - 4 enlaces simples: `Hoy & Balance`, `Planificador Semanal`, `Despensa & Súper`, `Entrenamientos`
  - 1 CTA principal: `+ Registrar Entrenamiento`

---

## 3. Key Product Decisions & Trade-Offs

### Decisión 1: Registro Atlético Híbrido (FIT/TCX/GPX Parser + Presets)
- **Enfoque Elegido**: Parser del lado del cliente en TypeScript que procesa estructuras XML de `.tcx` / `.gpx` y binarias `.fit`, extrayendo timestamps, calorías, frecuencia cardíaca media y distancia; complementado con selectores rápidos para Coros, Polar y Apple Health.
- **Razón**: Permite a cualquier usuario exportar su actividad desde Coros App, Polar Flow o Apple Entrenos sin requerir cuentas de desarrollador de terceros ni autorizaciones complejas que fallan en navegadores.

### Decisión 2: Base de Datos de Súper Curada y Optimizada para México (HEB & Costco)
- **Enfoque Elegido**: Catálogo precargado y ampliable con más de 120 insumos fitness habituales en México (proteínas, carbohidratos complejos, verduras, grasas saludables, suplementos) con precios reales actualizados para HEB y Costco México, precios unitarios por gramo/pieza y detección de formato mayorista vs minorista.
- **Razón**: Proporciona resultados inmediatos, precisos y offline-ready, complementados con la IA de Gemini para calcular recetas equivalentes y alternativas de ahorro.

### Decisión 3: Persistencia y Sincronización Local Reactiva
- **Enfoque Elegido**: Almacenamiento local estructurado (`localStorage` con esquemas de migración y backup en JSON exportable/importable) con reactividad inmediata sin fricción de logins forzados.
- **Razón**: Privacidad absoluta de los datos de salud y disponibilidad sin latencia.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Top Bar & Navigation                           │
│     [ NutriSpend ] ──── [ Hoy ] [ Plan ] [ Súper ] [ Actividad ] ──── [ + Quick Log ]  │
└────────────────────────────────────────────────────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│ Calorie Engine   │       │ Meal & Diet Hub  │       │ Supermarket Core │
│ ──────────────── │       │ ──────────────── │       │ ──────────────── │
│ • BMR Calculator │       │ • Weekly Planner │       │ • HEB / Costco DB│
│ • NEAT & TEF     │       │ • Recipe Builder │       │ • Basket Splitter│
│ • Workout Ingest │       │ • Macro Targeter │       │ • Per-100g Math  │
│ • Net Balance RT │       │ • Cost / Serving │       │ • Gemini AI Tips │
└──────────────────┘       └──────────────────┘       └──────────────────┘
         │                           │                           │
         └───────────────────────────┼───────────────────────────┘
                                     ▼
                   ┌──────────────────────────────────┐
                   │ Local Storage & Daily History    │
                   │ (Indexed by YYYY-MM-DD Date Key) │
                   └──────────────────────────────────┘
```

### Entidades de Datos Principales
- **UserProfile**: `age`, `gender`, `weightKg`, `heightCm`, `bodyFatPct`, `neatFactor`, `dailyCalorieTarget`, `proteinTargetG`, `carbsTargetG`, `fatTargetG`.
- **WorkoutRecord**: `id`, `date`, `deviceSource` ('coros' | 'polar' | 'apple_fitness' | 'other'), `activityType`, `durationMinutes`, `caloriesBurned`, `avgHeartRate`, `maxHeartRate`, `distanceKm`, `notes`.
- **MealDish**: `id`, `name`, `category` (breakfast, lunch, dinner, snack), `ingredients`: `{ foodId, amountG, unit }[]`, `calories`, `macros`, `costPerServing`.
- **DailyLog**: `date` (YYYY-MM-DD), `mealsEaten`: `MealEntry[]`, `workouts`: `WorkoutRecord[]`, `waterMl`, `notes`.
- **SupermarketItem**: `id`, `name`, `category`, `store` ('heb' | 'costco' | 'walmart'), `packageSizeG`, `priceMxn`, `unitPricePerKg`, `isKirkland`, `isBulk`.

---

## Plan Verification & Execution Gates
Una vez aprobado el plan, se implementará la suite completa con:
1. Motor metabólico en tiempo real (BMR + actividad + ingesta).
2. Módulo de entrenamientos con soporte Coros/Polar/Apple y parser de archivos.
3. Gestor de comidas semanales con optimizador de recetas de bajo costo.
4. Módulo de compras comparativo HEB vs Costco con cálculo de ahorro real en $ MXN.
5. Historial navegable por días.
