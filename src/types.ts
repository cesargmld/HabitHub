export type DeviceSource = 
  | 'coros' 
  | 'polar' 
  | 'apple_fitness' 
  | 'garmin' 
  | 'strava' 
  | 'nike' 
  | 'whoop' 
  | 'suunto' 
  | 'manual';

export type ActivityType = 
  | 'running' 
  | 'trail_running' 
  | 'cycling_road' 
  | 'cycling_indoor' 
  | 'strength_training' 
  | 'hiit' 
  | 'swimming' 
  | 'walking'
  | 'crossfit';

export interface WorkoutRecord {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  title: string;
  deviceSource: DeviceSource;
  activityType: ActivityType;
  durationMinutes: number;
  caloriesBurned: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  distanceKm?: number;
  elevationGainM?: number;
  paceMinPerKm?: string;
  notes?: string;
  sourceFileName?: string;
  screenshotUrl?: string;
}

export interface WorkoutScreenshotResult {
  title: string;
  deviceSource: DeviceSource;
  activityType: ActivityType;
  durationMinutes: number;
  caloriesBurned: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  distanceKm?: number;
  elevationGainM?: number;
  paceMinPerKm?: string;
  date: string;
  time?: string;
  confidenceNotes?: string;
  detectedApp?: string;
}

export interface ProductStoreComparison {
  priceMxn: number;
  unitPricePerKgMxn: number;
  packageSize: string;
  notes: string;
}

export interface ProductComparisonResult {
  name: string;
  brand: string;
  category: string;
  estimatedWeightG?: number;
  packageDescription: string;
  stores: {
    costco?: ProductStoreComparison;
    heb?: ProductStoreComparison;
    walmart?: ProductStoreComparison;
  };
  winner: 'costco' | 'heb' | 'walmart' | 'tie';
  savingPercentage: number;
  recommendation: string;
  annualSavingEstimateMxn?: number;
  confidenceNotes?: string;
}

export interface AppleHealthMetrics {
  date: string;
  activeCalories: number;
  totalSteps: number;
  exerciseMinutes: number;
  restingHeartRate?: number;
  lastSyncTimestamp: string;
}

export type MealTime = 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner';

export interface IngredientRequirement {
  id?: string;
  name: string;
  amount: number;
  unit: 'g' | 'ml' | 'pza' | 'taza' | 'cda';
  preferredStore?: 'costco' | 'heb' | 'walmart' | 'any';
  estimatedCostMxn?: number;
}

export interface IngredientSubstitute {
  originalIngredient: string;
  substituteIngredient: string;
  amount: string;
  calories: number;
  proteinG: number;
  savingMxn: number;
  notes: string;
}

export interface MealDish {
  id: string;
  name: string;
  mealTime: MealTime;
  category: 'high_protein' | 'low_cost' | 'quick_prep' | 'endurance_fuel';
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  costPerServingMxn: number;
  prepTimeMinutes: number;
  ingredients: IngredientRequirement[];
  instructions?: string;
  recommendedStoreNotes?: string;
  assignedDay?: string; // 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
  dayOfWeek?: number; // 0=Domingo, 1=Lunes, 2=Martes...
  substitutes?: IngredientSubstitute[];
}

export interface MealPlanEntry {
  id: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: number; // 0-6 (0=Domingo, 1=Lunes...)
  dish: MealDish;
  servings: number;
  eaten: boolean;
}

export interface SupermarketProduct {
  id: string;
  name: string;
  category: 'protein' | 'carbs' | 'vegetables' | 'fruits' | 'dairy' | 'healthy_fats' | 'supplements';
  store: 'costco' | 'heb' | 'walmart';
  brand: string;
  packageDescription: string;
  packageWeightG: number;
  priceMxn: number;
  unitPricePerKgMxn: number;
  isBulk: boolean;
  isKirkland?: boolean;
  notes?: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  category: string;
  recommendedStore: 'costco' | 'heb';
  reason: string;
  neededWeightG: number;
  packageDescription: string;
  estimatedPriceMxn: number;
  costPer100gMxn: number;
  alternativeStore?: 'costco' | 'heb';
  alternativePriceMxn?: number;
  savingsMxn?: number;
  isChecked: boolean;
  isPerishable: boolean; // True: Buy weekly at HEB; False: Buy monthly at Costco
  shelfLifeDays?: number;
}

export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female';
  weightKg: number;
  heightCm: number;
  bodyFatPct?: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active'; // NEAT factor
  goal: 'fat_loss' | 'maintenance' | 'muscle_gain';
  dailyCalorieTarget: number;
  proteinTargetG: number;
  carbsTargetG: number;
  fatTargetG: number;
  weeklyBudgetMxn: number;
  preferredStore: 'all' | 'costco' | 'heb';
}

export interface DailySummary {
  date: string;
  bmr: number;
  neat: number;
  workoutCaloriesBurned: number;
  totalExpenditureTdee: number;
  caloriesConsumed: number;
  proteinConsumedG: number;
  carbsConsumedG: number;
  fatConsumedG: number;
  netCaloricBalance: number; // Consumed - TDEE
  targetCaloricDifference: number; // Consumed - Goal
  workoutsCount: number;
  mealsCount: number;
}

export interface MonthlyDietPlan {
  id: string;
  title: string;
  month: string; // YYYY-MM
  createdAt: string;
  targetCalories: number;
  proteinTargetG: number;
  notes?: string;
  dishes: MealDish[];
  originalFileName?: string;
  nutritionistName?: string;
  recommendations?: string[];
  snacks?: string[];
}

export interface FastingSession {
  id: string;
  date: string;
  protocol: '16:8' | '18:6' | '20:4' | '14:10';
  startTime: string; // ISO
  endTime?: string;
  durationHours: number;
  completed: boolean;
}

export interface FastingState {
  isActive: boolean;
  protocol: '16:8' | '18:6' | '20:4' | '14:10';
  startTime: string; // ISO
  targetHours: number;
  history: FastingSession[];
}
