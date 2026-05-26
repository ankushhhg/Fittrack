/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";

// Pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import FitnessPlanView from "./pages/fitness/PlanView";
import FitnessSessionLog from "./pages/fitness/SessionLog";
import DietPlanView from "./pages/diet/PlanView";
import DietMealLog from "./pages/diet/MealLog";
import ProgressTracker from "./pages/Progress";
import AdminDashboard from "./pages/AdminDashboard";

function AppContent() {
  const { user, loading } = useAuth();
  
  // Tab/Routing State
  const [tab, setTab] = useState<string>("dashboard");
  const [showAuthGate, setShowAuthGate] = useState<boolean>(false);
  
  // Custom Param states (e.g. which workout day parameter was selected)
  const [workoutDayParam, setWorkoutDayParam] = useState<number>(0);

  // Simple loading indicator on checking details
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="h-14 w-14 rounded-full border-4 border-indigo-100 border-t-indigo-600 dark:border-indigo-950 dark:border-t-indigo-400 animate-spin"></div>
        </div>
        <p className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] animate-pulse">
          Starting FitTrack Core...
        </p>
      </div>
    );
  }

  // 1. Unlogged User screens
  if (!user) {
    if (showAuthGate) {
      return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
          <Auth />
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <Landing onJoin={() => setShowAuthGate(true)} />
      </div>
    );
  }

  // 2. Logged User pending onboarding setup
  if (!user.onboarding_done && !user.onboardingDone) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Onboarding onComplete={() => setTab("dashboard")} />
      </div>
    );
  }

  // 3. Logged User active screens dashboard workspace
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col">
      <Navbar currentTab={tab} setTab={setTab} />
      
      <main className="flex-grow select-none">
        {tab === "dashboard" && (
          <Dashboard setTab={setTab} setWorkoutDayParam={setWorkoutDayParam} />
        )}
        
        {tab === "fitness" && (
          <FitnessPlanView
            setTab={setTab}
            selectedDayParam={workoutDayParam}
            setWorkoutDayParam={setWorkoutDayParam}
          />
        )}
        
        {tab === "fitness_session" && (
          <FitnessSessionLog
            setTab={setTab}
            selectedDayParam={workoutDayParam}
          />
        )}
        
        {tab === "diet" && (
          <DietPlanView setTab={setTab} />
        )}
        
        {tab === "diet_log" && (
          <DietMealLog />
        )}
        
        {tab === "progress" && (
          <ProgressTracker />
        )}

        {tab === "admin" && (
          <AdminDashboard />
        )}
      </main>

      <footer className="border-t border-[var(--border)] bg-[var(--bg-card)] py-6 text-center text-xs text-[var(--text-secondary)] font-medium select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-y-3">
          <p>© 2026 FitTrack Core API. Powered server-side with Gemini 3.5 Flash.</p>
          <div className="flex space-x-4">
            <span className="text-gray-400">Environment: Sandbox</span>
            <span className="text-indigo-500 font-bold">Status: Online ✓</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
