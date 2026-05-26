/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  ShieldAlert,
  Users,
  Settings,
  Database,
  RefreshCw,
  Save,
  CheckCircle,
  FileCode,
  Activity,
  User,
  ShieldCheck,
  Loader2,
  Trash2
} from "lucide-react";

export default function AdminDashboard() {
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [adminLogs, setAdminLogs] = useState<any[]>([]);

  // Raw Editor State
  const [activePlanType, setActivePlanType] = useState<"fitness" | "diet">("fitness");
  const [editorText, setEditorText] = useState("");
  const [editorStatus, setEditorStatus] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const fetchAdminData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // 1. Users list
      const uResp = await fetch("/api/admin/users", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const uData = await uResp.json();
      if (uResp.ok) {
        setUsers(uData.users || []);
        if (uData.users && uData.users.length > 0 && !selectedUser) {
          setSelectedUser(uData.users[0]);
        }
      }

      // 2. Audit logs
      const lResp = await fetch("/api/admin/logs", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (lResp.ok) {
        const lData = await lResp.json();
        setAdminLogs(lData.logs || []);
      }
    } catch (err) {
      console.error("Failed to gather administrator details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  // Load current user's raw plan into the editor text area on selection or toggling plan type
  useEffect(() => {
    if (!selectedUser) return;
    const fetchUserRawPlan = async () => {
      try {
        const path = activePlanType === "fitness" ? "/api/fitness/plan" : "/api/diet/plan";
        
        // We override header token with user token to inspect their individual plan
        const resp = await fetch(path, {
          headers: { "Authorization": `Bearer ${selectedUser.id}` }
        });
        const data = await resp.json();
        if (resp.ok) {
          const planTarget = activePlanType === "fitness" ? data.plan : data.plan; // resolved weekDaysPlan
          setEditorText(JSON.stringify(planTarget, null, 2));
        } else {
          setEditorText("{\n  \"error\": \"This user has close to no plan mapped yet. Onboarding is pending!\"\n}");
        }
      } catch (err) {
        setEditorText("{\n  \"error\": \"Problem loading plan raw JSON files.\"\n}");
      }
    };

    fetchUserRawPlan();
    setEditorStatus(null);
  }, [selectedUser, activePlanType]);

  // Submit PUT updates to plans
  const handleSaveRawPlan = async () => {
    if (!selectedUser) return;
    setUpdating(true);
    setEditorStatus(null);
    try {
      // Validate locally first
      let parsed;
      try {
        parsed = JSON.parse(editorText);
      } catch (err) {
        throw new Error("Validation Failed: Invalid JSON representation.");
      }

      const resp = await fetch("/api/admin/update-plan", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          planType: activePlanType,
          planJson: parsed
        })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed update api.");

      setEditorStatus("Plan committed successfully! Audit logs synced. ✓");
      await fetchAdminData();
    } catch (err: any) {
      setEditorStatus(`⚠️ ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  // Trigger POST regenerations
  const handleRegeneratePlan = async () => {
    if (!selectedUser) return;
    setRegenerating(true);
    setEditorStatus(null);
    try {
      const resp = await fetch("/api/admin/regenerate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          planType: activePlanType
        })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Gemini Re-gen request failed.");

      setEditorStatus("Regenerated plan with Gemini instantly! Compiled files now online. 💫");
      setEditorText(JSON.stringify(data.plan, null, 2));
      await fetchAdminData();
    } catch (err: any) {
      setEditorStatus(`⚠️ ${err.message}`);
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[var(--text-primary)]">
      
      {/* Caution administrative ribbon */}
      <div className="p-4 rounded-xl border border-rose-100 bg-rose-50 text-rose-800 text-xs font-semibold leading-relaxed flex items-start space-x-2 dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-400">
        <ShieldAlert className="h-4.5 w-4.5 text-rose-500 flex-shrink-0" />
        <div>
          <strong>FitTrack Admin Console Active:</strong> This workspace is pre-authenticated to audit database indices, adapt raw workout routines, or instruct full plan regeneration directly using prompt variables. Handle updates prudently.
        </div>
      </div>

      {loading ? (
        <div className="h-[40vh] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          <p className="text-xs text-[var(--text-secondary)] font-extrabold uppercase tracking-widest">Preloading admin data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 page-enter text-xs select-none">
          
          {/* User Side drawer selection */}
          <div className="card p-5 space-y-4">
            <span className="text-xs font-bold text-slate-505 uppercase tracking-wide flex items-center space-x-1.5 pb-2 border-b border-[var(--border)]">
              <Users className="h-4 w-4" />
              <span>Registered Accounts List ({users.length})</span>
            </span>

            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {users.map((u) => {
                const active = selectedUser?.id === u.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    className={`p-3 border rounded-xl cursor-pointer text-left transition-colors ${active ? "bg-indigo-500/10 border-indigo-400" : "bg-[var(--bg-primary)] border-[var(--border)] hover:bg-slate-50 dark:hover:bg-slate-900"}`}
                  >
                    <p className="font-bold text-xs text-[var(--text-primary)]">{u.name}</p>
                    <p className="text-[10px] text-slate-400 truncate tracking-tight">{u.email}</p>
                    
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-[var(--border)]/40 text-[9px] text-slate-400">
                      <span>Goal: {u.goal || "Not configured"}</span>
                      {u.role === "admin" && <span className="bg-rose-50 px-1 rounded text-rose-550 border border-rose-100 font-extrabold">Admin</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Plan Text JSON Editor panel */}
          {selectedUser && (
            <div className="lg:col-span-2 card p-5 space-y-4 text-xs font-semibold">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-y-3 pb-2 border-b border-[var(--border)]">
                <div>
                  <span className="font-semibold text-slate-400 uppercase tracking-wide text-[9px]">Account Details</span>
                  <h3 className="text-base font-black tracking-tight text-[var(--text-primary)] mt-0.5">{selectedUser.name} ({selectedUser.goal})</h3>
                </div>

                <div className="flex border border-[var(--border)] rounded-lg p-0.5 bg-slate-50 dark:bg-slate-900 text-[10px]">
                  <button
                    onClick={() => setActivePlanType("fitness")}
                    className={`px-3 py-1.5 rounded-md cursor-pointer font-bold ${activePlanType === "fitness" ? "bg-white dark:bg-slate-800 text-[var(--text-primary)] shadow-sm" : "text-slate-400"}`}
                  >
                    Workouts Program
                  </button>
                  <button
                    onClick={() => setActivePlanType("diet")}
                    className={`px-3 py-1.5 rounded-md cursor-pointer font-bold ${activePlanType === "diet" ? "bg-white dark:bg-slate-800 text-[var(--text-primary)] shadow-sm" : "text-slate-400"}`}
                  >
                    Diet Recipes
                  </button>
                </div>
              </div>

              {editorStatus && (
                <div className="p-2.5 rounded border border-indigo-100 bg-indigo-50/50 text-[11px] font-bold text-indigo-700 leading-normal">
                  {editorStatus}
                </div>
              )}

              {/* Text editor box */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase text-slate-400 tracking-wider">Raw plan database JSON:</label>
                <textarea
                  value={editorText}
                  onChange={(e) => setEditorText(e.target.value)}
                  rows={14}
                  className="font-mono text-[11px] leading-relaxed block w-full p-3.5 rounded-xl border border-[var(--border)] bg-slate-900 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 whitespace-pre scrollbar-thin resize-y"
                  placeholder="Raw JSON content representation loads here..."
                ></textarea>
              </div>

              {/* Editor actions */}
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={handleSaveRawPlan}
                  disabled={updating || regenerating}
                  className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-700 bg-indigo-600 text-white font-black text-xs rounded-xl flex items-center justify-center space-x-1 shadow cursor-pointer"
                >
                  {updating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Updating Plan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Raw Blueprint Changes</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleRegeneratePlan}
                  disabled={updating || regenerating}
                  className="flex-1 py-2.5 border border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-black text-xs rounded-xl flex items-center justify-center space-x-1 copy-to-clipboard cursor-pointer"
                >
                  {regenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>AI Re-creating...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin-slow" />
                      <span>Regenerate Blueprint with AI 💫</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Administrative System Audit Logs */}
          <div className="lg:col-span-3 card p-5 space-y-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center space-x-1.5">
              <Database className="h-4 w-4 text-emerald-505" />
              <span>Systematic Security Audit Logs (last 100 actions)</span>
            </span>

            {adminLogs.length === 0 ? (
              <p className="text-slate-400 font-bold py-6 text-center">No transactions registered in audit pools yet.</p>
            ) : (
              <div className="overflow-y-auto max-h-[160px] space-y-1.5 pr-1">
                {adminLogs.map((log) => (
                  <div key={log.id} className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-[var(--border)] rounded-lg flex justify-between items-center">
                    <div className="text-left">
                      <p className="font-extrabold text-[var(--text-primary)]">{log.action}</p>
                      <p className="text-[10px] text-slate-405 mt-0.5">Executor ID: {log.userId} · {log.userEmail}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${log.status === "Success" ? "bg-emerald-55 text-emerald-700 bg-emerald-50" : "bg-rose-50 text-rose-700"}`}>
                        {log.status}
                      </span>
                      <p className="text-[9px] text-slate-400 font-semibold font-mono mt-0.5">{log.date.split("T")[1].split(".")[0]} UTC</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
