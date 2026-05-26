/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import ExerciseCard from "../../components/ExerciseCard";
import {
  Calendar,
  Dumbbell,
  Timer,
  Info,
  ChevronRight,
  Smile,
  AlertCircle,
  Sparkles,
  Loader2,
  ListCollapse,
  Flame
} from "lucide-react";

interface PlanViewProps {
  setTab: (tab: string) => void;
  selectedDayParam: number;
  setWorkoutDayParam: (day: number) => void;
}

export default function PlanView({ setTab, selectedDayParam, setWorkoutDayParam }: PlanViewProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<any[]>([]);
  const [selectedDayIdx, setSelectedDayIdx] = useState(selectedDayParam);
  
  // Accordion Expand States
  const [expandedSections, setExpandedSections] = useState({
    warmup: true,
    main: true,
    supersets: true,
    abs: true,
    optional: false,
    stretching: false
  });

  const fetchPlan = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/fitness/plan", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || "Failed to load fitness plan.");
      }
      setPlan(data.plan || []);
    } catch (err: any) {
      setError(err.message || "Failed reading workout program.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [token]);

  const toggleSection = (sec: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  // On AI adaptation update
  const handleItemModified = (sectionName: string, itemIdx: number, updatedItem: any) => {
    setPlan((prevPlan) => {
      const copy = [...prevPlan];
      if (copy[selectedDayIdx] && copy[selectedDayIdx][sectionName]) {
        copy[selectedDayIdx][sectionName][itemIdx] = updatedItem;
      }
      return copy;
    });
    // Visual alert feedback
    const banner = document.getElementById("modification-toast");
    if (banner) {
      banner.classList.remove("opacity-0");
      banner.classList.add("opacity-100");
      setTimeout(() => {
        banner.classList.remove("opacity-100");
        banner.classList.add("opacity-0");
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="h-[40vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-xs text-[var(--text-secondary)] font-extrabold uppercase tracking-widest">Loading Workout Plan Routine...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-black tracking-tight">No Workout Program Found Map</h3>
        <p className="text-xs text-[var(--text-secondary)]">
          {error}
        </p>
        <button
          onClick={() => setTab("dashboard")}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/10 cursor-pointer"
        >
          Proceed to Onboarding Setup
        </button>
      </div>
    );
  }

  const daysAbbr = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const selectedDay = plan[selectedDayIdx];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-[var(--text-primary)]">
      
      {/* Dynamic Success Modification slide toast */}
      <div
        id="modification-toast"
        className="fixed bottom-6 right-6 p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-black shadow-xl z-50 opacity-0 transition-all duration-300 pointer-events-none flex items-center space-x-1.5"
      >
        <Sparkles className="h-4 w-4 text-emerald-500 animate-spin" />
        <span>Exercise has been updated successfully by Gemini AI✓</span>
      </div>

      {/* Weekday strip selector */}
      <div className="flex space-x-1.5 overflow-x-auto pb-2.5 select-none scrollbar-none border-b border-[var(--border)]">
        {daysAbbr.map((d, idx) => {
          const active = selectedDayIdx === idx;
          const targetDay = plan[idx];
          const focusMuscles = targetDay ? (targetDay.restDay ? "Rest" : targetDay.muscleGroup.split(" & ")[0]) : "";

          return (
            <button
              key={d}
              onClick={() => {
                setSelectedDayIdx(idx);
                setWorkoutDayParam(idx);
              }}
              className={`flex-1 min-w-[75px] py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer ${active ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/15" : "bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:bg-slate-50 dark:hover:bg-slate-900"}`}
            >
              <span className="text-[10px] uppercase font-black tracking-wider block">{d}</span>
              <span className="text-[10.5px] font-bold truncate block mt-1 max-w-[70px] mx-auto opacity-90">{focusMuscles}</span>
            </button>
          );
        })}
      </div>

      {selectedDay && (
        <div className="space-y-6 page-enter">
          
          {/* Day details header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border border-[var(--border)] bg-[var(--bg-card)] rounded-2xl gap-y-4">
            <div>
              <span className="text-[10px] font-bold text-indigo-505 uppercase tracking-wide bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 rounded-full">
                Selected Routine
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-2 text-[var(--text-primary)]">
                {selectedDay.day} — {selectedDay.restDay ? "Recovery Day 🧘" : selectedDay.muscleGroup}
              </h2>
              <p className="text-xs font-semibold text-[var(--text-secondary)] mt-1 flex gap-2 items-center">
                <span>⏱️ Limit: ~50 mins routine</span>
                {!selectedDay.restDay && (
                  <>
                    <span>•</span>
                    <span>💪 {selectedDay.mainExercises?.length || 0} prime exercise movements</span>
                  </>
                )}
              </p>
            </div>

            {!selectedDay.restDay && (
              <button
                onClick={() => {
                  setWorkoutDayParam(selectedDayIdx);
                  setTab("fitness_session");
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md cursor-pointer flex items-center justify-center space-x-1 uppercase"
              >
                <span>Start Session 🏋️</span>
              </button>
            )}
          </div>

          {selectedDay.restDay ? (
            <div className="card p-8 text-center text-sm space-y-4 max-w-xl mx-auto">
              <Smile className="h-12 w-12 text-indigo-500 mx-auto animate-bounce" />
              <h3 className="font-extrabold text-base tracking-tight">Active Fiber Repair Phases</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-sm mx-auto">
                No prime lifting cycles are planned today. Target 8-10 glasses of water, load dynamic compound stretches, and check daily nutrition macros to maintain structural integrity.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    const tomorrowIdx = (selectedDayIdx + 1) % 7;
                    setSelectedDayIdx(tomorrowIdx);
                    setWorkoutDayParam(tomorrowIdx);
                  }}
                  className="px-4 py-2 rounded-lg border border-[var(--border)] text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer text-[var(--text-secondary)]"
                >
                  Inspect Tomorrow's Program
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Category 1: WARM UP */}
              <div className="border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--bg-card)] shadow-sm">
                <button
                  onClick={() => toggleSection("warmup")}
                  className="w-full flex items-center justify-between p-4 font-extrabold text-xs tracking-wider uppercase bg-slate-50/50 dark:bg-slate-900/50 border-b border-[var(--border)] cursor-pointer text-[var(--text-secondary)]"
                >
                  <span className="flex items-center space-x-1.5 text-indigo-600 dark:text-indigo-400">
                    <Timer className="h-4 w-4" />
                    <span>🔥 Pre-activation Warm-ups ({selectedDay.warmup?.length || 0})</span>
                  </span>
                  <span>{expandedSections.warmup ? "Collapse" : "Expand"}</span>
                </button>
                {expandedSections.warmup && (
                  <div className="p-4 space-y-3 bg-[var(--bg-card)]/50 text-[var(--text-primary)] border-t border-[var(--border)]">
                    {selectedDay.warmup?.map((ex: any, idx: number) => (
                      <ExerciseCard
                        key={idx}
                        exercise={ex}
                        dayIndex={selectedDayIdx}
                        section="warmup"
                        itemIndex={idx}
                        onModified={(updated) => handleItemModified("warmup", idx, updated)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Category 2: PRIMER EXERCISES */}
              <div className="border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--bg-card)] shadow-sm">
                <button
                  onClick={() => toggleSection("main")}
                  className="w-full flex items-center justify-between p-4 font-extrabold text-xs tracking-wider uppercase bg-slate-50/50 dark:bg-slate-900/50 border-b border-[var(--border)] cursor-pointer text-[var(--text-secondary)]"
                >
                  <span className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400">
                    <Dumbbell className="h-4 w-4" />
                    <span>💪 Main Core Movements ({selectedDay.mainExercises?.length || 0})</span>
                  </span>
                  <span>{expandedSections.main ? "Collapse" : "Expand"}</span>
                </button>
                {expandedSections.main && (
                  <div className="p-4 space-y-3 bg-[var(--bg-card)]/50 text-[var(--text-primary)] border-t border-[var(--border)]">
                    {selectedDay.mainExercises?.map((ex: any, idx: number) => (
                      <ExerciseCard
                        key={idx}
                        exercise={ex}
                        dayIndex={selectedDayIdx}
                        section="mainExercises"
                        itemIndex={idx}
                        onModified={(updated) => handleItemModified("mainExercises", idx, updated)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Category 3: SUPERSETS */}
              {selectedDay.supersets && selectedDay.supersets.length > 0 && (
                <div className="border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--bg-card)] shadow-sm">
                  <button
                    onClick={() => toggleSection("supersets")}
                    className="w-full flex items-center justify-between p-4 font-extrabold text-xs tracking-wider uppercase bg-slate-50/50 dark:bg-slate-900/50 border-b border-[var(--border)] cursor-pointer text-[var(--text-secondary)]"
                  >
                    <span className="flex items-center space-x-1.5 text-amber-500">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>⚡ Compound Burner Supersets ({selectedDay.supersets?.length || 0} pairs)</span>
                    </span>
                    <span>{expandedSections.supersets ? "Collapse" : "Expand"}</span>
                  </button>
                  {expandedSections.supersets && (
                    <div className="p-4 space-y-4 bg-[var(--bg-card)]/50 text-[var(--text-primary)] border-t border-[var(--border)]">
                      {selectedDay.supersets.map((set: any, idx: number) => (
                        <div key={idx} className="border border-amber-100 dark:border-amber-950 rounded-2xl p-4 bg-amber-50/10 space-y-3">
                          <span className="text-[10px] uppercase font-black text-amber-500 tracking-wider">Compound Pair {idx + 1}: {set.name}</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <ExerciseCard
                              exercise={set.exerciseA}
                              dayIndex={selectedDayIdx}
                              section={`supersets[${idx}].exerciseA`}
                              itemIndex={idx} // will map appropriately inside backend
                            />
                            <ExerciseCard
                              exercise={set.exerciseB}
                              dayIndex={selectedDayIdx}
                              section={`supersets[${idx}].exerciseB`}
                              itemIndex={idx}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Category 4: ABS SHREDDER */}
              {selectedDay.abSupersets && selectedDay.abSupersets.length > 0 && (
                <div className="border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--bg-card)] shadow-sm">
                  <button
                    onClick={() => toggleSection("abs")}
                    className="w-full flex items-center justify-between p-4 font-extrabold text-xs tracking-wider uppercase bg-slate-50/50 dark:bg-slate-900/50 border-b border-[var(--border)] cursor-pointer text-[var(--text-secondary)]"
                  >
                    <span className="flex items-center space-x-1.5 text-rose-500">
                      <Flame className="h-4 w-4" />
                      <span>🔥 Belly Trim / Abs Supersets ({selectedDay.abSupersets?.length || 0} pairs)</span>
                    </span>
                    <span>{expandedSections.abs ? "Collapse" : "Expand"}</span>
                  </button>
                  {expandedSections.abs && (
                    <div className="p-4 space-y-4 bg-[var(--bg-card)]/50 text-[var(--text-primary)] border-t border-[var(--border)]">
                      {selectedDay.abSupersets.map((set: any, idx: number) => (
                        <div key={idx} className="border border-rose-100 dark:border-rose-950 rounded-2xl p-4 bg-rose-50/10 space-y-3">
                          <span className="text-[10px] uppercase font-black text-rose-500 tracking-wider">Abs Combo {idx + 1}</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <ExerciseCard
                              exercise={set.exerciseA}
                              dayIndex={selectedDayIdx}
                              section={`abSupersets[${idx}].exerciseA`}
                              itemIndex={idx}
                            />
                            <ExerciseCard
                              exercise={set.exerciseB}
                              dayIndex={selectedDayIdx}
                              section={`abSupersets[${idx}].exerciseB`}
                              itemIndex={idx}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Category 5: OPTIONAL LIMITS */}
              {selectedDay.optional && selectedDay.optional.length > 0 && (
                <div className="border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--bg-card)] shadow-sm">
                  <button
                    onClick={() => toggleSection("optional")}
                    className="w-full flex items-center justify-between p-4 font-extrabold text-xs tracking-wider uppercase bg-slate-50/50 dark:bg-slate-900/50 border-b border-[var(--border)] cursor-pointer text-[var(--text-secondary)]"
                  >
                    <span className="flex items-center space-x-1.5 text-teal-600 dark:text-teal-400">
                      <Info className="h-4 w-4" />
                      <span>⭐ Optional Extras ({selectedDay.optional?.length || 0})</span>
                    </span>
                    <span>{expandedSections.optional ? "Collapse" : "Expand"}</span>
                  </button>
                  {expandedSections.optional && (
                    <div className="p-4 space-y-3 bg-[var(--bg-card)]/50 text-[var(--text-primary)] border-t border-[var(--border)]">
                      {selectedDay.optional?.map((ex: any, idx: number) => (
                        <ExerciseCard
                          key={idx}
                          exercise={ex}
                          dayIndex={selectedDayIdx}
                          section="optional"
                          itemIndex={idx}
                          onModified={(updated) => handleItemModified("optional", idx, updated)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Category 6: COOL DOWN stretching */}
              <div className="border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--bg-card)] shadow-sm">
                <button
                  onClick={() => toggleSection("stretching")}
                  className="w-full flex items-center justify-between p-4 font-extrabold text-xs tracking-wider uppercase bg-slate-50/50 dark:bg-slate-900/50 border-b border-[var(--border)] cursor-pointer text-[var(--text-secondary)]"
                >
                  <span className="flex items-center space-x-1.5 text-purple-600 dark:text-purple-400">
                    <ListCollapse className="h-4 w-4" />
                    <span>🧘 Cool-down Stretching ({selectedDay.stretching?.length || 0})</span>
                  </span>
                  <span>{expandedSections.stretching ? "Collapse" : "Expand"}</span>
                </button>
                {expandedSections.stretching && (
                  <div className="p-4 space-y-3 bg-[var(--bg-card)]/50 text-[var(--text-primary)] border-t border-[var(--border)]">
                    {selectedDay.stretching?.map((ex: any, idx: number) => (
                      <div key={idx} className="p-3.5 border border-[var(--border)] bg-[var(--bg-card)] rounded-xl space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs text-[var(--text-primary)]">{ex.name}</span>
                          <span className="text-[10px] font-extrabold text-purple-650 dark:text-purple-400 bg-purple-500/10 py-0.5 px-2 rounded-full">⏱️ {ex.duration || "30s"}</span>
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)]"><strong>Target:</strong> {ex.targetMuscles || "Total body fibers"}</p>
                        <p className="text-[11px] leading-relaxed text-[var(--text-primary)]"><strong>Method:</strong> {ex.execution}</p>
                        {ex.tips && <p className="text-[10px] text-[var(--text-secondary)] leading-normal bg-[var(--bg-card)]/50 p-2.5 rounded-lg border border-[var(--border)] mt-1.5">💡 {ex.tips}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
