/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { ChevronDown, ChevronUp, Edit3, Youtube, PlusCircle, Check, Loader2 } from "lucide-react";
import { RecipeMeal } from "../types";
import { useAuth } from "../context/AuthContext";
import AIModifyPanel from "./AIModifyPanel";

interface MealCardProps {
  key?: any;
  meal: RecipeMeal;
  dayIndex: number;
  mealIndex: number;
  onModified?: (updatedMeal: RecipeMeal) => void;
  onLoggedToday?: (mealLog: any) => void;
}

export default function MealCard({
  meal,
  dayIndex,
  mealIndex,
  onModified,
  onLoggedToday
}: MealCardProps) {
  const { token } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  
  const [portion, setPortion] = useState<"full" | "half" | "double">("full");
  const [logging, setLogging] = useState(false);
  const [loggedStatus, setLoggedStatus] = useState(false);

  const handleModified = (newMeal: RecipeMeal) => {
    if (onModified) onModified(newMeal);
    setShowEdit(false);
  };

  const fireLogMeal = async () => {
    setLogging(true);
    let scale = 1.0;
    if (portion === "half") scale = 0.5;
    else if (portion === "double") scale = 2.0;

    const loggedBody = {
      date: new Date().toISOString().split("T")[0],
      mealType: meal.mealType,
      foodName: `${portion !== "full" ? portion.toUpperCase() + " portion of " : ""}${meal.name}`,
      quantityG: Math.round(100 * scale), // baseline indicator
      calories: Math.round(meal.calories * scale),
      protein_g: Math.round(meal.protein_g * scale),
      carbs_g: Math.round(meal.carbs_g * scale),
      fat_g: Math.round(meal.fat_g * scale)
    };

    try {
      const resp = await fetch("/api/logs/meal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(loggedBody)
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);
      
      setLoggedStatus(true);
      if (onLoggedToday) onLoggedToday(data.mealLog);
      setTimeout(() => {
        setLoggedStatus(false);
        setShowLogForm(false);
      }, 1500);
    } catch (err) {
      console.error("Failed to journal meal:", err);
    } finally {
      setLogging(false);
    }
  };

  const badgeColorMapping: Record<string, string> = {
    Breakfast: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/45",
    Snack: "bg-teal-50 text-teal-600 dark:bg-teal-950/30 dark:text-teal-400 border border-teal-100 dark:border-teal-900/40",
    Lunch: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40",
    Dinner: "bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40",
    "Mid-morning Snack": "bg-sky-50 text-sky-600 dark:bg-sky-950/30 dark:text-sky-400 border border-sky-100 dark:border-sky-900/40",
    "Evening Snack": "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40"
  };

  const badgeClass = badgeColorMapping[meal.mealType] || badgeColorMapping.Snack;

  return (
    <div className="card p-4 hover:shadow-md transition-all duration-200 bg-[var(--bg-card)]">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${badgeClass}`}>
            {meal.mealType}
          </span>

          <h3 className="mt-2 font-bold text-sm text-[var(--text-primary)] leading-tight tracking-tight">
            {meal.name}
          </h3>

          <p className="mt-2 text-xs text-[var(--text-secondary)] font-medium flex flex-wrap gap-x-2.5 gap-y-1 items-center">
            <span className="text-[11px] font-semibold text-rose-500 dark:text-rose-400">🔥 {meal.calories} kcal</span>
            <span className="text-[var(--text-secondary)]/30">•</span>
            <span className="text-[var(--text-primary)]">🥩 {meal.protein_g}g Protein</span>
            <span className="text-[var(--text-secondary)]/30">•</span>
            <span className="text-[var(--text-primary)]">🌾 {meal.carbs_g}g Carbs</span>
            <span className="text-[var(--text-secondary)]/30">•</span>
            <span className="text-[var(--text-primary)]">🥑 {meal.fat_g}g Fat</span>
          </p>

          <p className="mt-1 text-[11px] text-[var(--text-secondary)] font-medium">
            ⏱️ Prep: {meal.prepTime || "15 mins"}
          </p>
        </div>

        <div className="flex items-center space-x-1.5 ml-2">
          <button
            onClick={() => setShowLogForm(!showLogForm)}
            className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--border)] text-indigo-650 dark:text-indigo-400 cursor-pointer transition-colors"
            title="Log Meal portions cooked"
          >
            <PlusCircle className="h-4 w-4" />
          </button>
          
          {onModified && (
            <button
              onClick={() => {
                setShowEdit(!showEdit);
                if (!showEdit) setExpanded(true);
              }}
              className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
              title="Tailor meal ingredient list"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {showLogForm && (
        <div className="mt-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-xs">
          <p className="font-semibold text-[var(--text-primary)] mb-2">Record food portion logged:</p>
          <div className="flex space-x-2">
            {[
              { id: "half", label: "Half Portion (50%)" },
              { id: "full", label: "Standard Portion (100%)" },
              { id: "double", label: "Double Portion (200%)" }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setPortion(opt.id as any)}
                className={`flex-1 py-1.5 px-2 text-[10px] font-semibold border rounded-lg cursor-pointer transition-all ${portion === opt.id ? "bg-indigo-600 text-white border-indigo-600" : "bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)]"}`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="mt-3 flex justify-end">
            <button
              onClick={fireLogMeal}
              disabled={logging || loggedStatus}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer flex items-center space-x-1 shadow-sm"
            >
              {logging ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Logging...</span>
                </>
              ) : loggedStatus ? (
                <>
                  <Check className="h-3 w-3" />
                  <span>Logged! ✓</span>
                </>
              ) : (
                <span>Confirm Journal Log</span>
              )}
            </button>
          </div>
        </div>
      )}

      {expanded && (
        <div className="mt-4 pt-3 border-t border-[var(--border)] text-xs text-[var(--text-primary)] space-y-3">
          {meal.ingredients && meal.ingredients.length > 0 && (
            <div>
              <span className="font-semibold text-[var(--text-secondary)] uppercase tracking-wide text-[10px]">Ingredients list</span>
              <ul className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-1 px-1">
                {meal.ingredients.map((ing, k) => (
                  <li key={k} className="flex items-center space-x-1.5 text-[var(--text-primary)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#CBFF2E]"></span>
                    <span className="text-[var(--text-primary)]">{ing}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {meal.instructions && (
            <div>
              <span className="font-semibold text-[var(--text-secondary)] uppercase tracking-wide text-[10px]">Recipe Cooking Steps</span>
              <p className="mt-1 leading-relaxed text-[var(--text-primary)]/90">{meal.instructions}</p>
            </div>
          )}

          {meal.videoSearch && (
            <div className="pt-1 select-none">
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(meal.videoSearch)}`}
                target="_blank"
                rel="no-referrer"
                className="inline-flex items-center space-x-1.5 text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold"
              >
                <Youtube className="h-4 w-4" />
                <span>Watch Recipe Preparation Demo Video</span>
              </a>
            </div>
          )}

          {showEdit && onModified && (
            <AIModifyPanel
              dayIndex={dayIndex}
              section=""
              itemIndex={mealIndex}
              currentItem={meal}
              dietMode={true}
              onModified={handleModified}
              onClose={() => setShowEdit(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}
