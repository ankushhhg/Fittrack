/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import ProgressChart from "../components/ProgressChart";
import {
  TrendingUp,
  Scale,
  Award,
  ChevronDown,
  Calendar,
  Sparkles,
  Loader2,
  Trash2,
  Info
} from "lucide-react";

export default function Progress() {
  const { token, refreshUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [weighIns, setWeighIns] = useState<any[]>([]);
  const [sessionLogs, setSessionLogs] = useState<any[]>([]);
  const [dietPlan, setDietPlan] = useState<any>(null);

  const fetchProgressMatrices = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // 1. Weigh-ins (GET /api/weigh-ins)
      const weighResp = await fetch("/api/weigh-ins", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (weighResp.ok) {
        const body = await weighResp.json();
        setWeighIns(body.weighIns || []);
      }

      // 2. Workout Sessions Logs (GET /api/logs/all)
      const sessionResp = await fetch("/api/logs/all", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (sessionResp.ok) {
        const body = await sessionResp.json();
        setSessionLogs(body.workoutSessions || []);
      }

      // 3. Diet values for target
      const dietResp = await fetch("/api/diet/plan", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (dietResp.ok) {
        const body = await dietResp.json();
        setDietPlan(body.plan || null);
      }
    } catch (err) {
      console.error("Failed to load progress parameters:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressMatrices();
  }, [token]);

  // Handle single weigh-in delete
  const deleteWeighIn = async (weighInId: string) => {
    try {
      const resp = await fetch(`/api/weigh-ins?id=${encodeURIComponent(weighInId)}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resp.ok) {
        await refreshUser();
        await fetchProgressMatrices(); // reload chart
      }
    } catch (err) {
      console.error("Failed clearing weight entry:", err);
    }
  };

  // Parse Personal bests (PBs) from exercises list
  const extractPersonalBests = () => {
    const pbs: Record<string, { weight: number; reps: number; date: string }> = {};
    
    sessionLogs.forEach((session) => {
      if (session.exercisesList) {
        session.exercisesList.forEach((ex: any) => {
          if (ex.sets) {
            ex.sets.forEach((set: any) => {
              const currentMax = pbs[ex.name]?.weight || 0;
              if (set.weight > currentMax) {
                pbs[ex.name] = {
                  weight: set.weight,
                  reps: set.reps,
                  date: session.date
                };
              }
            });
          }
        });
      }
    });

    return Object.entries(pbs).map(([name, data]) => ({ name, ...data }));
  };

  const personalBests = extractPersonalBests();

  // Metrics status summaries
  const startingWeight = weighIns.length > 0 ? weighIns[0].weight_kg : 0;
  const currentWeight = weighIns.length > 0 ? weighIns[weighIns.length - 1].weight_kg : 0;
  const netWeightChange = Number((currentWeight - startingWeight).toFixed(1));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[var(--text-primary)]">
      
      {loading ? (
        <div className="h-[40vh] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          <p className="text-xs text-[var(--text-secondary)] font-extrabold uppercase tracking-widest">Compiling Progress Graphs...</p>
        </div>
      ) : (
        <div className="space-y-8 page-enter text-sm">
          
          {/* Progress metric headers summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="card p-5 bg-[var(--bg-card)] flex flex-col justify-center space-y-1.5">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-neutral-600 dark:text-slate-400 block">Total Trained Sessions</span>
              <p className="text-2xl font-black text-indigo-650 dark:text-indigo-400">🏋️ {sessionLogs.length} sessions</p>
              <span className="text-[10px] text-neutral-700 dark:text-slate-400 font-medium">Accumulating consecutive lifting streaks</span>
            </div>

            <div className="card p-5 bg-[var(--bg-card)] flex flex-col justify-center space-y-1.5">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-neutral-600 dark:text-slate-400 block">Starting Weight Entry</span>
              <p className="text-2xl font-black">{startingWeight || "--"} <span className="text-xs font-semibold text-[var(--text-secondary)]">kg</span></p>
              <span className="text-[10px] text-neutral-700 dark:text-slate-400 font-medium">Recorded at onboarding setups</span>
            </div>

            <div className="card p-5 bg-[var(--bg-card)] flex flex-col justify-center space-y-1.5">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-neutral-600 dark:text-slate-400 block">Net Scale change</span>
              <p className={`text-2xl font-black ${netWeightChange < 0 ? "text-emerald-600 dark:text-emerald-500" : netWeightChange > 0 ? "text-indigo-650 dark:text-indigo-400" : "text-neutral-700 dark:text-slate-400"}`}>
                {netWeightChange > 0 ? `+${netWeightChange}` : netWeightChange} kg
              </p>
              <span className="text-[10px] text-neutral-700 dark:text-slate-400 font-medium">Variance across weigh-in logs</span>
            </div>

          </div>

          {/* Visual charts segment container */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Physical Weight Line Graph */}
            <div className="card p-6 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-[var(--border)]">
                <span className="text-xs font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-wide flex items-center space-x-1">
                  <Scale className="h-4.5 w-4.5" />
                  <span>Weigh-ins Timeline</span>
                </span>
                <span className="text-[10px] font-bold text-neutral-600 dark:text-slate-400">Weight Scale (kg)</span>
              </div>
              
              <ProgressChart
                data={weighIns.map((w) => ({ date: w.date, weight: w.weight_kg }))}
                dataKey="weight"
                label="Weight"
                color="#4f46e5"
                unit="kg"
              />
            </div>

            {/* Chart 2: Body fat estimates */}
            <div className="card p-6 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-[var(--border)]">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-500 uppercase tracking-wide flex items-center space-x-1">
                  <TrendingUp className="h-4.5 w-4.5" strokeWidth={2.4} />
                  <span>Lipid Mass timeline</span>
                </span>
                <span className="text-[10px] font-bold text-neutral-600 dark:text-slate-400">Body Fat %</span>
              </div>

              <ProgressChart
                data={weighIns.filter((w) => w.body_fat_percent !== undefined).map((w) => ({ date: w.date, bf: w.body_fat_percent }))}
                dataKey="bf"
                label="Body Fat %"
                color="#f43f5e"
                unit="%"
                chartType="bar"
              />
            </div>

          </div>

          {/* Personal best lifts & weigh-ins ledger tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-none">
            
            {/* Personal Records Table */}
            <div className="card p-5 space-y-4">
              <span className="text-xs font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-widest flex items-center space-x-1">
                <Award className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                <span>Personal Best (PB) Peak Lifts</span>
              </span>

              {personalBests.length === 0 ? (
                <div className="h-[150px] flex items-center justify-center font-bold text-neutral-600 dark:text-slate-400 text-xs border border-dashed border-[var(--border)] rounded-xl">
                  No lifted records trace elements found yet! Keep logging.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-neutral-700 dark:text-slate-400 font-extrabold uppercase tracking-wider text-[9.5px]">
                        <th className="pb-2">Exercise / Muscle</th>
                        <th className="pb-2 text-right">Max weight (kg)</th>
                        <th className="pb-2 text-right">Target Reps</th>
                        <th className="pb-2 text-center">First Logged</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {personalBests.map((pb, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                          <td className="py-2 font-bold text-[var(--text-primary)]">{pb.name}</td>
                          <td className="py-2 text-right font-black text-indigo-650 dark:text-indigo-400 font-mono">💪 {pb.weight} kg</td>
                          <td className="py-2 text-right font-bold font-mono text-[var(--text-primary)]">{pb.reps} reps</td>
                          <td className="py-2 text-center text-neutral-600 dark:text-slate-400 font-semibold">{pb.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Weigh-ins table list */}
            <div className="card p-5 space-y-4">
              <span className="text-xs font-bold text-neutral-700 dark:text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
                <Scale className="h-4.5 w-4.5 text-slate-500 dark:text-slate-400" />
                <span>Historic Weight Scales Ledger</span>
              </span>

              {weighIns.length === 0 ? (
                <div className="h-[150px] flex items-center justify-center text-neutral-600 dark:text-slate-400 font-bold text-xs border border-dashed border-[var(--border)] rounded-xl">
                  Log scales to populate timeline maps.
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[220px] pr-1">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-neutral-700 dark:text-slate-400 font-extrabold uppercase tracking-wide text-[9px]">
                        <th className="pb-2">Weigh-in Date</th>
                        <th className="pb-2 text-right">Weight Reading</th>
                        <th className="pb-2 text-right">Body Fat %</th>
                        <th className="pb-2 text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {weighIns.slice().reverse().map((w) => (
                        <tr key={w.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-905/10">
                          <td className="py-2 font-bold text-neutral-700 dark:text-slate-400">{w.date}</td>
                          <td className="py-2 text-right font-bold text-[var(--text-primary)]">{w.weight_kg} kg</td>
                          <td className="py-2 text-right font-bold text-rose-600 dark:text-rose-500">{w.body_fat_percent !== undefined ? `${w.body_fat_percent}%` : "--"}</td>
                          <td className="py-2 text-center">
                            <button
                              onClick={() => deleteWeighIn(w.id)}
                              className="text-neutral-500 hover:text-rose-600 p-1 cursor-pointer"
                              title="Clear measurement stats"
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

          </div>

        </div>
      )}

    </div>
  );
}
