/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Apple,
  Plus,
  Trash2,
  Activity,
  Flame,
  Check,
  ChevronDown,
  Info,
  Loader2,
  Utensils
} from "lucide-react";

export default function MealLog() {
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [targetCals, setTargetCals] = useState(1800);

  // Form State
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [mealType, setMealType] = useState("Lunch");
  
  const [saving, setSaving] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const fetchTodayLogs = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const resp = await fetch("/api/logs/today", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await resp.json();
      if (resp.ok) {
        setLogs(data.logs || []);
        setTotals({
          calories: data.totalCalories,
          protein: data.totalProtein,
          carbs: data.totalCarbs,
          fat: data.totalFat
        });
      }

      // Fetch targets limits
      const dResp = await fetch("/api/diet/plan", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (dResp.ok) {
        const dData = await dResp.json();
        setTargetCals(dData.plan?.dailyCalorieTarget || 1800);
      }
    } catch (err) {
      console.error("Failed fetching logged nutrition items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayLogs();
  }, [token]);

  const addManualFoodItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!foodName || !calories) return;
    setSaving(true);
    setErrorCode(null);

    const newItem = {
      date: new Date().toISOString().split("T")[0],
      mealType,
      foodName,
      quantityG: 100, // baseline
      calories: Number(calories),
      protein_g: protein ? Number(protein) : 0,
      carbs_g: carbs ? Number(carbs) : 0,
      fat_g: fat ? Number(fat) : 0
    };

    try {
      const resp = await fetch("/api/logs/meal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newItem)
      });
      if (!resp.ok) throw new Error("Could not register custom calorie entry.");

      // Reset
      setFoodName("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
      
      await fetchTodayLogs();
    } catch (err: any) {
      setErrorCode(err.message || "Failed saving manual food product.");
    } finally {
      setSaving(false);
    }
  };

  const deleteLoggedItem = async (idxName: string) => {
    try {
      const resp = await fetch(`/api/logs/meal?id=${encodeURIComponent(idxName)}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resp.ok) {
        await fetchTodayLogs();
      }
    } catch (err) {
      console.error("Failed clear log item:", err);
    }
  };

  const balance = targetCals - totals.calories;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-[var(--text-primary)] md:text-sm">
      
      {loading ? (
        <div className="h-[40vh] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          <p className="text-xs text-[var(--text-secondary)] font-extrabold uppercase tracking-widest">Loading journal metrics...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 page-enter">
          
          {/* Main Logs Table Segment */}
          <div className="lg:col-span-2 space-y-5">
            <div className="card p-5 space-y-4">
              <span className="text-xs font-bold text-indigo-505 uppercase tracking-wide flex items-center space-x-1">
                <Utensils className="h-4 w-4 text-indigo-505" />
                <span>Nutrition Journal Ledger</span>
              </span>

              {logs.length === 0 ? (
                <div className="h-[180px] flex flex-col justify-center items-center font-bold text-slate-400 text-xs border border-dashed rounded-xl space-y-2">
                  <span>No food logged today yet!</span>
                  <p className="text-[10px] text-slate-400 font-medium">Use the panel on the right or tap "Log portions" inside recipes.</p>
                </div>
              ) : (
                <div className="overflow-x-auto select-none">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                        <th className="pb-2">Meal</th>
                        <th className="pb-2">Food / Ingredient</th>
                        <th className="pb-2 text-right">Calories</th>
                        <th className="pb-2 text-right">Macros</th>
                        <th className="pb-2 text-center">Remove</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {logs.map((log: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                          <td className="py-2.5 font-bold text-slate-500 dark:text-slate-400">{log.mealType}</td>
                          <td className="py-2.5 font-bold truncate max-w-[150px]" title={log.foodName}>{log.foodName}</td>
                          <td className="py-2.5 text-right font-black text-rose-500">🔥 {log.calories}</td>
                          <td className="py-2.5 text-right text-slate-500 dark:text-slate-400 font-semibold font-mono">
                            {log.protein_g}P · {log.carbs_g}C · {log.fat_g}F
                          </td>
                          <td className="py-2.5 text-center">
                            <button
                              onClick={() => deleteLoggedItem(log.id)}
                              className="text-rose-500 hover:text-rose-600 transition-colors cursor-pointer p-1"
                              title="Delete food log row entry"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Current Day balance cards */}
            <div className="card p-5 space-y-4">
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Calculated Balance Indices</span>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-[var(--border)]">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold block">Today's Target</span>
                  <p className="text-lg font-black mt-1 text-[var(--text-primary)]">{targetCals} kcal</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-[var(--border)]">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold block">Total Eaten</span>
                  <p className="text-lg font-black mt-1 text-indigo-600 dark:text-indigo-400">{totals.calories} kcal</p>
                </div>
                <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-200 dark:border-indigo-950">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold block">{balance >= 0 ? "Under Cap" : "Deficit Balance"}</span>
                  <p className={`text-lg font-black mt-1 ${balance >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                    {Math.abs(balance)} kcal
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Manual Adding Form Segment */}
          <div className="space-y-4.5">
            <div className="card p-5 bg-[var(--bg-card)] border border-[var(--border)] shadow-sm space-y-4 text-xs">
              <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wide flex items-center space-x-1.5 font-extrabold pb-2 border-b border-[var(--border)]">
                <Plus className="h-4.5 w-4.5 animate-bounce" />
                <span>Manual Food Entry Scanner</span>
              </span>

              {errorCode && (
                <p className="p-2 border border-rose-100 bg-rose-50 text-rose-600 text-[11px] rounded font-bold leading-normal">
                  ⚠️ {errorCode}
                </p>
              )}

              <form onSubmit={addManualFoodItem} className="space-y-4 pt-1">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">Meal Schedule Category</label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] font-bold font-semibold focus:outline-none"
                  >
                    {["Breakfast", "Mid-morning Snack", "Lunch", "Evening Snack", "Dinner"].map((x) => (
                      <option key={x} value={x}>{x}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">Food Name / Ingredient</label>
                  <input
                    type="text"
                    required
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    placeholder="e.g. Boiled Eggs (3) or Whole Wheat Oats"
                    className="mt-1 block w-full px-3.5 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] font-semibold placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">Calories Count (kcal)</label>
                  <input
                    type="number"
                    required
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    placeholder="e.g. 240 Calories"
                    className="mt-1 block w-full px-3.5 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] font-semibold focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-400">Protein (g)</label>
                    <input
                      type="number"
                      value={protein}
                      onChange={(e) => setProtein(e.target.value)}
                      placeholder="g"
                      className="mt-1 block w-full px-2 py-1.5 text-center rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] font-bold text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-400">Carbs (g)</label>
                    <input
                      type="number"
                      value={carbs}
                      onChange={(e) => setCarbs(e.target.value)}
                      placeholder="g"
                      className="mt-1 block w-full px-2 py-1.5 text-center rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] font-bold text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-400">Fat (g)</label>
                    <input
                      type="number"
                      value={fat}
                      onChange={(e) => setFat(e.target.value)}
                      placeholder="g"
                      className="mt-1 block w-full px-2 py-1.5 text-center rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] font-bold text-[11px]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-2.5 bg-indigo-650 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs cursor-pointer shadow-md flex items-center justify-center space-x-1"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                        <span>Saving custom item...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4.5 w-4.5" />
                        <span>Journal Food Log</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
