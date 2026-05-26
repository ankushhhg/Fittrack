/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from "react";

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  color?: "indigo" | "green" | "amber" | "red" | "blue" | "rose";
  subtitle?: string;
}

export default function StatsCard({ icon, label, value, unit, color = "indigo", subtitle }: StatsCardProps) {
  const colorClasses = {
    indigo: {
      bg: "bg-violet-100 dark:bg-indigo-950/40",
      text: "text-violet-800 dark:text-indigo-400"
    },
    green: {
      bg: "bg-emerald-100 dark:bg-emerald-950/40",
      text: "text-emerald-800 dark:text-emerald-400"
    },
    amber: {
      bg: "bg-amber-100 dark:bg-amber-950/40",
      text: "text-amber-800 dark:text-amber-400"
    },
    red: {
      bg: "bg-rose-100 dark:bg-rose-950/40",
      text: "text-rose-800 dark:text-rose-400"
    },
    blue: {
      bg: "bg-sky-100 dark:bg-sky-950/40",
      text: "text-sky-800 dark:text-sky-400"
    },
    rose: {
      bg: "bg-pink-100 dark:bg-pink-950/40",
      text: "text-pink-800 dark:text-pink-400"
    }
  };

  const selectedColor = colorClasses[color] || colorClasses.indigo;

  return (
    <div className="card p-5 shadow-sm transition-all duration-200 flex flex-col justify-between border-neutral-300 dark:border-[var(--border)]">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
            {label}
          </span>
          <div className="mt-2.5 flex items-baseline">
            <span className="text-2xl md:text-3xl font-black tracking-tight text-black dark:text-white">
              {value}
            </span>
            {unit && (
              <span className="ml-1 text-sm font-extrabold text-black dark:text-white">
                {unit}
              </span>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-xl ${selectedColor.bg} ${selectedColor.text}`}>
          {icon}
        </div>
      </div>
      {subtitle && (
        <div className="mt-4 pt-3 border-t border-neutral-300 dark:border-[var(--border)] text-xs text-black dark:text-white font-bold">
          {subtitle}
        </div>
      )}
    </div>
  );
}
