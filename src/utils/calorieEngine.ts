import { UserProfile, WorkoutRecord, MealPlanEntry, DailySummary } from '../types';

/**
 * Calculates Basal Metabolic Rate (BMR) using Mifflin-St Jeor equation.
 */
export function calculateBMR(profile: UserProfile): number {
  const { weightKg, heightCm, age, gender } = profile;
  if (!weightKg || !heightCm || !age) return 1750;

  if (gender === 'female') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  }
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
}

/**
 * Multiplier for baseline Non-Exercise Activity Thermogenesis (NEAT).
 * We isolate formal workout sessions to compute them dynamically in real-time.
 */
export function getNeatMultiplier(level: UserProfile['activityLevel']): number {
  switch (level) {
    case 'sedentary':
      return 1.15; // Desk job, very minimal movement outside workouts
    case 'light':
      return 1.22; // Moderate standing, office work with some walking
    case 'moderate':
      return 1.32; // On feet often, active commute
    case 'very_active':
      return 1.45; // Physical labor, coaching, constant movement
    default:
      return 1.20;
  }
}

/**
 * Fallback calorie estimation based on sport, duration, and user weight
 * if device file did not provide burned calories.
 */
export function estimateWorkoutCalories(
  activityType: WorkoutRecord['activityType'],
  durationMinutes: number,
  weightKg: number,
  avgHeartRate?: number
): number {
  // MET values (Metabolic Equivalent of Task)
  const mets: Record<WorkoutRecord['activityType'], number> = {
    running: 9.8,
    trail_running: 11.0,
    cycling_road: 8.5,
    cycling_indoor: 7.5,
    strength_training: 5.0,
    hiit: 10.0,
    swimming: 8.0,
    walking: 3.8,
    crossfit: 9.0
  };

  if (avgHeartRate && avgHeartRate > 90) {
    // Keytel formula approximation for athletes
    // Calories/min ~ [(-55.0969 + (0.6309 x HR) + (0.1988 x W) + (0.2017 x A)) / 4.184] x 60 / 60
    const hrFactor = Math.max(0, (avgHeartRate - 80) * 0.08);
    const met = mets[activityType] || 7.0;
    return Math.round(((met + hrFactor) * 3.5 * weightKg) / 200 * durationMinutes);
  }

  const met = mets[activityType] || 6.5;
  // Calories = MET x 3.5 x weight(kg) / 200 x minutes
  return Math.round((met * 3.5 * weightKg / 200) * durationMinutes);
}

/**
 * Computes complete daily energy summary in real-time.
 */
export function calculateDailySummary(
  date: string,
  profile: UserProfile,
  workouts: WorkoutRecord[],
  meals: MealPlanEntry[]
): DailySummary {
  const bmr = calculateBMR(profile);
  const neatMultiplier = getNeatMultiplier(profile.activityLevel);
  const baselineDailyEnergy = Math.round(bmr * neatMultiplier);
  const neatCalories = baselineDailyEnergy - bmr;

  // Filter workouts for this specific day
  const dayWorkouts = workouts.filter(w => w.date === date);
  const workoutCaloriesBurned = dayWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);

  // Total Daily Energy Expenditure = Baseline (BMR + NEAT) + Active Exercise Calories
  const totalExpenditureTdee = baselineDailyEnergy + workoutCaloriesBurned;

  // Filter meals eaten or planned for this day
  const dayMeals = meals.filter(m => m.date === date);
  const eatenMeals = dayMeals.filter(m => m.eaten);

  // Consider all planned meals as consumed if eaten is marked, or aggregate all for total planned
  const activeMealsList = eatenMeals.length > 0 ? eatenMeals : dayMeals;

  const caloriesConsumed = activeMealsList.reduce(
    (sum, m) => sum + (m.dish.calories * (m.servings || 1)), 
    0
  );
  const proteinConsumedG = activeMealsList.reduce(
    (sum, m) => sum + (m.dish.proteinG * (m.servings || 1)), 
    0
  );
  const carbsConsumedG = activeMealsList.reduce(
    (sum, m) => sum + (m.dish.carbsG * (m.servings || 1)), 
    0
  );
  const fatConsumedG = activeMealsList.reduce(
    (sum, m) => sum + (m.dish.fatG * (m.servings || 1)), 
    0
  );

  const netCaloricBalance = caloriesConsumed - totalExpenditureTdee;
  const targetCaloricDifference = caloriesConsumed - profile.dailyCalorieTarget;

  return {
    date,
    bmr,
    neat: neatCalories,
    workoutCaloriesBurned,
    totalExpenditureTdee,
    caloriesConsumed,
    proteinConsumedG: Math.round(proteinConsumedG),
    carbsConsumedG: Math.round(carbsConsumedG),
    fatConsumedG: Math.round(fatConsumedG),
    netCaloricBalance,
    targetCaloricDifference,
    workoutsCount: dayWorkouts.length,
    mealsCount: activeMealsList.length
  };
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Atleta',
  age: 28,
  gender: 'male',
  weightKg: 70,
  heightCm: 175,
  bodyFatPct: 15,
  activityLevel: 'moderate',
  goal: 'maintenance',
  dailyCalorieTarget: 2000,
  proteinTargetG: 140,
  carbsTargetG: 220,
  fatTargetG: 60,
  weeklyBudgetMxn: 1500,
  preferredStore: 'all'
};
