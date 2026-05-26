/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
import { Dumbbell, ShieldAlert, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Auth() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    
    if (!email || !password) {
      setError("Please fill in all core login email/password parameters.");
      return;
    }

    if (!isLogin) {
      if (!name) {
        setError("Please supply your full name to set up your profile.");
        return;
      }
      if (password.length < 8) {
        setError("Password needs to be at least 8 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Your passwords are not matching, verify both blocks match.");
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        const result = await login(email, password);
        if (!result.success) {
          setError(result.error || "Login credentials failed.");
        }
      } else {
        const result = await register(name, email, password);
        if (result.success) {
          setInfo("Account set up successfully! Log in to begin.");
          setIsLogin(true);
        } else {
          setError(result.error || "Failed registration checks.");
        }
      }
    } catch (err: any) {
      setError("Network or local container configuration mismatch.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative bg-slate-50/20 dark:bg-slate-950/20 text-[var(--text-primary)]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg animate-pulse">
          <Dumbbell className="h-6 w-6" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-black tracking-tight text-[var(--text-primary)]">
          {isLogin ? "Welcome back to FitTrack" : "Establish Your Account"}
        </h2>
        <p className="mt-2 text-center text-xs text-[var(--text-secondary)] font-medium">
          {isLogin ? "Track your weights and nutrients automatically" : "Create your personal athletic blueprint in 60s"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="card py-8 px-6 sm:px-10 shadow-lg text-sm bg-[var(--bg-card)]">
          
          {/* Tab Selection */}
          <div className="flex border-b border-[var(--border)] mb-6">
            <button
              onClick={() => {
                setIsLogin(true);
                setError(null);
              }}
              className={`flex-1 pb-3 text-center font-bold relative transition-colors cursor-pointer ${isLogin ? "text-indigo-600 dark:text-indigo-400" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
            >
              Sign In
              {isLogin && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"></div>}
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError(null);
              }}
              className={`flex-1 pb-3 text-center font-bold relative transition-colors cursor-pointer ${!isLogin ? "text-indigo-600 dark:text-indigo-400" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
            >
              Create Account
              {!isLogin && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"></div>}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl border border-rose-100 dark:border-rose-950 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 text-xs font-semibold leading-relaxed">
              ⚠️ {error}
            </div>
          )}

          {info && (
            <div className="mb-4 p-3 rounded-xl border border-emerald-100 dark:border-emerald-950 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 text-xs font-semibold leading-relaxed">
              ✅ {info}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Anksh Sharma"
                    className="appearance-none block w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent font-medium"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="anksh2307@gmail.com"
                  className="appearance-none block w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="appearance-none block w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent font-medium"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="appearance-none block w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent font-medium"
                  />
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md hover:shadow-lg text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-all cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed items-center space-x-1.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    <span>Processing details...</span>
                  </>
                ) : (
                  <>
                    <span>{isLogin ? "Sign In & Track" : "Establish AI Program"}</span>
                    <ArrowRight className="h-4.5 w-4.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Tester Helper Warning */}
          <div className="mt-6 pt-4 border-t border-[var(--border)] text-[10px] text-[var(--text-secondary)] font-medium leading-relaxed leading-normal bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg flex items-start space-x-1.5">
            <ShieldAlert className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <div>
              <span className="font-extrabold text-[var(--text-primary)] block mb-0.5">Testing Details (Anksh / User Role Admin):</span>
              Any user registered with email <strong className="text-indigo-600 dark:text-indigo-400">anksh2307@gmail.com</strong> is classified with the <span className="font-bold underline text-[var(--text-primary)]">admin</span> role automatically, unlocked to access user tracking details and manual JSON regenerator capabilities. Use simple passwords.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
