/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { Check, Play, Square, FastForward, Clock } from "lucide-react";
import { Exercise } from "../types";

interface SetRow {
  weight: number;
  reps: number;
  completed: boolean;
}

interface SetLoggerProps {
  key?: any;
  exercise: Exercise;
  onSetLogged: (exerciseData: { name: string; sets: SetRow[] }) => void;
}

export default function SetLogger({ exercise, onSetLogged }: SetLoggerProps) {
  // Parse sets count
  const targetSetsCount = exercise.sets || 3;
  // Parse suggest weight
  const defaultWeight = parseFloat(exercise.weight?.replace(/[^0-9.]/g, "") || "10");
  // Parse suggest reps
  const defaultReps = parseInt(exercise.reps?.replace(/[^0-9]/g, "") || "12");

  const [sets, setSets] = useState<SetRow[]>(() => {
    return Array.from({ length: targetSetsCount }, () => ({
      weight: defaultWeight,
      reps: defaultReps,
      completed: false
    }));
  });

  // Rest Timer State
  const [restSeconds, setRestSeconds] = useState(0);
  const [activeTimerSet, setActiveTimerSet] = useState<number | null>(null);
  const [totalRestTarget, setTotalRestTarget] = useState(60);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Stop timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleSetChange = (idx: number, field: "weight" | "reps", val: string) => {
    const num = parseFloat(val) || 0;
    setSets((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: num };
      return copy;
    });
  };

  const startRestTimer = (setIndex: number) => {
    // Parse recommended rest duration ("60s", "45 seconds", etc.)
    let targetSec = 60;
    const match = exercise.rest ? exercise.rest.match(/\d+/) : null;
    if (match) {
      targetSec = parseInt(match[0]);
    }
    setTotalRestTarget(targetSec);
    setRestSeconds(targetSec);
    setActiveTimerSet(setIndex);

    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setRestSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setActiveTimerSet(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const skipTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRestSeconds(0);
    setActiveTimerSet(null);
  };

  const logSetRow = (idx: number) => {
    setSets((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], completed: true };
      
      // Auto-trigger rest timer if not all sets are completed
      const allDone = copy.every((s) => s.completed);
      if (!allDone) {
        startRestTimer(idx);
      } else {
        // All sets complete! Fire callback immediately
        setTimeout(() => {
          onSetLogged({
            name: exercise.name,
            sets: copy
          });
        }, 500);
      }
      
      return copy;
    });
  };

  // Circular timer SVG parameters
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = totalRestTarget > 0 
    ? circumference - (restSeconds / totalRestTarget) * circumference 
    : 0;

  const allCompleted = sets.every((s) => s.completed);

  return (
    <div className="p-4 rounded-xl border border-[var(--border)] bg-slate-50/50 dark:bg-slate-900/30 text-xs text-[var(--text-primary)]">
      <div className="flex items-center justify-between mb-3 border-b border-[var(--border)] pb-2">
        <span className="font-bold tracking-tight text-slate-500 dark:text-slate-400 uppercase text-[10px]">Track Exercises Routine</span>
        <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
          Target: {exercise.sets} sets × {exercise.reps} reps
        </span>
      </div>

      <div className="space-y-2.5">
        {sets.map((set, idx) => (
          <div
            key={idx}
            className={`flex items-center space-x-3 p-2 rounded-xl transition-all border ${set.completed ? "bg-emerald-500/10 border-emerald-300 dark:border-emerald-800" : "bg-white dark:bg-slate-950 border-[var(--border)]"}`}
          >
            <span className="flex-shrink-0 w-8 font-bold text-center text-slate-500 dark:text-slate-400 text-xs">
              SET {idx + 1}
            </span>

            <div className="flex items-center space-x-2 flex-1">
              <div className="flex items-center space-x-1 flex-1 min-w-0">
                <input
                  type="number"
                  step="0.5"
                  value={set.weight}
                  onChange={(e) => handleSetChange(idx, "weight", e.target.value)}
                  disabled={set.completed || allCompleted}
                  className="w-full text-center py-1 rounded bg-slate-50 dark:bg-slate-900 border border-[var(--border)] font-bold text-xs"
                />
                <span className="text-[10px] text-slate-400">kg</span>
              </div>

              <span className="text-slate-300 dark:text-slate-705">×</span>

              <div className="flex items-center space-x-1 flex-1 min-w-0">
                <input
                  type="number"
                  value={set.reps}
                  onChange={(e) => handleSetChange(idx, "reps", e.target.value)}
                  disabled={set.completed || allCompleted}
                  className="w-full text-center py-1 rounded bg-slate-50 dark:bg-slate-900 border border-[var(--border)] font-bold text-xs"
                />
                <span className="text-[10px] text-slate-400">reps</span>
              </div>
            </div>

            <button
              onClick={() => logSetRow(idx)}
              disabled={set.completed || allCompleted}
              className={`flex-shrink-0 w-20 py-1 rounded font-bold cursor-pointer text-[10px] text-center flex items-center justify-center transition-all ${set.completed ? "bg-emerald-500 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"}`}
            >
              {set.completed ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <span>Log Set</span>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Rest Timer Overlay/Card */}
      {activeTimerSet !== null && restSeconds > 0 && (
        <div className="mt-4 p-3 bg-indigo-500 text-white rounded-xl flex items-center justify-between shadow-md transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  className="stroke-indigo-400 fill-none"
                  strokeWidth="3.5"
                />
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  className="stroke-white fill-none transition-all duration-1000 ease-linear"
                  strokeWidth="3.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <span className="absolute text-xs font-black">{restSeconds}</span>
            </div>

            <div>
              <p className="font-extrabold text-sm tracking-tight">Active Muscle Rest Timer</p>
              <p className="text-[10px] opacity-90 font-medium">Stretch muscles and drink water</p>
            </div>
          </div>

          <button
            onClick={skipTimer}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] flex items-center space-x-1 cursor-pointer transition-all"
          >
            <FastForward className="h-3 w-3" />
            <span>Skip Rest</span>
          </button>
        </div>
      )}

      {allCompleted && (
        <div className="mt-4 p-2.5 rounded-xl bg-emerald-100/60 border border-emerald-300 text-emerald-800 text-center font-bold flex items-center justify-center space-x-1">
          <Check className="h-4 w-4 text-emerald-600 animate-bounce" />
          <span>Exercise is Completed! Well done! ✓</span>
        </div>
      )}
    </div>
  );
}
