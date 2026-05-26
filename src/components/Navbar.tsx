/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { LogOut, Dumbbell, Calendar, Apple, LineChart, Shield, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

interface NavbarProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

export default function Navbar({ currentTab, setTab }: NavbarProps) {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: <Calendar className="h-4 w-4" /> },
    { id: "fitness", label: "Fitness Plan", icon: <Dumbbell className="h-4 w-4" /> },
    { id: "diet", label: "Diet Plan", icon: <Apple className="h-4 w-4" /> },
    { id: "progress", label: "Progress", icon: <LineChart className="h-4 w-4" /> }
  ];

  // If user is admin (Anksh as per email or tagged as admin), show admin tab!
  const isAdmin = user.role === "admin" || user.email === "anksh2307@gmail.com";

  if (isAdmin) {
    tabs.push({ id: "admin", label: "Admin Portal", icon: <Shield className="h-4 w-4" /> });
  }

  // Get name initials
  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().substr(0, 2)
    : "FT";

  const handleTabClick = (tabId: string) => {
    setTab(tabId);
    setIsOpen(false);
  };

  return (
    <nav className="border-b border-[var(--border)] bg-[var(--bg-card)] sticky top-0 z-50 shadow-sm text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo Brand */}
          <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={() => handleTabClick("dashboard")}>
            <div className="w-10 h-10 bg-[#CBFF2E] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(203,255,46,0.3)] hover:scale-105 transition-transform duration-200">
              <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center font-black text-[9px] text-[#CBFF2E]">FT</div>
            </div>
            <span className="text-xl font-light italic font-serif leading-none tracking-tight text-black dark:text-[#F5F5F5] hover:opacity-95 transition-opacity">
              FitTrack <span className="text-[#CBFF2E] not-italic font-bold tracking-tighter">PRO</span>
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-1 items-center">
            {tabs.map((tab) => {
              const active = currentTab === tab.id || (tab.id === "fitness" && currentTab.startsWith("fitness")) || (tab.id === "diet" && currentTab.startsWith("diet"));
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-bold transition-all duration-150 cursor-pointer ${active ? "bg-violet-100 text-violet-800 dark:bg-indigo-950/40 dark:text-[var(--accent)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-50 dark:hover:bg-slate-900"}`}
                >
                  {tab.icon}
                  <span className="hidden lg:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Control Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle />
            
            <div className="flex items-center space-x-2.5 border-l border-[var(--border)] pl-3">
              <div
                className="h-9 w-9 rounded-xl bg-indigo-600 text-white font-extrabold text-[13px] flex items-center justify-center shadow-inner"
                title={user.name}
              >
                {initials}
              </div>
              
              <div className="text-left flex flex-col justify-center max-w-[120px] truncate leading-none">
                <span className="text-xs font-black text-[var(--text-primary)] truncate">{user.name}</span>
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-500 mt-0.5">{user.role}</span>
              </div>

              <button
                id="sign-out-btn"
                onClick={logout}
                className="p-2 rounded-xl border border-[var(--border)] text-rose-500 bg-white hover:bg-rose-50 dark:bg-slate-950 dark:hover:bg-rose-950/20 cursor-pointer transition-all duration-200"
                title="Log Out Session"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex items-center space-x-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl border border-[var(--border)] text-[var(--text-primary)] hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Collapsible Navigation Panel */}
      {isOpen && (
        <div className="md:hidden border-t border-[var(--border)] px-2 pt-2.5 pb-4 space-y-1 bg-[var(--bg-card)]">
          {tabs.map((tab) => {
            const active = currentTab === tab.id || (tab.id === "fitness" && currentTab.startsWith("fitness")) || (tab.id === "diet" && currentTab.startsWith("diet"));
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center space-x-3 w-full px-4 py-2.5 rounded-xl font-bold text-left transition-colors cursor-pointer ${active ? "bg-violet-100 text-violet-800 dark:bg-indigo-950/40 dark:text-[var(--accent)]" : "text-[var(--text-secondary)] hover:bg-slate-50 dark:hover:bg-slate-900"}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
          
          <div className="border-t border-[var(--border)] pt-3 mt-3 flex items-center justify-between px-4">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white font-extrabold text-[13px] flex items-center justify-center">
                {initials}
              </div>
              <div className="text-left font-semibold text-xs leading-none">
                <span className="text-[var(--text-primary)] block">{user.name}</span>
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-500 mt-1 block">{user.role}</span>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center space-x-1 p-2 rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-bold text-xs cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
