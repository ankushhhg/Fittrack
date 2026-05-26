/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from "react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import StatsCard from "../components/StatsCard";
import {
  Calendar,
  Activity,
  GlassWater,
  Scale,
  Smile,
  CirclePlay,
  HeartPulse,
  Flame,
  Apple,
  TrendingUp,
  AlertCircle,
  TrendingDown,
  Loader2,
  CheckCircle,
  Plus
} from "lucide-react";

interface DashboardProps {
  setTab: (tab: string) => void;
  setWorkoutDayParam: (day: number) => void;
}

export default function Dashboard({ setTab, setWorkoutDayParam }: DashboardProps) {
  const { user, token, refreshUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const [dietPlan, setDietPlan] = useState<any>(null);
  const [todayMeals, setTodayMeals] = useState<any[]>([]);
  const [mealTotals, setMealTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [sessionLogs, setSessionLogs] = useState<any[]>([]);
  const [weighIns, setWeighIns] = useState<any[]>([]);

  // Modal State
  const [showWeighInModal, setShowWeighInModal] = useState(false);
  const [inputWeight, setInputWeight] = useState("");
  const [inputBodyFat, setInputBodyFat] = useState("");
  const [savingWeighIn, setSavingWeighIn] = useState(false);

  // API Key Verification state
  const [verifyingKey, setVerifyingKey] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);

  const handleVerifyApiKey = async () => {
    if (!token) return;
    setVerifyingKey(true);
    setVerifyResult(null);
    try {
      const resp = await fetch("/api/auth/verify-api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await resp.json();
      if (data.success) {
        setVerifyResult({ success: true, message: data.message });
        await refreshUser(); // This triggers updating 'user' in Context, which dismisses the warning banner
      } else {
        setVerifyResult({ success: false, error: data.error });
      }
    } catch (err) {
      setVerifyResult({ success: false, error: "Network communication error with the verification server." });
    } finally {
      setVerifyingKey(false);
    }
  };

  const fetchDashboardData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // 1. Fetch Workout Plan (GET /api/fitness/plan)
      const wPlanResp = await fetch("/api/fitness/plan", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (wPlanResp.ok) {
        const body = await wPlanResp.json();
        setWorkoutPlan(body.plan);
      }

      // 2. Fetch Diet Plan (GET /api/diet/plan)
      const dPlanResp = await fetch("/api/diet/plan", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (dPlanResp.ok) {
        const body = await dPlanResp.json();
        setDietPlan(body.plan);
      }

      // 3. Fetch Today's log totals (GET /api/logs/today)
      const todayLogsResp = await fetch("/api/logs/today", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (todayLogsResp.ok) {
        const body = await todayLogsResp.json();
        setTodayMeals(body.logs);
        setMealTotals({
          calories: body.totalCalories,
          protein: body.totalProtein,
          carbs: body.totalCarbs,
          fat: body.totalFat
        });
        setWaterGlasses(body.waterGlasses);
      }

      // 4. Fetch all sessions & weigh-ins (GET /api/logs/all)
      const logsResp = await fetch("/api/logs/all", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (logsResp.ok) {
        const body = await logsResp.json();
        setSessionLogs(body.workoutSessions || []);
      }

      // 5. Fetch weigh-ins
      const weighResp = await fetch("/api/weigh-ins", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (weighResp.ok) {
        const body = await weighResp.json();
        setWeighIns(body.weighIns || []);
        if (body.weighIns && body.weighIns.length > 0) {
          const latest = body.weighIns[body.weighIns.length - 1];
          setInputWeight(latest.weight_kg.toString());
          setInputBodyFat(latest.body_fat_percent ? latest.body_fat_percent.toString() : "");
        }
      }

    } catch (err) {
      console.error("Dashboard preloading failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  // Adjust Water Index
  const updateWaterIntake = async (glassesCount: number) => {
    if (glassesCount < 0) return;
    setWaterGlasses(glassesCount);
    try {
      await fetch("/api/logs/water", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          date: new Date().toISOString().split("T")[0],
          glasses: glassesCount
        })
      });
    } catch (err) {
      console.error("Failed to commit water log:", err);
    }
  };

  // Submit Weigh In
  const submitWeighIn = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputWeight) return;
    setSavingWeighIn(true);
    try {
      const resp = await fetch("/api/weigh-ins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          weight_kg: Number(inputWeight),
          body_fat_percent: inputBodyFat ? Number(inputBodyFat) : undefined,
          notes: "Real-time Dashboard Weigh-in Entry"
        })
      });
      if (resp.ok) {
        setShowWeighInModal(false);
        await refreshUser(); // sync profile weight
        await fetchDashboardData(); // reload cards
      }
    } catch (err) {
      console.error("Failed logging weight scale:", err);
    } finally {
      setSavingWeighIn(false);
    }
  };

  if (!user) return null;

  // Header dynamic greeting
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 17) return "Good afternoon";
    return "Good evening";
  };

  // Current day indices matching (Monday -> 0 ... Sunday -> 6)
  const getDayIndex = () => {
    let day = new Date().getDay(); // 0 is Sunday, 1 is Monday...
    // Wrap to Mon -> 0, Tue -> 1 ... Sun -> 6
    return day === 0 ? 6 : day - 1;
  };

  const dayIndex = getDayIndex();
  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const currentDayName = weekDays[dayIndex];

  // Match today's plan
  const todayWorkout = workoutPlan && workoutPlan[dayIndex] ? workoutPlan[dayIndex] : null;

  // BMI computations
  const age = user.age || 26;
  const weight = user.weight_kg || 70;
  const height = user.height_cm || 172;
  const hM = height / 100;
  const bmi = Number((weight / (hM * hM)).toFixed(1));

  const getBMICategory = (b: number) => {
    if (b < 18.5) return "Underweight";
    if (b < 25) return "Normal Range";
    if (b < 30) return "Overweight Range";
    return "Obese Index";
  };

  // Navy Estimate
  const estBodyFat = () => {
    const base = user.gender === "Female"
      ? (1.20 * bmi) + (0.23 * age) - 5.4
      : (1.20 * bmi) + (0.23 * age) - 16.2;
    return Number(Math.max(3, Math.min(50, base)).toFixed(1));
  };
  const bf = estBodyFat();

  const getBFCategory = (f: number) => {
    if (user.gender === "Female") {
      if (f < 12) return "Essential Fat";
      if (f < 21) return "Athletes Level";
      if (f < 25) return "Optimal fitness";
      if (f < 32) return "Acceptable Limits";
      return "Obese Margin";
    } else {
      if (f < 6) return "Essential Lipid";
      if (f < 14) return "Athletic Core";
      if (f < 18) return "Fitness Ratio";
      if (f < 25) return "Acceptable";
      return "Obese Margin";
    }
  };

  // Calorie calculations
  const calorieTarget = dietPlan?.dailyCalorieTarget || 1800;
  const loggedCalories = mealTotals.calories;
  const calorieBalance = calorieTarget - loggedCalories;

  // Macro splitting structures
  const targetProteins = dietPlan?.macroSplit?.protein_g || 140;
  const targetCarbs = dietPlan?.macroSplit?.carbs_g || 180;
  const targetFats = dietPlan?.macroSplit?.fat_g || 60;

  // Workout completeness percentages today
  const todaySessionLogged = sessionLogs.find(
    (s) => s.date === new Date().toISOString().split("T")[0]
  );
  const workoutProgressPercent = todaySessionLogged ? 100 : 0;
  const calorieProgressPercent = Math.min(100, Math.round((loggedCalories / calorieTarget) * 100));

  // Calendar timeline calculations: Streak map (filled square dots inside last 30 days grid)
  const getStreakTileDays = () => {
    const dates = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const str = d.toISOString().split("T")[0];
      const match = sessionLogs.some((s) => s.date === str);
      dates.push({ dateStr: str, active: match, dayAbbr: d.getDate() });
    }
    return dates;
  };
  const streakTiles = getStreakTileDays();
  const currentStreakCount = [...sessionLogs]
    .sort((a,b) => b.date.localeCompare(a.date))
    .reduce((acc, current, k, arr) => {
      // Very simple local consecutive day analysis
      return acc + 1; // placeholder, dynamic displays logs
    }, sessionLogs.length);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[var(--text-primary)]">
      
      {loading ? (
        <div className="h-[40vh] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          <p className="text-xs text-[var(--text-secondary)] font-extrabold uppercase tracking-widest">Loading dashboard metrics...</p>
        </div>
      ) : (
        <div className="space-y-8 page-enter">
          
          {/* Welcome ribbon */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-6 border-b border-white/10 gap-y-6">
            <div>
              <p className="text-black/50 dark:text-white/40 text-[11px] font-bold tracking-widest uppercase mb-1">
                {getGreeting()}, {user.name}
              </p>
              <h1 className="text-3xl sm:text-4xl font-light italic font-serif leading-tight text-[var(--text-primary)]">
                Targeting <span className="text-indigo-650 dark:text-[#CBFF2E] not-italic font-sans font-extrabold tracking-tight">
                  {user.goal === "lose_fat" ? "LOSE FAT" : user.goal === "build_muscle" ? "BUILD MUSCLE" : "RECOMPOSITION"}
                </span> 
              </h1>
              <p className="text-xs text-[var(--text-secondary)] font-bold mt-2 uppercase tracking-wider">
                Current Weight: <span className="font-extrabold text-indigo-650 dark:text-[#CBFF2E]">{weight}kg</span>
              </p>
            </div>
            
            <button
              onClick={() => setShowWeighInModal(true)}
              className="px-5 py-3 rounded-xl bg-[#CBFF2E] hover:bg-[#bce628] text-black font-extrabold text-xs shadow-[0_4px_15px_rgba(203,255,46,0.2)] hover:scale-[1.02] cursor-pointer flex items-center space-x-1.5 transition-all leading-none"
            >
              <Scale className="h-4 w-4" />
              <span>Weigh In Today</span>
            </button>
          </div>

          {/* API Key Leaked / Fallback Warning Banner */}
          {user.api_error_warning && (
            <div className="relative overflow-hidden bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/20 rounded-2xl p-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs tracking-wide uppercase">
                  <span className="p-1 px-2.5 rounded bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 text-[10px] font-black tracking-widest leading-none">AI OFFLINE MODE ACTIVE</span>
                  <span className="text-neutral-900 dark:text-white/90 font-bold text-[11px] normal-case">FitTrack Premium offline compiler took over successfully</span>
                </div>
                <p className="text-xs text-neutral-700 dark:text-white/70 max-w-4xl leading-relaxed">
                  Notice: Your Google Gemini API Key was flagged as leaked, missing or blocked: <code className="bg-neutral-150 dark:bg-black/40 text-rose-700 dark:text-rose-400 px-1.5 py-0.5 rounded text-[11px] font-mono break-all">{user.api_error_warning}</code>. 
                  But don't worry! We successfully compiled high-quality workout routines and recipe plans offline for you, so your fitness onboarding is completely uninterrupted.
                </p>
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[11px] text-amber-300/90 leading-normal font-medium max-w-3xl">
                  ⚡ <strong>To reactivate fully-dynamic online AI synthesis:</strong> Go to the Google AI Studio <strong>'Settings'</strong> menu (top-right gear icon) → <strong>'Secrets'</strong> → find <strong>'GEMINI_API_KEY'</strong>, and input your valid API key. Once added, test the key below to automatically sync and go online!
                </div>
                <div className="pt-1 flex flex-wrap items-center gap-4">
                  <button
                    onClick={handleVerifyApiKey}
                    disabled={verifyingKey}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-black text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center space-x-1.5 shadow-sm"
                  >
                    {verifyingKey ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-black" />
                        <span>Verifying API Key...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Verify API Key & Go Online</span>
                      </>
                    )}
                  </button>

                  {verifyResult && (
                    <div className={`text-xs px-3 py-1.5 rounded-lg border font-medium ${
                      verifyResult.success 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}>
                      {verifyResult.success ? verifyResult.message : verifyResult.error}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Stats Multiplier block */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              icon={<Activity className="h-5 w-5" />}
              label="BMI Index"
              value={bmi}
              color="indigo"
              subtitle={`Classification: ${getBMICategory(bmi)}`}
            />
            <StatsCard
              icon={<HeartPulse className="h-5 w-5" />}
              label="Body Fat Estimate"
              value={bf}
              unit="%"
              color="rose"
              subtitle={`Navy Standard: ${getBFCategory(bf)}`}
            />
            <StatsCard
              icon={<Flame className="h-5 w-5" />}
              label="Caloric Target"
              value={calorieTarget}
              unit="kcal"
              color="amber"
              subtitle="Daily Maintenance Ceiling"
            />
            <StatsCard
              icon={<TrendingUp className="h-5 w-5" />}
              label={calorieBalance >= 0 ? "Calories Left" : "Calorie Deficit"}
              value={Math.abs(calorieBalance)}
              unit="kcal"
              color={calorieBalance >= 0 ? "green" : "red"}
              subtitle={calorieBalance >= 0 ? "Remaining eating budget" : "Caloric margin exceeded!"}
            />
          </div>

          {/* Interactive plan focus dividers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Today Workout Summary */}
            <div className="card p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-violet-750 dark:text-indigo-400 uppercase tracking-widest flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4 text-violet-700 dark:text-indigo-400" />
                    <span>Today's Routine</span>
                  </span>
                  <span className="text-xs text-neutral-800 dark:text-[var(--text-secondary)] font-extrabold">{currentDayName} Schedule</span>
                </div>

                <div className="mt-4">
                  {todayWorkout && !todayWorkout.restDay ? (
                    <div>
                      <h3 className="text-xl font-black tracking-tight text-[var(--text-primary)]">
                        {todayWorkout.muscleGroup}
                      </h3>
                      <p className="text-xs font-semibold text-[var(--text-secondary)] mt-1.5 flex gap-x-2 items-center">
                        <span>📋 {todayWorkout.mainExercises?.length || 0} exercises scheduled</span>
                        <span>•</span>
                        <span>⏱️ Est: ~50 mins</span>
                      </p>

                      <div className="mt-4 p-3 rounded-xl border border-[var(--border)] bg-slate-50/50 dark:bg-slate-900/40 text-xs">
                        <span className="font-bold text-[10px] uppercase text-violet-750 dark:text-indigo-400 tracking-wider">Workout Focus</span>
                        <p className="mt-1 font-extrabold text-neutral-800 dark:text-white leading-relaxed">
                          Includes {todayWorkout.warmup?.length || 0} warm-ups, {todayWorkout.supersets?.length || 0} supersets burner and abs core shred exercises!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-950/80 bg-emerald-500/10 text-center">
                      <h4 className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">Rest & Recover Day 🧘</h4>
                      <p className="text-xs leading-relaxed text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">
                        Your fibers are recovering. Stretch for 10 minutes, drink 8 glasses of water, check tomorrow's muscle targets.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-2.5 pt-3 border-t border-[var(--border)] select-none">
                <button
                  onClick={() => {
                    setWorkoutDayParam(dayIndex);
                    setTab("fitness");
                  }}
                  className="flex-1 py-3 text-center border border-[var(--border)] font-extrabold text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer text-[var(--text-primary)]"
                >
                  View Details
                </button>
                {todayWorkout && !todayWorkout.restDay && (
                  <button
                    onClick={() => {
                      setWorkoutDayParam(dayIndex);
                      setTab("fitness_session");
                    }}
                    className="flex-1 py-3 text-center bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <CirclePlay className="h-4 w-4" />
                    <span>Start Active Session</span>
                  </button>
                )}
              </div>
            </div>

            {/* Today Diet Summary */}
            <div className="card p-6 flex flex-col justify-between space-y-4 border-neutral-300 dark:border-[var(--border)]">
              <div>
                <span className="text-xs font-bold text-emerald-700 dark:text-white uppercase tracking-widest flex items-center space-x-1">
                  <Apple className="h-4 w-4 text-emerald-600 dark:text-white" />
                  <span>Macronutrient tracking</span>
                </span>

                <div className="mt-4 space-y-3.5">
                  <div className="flex justify-between text-xs font-extrabold mb-1 text-black dark:text-white">
                    <span className="text-black dark:text-white">Protein Index</span>
                    <span className="text-black dark:text-white font-extrabold">{mealTotals.protein}g / {targetProteins}g</span>
                  </div>
                  <div className="h-2.5 bg-neutral-200 dark:bg-slate-900 rounded-full overflow-hidden border border-neutral-300 dark:border-white/5">
                    <div
                      className="bg-sky-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (mealTotals.protein / targetProteins) * 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-xs font-extrabold mb-1 text-black dark:text-white">
                    <span className="text-black dark:text-white">Carbs Index</span>
                    <span className="text-black dark:text-white font-extrabold">{mealTotals.carbs}g / {targetCarbs}g</span>
                  </div>
                  <div className="h-2.5 bg-neutral-200 dark:bg-slate-900 rounded-full overflow-hidden border border-neutral-300 dark:border-white/5">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (mealTotals.carbs / targetCarbs) * 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-xs font-extrabold mb-1 text-black dark:text-white">
                    <span className="text-black dark:text-white">Fats (healthy)</span>
                    <span className="text-black dark:text-white font-extrabold">{mealTotals.fat}g / {targetFats}g</span>
                  </div>
                  <div className="h-2.5 bg-neutral-200 dark:bg-slate-900 rounded-full overflow-hidden border border-neutral-300 dark:border-white/5">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (mealTotals.fat / targetFats) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2.5 pt-3 border-t border-neutral-300 dark:border-[var(--border)] select-none">
                <button
                  onClick={() => setTab("diet")}
                  className="flex-1 py-3 text-center border border-neutral-300 dark:border-[var(--border)] font-extrabold text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer text-black dark:text-white"
                >
                  View Meal Recipes
                </button>
                <button
                  onClick={() => setTab("diet_log")}
                  className="flex-1 py-3 text-center bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Plus className="h-4.5 w-4.5 animate-pulse" />
                  <span>Log Food Meal</span>
                </button>
              </div>
            </div>

          </div>

          {/* Progress gauges & Water logs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* circular gauges SVGs */}
            <div className="card p-6 space-y-4">
              <span className="text-xs font-bold text-violet-750 dark:text-white uppercase tracking-widest flex items-center space-x-1">
                <TrendingUp className="h-4 w-4 text-violet-700 dark:text-white" />
                <span>Today's Completion Ratios</span>
              </span>

              <div className="flex justify-around items-center pt-2 select-none">
                
                {/* Ring 1 - workouts */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="flex flex-col items-center space-y-2"
                >
                  <div className="relative flex items-center justify-center">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle cx="48" cy="48" r="38" className="stroke-slate-100 dark:stroke-slate-900 fill-none" strokeWidth="6" />
                      <motion.circle
                        cx="48"
                        cy="48"
                        r="38"
                        className="stroke-indigo-600 dark:stroke-indigo-400 fill-none"
                        strokeWidth="6"
                        strokeDasharray={2 * Math.PI * 38}
                        initial={{ strokeDashoffset: 2 * Math.PI * 38 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 38 * (1 - workoutProgressPercent / 100) }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                      />
                    </svg>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.5 }}
                      className="absolute text-sm font-black text-[var(--text-primary)] dark:text-white"
                    >
                      {workoutProgressPercent}%
                    </motion.span>
                  </div>
                  <span className="text-[11px] font-extrabold text-neutral-800 dark:text-white">Training Sessions</span>
                </motion.div>

                {/* Ring 2 - calories */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
                  className="flex flex-col items-center space-y-2"
                >
                  <div className="relative flex items-center justify-center">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle cx="48" cy="48" r="38" className="stroke-slate-100 dark:stroke-slate-900 fill-none" strokeWidth="6" />
                      <motion.circle
                        cx="48"
                        cy="48"
                        r="38"
                        className="stroke-emerald-600 dark:stroke-emerald-400 fill-none"
                        strokeWidth="6"
                        strokeDasharray={2 * Math.PI * 38}
                        initial={{ strokeDashoffset: 2 * Math.PI * 38 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 38 * (1 - calorieProgressPercent / 100) }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.35 }}
                      />
                    </svg>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.65 }}
                      className="absolute text-sm font-black text-[var(--text-primary)] dark:text-white"
                    >
                      {calorieProgressPercent}%
                    </motion.span>
                  </div>
                  <span className="text-[11px] font-extrabold text-neutral-800 dark:text-white">Calorie Logged</span>
                </motion.div>

              </div>
            </div>

            {/* Water hydration logged */}
            <div className="card p-6 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-bold text-sky-750 dark:text-white uppercase tracking-widest flex items-center space-x-1.5">
                  <GlassWater className="h-4.5 w-4.5 text-sky-700 dark:text-white animate-bounce" />
                  <span>Hydration Meter</span>
                </span>
                
                <p className="mt-2 text-xl font-black text-[var(--text-primary)] dark:text-white">
                  {waterGlasses} / 8 glasses logged
                </p>
                <p className="text-[11px] text-neutral-800 dark:text-white mt-0.5 font-bold">Keep water levels high in muscle recovery cycles.</p>

                {/* Water icons row */}
                <div className="flex flex-wrap gap-2.5 mt-5 justify-start select-none">
                  {Array.from({ length: 8 }).map((_, idx) => {
                    const active = idx < waterGlasses;
                    return (
                      <button
                        key={idx}
                        onClick={() => updateWaterIntake(active ? idx : idx + 1)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer ${active ? "bg-sky-500 border-sky-400 text-white shadow-md shadow-sky-500/15" : "bg-[var(--bg-primary)] border-[var(--border)] text-slate-350 hover:text-sky-500"}`}
                        title={`Record ${idx + 1} cups`}
                      >
                        <GlassWater className="h-5 w-5 stroke-[2.2]" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border)] text-[10px] uppercase font-bold text-[var(--text-secondary)] dark:text-white tracking-widest text-left">
                Tapping a glass logs or sets today's intake values.
              </div>
            </div>

          </div>

          {/* Training Streak tracker */}
          <div className="card p-6 space-y-4 select-none">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-violet-750 dark:text-white uppercase tracking-widest flex items-center space-x-1">
                <Calendar className="h-4 w-4 text-violet-700 dark:text-white" />
                <span>Active 30-Day Training Streak Calendar</span>
              </span>
              <span className="text-xs font-bold px-2.5 py-1 bg-violet-100 dark:bg-indigo-500/10 border border-violet-200 dark:border-indigo-200/50 rounded-lg text-violet-800 dark:text-white">
                Logged Sessions: {sessionLogs.length}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-y-4 pt-1">
              <p className="text-xs text-neutral-800 dark:text-white max-w-sm leading-normal font-bold">
                Green tiles denote days you logged active completed training sessions. Keeps muscles loading consistently!
              </p>
              <div className="h-3 w-40 bg-gradient-to-r from-slate-200 to-emerald-500 dark:from-slate-800 dark:to-emerald-400 rounded overflow-hidden flex items-center justify-between px-2 text-[8px] font-black uppercase text-white">
                <span>rest</span>
                <span>trained ✓</span>
              </div>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 gap-2 pt-2">
              {streakTiles.map((tile, idx) => (
                <div
                  key={idx}
                  className={`aspect-square sm:h-10 sm:w-10 rounded-xl border flex flex-col items-center justify-center text-[10px] font-extrabold select-none transition-all ${tile.active ? "bg-emerald-500 border-emerald-400 text-white shadow-sm" : "bg-slate-100/50 dark:bg-slate-900/60 border-[var(--border)] text-[var(--text-secondary)] dark:text-white"}`}
                  title={tile.dateStr}
                >
                  <span>{tile.dayAbbr}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* WEIGH-IN MODAL POPUP */}
      {showWeighInModal && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in text-sm">
          <div className="card p-6 max-w-md w-full bg-[var(--bg-card)] border-[var(--border)] shadow-2xl relative space-y-4">
            <h3 className="text-lg font-black tracking-tight text-[var(--text-primary)]">Log Weights Scales ⚖️</h3>
            <p className="text-xs text-[var(--text-secondary)]">Record current scales to compute updated BMI status levels.</p>

            <form onSubmit={submitWeighIn} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Current Weight (in kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={inputWeight}
                  onChange={(e) => setInputWeight(e.target.value)}
                  className="mt-1 block w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] font-bold text-sm focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Body Fat % (Optional)</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputBodyFat}
                  onChange={(e) => setInputBodyFat(e.target.value)}
                  placeholder="e.g. 18.5"
                  className="mt-1 block w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] font-bold text-sm focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowWeighInModal(false)}
                  className="flex-1 py-2.5 border border-[var(--border)] rounded-xl font-bold text-xs text-[var(--text-secondary)] bg-[var(--bg-card)] hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingWeighIn}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  {savingWeighIn ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Register Weigh In</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
