/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Sparkles, Loader2, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface AIModifyPanelProps {
  dayIndex: number;
  section: string;
  itemIndex: number;
  currentItem: any;
  dietMode?: boolean;
  onModified: (updatedItem: any) => void;
  onClose: () => void;
}

export default function AIModifyPanel({
  dayIndex,
  section,
  itemIndex,
  currentItem,
  dietMode = false,
  onModified,
  onClose
}: AIModifyPanelProps) {
  const { token } = useAuth();
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chips = dietMode
    ? ["Vegetarian option", "Make it higher protein", "Lower prep time", "Swap to sweet style", "Budget alternative"]
    : ["Replace with floor version", "Make it muscle focus", "Swap to bodyweight", "Make it easier", "Change reps range"];

  const handleModify = async () => {
    if (!instruction.trim()) return;
    setLoading(true);
    setError(null);

    const endpoint = dietMode ? "/api/diet/modify-meal" : "/api/fitness/modify-section";
    const body = dietMode
      ? {
          dayIndex,
          mealIndex: itemIndex,
          userInstruction: instruction,
          currentMeal: currentItem
        }
      : {
          dayIndex,
          section,
          itemIndex,
          userInstruction: instruction,
          currentItem
        };

    try {
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || "AI modification failed.");
      }
      onModified(dietMode ? data.updatedMeal : data.updatedItem);
    } catch (err: any) {
      setError(err.message || "An error occurred during compilation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 rounded-xl border border-indigo-100 dark:border-indigo-950 bg-indigo-50/40 dark:bg-indigo-950/20 text-[var(--text-primary)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
          <Sparkles className="h-4.5 w-4.5 animate-pulse" />
          <span className="text-sm font-semibold tracking-tight">AI Plan Adaptor</span>
        </div>
        <button
          onClick={onClose}
          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1 rounded-lg"
          title="Cancel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <textarea
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        placeholder={dietMode ? "How do you want to modify this meal?" : "How do you want to modify this exercise?"}
        rows={3}
        className="w-full text-sm p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
        disabled={loading}
      />

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {chips.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => setInstruction(chip)}
            className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-900 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 cursor-pointer transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-2.5 text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/20 p-2.5 rounded-lg border border-rose-100 dark:border-rose-950">
          ⚠️ {error}
        </p>
      )}

      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="text-xs font-semibold px-4 py-2 border border-[var(--border)] bg-[var(--bg-card)] rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-[var(--text-secondary)] cursor-pointer transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleModify}
          disabled={loading || !instruction.trim()}
          className="text-xs font-semibold px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5 transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Updating plan...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ask AI to Modify</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
