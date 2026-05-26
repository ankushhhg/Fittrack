/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import SetLogger from "../../components/SetLogger";
import {
  Sparkles,
  Timer,
  Play,
  Square,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ListRestart,
  Heart,
  Undo2,
  Info,
  Loader2,
  Trophy
} from "lucide-react";

interface SessionLogProps {
  setTab: (tab: string) => void;
  selectedDayParam: number;
}

export default function SessionLog({ setTab, selectedDayParam }: SessionLogProps) {
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<any[]>([]);
  
  const [currentDayIdx] = useState(selectedDayParam);
  const [exerciseIndex, setExerciseIndex] = useState(0);

  // Active training sets accumulator
  const [loggedSets, setLoggedSets] = useState<any[]>([]);
  const [workoutFinished, setWorkoutFinished] = useState(false);

  // Session elapsed timer logic
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const clockRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load physical plans Mon-Sun
    const fetchPlanData = async () => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch("/api/fitness/plan", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error);
        setPlan(data.plan || []);
      } catch (err: any) {
        setError(err.message || "Failed loading available workouts.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlanData();
  }, [token]);

  // Handle ticking timer
  useEffect(() => {
    if (isActive) {
      clockRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (clockRef.current) clearInterval(clockRef.current);
    }
    return () => {
      if (clockRef.current) clearInterval(clockRef.current);
    };
  }, [isActive]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const formatTimerValue = (totalSecs: number) => {
    const hr = Math.floor(totalSecs / 3600);
    const min = Math.floor((totalSecs % 3600) / 60);
    const sec = totalSecs % 60;
    return [
      hr.toString().padStart(2, "0"),
      min.toString().padStart(2, "0"),
      sec.toString().padStart(2, "0")
    ].join(":");
  };

  const handleSetLogged = (exerciseStat: { name: string; sets: any[] }) => {
    setLoggedSets((prev) => [...prev, exerciseStat]);
    
    // Jump forward or complete workout
    const currentExercises = plan[currentDayIdx]?.mainExercises || [];
    if (exerciseIndex + 1 < currentExercises.length) {
      setExerciseIndex(exerciseIndex + 1);
    } else {
      finishWholeWorkout();
    }
  };

  const finishWholeWorkout = async () => {
    setIsActive(false);
    if (clockRef.current) clearInterval(clockRef.current);

    // Calculate aggregated parameters
    let totalSetsLogged = 0;
    let totalRepsCompleted = 0;
    let accumulatedWeightKg = 0;

    loggedSets.forEach((ex) => {
      ex.sets.forEach((set: any) => {
        totalSetsLogged += 1;
        totalRepsCompleted += set.reps;
        accumulatedWeightKg += set.weight;
      });
    });

    const completionBody = {
      date: new Date().toISOString().split("T")[0],
      dayName: plan[currentDayIdx]?.day || "Monday",
      muscleGroup: plan[currentDayIdx]?.muscleGroup || "Chest",
      durationMinutes: Math.round(secondsElapsed / 60) || 1,
      totalSetsLogged,
      totalRepsCompleted,
      accumulatedVolumeKg: Math.round(accumulatedWeightKg),
      exercisesList: loggedSets
    };

    try {
      const resp = await fetch("/api/logs/workout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(completionBody)
      });
      if (!resp.ok) throw new Error("Could not commit workout completion log.");
      
      setWorkoutFinished(true);
    } catch (err) {
      console.error("Critical error committing physical statistics summary:", err);
      // Fallback complete state
      setWorkoutFinished(true);
    }
  };

  if (loading) {
    return (
      <div className="h-[45vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-xs text-[var(--text-secondary)] font-extrabold uppercase tracking-widest">Prepping live training timers...</p>
      </div>
    );
  }

  if (error || plan.length === 0) {
    return (
      <div className="max-w-md mx-auto py-12 text-center text-xs space-y-3">
        <p className="text-slate-400 font-bold">Failed to load associated exercises list.</p>
        <button onClick={() => setTab("fitness")} className="px-5 py-2 hover:bg-slate-50 border border-[var(--border)] font-bold text-xs rounded-xl">Go Back</button>
      </div>
    );
  }

  const selectedDay = plan[currentDayIdx];
  const exercises = selectedDay?.mainExercises || [];
  const currentEx = exercises[exerciseIndex];

  // Completion screen layout
  if (workoutFinished) {
    return (
      <div className="max-w-md mx-auto py-10 px-4 space-y-6 text-center page-enter text-sm">
        <div className="card p-8 bg-[var(--bg-card)] border border-[var(--border)] shadow-xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-emerald-500"></div>
          
          <div className="h-20 w-20 rounded-full bg-emerald-500/10 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
            <Trophy className="h-10 w-10 animate-bounce" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">Routines Finalized! ✓</h2>
            <p className="text-xs text-[var(--text-secondary)]">Outstanding performance. You locked muscle target fibers beautifully today.</p>
          </div>

          {/* Aggregated totals row */}
          <div className="grid grid-cols-3 gap-2.5 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-[var(--border)] text-xs text-left">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400">Total Sets</span>
              <p className="font-extrabold text-base text-[var(--text-primary)] mt-0.5">{loggedSets.reduce((acc, x) => acc + x.sets.length, 0)} sets</p>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400">Time Taken</span>
              <p className="font-extrabold text-base text-[var(--text-primary)] mt-0.5">~{Math.round(secondsElapsed / 60) || 1} mins</p>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400">Work Volume</span>
              <p className="font-extrabold text-base text-indigo-600 dark:text-indigo-400 mt-0.5">
                {loggedSets.reduce((sum, item) => sum + item.sets.reduce((sSum: number, s: any) => sSum + Math.round(s.weight * s.reps), 0), 0)} kg
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="text-left space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Work Summary Breakdown:</span>
              <div className="max-h-[90px] overflow-y-auto space-y-1.5 text-[11px] font-semibold pr-2 select-none">
                {loggedSets.map((s, k) => (
                  <div key={k} className="flex justify-between border-b border-[var(--border)] pb-1">
                    <span className="truncate max-w-[200px] text-slate-700 dark:text-slate-300">{s.name}</span>
                    <span className="text-slate-400">{s.sets.length} sets completed</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setTab("dashboard")}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl cursor-pointer shadow-md"
            >
              Back to Dashboard Overview
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 text-[var(--text-primary)] text-sm">
      
      {/* Session header section */}
      <div className="flex justify-between items-center bg-[var(--bg-card)] border border-[var(--border)] p-4.5 rounded-2xl shadow-sm">
        <div>
          <span className="text-[10px] font-black uppercase text-rose-500 tracking-wider">Active Training Room</span>
          <h2 className="text-lg font-black tracking-tight mt-1 text-[var(--text-primary)]">{selectedDay.day} — {selectedDay.muscleGroup}</h2>
          <p className="text-[11.5px] text-[var(--text-secondary)] font-medium mt-0.5">Exercise {exerciseIndex + 1} of {exercises.length}</p>
        </div>

        {/* Stopwatch indicator */}
        <div className="flex items-center space-x-2.5 bg-slate-100 dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-[var(--border)] select-none">
          <div className="text-right">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold block">Time Clock</span>
            <span className="text-[13px] font-extrabold text-[var(--accent)] font-mono block mt-0.5">{formatTimerValue(secondsElapsed)}</span>
          </div>
          <button
            onClick={toggleTimer}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-[var(--text-secondary)] cursor-pointer transition-all"
            title={isActive ? "Pause workout" : "Resume workout timer"}
          >
            {isActive ? <Square className="h-3.5 w-3.5 text-rose-500" /> : <Play className="h-3.5 w-3.5 text-emerald-500" />}
          </button>
        </div>
      </div>

      {currentEx ? (
        <div className="space-y-5 page-enter">
          
          {/* Active exercise target card */}
          <div className="card p-5 space-y-3 bg-[var(--bg-card)]">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase bg-indigo-50 dark:bg-indigo-950/45 text-indigo-600 dark:text-indigo-400 py-0.5 px-2 rounded tracking-wide">Lifting target</span>
                <h3 className="text-xl font-bold tracking-tight text-[var(--text-primary)] mt-1.5">{currentEx.name}</h3>
              </div>
              <span className="text-xs font-semibold text-[var(--text-secondary)] bg-slate-100 dark:bg-slate-8/50 px-2.5 py-1 rounded-lg border border-[var(--border)] select-none">
                {currentEx.equipment || "Bodyweight"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs border-t border-b border-[var(--border)] py-3">
              <div>
                <span className="font-semibold text-slate-500 dark:text-slate-400 text-[9px] uppercase">Goal Sets</span>
                <p className="font-black text-sm mt-0.5">{currentEx.sets} sets</p>
              </div>
              <div>
                <span className="font-semibold text-slate-500 dark:text-slate-400 text-[9px] uppercase">Goal Reps</span>
                <p className="font-black text-sm mt-0.5">{currentEx.reps} reps</p>
              </div>
              {currentEx.targetMuscles && (
                <div className="col-span-2">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 text-[9px] uppercase">Muscles Engaged</span>
                  <p className="font-semibold text-slate-700 dark:text-slate-350 mt-0.5 leading-relaxed">{currentEx.targetMuscles}</p>
                </div>
              )}
            </div>

            {/* Quick tips dropdown summary */}
            {(currentEx.execution || currentEx.form) && (
              <div className="p-3.5 rounded-xl border border-[var(--border)] bg-slate-50/50 dark:bg-slate-900/35 text-[11px] leading-relaxed flex items-start space-x-2">
                <Info className="h-4.5 w-4.5 text-indigo-500 flex-shrink-0 mt-0.5 animate-pulse" />
                <div className="text-left font-medium text-slate-600 dark:text-slate-300">
                  <span className="font-extrabold text-[var(--text-primary)] block mb-0.5">Technique Quick Tip:</span>
                  {currentEx.execution || currentEx.form}
                </div>
              </div>
            )}
          </div>

          {/* Active logging block */}
          <SetLogger
            key={currentEx.name + exerciseIndex} // reset state on change
            exercise={currentEx}
            onSetLogged={handleSetLogged}
          />

          {/* Force skip buttons */}
          <div className="flex justify-between pt-2 select-none">
            <button
              onClick={() => setTab("fitness")}
              className="px-4 py-2 border border-[var(--border)] text-[var(--text-secondary)] hover:text-rose-500 bg-[var(--bg-card)] rounded-xl font-bold text-xs cursor-pointer flex items-center space-x-1"
            >
              <Undo2 className="h-4 w-4" />
              <span>Cancel Workout</span>
            </button>
            <button
              onClick={() => {
                if (exerciseIndex + 1 < exercises.length) {
                  setExerciseIndex(exerciseIndex + 1);
                } else {
                  finishWholeWorkout();
                }
              }}
              className="px-4 py-2 hover:bg-slate-50 border border-[var(--border)] rounded-xl font-bold text-xs text-[var(--text-secondary)] cursor-pointer flex items-center space-x-1"
            >
              <span>Skip This Exercise</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      ) : (
        <div className="text-center py-6 text-slate-400 font-bold">No active exercise entries found here.</div>
      )}

    </div>
  );
}
