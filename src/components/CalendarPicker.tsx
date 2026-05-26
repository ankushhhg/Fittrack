/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check, FastForward } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CalendarPickerProps {
  value: string; // expects YYYY-MM-DD
  onChange: (value: string) => void;
  id?: string;
}

export function CalendarPicker({ value, onChange, id }: CalendarPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial date value or default to today
  const parsedDate = value ? new Date(value) : new Date();
  const initialYear = isNaN(parsedDate.getTime()) ? new Date().getFullYear() : parsedDate.getFullYear();
  const initialMonth = isNaN(parsedDate.getTime()) ? new Date().getMonth() : parsedDate.getMonth();

  const [navYear, setNavYear] = useState(initialYear);
  const [navMonth, setNavMonth] = useState(initialMonth); // 0-11

  // Keep navigation in sync if value changed from outside
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setNavYear(d.getFullYear());
        setNavMonth(d.getMonth());
      }
    }
  }, [value]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Helper calculation for calendar days
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(navYear, navMonth);
  const startDay = getFirstDayOfMonth(navYear, navMonth);

  const prevMonthDaysToShow = startDay;
  const prevMonthIndex = navMonth === 0 ? 11 : navMonth - 1;
  const prevMonthYear = navMonth === 0 ? navYear - 1 : navYear;
  const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonthIndex);

  const totalGridItems = prevMonthDaysToShow + daysInMonth;
  const nextMonthDaysToShow = totalGridItems % 7 === 0 ? 0 : 7 - (totalGridItems % 7);

  // Month Navigation
  const prevMonth = () => {
    if (navMonth === 0) {
      setNavMonth(11);
      setNavYear(navYear - 1);
    } else {
      setNavMonth(navMonth - 1);
    }
  };

  const nextMonth = () => {
    if (navMonth === 11) {
      setNavMonth(0);
      setNavYear(navYear + 1);
    } else {
      setNavMonth(navMonth + 1);
    }
  };

  const handleSelectDay = (day: number, isCurrentMonth: "prev" | "current" | "next") => {
    let targetYear = navYear;
    let targetMonth = navMonth;

    if (isCurrentMonth === "prev") {
      if (navMonth === 0) {
        targetMonth = 11;
        targetYear = navYear - 1;
      } else {
        targetMonth = navMonth - 1;
      }
    } else if (isCurrentMonth === "next") {
      if (navMonth === 11) {
        targetMonth = 0;
        targetYear = navYear + 1;
      } else {
        targetMonth = navMonth + 1;
      }
    }

    const yearStr = targetYear;
    const monthStr = String(targetMonth + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");

    const formattedDate = `${yearStr}-${monthStr}-${dayStr}`;
    onChange(formattedDate);
    setIsOpen(false);
  };

  // Quick Preset Handlers
  const applyPresetWeeks = (weeks: number) => {
    const target = new Date();
    target.setDate(target.getDate() + weeks * 7);
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, "0");
    const d = String(target.getDate()).padStart(2, "0");
    onChange(`${y}-${m}-${d}`);
    setIsOpen(false);
  };

  // Render display date DD-MM-YYYY
  const getDisplayValue = () => {
    if (!value) return "Select target date...";
    const parts = value.split("-");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return value;
  };

  // Check if grid day is the selected date
  const isSelectedDate = (day: number, isCurrentMonth: "prev" | "current" | "next") => {
    if (!value) return false;
    let targetYear = navYear;
    let targetMonth = navMonth;

    if (isCurrentMonth === "prev") {
      if (navMonth === 0) {
        targetMonth = 11;
        targetYear = navYear - 1;
      } else {
        targetMonth = navMonth - 1;
      }
    } else if (isCurrentMonth === "next") {
      if (navMonth === 11) {
        targetMonth = 0;
        targetYear = navYear + 1;
      } else {
        targetMonth = navMonth + 1;
      }
    }

    const d = new Date(value);
    return (
      d.getFullYear() === targetYear &&
      d.getMonth() === targetMonth &&
      d.getDate() === day
    );
  };

  const isTodayDate = (day: number, isCurrentMonth: "prev" | "current" | "next") => {
    const today = new Date();
    let targetYear = navYear;
    let targetMonth = navMonth;

    if (isCurrentMonth === "prev") {
      if (navMonth === 0) {
        targetMonth = 11;
        targetYear = navYear - 1;
      } else {
        targetMonth = navMonth - 1;
      }
    } else if (isCurrentMonth === "next") {
      if (navMonth === 11) {
        targetMonth = 0;
        targetYear = navYear + 1;
      } else {
        targetMonth = navMonth + 1;
      }
    }

    return (
      today.getFullYear() === targetYear &&
      today.getMonth() === targetMonth &&
      today.getDate() === day
    );
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Target Trigger Input */}
      <div
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] text-white font-bold text-sm focus-within:ring-2 focus-within:ring-indigo-500/20 shadow-sm transition-all focus-within:border-indigo-500 cursor-pointer select-none"
      >
        <span className={value ? "text-white font-extrabold font-mono" : "text-white/55 font-medium"}>
          {getDisplayValue()}
        </span>
        <CalendarIcon className="h-4.5 w-4.5 text-indigo-500" />
      </div>

      {/* Calendar Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 right-0 mt-2 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl space-y-3.5 text-neutral-900 dark:text-neutral-100"
          >
            {/* Quick Presets Section */}
            <div className="space-y-1.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase font-black text-indigo-600 dark:text-indigo-400 tracking-wider flex items-center space-x-1">
                <FastForward className="h-3 w-3" />
                <span>Quick goals target presets (DD-MM-YYYY)</span>
              </span>
              <div className="grid grid-cols-2 xs:grid-cols-4 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => applyPresetWeeks(4)}
                  className="px-2 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-[10px] font-bold rounded-lg border border-slate-200/60 dark:border-slate-800 text-left transition-colors truncate"
                  title="Reach goal in 4 weeks"
                >
                  <span className="block opacity-60">4 Weeks</span>
                  <span className="block font-mono text-[9px] text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {(() => {
                      const t = new Date();
                      t.setDate(t.getDate() + 28);
                      return `${String(t.getDate()).padStart(2, "0")}-${String(t.getMonth() + 1).padStart(2, "0")}-${t.getFullYear()}`;
                    })()}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetWeeks(12)}
                  className="px-2 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-[10px] font-bold rounded-lg border border-slate-200/60 dark:border-slate-800 text-left transition-colors truncate"
                  title="Reach goal in 12 weeks"
                >
                  <span className="block opacity-60">12 Weeks</span>
                  <span className="block font-mono text-[9px] text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {(() => {
                      const t = new Date();
                      t.setDate(t.getDate() + 84);
                      return `${String(t.getDate()).padStart(2, "0")}-${String(t.getMonth() + 1).padStart(2, "0")}-${t.getFullYear()}`;
                    })()}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetWeeks(24)}
                  className="px-2 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-[10px] font-bold rounded-lg border border-slate-200/60 dark:border-slate-800 text-left transition-colors truncate"
                  title="Reach goal in 24 weeks"
                >
                  <span className="block opacity-60">24 Weeks</span>
                  <span className="block font-mono text-[9px] text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {(() => {
                      const t = new Date();
                      t.setDate(t.getDate() + 168);
                      return `${String(t.getDate()).padStart(2, "0")}-${String(t.getMonth() + 1).padStart(2, "0")}-${t.getFullYear()}`;
                    })()}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetWeeks(48)}
                  className="px-2 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-[10px] font-bold rounded-lg border border-slate-200/60 dark:border-slate-800 text-left transition-colors truncate"
                  title="Reach goal in 48 weeks"
                >
                  <span className="block opacity-60">48 Weeks</span>
                  <span className="block font-mono text-[9px] text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {(() => {
                      const t = new Date();
                      t.setDate(t.getDate() + 336);
                      return `${String(t.getDate()).padStart(2, "0")}-${String(t.getMonth() + 1).padStart(2, "0")}-${t.getFullYear()}`;
                    })()}
                  </span>
                </button>
              </div>
            </div>

            {/* Navigation Header */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-lg transition-colors border border-slate-200/50 dark:border-slate-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm">{months[navMonth]}</span>
                <select
                  value={navYear}
                  onChange={(e) => setNavYear(parseInt(e.target.value, 10))}
                  className="bg-slate-50 dark:bg-slate-800 border-none font-extrabold text-sm text-indigo-600 dark:text-indigo-400 focus:ring-0 rounded p-1 cursor-pointer"
                >
                  {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() + i).map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-lg transition-colors border border-slate-200/50 dark:border-slate-800"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div>
              {/* Day Titles */}
              <div className="grid grid-cols-7 text-center mb-1">
                {daysOfWeek.map((day) => (
                  <span key={day} className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {day}
                  </span>
                ))}
              </div>

              {/* Day Cells */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {/* Render previous month days */}
                {Array.from({ length: prevMonthDaysToShow }).map((_, i) => {
                  const dayNum = daysInPrevMonth - prevMonthDaysToShow + i + 1;
                  return (
                    <button
                      key={`prev-${i}`}
                      type="button"
                      onClick={() => handleSelectDay(dayNum, "prev")}
                      className={`h-8 w-full text-xs font-medium rounded-lg text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-all ${
                        isSelectedDate(dayNum, "prev") ? "bg-indigo-500 text-white! font-black" : ""
                      }`}
                    >
                      {dayNum}
                    </button>
                  );
                })}

                {/* Render current month days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const isSel = isSelectedDate(dayNum, "current");
                  const isToday = isTodayDate(dayNum, "current");
                  return (
                    <button
                      key={`curr-${i}`}
                      type="button"
                      onClick={() => handleSelectDay(dayNum, "current")}
                      className={`h-8 w-full text-xs font-bold rounded-lg flex items-center justify-center transition-all ${
                        isSel
                          ? "bg-indigo-600 text-white! font-extrabold shadow-md shadow-indigo-600/20"
                          : isToday
                          ? "bg-indigo-500/10 border border-indigo-500 text-indigo-600 dark:text-indigo-400 font-extrabold"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {dayNum}
                    </button>
                  );
                })}

                {/* Render next month days */}
                {Array.from({ length: nextMonthDaysToShow }).map((_, i) => {
                  const dayNum = i + 1;
                  return (
                    <button
                      key={`next-${i}`}
                      type="button"
                      onClick={() => handleSelectDay(dayNum, "next")}
                      className={`h-8 w-full text-xs font-medium rounded-lg text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-all ${
                        isSelectedDate(dayNum, "next") ? "bg-indigo-500 text-white! font-black" : ""
                      }`}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Footer selected preview */}
            {value && (
              <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 text-center select-none pt-1 border-t border-slate-100 dark:border-slate-800">
                Selected Goal Date: <strong className="font-extrabold font-mono text-slate-700 dark:text-slate-200">{getDisplayValue()}</strong>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
