/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile } from "../src/types";

export function buildFitnessPrompt(user: UserProfile & { age: number; height_cm: number; weight_kg: number; target_date?: string }) {
  const goalText = user.goal === 'lose_fat' ? 'Fat Loss (higher reps e.g. 15-20, shorter rest e.g. 30-45s, high intensity)' : 
                   user.goal === 'build_muscle' ? 'Muscle Building (lower reps e.g. 8-12, longer rest e.g. 60-90s, progressive overload)' :
                   'Body Recomposition (balanced reps 10-15)';
                   
  const equipmentText = user.equipment && user.equipment.length > 0
    ? user.equipment.join(", ") 
    : "Bodyweight Only";

  const locationText = user.workout_location === 'home' 
    ? "At home. IMPORTANT: Include only floor exercises or variants that do not require any commercial gym machines. The user has no bench (assume floor-based variations like floor press)."
    : "Gym (access to bar and free equipment).";

  return `
Create a comprehensive 7-day personalized fitness plan for ${user.name} who is a ${user.age}-year-old ${user.gender || 'individual'}.
- Height: ${user.height_cm} cm
- Weight: ${user.weight_kg} kg
- Fitness Goal: ${goalText}
- Workout Location: ${locationText}
- Available Equipment: ${equipmentText}

The workout plan MUST strictly adhere to the following rules per day:
Each exercise list must contain:
1. Warm-up Exercises (exactly 6 items): Proper compound or dynamic movements. Names, targeted muscles, details, sets/reps or timers, rest times, and videoSearch query.
2. Main Exercises (exactly 6-7 items): Mark each exercises with "important": true or false. Include targeted muscles, equipment required, sets (e.g. 3 sets), reps, rest periods, execution, form cues (posture/grip/ROM/tempo), common mistakes, breathing technique, tips, and videoSearch query.
3. Supersets (exactly 2 pairs): List of two exercises that are performed back-to-back. Must be different from the main exercises section. Pair A and Pair B. Format as "exerciseA" and "exerciseB".
4. Fat Burning Ab Supersets (exactly 2 pairs): One focusing on upper/lower abs, one on obliques. Format as "exerciseA" and "exerciseB".
5. Optional Main Exercises (exactly 1-2 items): Supplementary work for lagging muscles. Same fields as Main Exercises.
6. Stretching Exercises (exactly 6 items): Cool-down stretching. Names, target muscles, execution details, duration (e.g., 30s), breathing, tips.

EQUIPMENT STRATEGY & COMPATIBILITY CHECK:
- The user has: ${equipmentText}.
- If user has dumbbell rods pair, barbell extender, and weights, the maximum dumbbell weight is ~10kg each side. Suggest realistic starter weights.
- NEVER combine barbell and dumbbell in the same compound list or exercise. Use equipment the user explicitly owns.
- Workout sessions must be designed to be fully completed within exactly 50 minutes.
- For "videoSearch", provide a literal search string targeting youtube channels like athleanx, jeff nippard, delta bolic, renaissance periodization, or buff dudes. Examples: "athleanx dumbbell floor press proper form", "jeff nippard lateral raise form".

CRITICAL: Respond ONLY with valid JSON matching the schema below. No conversational text, no markdowns, no markdown codeblocks, no backticks, no wrap text. Simply output the raw JSON object.

JSON SCHEMA:
{
  "weekPlan": [
    {
      "day": "Monday",
      "muscleGroup": "Chest & Triceps",
      "restDay": false,
      "warmup": [
        { "name": "Arm Circles", "targetMuscles": "Shoulders", "execution": "Rotate arms forward then backwards", "sets": "1", "reps": "15 reps each direction", "rest": "15s", "videoSearch": "athleanx arm circles warm up" }
      ],
      "mainExercises": [
        { "name": "Dumbbell Floor Press", "important": true, "targetMuscles": "Chest, Triceps", "equipment": "Dumbbell Rods & Weight Plates", "weight": "8kg each side", "sets": 3, "reps": "12-15", "rest": "60s", "execution": "Lie flat on floor, drive dumbbells up and control down.", "tips": "Keep elbows tucked to 45 degrees", "form": "Flat shoulder blades", "mistakes": "Flaring elbows", "breathing": "Inhale on descent, exhale on press", "videoSearch": "athleanx dumbbell floor press proper form" }
      ],
      "supersets": [
        {
          "dayIndex": 0,
          "name": "Chest-Tricep Burner",
          "exerciseA": { "name": "Dumbbell Pushup", "targetMuscles": "Lower Chest", "equipment": "Dumbbells", "weight": "Bodyweight", "sets": 3, "reps": "10-12", "rest": "0s", "execution": "Pushups holding dumbbells to keep neutral wrist.", "tips": "Squeeze chest at top", "videoSearch": "athleanx dumbbell pushup" },
          "exerciseB": { "name": "Overhead Dumbbell Tricep Extension", "targetMuscles": "Triceps Long Head", "equipment": "Dumbbell", "weight": "5kg", "sets": 3, "reps": "12", "rest": "45s", "execution": "Press dumbbell overhead, bend elbows to lower, extend to press.", "tips": "Keep elbows close to head", "videoSearch": "athleanx dumbbell overhead tricep extension" }
        }
      ],
      "abSupersets": [
        {
          "name": "Core Shred",
          "exerciseA": { "name": "Lying Leg Raises", "targetMuscles": "Lower Abs", "equipment": "Mat", "weight": "Bodyweight", "sets": 3, "reps": "15", "rest": "0s", "execution": "Raise legs up, lower slowly.", "tips": "Lower back flat", "videoSearch": "athleanx lying leg raise form" },
          "exerciseB": { "name": "Russian Twists", "targetMuscles": "Obliques", "equipment": "Dumbbell", "weight": "2.5kg", "sets": 3, "reps": "20 reps", "rest": "30s", "execution": "Rotate trunk side to side.", "tips": "Follow with torso, not just hands", "videoSearch": "athleanx russian twists form" }
        }
      ],
      "optional": [
        { "name": "Dumbbell Kickbacks", "important": false, "targetMuscles": "Triceps Lateral Head", "equipment": "Dumbbell", "weight": "2.5kg", "sets": 2, "reps": "15", "rest": "45s", "execution": "Hinge hips back, kick dumbbell back.", "tips": "Keep upper arm pinned to side", "videoSearch": "athleanx tricep kickbacks" }
      ],
      "stretching": [
        { "name": "Chest Opening Stretch", "targetMuscles": "Pectorals", "execution": "Interlock fingers behind your back and pull backwards", "duration": "30s", "breathing": "Deep steady inhalations", "tips": "Relax neck" }
      ]
    },
    ... (continue for all remaining days: Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday. Ensure some days are rest days where "restDay" is true. If "restDay" is true, the warmup, mainExercises, supersets, abSupersets, optional, and stretching lists can be empty.)
  ]
}
`;
}

