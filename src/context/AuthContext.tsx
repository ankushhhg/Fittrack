/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { UserProfile } from "../types";

interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("fittrack_token"));
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (sessionToken: string) => {
    try {
      const resp = await fetch("/api/auth/me", {
        headers: {
          "Authorization": `Bearer ${sessionToken}`
        }
      });
      if (resp.ok) {
        const body = await resp.json();
        setUser(body.user);
      } else {
        // Stale session
        logout();
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const resp = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await resp.json();
      if (!resp.ok) {
        return { success: false, error: data.error || "Authentication failed" };
      }
      localStorage.setItem("fittrack_token", data.token || data.user.id);
      setToken(data.token || data.user.id);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: "Network connection error" };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const resp = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await resp.json();
      if (!resp.ok) {
        return { success: false, error: data.error || "Failed to create account" };
      }
      localStorage.setItem("fittrack_token", data.token || data.user.id);
      setToken(data.token || data.user.id);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: "Network connection error" };
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!token) return { success: false, error: "Not logged in" };
    try {
      const resp = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      const data = await resp.json();
      if (!resp.ok) {
        return { success: false, error: data.error || "Update profile failed" };
      }
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: "Network connection error" };
    }
  };

  const logout = () => {
    localStorage.removeItem("fittrack_token");
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      await fetchProfile(token);
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, updateProfile, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
