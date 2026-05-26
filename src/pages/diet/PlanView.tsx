/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import MealCard from "../../components/MealCard";
import {
  Apple,
  Calendar,
  Activity,
  Award,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Loader2,
  ListRestart,
  CheckCircle2
} from "lucide-react";

interface PlanViewProps {
  setTab: (tab: string) => void;
}

export default function PlanView({ setTab }: PlanViewProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dietPlan, setDietPlan] = useState<any>(null);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  const fetchDietPlan = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/diet/plan", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || "Failed to load nutrition plan.");
      }
      setDietPlan(data.plan || null);
    } catch (err: any) {
      setError(err.message || "Failed reading diet program.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDietPlan();
  }, [token]);

  const handleMealModified = (mealIdx: number, updatedMeal: any) => {
    setDietPlan((prev: any) => {
      if (!prev) return prev;
      const copy = { ...prev };
      const currentDayName = weekDays[selectedDayIdx].toLowerCase();
      // Look up inside weekday meals
      if (copy.weekDaysPlan && copy.weekDaysPlan[currentDayName]) {
        copy.weekDaysPlan[currentDayName][mealIdx] = updatedMeal;
      }
      return copy;
    });

    // Alert toast
    const banner = document.getElementById("diet-modification-toast");
    if (banner) {
      banner.classList.remove("opacity-0");
      banner.classList.add("opacity-100");
      setTimeout(() => {
        banner.classList.remove("opacity-100");
        banner.classList.add("opacity-0");
      }, 3000);
    }
  };

  const handleLoggedToday = () => {
    // Alert toast for logging
    const loggedToast = document.getElementById("meal-logged-toast");
    if (loggedToast) {
      loggedToast.classList.remove("opacity-0");
      loggedToast.classList.add("opacity-100");
      setTimeout(() => {
        loggedToast.classList.remove("opacity-100");
        loggedToast.classList.add("opacity-0");
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="h-[40vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-xs text-[var(--text-secondary)] font-extrabold uppercase tracking-widest">Loading nutrition macro recipes...</p>
      </div>
    );
  }

  if (error || !dietPlan) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-amber-500 mx-auto animate-bounce" />
        <h3 className="text-lg font-black tracking-tight">No Nutrition Plan Found</h3>
        <p className="text-xs text-[var(--text-secondary)]">
          {error || "Your nutrition profile is empty. Let's start the onboarding!"}
        </p>
        <button
          onClick={() => setTab("dashboard")}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md cursor-pointer"
        >
          Initialize Onboarding Program
        </button>
      </div>
    );
  }

  const daysAbbr = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const currentDayName = weekDays[selectedDayIdx];
  
  // Resolve today's meals
  const dayKey = currentDayName.toLowerCase();
  const mealsList = dietPlan.weekDaysPlan ? dietPlan.weekDaysPlan[dayKey] || [] : [];

  // Macro splitting values
  const targetCals = dietPlan.dailyCalorieTarget || 1800;
  const pG = dietPlan.macroSplit?.protein_g || 140;
  const cG = dietPlan.macroSplit?.carbs_g || 180;
  const fG = dietPlan.macroSplit?.fat_g || 60;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-[var(--text-primary)]">
      
      {/* Toast notifications */}
      <div
        id="diet-modification-toast"
        className="fixed bottom-6 right-6 p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-black shadow-xl z-50 opacity-0 transition-all duration-300 pointer-events-none flex items-center space-x-1.5"
      >
        <Sparkles className="h-4 w-4 text-emerald-500 animate-spin" />
        <span>Recipe customized successfully with Gemini AI✓</span>
      </div>

      <div
        id="meal-logged-toast"
        className="fixed bottom-6 right-6 p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-black shadow-xl z-50 opacity-0 transition-all duration-350 pointer-events-none flex items-center space-x-1.5"
      >
        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 animate-pulse" />
        <span>Meal portions logged successfully to your daily journal✓</span>
      </div>

      {/* Days slider */}
      <div className="flex space-x-1.5 overflow-x-auto pb-2.5 select-none scrollbar-none border-b border-[var(--border)]">
        {daysAbbr.map((d, idx) => {
          const active = selectedDayIdx === idx;
          return (
            <button
              key={d}
              onClick={() => setSelectedDayIdx(idx)}
              className={`flex-1 min-w-[75px] py-3.5 px-1.5 rounded-xl border text-center transition-all cursor-pointer ${active ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/15" : "bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:bg-slate-50 dark:hover:bg-slate-900"}`}
            >
              <span className="text-[10px] uppercase font-black tracking-wider block">{d}</span>
              <span className="text-[10px] font-bold block mt-1 opacity-80">Weekday</span>
            </button>
          );
        })}
      </div>

      {/* Target Macros card summaries */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Calories summary info */}
        <div className="card p-5 bg-[var(--bg-card)] flex flex-col justify-center space-y-1.5">
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">Daily Target Calories</span>
          <p className="text-2xl font-black text-rose-500">🔥 {targetCals} <span className="text-xs font-semibold text-[var(--text-secondary)]">kcal</span></p>
          <span className="text-[10px] text-slate-400 font-medium">Equates to maintenance / deficit ratios</span>
        </div>

        {/* Proteins */}
        <div className="card p-5 bg-[var(--bg-card)] flex flex-col justify-center space-y-1.5">
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">Target Proteins</span>
          <p className="text-2xl font-black text-sky-500">🥩 {pG}g</p>
          <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
            <div className="bg-sky-500 h-full rounded-full" style={{ width: "100%" }}></div>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Fiber building building block</span>
        </div>

        {/* Carbohydrates */}
        <div className="card p-5 bg-[var(--bg-card)] flex flex-col justify-center space-y-1.5">
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">Carb Fuel standard</span>
          <p className="text-2xl font-black text-amber-500">🌾 {cG}g</p>
          <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: "100%" }}></div>
          </div>
          <span className="text-[10px] text-slate-400 font-medium font-bold">Stable exercise energy</span>
        </div>

        {/* Healthy Fats */}
        <div className="card p-5 bg-[var(--bg-card)] flex flex-col justify-center space-y-1.5">
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">Healthy Fats budget</span>
          <p className="text-2xl font-black text-emerald-500">🥑 {fG}g</p>
          <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: "100%" }}></div>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Hormonal maintenance levels</span>
        </div>

      </div>

      {/* Primary schedule list block */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-lg font-black tracking-tight flex items-center space-x-1">
            <Apple className="h-5 w-5 text-indigo-500" />
            <span>{currentDayName}'s Ingredient Blueprint</span>
          </h2>
          <button
            onClick={() => setTab("diet_log")}
            className="text-xs font-bold px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-all"
          >
            Check Eaten Journal Logbook
          </button>
        </div>

        <div className="space-y-3.5">
          {mealsList.length > 0 ? (
            mealsList.map((meal: any, idx: number) => (
              <MealCard
                key={meal.name + idx}
                meal={meal}
                dayIndex={selectedDayIdx}
                mealIndex={idx}
                onModified={(updated) => handleMealModified(idx, updated)}
                onLoggedToday={handleLoggedToday}
              />
            ))
          ) : (
            <div className="text-center py-6 text-slate-400 font-semibold text-xs border border-dashed rounded-2xl">
              No meal recipe templates allocated for this day index.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
