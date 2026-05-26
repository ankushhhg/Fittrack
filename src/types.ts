/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  age?: number;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  goal?: 'lose_fat' | 'build_muscle' | 'recomp';
  target_date?: string;
  workout_location?: 'home' | 'gym';
  equipment?: string[];
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active';
  role: 'user' | 'admin';
  onboarding_done: boolean;
  created_at: string;
}

export interface Exercise {
  name: string;
  important?: boolean;
  targetMuscles: string;
  equipment?: string;
  weight?: string;
  sets: number;
  reps: string;
  rest: string;
  execution: string;
  tips?: string;
  form?: string;
  mistakes?: string;
  breathing?: string;
  videoSearch: string;
}

export interface Superset {
  exerciseA: Exercise;
  exerciseB: Exercise;
}

export interface DayWorkout {
  day: string;
  muscleGroup: string;
  restDay: boolean;
  warmup: Exercise[];
  mainExercises: Exercise[];
  supersets: Superset[];
  abSupersets: Superset[];
  optional: Exercise[];
  stretching: {
    name: string;
    targetMuscles: string;
    execution: string;
    duration: string;
    breathing?: string;
    tips?: string;
  }[];
}

export interface FitnessPlan {
  id: string;
  userId: string;
  weekPlan: DayWorkout[];
  weekNumber: number;
  isActive: boolean;
  created_at: string;
  modified_at?: string;
}

export interface RecipeMeal {
  mealType: string; // "Breakfast", "Snack", "Lunch", "Dinner" etc
  name: string;
  ingredients: string[];
  prepTime: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  instructions: string;
  videoSearch: string;
}

export interface DayDiet {
  day: string;
  totalCalories: number;
  meals: RecipeMeal[];
}

export interface DietPlan {
  id: string;
  userId: string;
  dailyCalorieTarget: number;
  macroSplit: {
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
  weekPlan: DayDiet[];
  weekNumber: number;
  isActive: boolean;
  created_at: string;
  modified_at?: string;
}

export interface WorkoutSessionLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  dayName: string;
  muscleGroup: string;
  exercisesLogged: {
    name: string;
    sets: {
      weight: number;
      reps: number;
      completed: boolean;
    }[];
  }[];
  durationMins: number;
  totalVolumeKg: number;
  completed: boolean;
}

export interface MealLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mealType: string;
  foodName: string;
  quantityG: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  water_glasses?: number;
}

export interface WeighIn {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  weight_kg: number;
  body_fat_percent?: number;
  notes?: string;
}

export interface PersonalRecord {
  id: string;
  userId: string;
  exerciseName: string;
  bestWeightKg: number;
  bestReps: number;
  totalVolumeKg: number;
  achievedOn: string;
}

export interface AdminLog {
  id: string;
  date: string;
  action: string;
  userId: string;
  userEmail: string;
  status: string;
}
