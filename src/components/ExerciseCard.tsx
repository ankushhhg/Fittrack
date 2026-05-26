/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { ChevronDown, ChevronUp, Edit3, Youtube, CheckCircle2, Circle } from "lucide-react";
import { Exercise } from "../types";
import AIModifyPanel from "./AIModifyPanel";

interface ExerciseCardProps {
  key?: any;
  exercise: Exercise;
  dayIndex: number;
  section: string;
  itemIndex: number;
  onModified?: (updatedItem: Exercise) => void;
  showCheckbox?: boolean;
  isCompleted?: boolean;
  onToggleComplete?: () => void;
}

export default function ExerciseCard({
  exercise,
  dayIndex,
  section,
  itemIndex,
  onModified,
  showCheckbox = false,
  isCompleted = false,
  onToggleComplete
}: ExerciseCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const handleModified = (newItem: Exercise) => {
    if (onModified) onModified(newItem);
    setShowEdit(false);
  };

  return (
    <div className={`card p-4 hover:shadow-md transition-all duration-200 ${isCompleted ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900' : 'bg-[var(--bg-card)]'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {showCheckbox && onToggleComplete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete();
              }}
              className="text-neutral-500 dark:text-[var(--text-secondary)] hover:text-indigo-600 transition-colors p-1 cursor-pointer focus:outline-none"
            >
              {isCompleted ? (
                <CheckCircle2 className="h-5.5 w-5.5 text-emerald-500" />
              ) : (
                <Circle className="h-5.5 w-5.5" />
              )}
            </button>
          )}

          <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setExpanded(!expanded)}>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
              <span className="font-bold text-sm tracking-tight text-[var(--text-primary)] leading-tight">
                {exercise.name}
              </span>
              {exercise.important && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400">
                  Must Do
                </span>
              )}
              {!exercise.important && section === "mainExercises" && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-50 text-slate-500 border border-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">
                  Can Skip
                </span>
              )}
            </div>

            <p className="mt-1 text-xs text-[var(--text-secondary)] font-medium flex flex-wrap gap-2 items-center">
              <span>{exercise.sets} sets × {exercise.reps} reps</span>
              <span className="text-[var(--text-secondary)]/30">•</span>
              <span className="text-[11px] bg-[var(--border)] px-1.5 py-0.5 rounded text-[var(--text-primary)] border border-[var(--border)]">
                {exercise.equipment || "Bodyweight"}
              </span>
              {exercise.weight && (
                <>
                  <span className="text-[var(--text-secondary)]/30">•</span>
                  <span className="text-[11px] font-semibold text-indigo-650 dark:text-indigo-400">
                    {exercise.weight}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 ml-2">
          {onModified && (
            <button
              onClick={() => {
                setShowEdit(!showEdit);
                if (!showEdit) setExpanded(true); // Open details too for context
              }}
              className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
              title="Optimize with AI Coach"
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

      {expanded && (
        <div className="mt-4 pt-3 border-t border-[var(--border)] text-xs text-[var(--text-primary)] space-y-3">
          {exercise.targetMuscles && (
            <div>
              <span className="font-semibold text-[var(--text-secondary)] uppercase tracking-wide text-[10px]">Target Muscles</span>
              <p className="mt-0.5 text-[var(--text-primary)]">{exercise.targetMuscles}</p>
            </div>
          )}

          {exercise.execution && (
            <div>
              <span className="font-semibold text-[var(--text-secondary)] uppercase tracking-wide text-[10px]">Execution Guide</span>
              <p className="mt-0.5 leading-relaxed text-[var(--text-primary)]">{exercise.execution}</p>
            </div>
          )}

          {(exercise.form || exercise.tips || exercise.mistakes || exercise.breathing || exercise.rest) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[var(--bg-card)] p-3 rounded-xl border border-[var(--border)]">
              {exercise.form && (
                <div>
                  <span className="font-semibold text-[var(--text-secondary)] uppercase tracking-wide text-[9px]">Form Standard</span>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--text-primary)]">{exercise.form}</p>
                </div>
              )}
              {exercise.breathing && (
                <div>
                  <span className="font-semibold text-[var(--text-secondary)] uppercase tracking-wide text-[9px]">Breathing Pattern</span>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--text-primary)]">{exercise.breathing}</p>
                </div>
              )}
              {exercise.mistakes && (
                <div>
                  <span className="font-semibold text-rose-500 uppercase tracking-wide text-[9px]">Common Mistakes</span>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-rose-500">{exercise.mistakes}</p>
                </div>
              )}
              {exercise.rest && (
                <div>
                  <span className="font-semibold text-[var(--text-secondary)] uppercase tracking-wide text-[9px]">Recommended Rest</span>
                  <p className="mt-0.5 text-[11px] font-semibold text-indigo-500">{exercise.rest}</p>
                </div>
              )}
            </div>
          )}

          {exercise.videoSearch && (
            <div className="pt-2 flex justify-start">
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.videoSearch)}`}
                target="_blank"
                rel="no-referrer"
                className="inline-flex items-center space-x-1.5 text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold"
              >
                <Youtube className="h-4 w-4" />
                <span>Watch Technique Video Demo</span>
              </a>
            </div>
          )}

          {showEdit && onModified && (
            <AIModifyPanel
              dayIndex={dayIndex}
              section={section}
              itemIndex={itemIndex}
              currentItem={exercise}
              onModified={handleModified}
              onClose={() => setShowEdit(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}