export function buildDietPrompt(user: UserProfile & { age: number; height_cm: number; weight_kg: number }, calorieTarget: number) {
  const goalText = user.goal === 'lose_fat' ? 'Fat Loss / Caloric Deficit' : 
                   user.goal === 'build_muscle' ? 'Muscle Building / Caloric Surplus' :
                   'Body Recomposition';

  const activityText = user.activity_level || 'moderate';

  return `
Create a complete, detailed 7-day meal plan for ${user.name} with a daily caloric target of exactly ${calorieTarget} kcal.
- Age: ${user.age}
- Goals: ${goalText}
- Activity Level: ${activityText}
- Recommended Macro split estimate: Protein: 30%, Carbs: 45%, Fat: 25% (or adapted to their goal). For muscle gain, keep Protein high.

Instructions:
1. Provide exactly five meals for each day: Breakfast, Mid-morning Snack, Lunch, Evening Snack, Dinner.
2. The recipes must use common home ingredients, be simple to prepare (max 20 minutes prep), and budget-friendly.
3. For each meal item, supply: mealType, name, prepTime (e.g. "10 mins"), ingredients (as a list of strings with specific quantities like "100g", "2 eggs", "1 banana"), instructions (short step-by-step description), calories, protein_g, carbs_g, fat_g, and videoSearch keyword targeting channel home cooking show, live lean, or max euceda.
4. Calculate totals per day and verify they sum up close to the targeted ${calorieTarget} kcal.
5. Provide the estimated macronutrient splits (protein, carbs, fat) in grams for each day and for the overall target.

CRITICAL: Respond ONLY with valid JSON matching the schema below. No conversational text, no markdown block wraps, no backticks. Simply output the raw JSON string.

JSON SCHEMA:
{
  "dailyCalorieTarget": ${calorieTarget},
  "macroSplit": { "protein_g": ${Math.round(calorieTarget * 0.35 / 4)}, "carbs_g": ${Math.round(calorieTarget * 0.45 / 4)}, "fat_g": ${Math.round(calorieTarget * 0.20 / 9)} },
  "weekPlan": [
    {
      "day": "Monday",
      "totalCalories": ${calorieTarget},
      "meals": [
        {
          "mealType": "Breakfast",
          "name": "High Protein Banana Oats",
          "prepTime": "10 mins",
          "ingredients": [
            "60g rolled oats",
            "1 scoop vanilla protein powder",
            "1 medium banana",
            "200ml skimmed milk",
            "10g chia seeds"
          ],
          "instructions": "Mix oats and milk, microwave for 2 minutes. Stir in protein powder, top with sliced banana and chia seeds.",
          "calories": 450,
          "protein_g": 35,
          "carbs_g": 60,
          "fat_g": 8,
          "videoSearch": "home cooking show high protein breakfast banana oats"
        },
        ... (Exactly 5 meals: Breakfast, Mid-morning Snack, Lunch, Evening Snack, Dinner)
      ]
    },
    ... (continue for all remaining days: Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)
  ]
}
`;
}
