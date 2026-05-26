/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Activity,
  Flame,
  Dumbbell,
  Home,
  Check,
  Award,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Calendar
} from "lucide-react";
import { CalendarPicker } from "../components/CalendarPicker";

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { user, token, updateProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || "",
    age: 26,
    gender: "Male" as "Male" | "Female" | "Other",
    height_cm: 175,
    weight_kg: 78,
    goal: "recomp" as "lose_fat" | "build_muscle" | "recomp",
    target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 3 months default
    workout_location: "home" as "home" | "gym",
    equipment: ["dumbbell_rods", "barbell_extender", "weight_plates"] as string[],
    activity_level: "moderate" as "sedentary" | "light" | "moderate" | "active"
  });

  const equipmentOptions = [
    { id: "dumbbell_rods", label: "Dumbbell Rods (pair)" },
    { id: "barbell_extender", label: "Barbell Extender (1)" },
    { id: "weight_plates", label: "Weight Plates — 2.5kg × 4" },
    { id: "pullup_bar", label: "Pull-up Bar" },
    { id: "bands", label: "Resistance Bands" },
    { id: "bench", label: "Flat Bench" },
    { id: "bodyweight", label: "Bodyweight Only" }
  ];

  const handleEquipmentToggle = (id: string) => {
    setFormData((prev) => {
      let copy = [...prev.equipment];
      if (copy.includes(id)) {
        copy = copy.filter((x) => x !== id);
      } else {
        copy.push(id);
      }
      return { ...prev, equipment: copy };
    });
  };

  // Calculations for Step 6 Review
  const calculateBMI = () => {
    const hM = formData.height_cm / 100;
    return Number((formData.weight_kg / (hM * hM)).toFixed(1));
  };

  const estimateBodyFat = (bmi: number) => {
    // Standard adult BMI base body fat estimation formula
    const base = formData.gender === "Female" 
      ? (1.20 * bmi) + (0.23 * formData.age) - 5.4
      : (1.20 * bmi) + (0.23 * formData.age) - 16.2;
    return Number(Math.max(3, Math.min(50, base)).toFixed(1));
  };

  const calculateTDEE = () => {
    // Mifflin St. Jeor Base
    const isMale = formData.gender === "Male";
    const bmr = isMale
      ? (10 * formData.weight_kg) + (6.25 * formData.height_cm) - (5 * formData.age) + 5
      : (10 * formData.weight_kg) + (6.25 * formData.height_cm) - (5 * formData.age) - 161;

    let multiplier = 1.2; // sedentary
    if (formData.activity_level === "light") multiplier = 1.375;
    else if (formData.activity_level === "moderate") multiplier = 1.55;
    else if (formData.activity_level === "active") multiplier = 1.725;

    return Math.round(bmr * multiplier);
  };

  const formatGoal = (g: string) => {
    if (g === "lose_fat") return "Fat Loss (Deficit Focus)";
    if (g === "build_muscle") return "Muscle Building (Hypertrophy Focus)";
    return "Body Recomposition (Fat Loss & Muscle Building)";
  };

  const handleNext = () => {
    if (step < 6) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const triggerPlansGeneration = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Generate Fitness plan
      setGenerationStep("Analyzing physical metrics & generating custom workout plans... (Step 1/3)");
      const fitResp = await fetch("/api/fitness/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (!fitResp.ok) {
        const errData = await fitResp.json();
        throw new Error(`Workout Plan Generation Failed: ${errData.error || "Please verify API key settings."}`);
      }

      // 2. Generate Diet plan
      setGenerationStep("Designing home recipe nutrition macro plan... (Step 2/3)");
      const dietResp = await fetch("/api/diet/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (!dietResp.ok) {
        const errData = await dietResp.json();
        throw new Error(`Nutrition Plan Generation Failed: ${errData.error || "Please verify API key settings."}`);
      }

      // 3. Save Profile & complete Onboarding
      setGenerationStep("Finalizing your customized training program... (Step 3/3)");
      const updateResult = await updateProfile({
        ...formData,
        onboarding_done: true
      });

      if (!updateResult.success) {
        throw new Error(updateResult.error || "Failed to update profile settings.");
      }

      // 4. Initialise logs with weight weigh-in matching onboarding weight
      await fetch("/api/weigh-ins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          weight_kg: formData.weight_kg,
          body_fat_percent: estimateBodyFat(calculateBMI()),
          notes: "Initial weight at onboarding tracker."
        })
      });

      // Complete
      onComplete();
    } catch (err: any) {
      setError(err.message || "An unexpected generation error occurred.");
    } finally {
      setLoading(false);
      setGenerationStep("");
    }
  };

  const bmiValue = calculateBMI();
  const bfValue = estimateBodyFat(bmiValue);
  const tdeeValue = calculateTDEE();
  
  // Calorie targets baseline calculations
  const calorieObjective = formData.goal === "lose_fat" 
    ? Math.round(tdeeValue - 500) 
    : formData.goal === "build_muscle" 
      ? Math.round(tdeeValue + 250) 
      : tdeeValue;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-slate-50/20 dark:bg-slate-950/20 text-[var(--text-primary)]">
      <div className="max-w-3xl mx-auto">
        
        {/* Progress Strip header */}
        <div className="mb-8 select-none">
          <div className="flex items-center justify-between mb-3 text-xs text-[var(--text-secondary)] font-extrabold uppercase tracking-widest">
            <span>FitTrack Setup Wizard</span>
            <span>Step {step} of 6</span>
          </div>
          <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 dark:bg-indigo-400 transition-all duration-300 ease-out"
              style={{ width: `${(step / 6) * 100}%` }}
            ></div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-rose-100 dark:border-rose-950 bg-rose-50 dark:bg-rose-950/25 text-rose-500 text-xs font-bold leading-relaxed">
            <div className="flex items-center space-x-2 font-black mb-1.5 text-rose-600 dark:text-rose-400 uppercase tracking-wide">
              <ShieldAlert className="h-4.5 w-4.5" />
              <span>Onboarding Pipeline Error</span>
            </div>
            {error}
            <div className="mt-3.5 pt-3.5 border-t border-rose-100 dark:border-rose-950">
              Please guarantee your <strong className="underline text-rose-600 dark:text-rose-450">GEMINI_API_KEY</strong> is set up properly inside the Secrets panel under Settings before triggering plans generation.
            </div>
          </div>
        )}

        {/* LOADING GENERATOR SCREEN OVERLAY */}
        {loading && (
          <div className="card p-8 text-center text-sm shadow-xl flex flex-col items-center justify-center space-y-6 bg-[var(--bg-card)]">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 dark:border-indigo-950 dark:border-t-indigo-400 animate-spin flex items-center justify-center"></div>
              <Activity className="h-6 w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="font-extrabold text-lg tracking-tight text-[var(--text-primary)] animate-pulse">
                Assembling Your Personalized Plan
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
                Gemini's algorithm is studying your available training plates and BMI ratios to generate targeted routines and simple ingredients...
              </p>
            </div>

            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl max-w-sm text-left border border-indigo-100 dark:border-indigo-900/40 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center space-x-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600 flex-shrink-0" />
              <span>{generationStep}</span>
            </div>
          </div>
        )}

        {!loading && (
          <div className="space-y-6">
            
            {/* STEP 1: Personal physical values */}
            {step === 1 && (
              <div className="card p-6 xs:p-8 space-y-4 bg-[var(--bg-card)]">
                <div className="flex items-center space-x-2.5 mb-2">
                  <User className="h-5 w-5 text-indigo-500" />
                  <h2 className="text-xl font-black tracking-tight">Tell Us About Yourself</h2>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">Please supply basic parameters. We use this to compute customized BMR and BMI multipliers.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-extrabold text-[var(--text-secondary)]">Your Age</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                      className="mt-1 block w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] font-bold text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-extrabold text-[var(--text-secondary)]">Gender Category</label>
                    <div className="flex mt-1 space-x-2 text-center font-bold text-xs">
                      {["Male", "Female", "Other"].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setFormData({ ...formData, gender: g as any })}
                          className={`flex-1 py-2 rounded-xl border cursor-pointer ${formData.gender === g ? "bg-indigo-600 text-white border-indigo-600" : "bg-[var(--bg-primary)] border-[var(--border)] text-[var(--text-secondary)]"}`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-extrabold text-[var(--text-secondary)]">Height (in cm)</label>
                    <input
                      type="number"
                      value={formData.height_cm}
                      onChange={(e) => setFormData({ ...formData, height_cm: Number(e.target.value) })}
                      className="mt-1 block w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] font-bold text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-extrabold text-[var(--text-secondary)]">Weight (in kg)</label>
                    <input
                      type="number"
                      value={formData.weight_kg}
                      onChange={(e) => setFormData({ ...formData, weight_kg: Number(e.target.value) })}
                      className="mt-1 block w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] font-bold text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: General Goals */}
            {step === 2 && (
              <div className="card p-6 xs:p-8 space-y-4 bg-[var(--bg-card)]">
                <div className="flex items-center space-x-2.5 mb-2">
                  <Flame className="h-5 w-5 text-indigo-500" />
                  <h2 className="text-xl font-black tracking-tight">Select Primary Target</h2>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">The calorie deficit or surplus ratios of both recipes and rep sets is governed by this key objective.</p>

                <div className="space-y-2.5 pt-2 select-none">
                  {[
                    { id: "lose_fat", label: "Lose Body Fat", desc: "Slight daily calorie deficit. Higher density rep sets with brief active rest intervals to secure fat burn.", icon: "🔥" },
                    { id: "build_muscle", label: "Build Visible Muscle", desc: "Hypertrophy calorie matrix focus. Heavy rep sets focusing on progressive overload and muscle builds.", icon: "💪" },
                    { id: "recomp", label: "Body Recomposition (Both)", desc: "Balanced macros structure. Burns excess torso lipids while growing lean muscle fibres.", icon: "⚡" }
                  ].map((x) => (
                    <div
                      key={x.id}
                      onClick={() => setFormData({ ...formData, goal: x.id as any })}
                      className={`p-4 border rounded-2xl cursor-pointer flex items-start space-x-3 transition-colors ${formData.goal === x.id ? "bg-indigo-500/10 border-indigo-400" : "bg-[var(--bg-primary)] border-[var(--border)] hover:bg-slate-50 dark:hover:bg-slate-900"}`}
                    >
                      <span className="text-xl p-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-[var(--border)]">{x.icon}</span>
                      <div className="text-left">
                        <p className="font-extrabold text-xs text-[var(--text-primary)]">{x.label}</p>
                        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-normal">{x.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="block text-[10px] uppercase tracking-wider font-extrabold text-[var(--text-secondary)] mb-1.5 flex items-center space-x-1.5 font-bold">
                    <Calendar className="h-4 w-4 text-indigo-500" />
                    <span>When do you want to reach your goal?</span>
                  </label>
                  <CalendarPicker
                    value={formData.target_date}
                    id="target_date_calendar"
                    onChange={(val) => setFormData({ ...formData, target_date: val })}
                  />
                  {formData.target_date && (
                    <div className="mt-2 text-xs font-semibold px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400 inline-flex items-center space-x-1.5 animate-fade-in shadow-sm">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                      <span>Selected (DD-MM-YYYY): <strong className="font-extrabold font-mono">{(() => {
                        const parts = formData.target_date.split("-");
                        return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : formData.target_date;
                      })()}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: Training Space */}
            {step === 3 && (
              <div className="card p-6 xs:p-8 space-y-4 bg-[var(--bg-card)]">
                <div className="flex items-center space-x-2.5 mb-2">
                  <Home className="h-5 w-5 text-indigo-500" />
                  <h2 className="text-xl font-black tracking-tight">Preferred Training Space</h2>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">If Home is selected, exercises will focus purely on floor-friendly exercises without complex stationary gym racks.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 select-none">
                  {[
                    { id: "home", label: "Home Workout", desc: "Floor based compound movements. Dumbbells, floor presses, pushup variants.", icon: <Home className="h-6 w-6" /> },
                    { id: "gym", label: "Gym Focus", desc: "Access to stationary gym machinery, back benches, pull racks.", icon: <Dumbbell className="h-6 w-6" /> }
                  ].map((x) => (
                    <div
                      key={x.id}
                      onClick={() => setFormData({ ...formData, workout_location: x.id as any })}
                      className={`p-5 border rounded-2xl cursor-pointer text-center flex flex-col items-center justify-center space-y-2.5 transition-colors ${formData.workout_location === x.id ? "bg-indigo-505/10 border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30" : "bg-[var(--bg-primary)] border-[var(--border)] hover:bg-slate-50 dark:hover:bg-slate-900"}`}
                    >
                      <div className={`p-3 rounded-xl border ${formData.workout_location === x.id ? "bg-indigo-600 text-white" : "bg-slate-50 dark:bg-slate-900 text-[var(--text-secondary)] border-[var(--border)]"}`}>
                        {x.icon}
                      </div>
                      <div>
                        <p className="font-extrabold text-xs text-[var(--text-primary)]">{x.label}</p>
                        <p className="text-[10px] text-[var(--text-secondary)] mt-1 max-w-[200px] mx-auto leading-normal">{x.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: Weights Equipment */}
            {step === 4 && (
              <div className="card p-6 xs:p-8 space-y-4 bg-[var(--bg-card)]">
                <div className="flex items-center space-x-2.5 mb-2">
                  <Dumbbell className="h-5 w-5 text-indigo-500" />
                  <h2 className="text-xl font-black tracking-tight">Available Equipment</h2>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">Specify what accessories you have at hand, as we only include exercises that you own are selected.</p>
                
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-950 p-3 rounded-xl text-[11px] text-[var(--text-primary)] font-medium leading-relaxed leading-normal">
                  💡 <strong>Pre-Selection Notice:</strong> We pre-selected <strong>Dumbbell Rods</strong>, a <strong>Barbell Extender</strong> and <strong>Weight Plates</strong> since you provided these specs! Feel free to modify.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 select-none">
                  {equipmentOptions.map((opt) => {
                    const active = formData.equipment.includes(opt.id);
                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleEquipmentToggle(opt.id)}
                        className={`p-3 border rounded-xl cursor-pointer flex items-center justify-between text-xs font-semibold ${active ? "bg-indigo-50 border-indigo-300 dark:bg-indigo-950/20 text-[var(--text-primary)]" : "bg-[var(--bg-primary)] border-[var(--border)] text-[var(--text-secondary)] hover:bg-slate-50 dark:hover:bg-slate-900"}`}
                      >
                        <span>{opt.label}</span>
                        <div className={`h-4 w-4 rounded-md border flex items-center justify-center ${active ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300"}`}>
                          {active && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 5: Physical Activity Level */}
            {step === 5 && (
              <div className="card p-6 xs:p-8 space-y-4 bg-[var(--bg-card)]">
                <div className="flex items-center space-x-2.5 mb-2">
                  <Activity className="h-5 w-5 text-indigo-500" />
                  <h2 className="text-xl font-black tracking-tight">Daily Activity Level</h2>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">Your TDEE multiplier index is generated directly from this card choice.</p>

                <div className="space-y-2 select-none pt-2">
                  {[
                    { id: "sedentary", label: "Sedentary", desc: "Desk job hours, little to no structured weekly training." },
                    { id: "light", label: "Light Activity", desc: "Walking workouts or light physical training 1-2 days/week." },
                    { id: "moderate", label: "Moderate Work", desc: "Structured workout sessions 3-4 days/week. Standard active routine." },
                    { id: "active", label: "Active Training", desc: "Rugged high-volume sport or strength training 5+ days/week." }
                  ].map((x) => (
                    <div
                      key={x.id}
                      onClick={() => setFormData({ ...formData, activity_level: x.id as any })}
                      className={`p-3.5 border rounded-xl cursor-pointer flex justify-between items-center transition-colors ${formData.activity_level === x.id ? "bg-indigo-500/10 border-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20" : "bg-[var(--bg-primary)] border-[var(--border)] hover:bg-slate-50 dark:hover:bg-slate-900"}`}
                    >
                      <div className="text-left">
                        <span className="font-bold text-xs text-[var(--text-primary)] block">{x.label}</span>
                        <span className="text-[10px] text-[var(--text-secondary)] leading-tight mt-0.5 block">{x.desc}</span>
                      </div>
                      <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center ${formData.activity_level === x.id ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300"}`}>
                        {formData.activity_level === x.id && <div className="h-2 w-2 rounded-full bg-white"></div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 6: Review & AI Build Trigger */}
            {step === 6 && (
              <div className="space-y-4">
                
                {/* Physical review cards */}
                <div className="card p-6 bg-[var(--bg-card)] space-y-4">
                  <div className="flex items-center space-x-2.5 mb-2">
                    <Award className="h-5 w-5 text-indigo-500" />
                    <h2 className="text-xl font-black tracking-tight">Review Physical Blueprint</h2>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">Here is our mathematical outline based on Mifflen formula estimates. Verify everything looks aligned before calling Gemini.</p>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-3.5 rounded-xl border border-[var(--border)] bg-slate-50/50 dark:bg-slate-900/55">
                      <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide font-extrabold">BMI Ratio</span>
                      <p className="text-lg font-black text-[var(--text-primary)] mt-1">{bmiValue}</p>
                      <span className="text-[9px] font-bold text-indigo-500">
                        {bmiValue < 18.5 ? "Underweight" : bmiValue < 25 ? "Normal Weight" : bmiValue < 30 ? "Overweight" : "Obese"}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-[var(--border)] bg-slate-50/50 dark:bg-slate-900/55">
                      <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide font-extrabold">Estimated Body Fat</span>
                      <p className="text-lg font-black text-[var(--text-primary)] mt-1">{bfValue}%</p>
                      <span className="text-[9px] font-bold text-indigo-500">Navy Calculation Formula</span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-[var(--border)] bg-slate-50/50 dark:bg-slate-900/55">
                      <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide font-extrabold">TDEE Baseline</span>
                      <p className="text-lg font-black text-[var(--text-primary)] mt-1">{tdeeValue} kcal</p>
                      <span className="text-[9px] font-bold text-indigo-500">Maintenance Energy Requirements</span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-[var(--border)] bg-indigo-500/10 border-indigo-200 dark:border-indigo-950">
                      <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide font-extrabold">Objective Targets</span>
                      <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-1">{calorieObjective} kcal</p>
                      <span className="text-[9px] font-bold text-emerald-500">Energy limit for calorie planning</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[var(--border)] text-xs text-slate-600 dark:text-slate-300 space-y-2">
                    <p className="flex justify-between font-semibold">
                      <span>Physical Goal:</span> <span className="text-[var(--text-primary)] font-extrabold">{formatGoal(formData.goal)}</span>
                    </p>
                    <p className="flex justify-between font-semibold">
                      <span>Workout Location:</span> <span className="text-[var(--text-primary)] font-extrabold">{formData.workout_location === "home" ? "Home Space" : "Gym Racks"}</span>
                    </p>
                    <p className="flex justify-between font-semibold">
                      <span>Equipped items:</span> <span className="text-[var(--text-primary)] font-extrabold">{formData.equipment.length} items active</span>
                    </p>
                  </div>
                </div>

                <div className="card p-6 bg-gradient-to-r from-indigo-900 to-slate-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <h3 className="font-extrabold text-sm text-indigo-300 uppercase tracking-widest">Plan Construction Center</h3>
                  <p className="text-xs text-slate-300 leading-normal font-medium max-w-md">
                    Ready to build your plan? FitTrack will call the Google Gemini API to assemble a complete 7-day training schedule and nutrition program.
                  </p>
                  
                  <button
                    onClick={triggerPlansGeneration}
                    className="w-full sm:w-auto px-10 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs tracking-wide rounded-2xl cursor-pointer shadow-lg inline-flex items-center justify-center space-x-2"
                  >
                    <span>Generate My Plans 🚀</span>
                  </button>
                </div>

              </div>
            )}

            {/* BUTTON NAVIGATION CONTROL PANELS */}
            <div className="flex justify-between select-none">
              <button
                onClick={handlePrev}
                className={`px-5 py-2.5 border border-[var(--border)] bg-[var(--bg-card)] rounded-xl font-bold text-xs text-[var(--text-secondary)] cursor-pointer flex items-center space-x-1 hover:bg-slate-50 dark:hover:bg-slate-900 ${step === 1 ? "opacity-0 cursor-not-allowed" : ""}`}
                disabled={step === 1}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              {step < 6 ? (
                <button
                  onClick={handleNext}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs cursor-pointer flex items-center space-x-1 hover:bg-indigo-700"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : null}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
