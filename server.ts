/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dns from "dns";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Load environment variables
dotenv.config();

// Ensure local DNS resolution is fast
dns.setDefaultResultOrder("ipv4first");

import { buildFitnessPrompt, buildDietPrompt } from "./server/prompts";
import { generateLocalFitnessFallback, generateLocalDietFallback } from "./server/fallbacks";
import { pool, toCamel, toSnake, initDB } from "./server/db";

let lastApiError: string | null = null;
const JWT_SECRET = process.env.JWT_SECRET || "7e971c529b04f8a306425de6b60367c203171f77a5e295c22979cf9cf63bc2ae";

// Helper to call Gemini AI with prompt and instructions
async function callGemini(contents: string, systemInstruction?: string): Promise<string | null> {
  const currentKey = process.env.GEMINI_API_KEY || "";
  if (!currentKey || currentKey.includes("MY_GEMINI_API_KEY")) {
    console.warn("GEMINI_API_KEY is not configured or uses placeholder token");
    lastApiError = "Your GEMINI_API_KEY in the Settings menu is either missing or contains a placeholder.";
    return null;
  }
  try {
    lastApiError = null; // Reset error on new call start
    const aiInstance = new GoogleGenAI({
      apiKey: currentKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    const response = await aiInstance.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction || "You are a professional athletic trainer and nutrition expert. Respond strictly in valid JSON.",
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    });
    return response.text || null;
  } catch (error: any) {
    const errorStr = typeof error === "object" ? JSON.stringify(error) : String(error);
    const errorMessage = error?.message || String(error) || "";
    const errorStatus = error?.status || error?.code;
    
    const isLeakedOrAuthError = 
      errorMessage.includes("leaked") || 
      errorMessage.includes("PERMISSION_DENIED") ||
      errorStr.includes("leaked") || 
      errorStr.includes("PERMISSION_DENIED") ||
      errorStatus === 403;

    if (isLeakedOrAuthError) {
      console.warn("[Google Gemini API Warning] API Key is invalid, blocked, or leaked. Safely reverting to offline fallback programs.", errorMessage || errorStr);
      lastApiError = "Your Google Gemini API Key has been BLOCKED or flagged as LEAKED by Google because it was published publicly or compromised. Please replace it with a new, brand-new valid API key inside Google AI Studio: go to the 'Settings' menu (top-right gear icon) -> 'Secrets' -> find 'GEMINI_API_KEY' and input your new key.";
    } else {
      console.error("Error invoking Google Gemini API:", error);
      lastApiError = `Google Gemini Service Error: ${errorMessage || "Unable to retrieve content. Please click generate again."}`;
    }
    return null;
  }
}

// Log admin action helper using postgres
async function logAdminAction(action: string, userId: string, userEmail: string, status: string) {
  try {
    const id = `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    await pool.query(
      `INSERT INTO admin_logs (id, date, action, user_id, user_email, status) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, new Date().toISOString(), action, userId, userEmail, status]
    );
  } catch (err) {
    console.error("[DB] Error writing admin log to database:", err);
  }
}

async function startServer() {
  // Ensure database initialization of tables & migration runs first!
  await initDB();

  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Simple Request Logger
  app.use((req, res, next) => {
    console.log(`[HTTP] ${req.method} ${req.url}`);
    next();
  });

  // Authentication Middleware using JWT
  const verifyToken = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing authorization token header" });
    }
    const token = authHeader.split(" ")[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
      
      const userRes = await pool.query("SELECT * FROM users WHERE id = $1", [decoded.userId]);
      if (userRes.rows.length === 0) {
        return res.status(401).json({ error: "Invalid user session token" });
      }
      
      const user = toCamel(userRes.rows[0]);
      if (user.equipment && typeof user.equipment === "string") {
        try {
          user.equipment = JSON.parse(user.equipment);
        } catch {
          // Keep as string if parsing fails
        }
      }
      
      req.userId = user.id;
      req.user = user;
      next();
    } catch (err) {
      console.warn("[Auth] Token verification failed:", err);
      return res.status(401).json({ error: "Your session has expired. Please log in again." });
    }
  };

  // ----- AUTH ENDPOINTS -----
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Please enter your name, email and password" });
    }
    
    try {
      const emailLower = email.toLowerCase();
      
      const existingRes = await pool.query("SELECT id FROM users WHERE email = $1", [emailLower]);
      if (existingRes.rows.length > 0) {
        return res.status(400).json({ error: "An account with this email address already exists" });
      }
      
      // Hash password securely with bcryptjs
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      const role = emailLower === "anksh2307@gmail.com" ? "admin" : "user"; // Assign admin role as per rules
      
      await pool.query(`
        INSERT INTO users (id, email, name, password, role, onboarding_done, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [userId, emailLower, name, hashedPassword, role, false, new Date().toISOString()]);
      
      // Generate JWT Token
      const token = jwt.sign({ userId, email: emailLower, role }, JWT_SECRET, { expiresIn: "14d" });
      
      return res.json({ 
        success: true, 
        token,
        user: { 
          id: userId, 
          name, 
          email: emailLower, 
          role, 
          onboarding_done: false 
        } 
      });
    } catch (err) {
      console.error("[Auth] Registration error:", err);
      res.status(500).json({ error: "Database error during registration." });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Please enter email and password" });
    }
    
    try {
      const emailLower = email.toLowerCase();
      const userRes = await pool.query("SELECT * FROM users WHERE email = $1", [emailLower]);
      if (userRes.rows.length === 0) {
        return res.status(401).json({ error: "Invalid credentials. Verify your email and password." });
      }
      
      const user = toCamel(userRes.rows[0]);
      
      // Compare passwords with bcrypt
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials. Verify your email and password." });
      }
      
      // Generate JWT Token
      const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "14d" });
      
      return res.json({ 
        success: true, 
        token,
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role, 
          onboarding_done: user.onboardingDone 
        } 
      });
    } catch (err) {
      console.error("[Auth] Login error:", err);
      res.status(500).json({ error: "Database error during authentication." });
    }
  });

  app.get("/api/auth/me", verifyToken, (req: any, res) => {
    res.json({ user: req.user });
  });

  app.post("/api/auth/update-profile", verifyToken, async (req: any, res) => {
    const updates = req.body;
    try {
      const userId = req.userId;
      
      // Select current user to merge updates with
      const userRes = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
      if (userRes.rows.length === 0) return res.status(404).json({ error: "User not found" });
      
      const current = toCamel(userRes.rows[0]);
      
      // Destructure updates cleanly
      const updatedOnboardingDone = updates.onboarding_done !== undefined ? updates.onboarding_done : current.onboardingDone;
      const updatedGender = updates.gender !== undefined ? updates.gender : current.gender;
      const updatedAge = updates.age !== undefined ? parseInt(updates.age, 10) : current.age;
      const updatedHeight = updates.height_cm !== undefined ? parseFloat(updates.height_cm) : current.heightCm;
      const updatedWeight = updates.weight_kg !== undefined ? parseFloat(updates.weight_kg) : current.weightKg;
      const updatedActivityLevel = updates.activity_level !== undefined ? updates.activity_level : current.activityLevel;
      const updatedGoal = updates.goal !== undefined ? updates.goal : current.goal;
      const updatedEquipment = updates.equipment !== undefined ? JSON.stringify(updates.equipment) : (typeof current.equipment === "object" ? JSON.stringify(current.equipment) : current.equipment);
      const updatedWorkoutLocation = updates.workout_location !== undefined ? updates.workout_location : current.workoutLocation;
      const updatedApiErrorWarning = updates.api_error_warning !== undefined ? updates.api_error_warning : current.apiErrorWarning;
      const updatedFallbackProgram = updates.using_fallback_program !== undefined ? updates.using_fallback_program : current.usingFallbackProgram;
      const updatedName = updates.name !== undefined ? updates.name : current.name;
      
      await pool.query(`
        UPDATE users SET 
          onboarding_done = $1, gender = $2, age = $3, height_cm = $4, weight_kg = $5,
          activity_level = $6, goal = $7, equipment = $8, workout_location = $9,
          api_error_warning = $10, using_fallback_program = $11, name = $12
        WHERE id = $13
      `, [
        updatedOnboardingDone, updatedGender, updatedAge, updatedHeight, updatedWeight,
        updatedActivityLevel, updatedGoal, updatedEquipment, updatedWorkoutLocation,
        updatedApiErrorWarning, updatedFallbackProgram, updatedName, userId
      ]);
      
      // Fetch latest user info
      const refreshedRes = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
      const refreshed = toCamel(refreshedRes.rows[0]);
      if (refreshed.equipment && typeof refreshed.equipment === "string") {
        try {
          refreshed.equipment = JSON.parse(refreshed.equipment);
        } catch {}
      }
      
      res.json({ success: true, user: refreshed });
    } catch (err) {
      console.error("[Profile] Update error:", err);
      res.status(500).json({ error: "Failed to update profile info in database." });
    }
  });

  app.post("/api/auth/verify-api-key", verifyToken, async (req: any, res) => {
    const userId = req.userId;
    console.log("[API Key Test] Checking newly provided GEMINI_API_KEY online state...");
    
    // Call Gemini with a tiny validation prompt
    const testResult = await callGemini(
      "Please output a JSON containing exactly { \"status\": \"online\" }.",
      "Respond strictly with raw valid JSON: { \"status\": \"online\" }. No markdown formatting, no backticks, no wrap text."
    );

    try {
      if (testResult && !lastApiError) {
        console.log("[API Key Test] Verification Succeeded! Key is fully active.");
        await pool.query(
          "UPDATE users SET api_error_warning = NULL, using_fallback_program = FALSE WHERE id = $1",
          [userId]
        );
        
        const refreshedRes = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
        const refreshed = toCamel(refreshedRes.rows[0]);
        if (refreshed.equipment && typeof refreshed.equipment === "string") {
          try {
            refreshed.equipment = JSON.parse(refreshed.equipment);
          } catch {}
        }
        
        return res.json({ 
          success: true, 
          message: "Your Google Gemini API Key is fully active, verified, and functioning online!",
          user: refreshed
        });
      } else {
        const currentWarning = lastApiError || "Verification check failed. Make sure your API key in Google AI Studio is active and spelled correctly.";
        console.warn("[API Key Test] Verification Failed:", currentWarning);
        await pool.query(
          "UPDATE users SET api_error_warning = $1 WHERE id = $2",
          [currentWarning, userId]
        );
        
        const refreshedRes = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
        const refreshed = toCamel(refreshedRes.rows[0]);
        if (refreshed.equipment && typeof refreshed.equipment === "string") {
          try {
            refreshed.equipment = JSON.parse(refreshed.equipment);
          } catch {}
        }
        
        return res.json({ 
          success: false, 
          error: currentWarning,
          user: refreshed
        });
      }
    } catch (err) {
      console.error("[Auth] Verify API error:", err);
      res.status(500).json({ error: "Database error during key verification." });
    }
  });


  // ----- FITNESS API -----
  app.post("/api/fitness/generate", verifyToken, async (req: any, res) => {
    const userProfile = req.body;
    const userId = req.userId;
    
    // Construct rich prompt
    const prompt = buildFitnessPrompt(userProfile);
    
    const result = await callGemini(
      prompt, 
      "You are a professional fitness trainer. Output strictly a single JSON object. No markdown formatting, no explanation, no backticks, no wrap text."
    );
    
    let parsed: any;
    let usingFallback = false;
    let apiErrorMsg: string | null = null;
    
    if (!result) {
      apiErrorMsg = lastApiError || "Failed to generate plan. Please verify your GEMINI_API_KEY in Settings.";
      lastApiError = null; // reset
      usingFallback = true;
      console.warn("Generating high-quality local fitness fallback plan due to API issue:", apiErrorMsg);
      parsed = { weekPlan: generateLocalFitnessFallback(userProfile).weekPlan };
    } else {
      try {
        let sanitized = result.trim();
        if (sanitized.startsWith("```")) {
          sanitized = sanitized.replace(/^```(json)?/, "").replace(/```$/, "").trim();
        }
        parsed = JSON.parse(sanitized);
      } catch (err: any) {
        console.error("JSON parse error on generated fitness plan, switching to fallback:", err);
        apiErrorMsg = "Failed to parse AI response. Using safe high-quality program.";
        usingFallback = true;
        parsed = { weekPlan: generateLocalFitnessFallback(userProfile).weekPlan };
      }
    }
    
    try {
      // Remove any existing active plan
      await pool.query("UPDATE fitness_plans SET is_active = FALSE WHERE user_id = $1", [userId]);
      
      const newPlanId = `plan_fit_${Date.now()}`;
      await pool.query(`
        INSERT INTO fitness_plans (id, user_id, week_plan, week_number, is_active, created_at, using_fallback, api_error_msg)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        newPlanId, userId, JSON.stringify(parsed.weekPlan || []), 1, true, new Date().toISOString(), usingFallback, apiErrorMsg
      ]);
      
      // Also sync user profile warnings
      await pool.query("UPDATE users SET api_error_warning = $1, using_fallback_program = $2 WHERE id = $3", [
        apiErrorMsg, usingFallback, userId
      ]);
      
      res.json({ success: true, plan: parsed, usingFallback, apiErrorMsg });
    } catch (err: any) {
      console.error("Database save error on fitness plan:", err);
      res.status(500).json({ error: "Could not save generated fitness program." });
    }
  });

  app.get("/api/fitness/plan", verifyToken, async (req: any, res) => {
    try {
      const activePlanRes = await pool.query(
        "SELECT * FROM fitness_plans WHERE user_id = $1 AND is_active = TRUE ORDER BY created_at DESC LIMIT 1",
        [req.userId]
      );
      if (activePlanRes.rows.length === 0) {
        return res.status(404).json({ error: "No active fitness plan found. Please complete Onboarding to generate your plan." });
      }
      
      const activePlan = toCamel(activePlanRes.rows[0]);
      let parsedPlan = [];
      if (activePlan.weekPlan) {
        parsedPlan = typeof activePlan.weekPlan === "string" ? JSON.parse(activePlan.weekPlan) : activePlan.weekPlan;
      }
      res.json({ plan: parsedPlan });
    } catch (err) {
      console.error("Error retrieving active fitness plan:", err);
      res.status(500).json({ error: "Failed to load active fitness program." });
    }
  });

  app.post("/api/fitness/modify-section", verifyToken, async (req: any, res) => {
    const { dayIndex, section, itemIndex, userInstruction, currentItem } = req.body;
    if (dayIndex === undefined || !section || itemIndex === undefined || !userInstruction) {
      return res.status(400).json({ error: "Missing dayIndex, section, itemIndex or instruction specs" });
    }
    
    try {
      const planRes = await pool.query(
        "SELECT * FROM fitness_plans WHERE user_id = $1 AND is_active = TRUE ORDER BY created_at DESC LIMIT 1",
        [req.userId]
      );
      if (planRes.rows.length === 0) return res.status(404).json({ error: "No active fitness plan loaded" });
      
      const activePlan = toCamel(planRes.rows[0]);
      
      const userProfileRes = await pool.query("SELECT * FROM users WHERE id = $1", [req.userId]);
      const userProfile = toCamel(userProfileRes.rows[0]);
      
      let equipmentList = [];
      if (userProfile.equipment) {
        equipmentList = typeof userProfile.equipment === "string" ? JSON.parse(userProfile.equipment) : userProfile.equipment;
      }
      const equipmentStr = equipmentList && equipmentList.join ? equipmentList.join(", ") : "Dumbbells, barbells, or bodyweight";
      
      const targetPrompt = `
You are a professional fitness coach. The user wants to modify a specific exercise from their workout plan.
Exercise object to modify:
${JSON.stringify(currentItem, null, 2)}
 
User's customized instruction: "${userInstruction}"
Equipment available to user: "${equipmentStr}"
Workout location: "${userProfile.workoutLocation || "at home"}"
 
Please return ONLY the updated exercise object matching the exact keys of the input. Do not wrap in arrays. No text explanation, no block marks, no markdowns, no backticks.
`;
      
      const result = await callGemini(targetPrompt, "Generate strictly valid JSON. Keep keys matching identical structure of input.");
      if (!result) {
        const errorMsg = lastApiError || "Gemini modify failed";
        lastApiError = null;
        return res.status(500).json({ error: errorMsg });
      }
      
      let sanitized = result.trim();
      if (sanitized.startsWith("```")) {
        sanitized = sanitized.replace(/^```(json)?/, "").replace(/```$/, "").trim();
      }
      const parsedItem = JSON.parse(sanitized);
      
      const weekPlanList = typeof activePlan.weekPlan === "string" ? JSON.parse(activePlan.weekPlan) : activePlan.weekPlan;
      const dayPlan = weekPlanList[dayIndex];
      
      if (!dayPlan || !dayPlan[section]) {
        return res.status(400).json({ error: "Requested day plan or category section does not exist" });
      }
      
      dayPlan[section][itemIndex] = parsedItem;
      
      await pool.query(
        "UPDATE fitness_plans SET week_plan = $1, modified_at = $2 WHERE id = $3",
        [JSON.stringify(weekPlanList), new Date().toISOString(), activePlan.id]
      );
      
      res.json({ success: true, updatedItem: parsedItem });
    } catch (err) {
      console.error("Failed to parse exercise update:", err);
      res.status(500).json({ error: "AI item formatting incorrect. Check prompt or describe differently." });
    }
  });


  // ----- DIET API -----
  app.post("/api/diet/generate", verifyToken, async (req: any, res) => {
    const userProfile = req.body;
    const userId = req.userId;
    
    // Estimate Calorie Targets
    const weight = Number(userProfile.weight_kg) || 70;
    const height = Number(userProfile.height_cm) || 172;
    const age = Number(userProfile.age) || 25;
    const isMale = userProfile.gender?.toLowerCase() === "male";
    
    // Mifflin St. Jeor for BMR
    const bmr = isMale
      ? (10 * weight) + (6.25 * height) - (5 * age) + 5
      : (10 * weight) + (6.25 * height) - (5 * age) - 161;
      
    // Active modifier
    let actMult = 1.2;
    if (userProfile.activity_level === "light") actMult = 1.375;
    else if (userProfile.activity_level === "moderate") actMult = 1.55;
    else if (userProfile.activity_level === "active") actMult = 1.725;
    
    const tdee = bmr * actMult;
    let calorieTarget = Math.round(tdee);
    
    if (userProfile.goal === "lose_fat") {
      calorieTarget = Math.round(tdee - 500);
    } else if (userProfile.goal === "build_muscle") {
      calorieTarget = Math.round(tdee + 250);
    }
    
    if (calorieTarget < 1200) calorieTarget = 1200; // safe limits
    
    const prompt = buildDietPrompt(userProfile, calorieTarget);
    
    const result = await callGemini(
      prompt,
      "You are a professional dietician. Output strictly a single JSON object. No markdown markup, no conversational text, no backticks."
    );
    
    let parsed: any;
    let usingFallback = false;
    let apiErrorMsg: string | null = null;
    
    if (!result) {
      apiErrorMsg = lastApiError || "Failed to generate nutrition plan. Please verify API configuration.";
      lastApiError = null;
      usingFallback = true;
      console.warn("Generating high-quality local sweet diet fallback due to API key block:", apiErrorMsg);
      parsed = generateLocalDietFallback(userProfile, calorieTarget);
    } else {
      try {
        let sanitized = result.trim();
        if (sanitized.startsWith("```")) {
          sanitized = sanitized.replace(/^```(json)?/, "").replace(/```$/, "").trim();
        }
        parsed = JSON.parse(sanitized);
      } catch (err: any) {
        console.error("JSON parse error on diet, switching to fallback:", err);
        apiErrorMsg = "Failed to parse AI dietitian response. Using safe high-quality diet.";
        usingFallback = true;
        parsed = generateLocalDietFallback(userProfile, calorieTarget);
      }
    }
    
    try {
      // Remove any existing active plan
      await pool.query("UPDATE diet_plans SET is_active = FALSE WHERE user_id = $1", [userId]);
      
      const newPlanId = `plan_diet_${Date.now()}`;
      const macroSplit = parsed.macroSplit || { protein_g: 130, carbs_g: 170, fat_g: 60 };
      const weekPlan = parsed.weekPlan || [];
      
      await pool.query(`
        INSERT INTO diet_plans (id, user_id, daily_calorie_target, macro_split, week_plan, week_number, is_active, created_at, using_fallback, api_error_msg)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        newPlanId, userId, calorieTarget, JSON.stringify(macroSplit), JSON.stringify(weekPlan), 1, true, new Date().toISOString(), usingFallback, apiErrorMsg
      ]);
      
      // Also sync user profile warnings
      await pool.query("UPDATE users SET api_error_warning = $1, using_fallback_program = $2 WHERE id = $3", [
        apiErrorMsg, usingFallback, userId
      ]);
      
      const combinedResponse = {
        id: newPlanId,
        userId,
        dailyCalorieTarget: calorieTarget,
        macroSplit,
        weekPlan,
        weekNumber: 1,
        isActive: true,
        created_at: new Date().toISOString(),
        usingFallback,
        apiErrorMsg
      };
      
      res.json({ success: true, plan: combinedResponse, usingFallback, apiErrorMsg });
    } catch (err: any) {
      console.error("Database save error on diet plan:", err);
      res.status(500).json({ error: "Could not save generated meal plan." });
    }
  });

  app.get("/api/diet/plan", verifyToken, async (req: any, res) => {
    try {
      const planRes = await pool.query(
        "SELECT * FROM diet_plans WHERE user_id = $1 AND is_active = TRUE ORDER BY created_at DESC LIMIT 1",
        [req.userId]
      );
      if (planRes.rows.length === 0) {
        return res.status(404).json({ error: "No active nutrition plan found. Generate at Onboarding." });
      }
      
      const rawPlan = toCamel(planRes.rows[0]);
      const activePlan = {
        id: rawPlan.id,
        userId: rawPlan.userId,
        dailyCalorieTarget: rawPlan.dailyCalorieTarget,
        macroSplit: typeof rawPlan.macroSplit === "string" ? JSON.parse(rawPlan.macroSplit) : rawPlan.macroSplit,
        weekPlan: typeof rawPlan.weekPlan === "string" ? JSON.parse(rawPlan.weekPlan) : rawPlan.weekPlan,
        weekNumber: rawPlan.weekNumber,
        isActive: rawPlan.isActive,
        created_at: rawPlan.createdAt
      };
      res.json({ plan: activePlan });
    } catch (err) {
      console.error("Retrieve diet plan error:", err);
      res.status(500).json({ error: "Failed to load nutrition plan." });
    }
  });

  app.post("/api/diet/modify-meal", verifyToken, async (req: any, res) => {
    const { dayIndex, mealIndex, userInstruction, currentMeal, dailyCalorieTarget } = req.body;
    if (dayIndex === undefined || mealIndex === undefined || !userInstruction || !currentMeal) {
      return res.status(400).json({ error: "Missing meal item index or customization queries" });
    }
    
    try {
      const planRes = await pool.query(
        "SELECT * FROM diet_plans WHERE user_id = $1 AND is_active = TRUE ORDER BY created_at DESC LIMIT 1",
        [req.userId]
      );
      if (planRes.rows.length === 0) return res.status(404).json({ error: "Active diet plan not found" });
      
      const activeDiet = toCamel(planRes.rows[0]);
      
      const targetPrompt = `
You are an expert chef and sports nutritionist. The user wants to change a specific meal in their planner.
Meal plan detail:
${JSON.stringify(currentMeal, null, 2)}
 
User instruction: "${userInstruction}"
Target day limit details: "Should keep prep easy and calories around ${currentMeal.calories} kcal."
 
Please return ONLY the updated single meal object matching the keys of the input. No explanation text, no descriptions, no markdown wrapping, no backticks.
`;
      
      const result = await callGemini(targetPrompt, "Generate strictly valid JSON. Align exact keys matching original input block.");
      if (!result) {
        const errorMsg = lastApiError || "Gemini modify meal failed";
        lastApiError = null;
        return res.status(500).json({ error: errorMsg });
      }
      
      let sanitized = result.trim();
      if (sanitized.startsWith("```")) {
        sanitized = sanitized.replace(/^```(json)?/, "").replace(/```$/, "").trim();
      }
      const parsedMeal = JSON.parse(sanitized);
      
      const weekPlanList = typeof activeDiet.weekPlan === "string" ? JSON.parse(activeDiet.weekPlan) : activeDiet.weekPlan;
      const dayPlan = weekPlanList[dayIndex];
      
      if (!dayPlan || !dayPlan.meals) {
        return res.status(400).json({ error: "Target day diet sequence is invalid" });
      }
      
      dayPlan.meals[mealIndex] = parsedMeal;
      
      await pool.query(
        "UPDATE diet_plans SET week_plan = $1, modified_at = $2 WHERE id = $3",
        [JSON.stringify(weekPlanList), new Date().toISOString(), activeDiet.id]
      );
      
      res.json({ success: true, updatedMeal: parsedMeal });
    } catch (err) {
      console.error("Failed to parse meal update:", err);
      res.status(500).json({ error: "AI meal format incorrect. Please check your instructions and try again." });
    }
  });


  // ----- PROGRESS WEIGHT SCALE -----
  app.get("/api/weigh-ins", verifyToken, async (req: any, res) => {
    try {
      const logsRes = await pool.query(
        "SELECT * FROM weigh_ins WHERE user_id = $1 ORDER BY date ASC",
        [req.userId]
      );
      const logs = logsRes.rows.map(row => {
        const m = toCamel(row);
        m.weightKg = parseFloat(m.weightKg);
        if (m.bodyFatPercent) m.bodyFatPercent = parseFloat(m.bodyFatPercent);
        return m;
      });
      res.json({ weighIns: logs });
    } catch (err) {
      console.error("Get weigh ins error:", err);
      res.status(500).json({ error: "Failed to retrieve weigh ins." });
    }
  });

  app.post("/api/weigh-ins", verifyToken, async (req: any, res) => {
    const { weight_kg, body_fat_percent, notes, date } = req.body;
    if (!weight_kg) return res.status(400).json({ error: "Input weight is required" });
    
    const todayStr = date || new Date().toISOString().split("T")[0];
    
    try {
      const userId = req.userId;
      
      // Override duplicates inside postgres
      await pool.query("DELETE FROM weigh_ins WHERE user_id = $1 AND date = $2", [userId, todayStr]);
      
      const weighInId = `w_${Date.now()}`;
      await pool.query(`
        INSERT INTO weigh_ins (id, user_id, date, weight_kg, body_fat_percent, notes)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        weighInId, userId, todayStr, parseFloat(weight_kg), body_fat_percent ? parseFloat(body_fat_percent) : null, notes || ""
      ]);
      
      // Also sync user latest active weight
      await pool.query("UPDATE users SET weight_kg = $1 WHERE id = $2", [parseFloat(weight_kg), userId]);
      
      res.json({ 
        success: true, 
        weighIn: {
          id: weighInId,
          userId,
          date: todayStr,
          weightKg: parseFloat(weight_kg),
          bodyFatPercent: body_fat_percent ? parseFloat(body_fat_percent) : undefined,
          notes: notes || ""
        } 
      });
    } catch (err) {
      console.error("Post weigh in error:", err);
      res.status(500).json({ error: "Failed to log weigh in." });
    }
  });


  // ----- WORKOUT & NUTRITION LOGS -----
  app.post("/api/logs/workout-session", verifyToken, async (req: any, res) => {
    const { date, dayName, muscleGroup, exercisesLogged, durationMins, totalVolumeKg } = req.body;
    if (!date || !dayName || !muscleGroup || !exercisesLogged) {
      return res.status(400).json({ error: "Required log data sets are missing" });
    }
    
    try {
      const userId = req.userId;
      const sessionId = `session_log_${Date.now()}`;
      
      await pool.query(`
        INSERT INTO workout_sessions (id, user_id, date, day_name, muscle_group, exercises_logged, duration_mins, total_volume_kg, completed)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        sessionId, userId, date, dayName, muscleGroup, JSON.stringify(exercisesLogged), durationMins || 50, totalVolumeKg || 0, true
      ]);
      
      // Update Personal Records
      for (const ex of exercisesLogged) {
        let maxWeight = 0;
        let maxReps = 0;
        let exVol = 0;
        
        for (const st of ex.sets) {
          if (st.completed) {
            if (st.weight > maxWeight) maxWeight = st.weight;
            if (st.reps > maxReps) maxReps = st.reps;
            exVol += st.weight * st.reps;
          }
        }
        
        if (maxWeight > 0) {
          const prRes = await pool.query(
            "SELECT * FROM personal_records WHERE user_id = $1 AND LOWER(exercise_name) = $2 LIMIT 1",
            [userId, ex.name.toLowerCase()]
          );
          
          if (prRes.rows.length === 0) {
            await pool.query(`
              INSERT INTO personal_records (id, user_id, exercise_name, best_weight_kg, best_reps, total_volume_kg, achieved_on)
              VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
              `pr_${Date.now()}_${Math.random().toString(36).substr(2,3)}`,
              userId, ex.name, maxWeight, maxReps, exVol, date
            ]);
          } else {
            const currentRecord = toCamel(prRes.rows[0]);
            const currentBestWeight = parseFloat(currentRecord.bestWeightKg);
            const currentTotalVol = parseFloat(currentRecord.totalVolumeKg);
            
            if (maxWeight > currentBestWeight || 
               (maxWeight === currentBestWeight && maxReps > currentRecord.bestReps)) {
              await pool.query(`
                UPDATE personal_records SET 
                  best_weight_kg = $1, best_reps = $2, total_volume_kg = $3, achieved_on = $4
                WHERE id = $5
              `, [
                maxWeight, maxReps, Math.max(currentTotalVol, exVol), date, currentRecord.id
              ]);
            }
          }
        }
      }
      
      res.json({
        success: true,
        session: {
          id: sessionId,
          userId,
          date,
          dayName,
          muscleGroup,
          exercisesLogged,
          durationMins: durationMins || 50,
          totalVolumeKg: totalVolumeKg || 0,
          completed: true
        }
      });
    } catch (err) {
      console.error("Workout log save error:", err);
      res.status(500).json({ error: "Failed to log workout session." });
    }
  });

  app.post("/api/logs/meal", verifyToken, async (req: any, res) => {
    const { date, mealType, foodName, quantityG, calories, protein_g, carbs_g, fat_g } = req.body;
    if (!date || !foodName || !calories) {
      return res.status(400).json({ error: "Missing food logs particulars" });
    }
    
    try {
      const userId = req.userId;
      const mealLogId = `meal_log_${Date.now()}`;
      
      await pool.query(`
        INSERT INTO meal_logs (id, user_id, date, meal_type, food_name, quantity_g, calories, protein_g, carbs_g, fat_g)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        mealLogId, userId, date, mealType || "Snack", foodName, quantityG ? parseFloat(quantityG) : 100,
        parseFloat(calories), protein_g ? parseFloat(protein_g) : 0, carbs_g ? parseFloat(carbs_g) : 0, fat_g ? parseFloat(fat_g) : 0
      ]);
      
      res.json({
        success: true,
        mealLog: {
          id: mealLogId,
          userId,
          date,
          mealType: mealType || "Snack",
          foodName,
          quantityG: quantityG ? parseFloat(quantityG) : 100,
          calories: parseFloat(calories),
          protein_g: protein_g ? parseFloat(protein_g) : 0,
          carbs_g: carbs_g ? parseFloat(carbs_g) : 0,
          fat_g: fat_g ? parseFloat(fat_g) : 0
        }
      });
    } catch (err) {
      console.error("Meal log post error:", err);
      res.status(500).json({ error: "Failed to log meal intake." });
    }
  });

  app.delete("/api/logs/meal/:id", verifyToken, async (req: any, res) => {
    try {
      const deleteRes = await pool.query(
        "DELETE FROM meal_logs WHERE id = $1 AND user_id = $2",
        [req.params.id, req.userId]
      );
      if (deleteRes.rowCount === 0) return res.status(404).json({ error: "Meal log not found" });
      res.json({ success: true });
    } catch (err) {
      console.error("Delete meal log error:", err);
      res.status(500).json({ error: "Failed to delete meal log." });
    }
  });

  app.post("/api/logs/water", verifyToken, async (req: any, res) => {
    const { date, glasses } = req.body;
    if (!date || glasses === undefined) {
      return res.status(400).json({ error: "Date and input count glasses required" });
    }
    
    try {
      const userId = req.userId;
      
      const existingRes = await pool.query(
        "SELECT id FROM meal_logs WHERE user_id = $1 AND date = $2 AND meal_type = 'Water' LIMIT 1",
        [userId, date]
      );
      
      if (existingRes.rows.length > 0) {
        await pool.query(
          "UPDATE meal_logs SET water_glasses = $1 WHERE id = $2",
          [parseInt(glasses, 10), existingRes.rows[0].id]
        );
      } else {
        await pool.query(`
          INSERT INTO meal_logs (id, user_id, date, meal_type, food_name, quantity_g, calories, protein_g, carbs_g, fat_g, water_glasses)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          `water_log_${Date.now()}`, userId, date, "Water", "Water Intake", 0, 0, 0, 0, 0, parseInt(glasses, 10)
        ]);
      }
      
      res.json({ success: true, waterGlasses: parseInt(glasses, 10) });
    } catch (err) {
      console.error("Water glasses log error:", err);
      res.status(500).json({ error: "Failed to log water glasses." });
    }
  });

  app.get("/api/logs/today", verifyToken, async (req: any, res) => {
    const todayStr = req.query.date || new Date().toISOString().split("T")[0];
    
    try {
      const userId = req.userId;
      
      const mealLogsRes = await pool.query(
        "SELECT * FROM meal_logs WHERE user_id = $1 AND date = $2 AND meal_type != 'Water'",
        [userId, todayStr]
      );
      const mealLogs = mealLogsRes.rows.map(row => {
        const m = toCamel(row);
        m.quantityG = parseFloat(m.quantityG);
        m.calories = parseFloat(m.calories);
        m.protein_g = parseFloat(m.proteinG);
        m.carbs_g = parseFloat(m.carbsG);
        m.fat_g = parseFloat(m.fatG);
        return m;
      });
      
      const waterRes = await pool.query(
        "SELECT water_glasses FROM meal_logs WHERE user_id = $1 AND date = $2 AND meal_type = 'Water' LIMIT 1",
        [userId, todayStr]
      );
      const waterGlasses = waterRes.rows.length > 0 ? waterRes.rows[0].water_glasses || 0 : 0;
      
      const totals = mealLogs.reduce(
        (acc, m) => {
          acc.calories += m.calories || 0;
          acc.protein += m.protein_g || 0;
          acc.carbs += m.carbs_g || 0;
          acc.fat += m.fat_g || 0;
          return acc;
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );
      
      res.json({
        logs: mealLogs,
        waterGlasses,
        totalCalories: totals.calories,
        totalProtein: Math.round(totals.protein),
        totalCarbs: Math.round(totals.carbs),
        totalFat: Math.round(totals.fat)
      });
    } catch (err) {
      console.error("Get logs today error:", err);
      res.status(500).json({ error: "Failed to load today's logs." });
    }
  });

  app.get("/api/logs/all", verifyToken, async (req: any, res) => {
    try {
      const userId = req.userId;
      
      const workoutsRes = await pool.query("SELECT * FROM workout_sessions WHERE user_id = $1", [userId]);
      const workouts = workoutsRes.rows.map(row => {
        const s = toCamel(row);
        s.exercisesLogged = typeof s.exercisesLogged === "string" ? JSON.parse(s.exercisesLogged) : s.exercisesLogged;
        s.totalVolumeKg = parseFloat(s.totalVolumeKg);
        return s;
      });
      
      const prsRes = await pool.query("SELECT * FROM personal_records WHERE user_id = $1", [userId]);
      const prs = prsRes.rows.map(row => {
        const r = toCamel(row);
        r.bestWeightKg = parseFloat(r.bestWeightKg);
        r.totalVolumeKg = parseFloat(r.totalVolumeKg);
        return r;
      });
      
      const mealsRes = await pool.query("SELECT * FROM meal_logs WHERE user_id = $1 AND meal_type != 'Water'", [userId]);
      const meals = mealsRes.rows.map(row => {
        const m = toCamel(row);
        m.quantityG = parseFloat(m.quantityG);
        m.calories = parseFloat(m.calories);
        m.protein_g = parseFloat(m.proteinG);
        m.carbs_g = parseFloat(m.carbsG);
        m.fat_g = parseFloat(m.fatG);
        return m;
      });
      
      res.json({
        workoutSessions: workouts,
        personalRecords: prs,
        mealLogs: meals
      });
    } catch (err) {
      console.error("Get logs all error:", err);
      res.status(500).json({ error: "Failed to load historical analytics." });
    }
  });


  // ----- ADMIN PANEL ENDPOINTS -----
  const verifyAdmin = async (req: any, res: any, next: any) => {
    const adminKey = req.headers["x-admin-key"];
    const devSecret = process.env.ADMIN_SECRET_KEY || "ANKSH_ADMIN_SECRET";
    
    if (adminKey === devSecret) {
      return next();
    }
    
    // Auth Token role lookup alternative
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
        const qRes = await pool.query("SELECT role FROM users WHERE id = $1", [decoded.userId]);
        if (qRes.rows.length > 0 && qRes.rows[0].role === "admin") {
          return next();
        }
      } catch (err) {
        // Fallback to error
      }
    }
    
    return res.status(403).json({ error: "Access denied. Admin credentials required." });
  };

  app.get("/api/admin/users", verifyAdmin, async (req, res) => {
    try {
      const usersRes = await pool.query("SELECT * FROM users ORDER BY created_at DESC");
      const sanitised = usersRes.rows.map(u => {
        const userObj = toCamel(u);
        if (userObj.equipment && typeof userObj.equipment === "string") {
          try {
            userObj.equipment = JSON.parse(userObj.equipment);
          } catch {}
        }
        return {
          id: userObj.id,
          name: userObj.name,
          email: userObj.email,
          role: userObj.role,
          goal: userObj.goal,
          onboarding_done: userObj.onboardingDone,
          created_at: userObj.createdAt,
          age: userObj.age,
          height_cm: userObj.heightCm ? parseFloat(userObj.heightCm) : null,
          weight_kg: userObj.weightKg ? parseFloat(userObj.weightKg) : null,
          equipment: userObj.equipment,
          workout_location: userObj.workoutLocation
        };
      });
      res.json({ users: sanitised });
    } catch (err) {
      console.error("Admin list users error:", err);
      res.status(500).json({ error: "Failed to list users." });
    }
  });

  app.get("/api/admin/logs", verifyAdmin, async (req, res) => {
    try {
      const logsRes = await pool.query("SELECT * FROM admin_logs ORDER BY date DESC LIMIT 200");
      res.json({ logs: logsRes.rows.map(row => toCamel(row)) });
    } catch (err) {
      console.error("Admin view logs error:", err);
      res.status(500).json({ error: "Failed to fetch administrative logs." });
    }
  });

  app.put("/api/admin/update-plan", verifyAdmin, async (req, res) => {
    const { userId, planType, planJson } = req.body;
    if (!userId || !planType || !planJson) {
      return res.status(400).json({ error: "Missing plan items update parameters" });
    }
    
    try {
      const parsedPlan = typeof planJson === "string" ? JSON.parse(planJson) : planJson;
      
      const userRes = await pool.query("SELECT email FROM users WHERE id = $1", [userId]);
      if (userRes.rows.length === 0) return res.status(404).json({ error: "User not found" });
      const userEmail = userRes.rows[0].email;
      
      if (planType === "fitness") {
        await pool.query("UPDATE fitness_plans SET is_active = FALSE WHERE user_id = $1", [userId]);
        await pool.query(`
          INSERT INTO fitness_plans (id, user_id, week_plan, week_number, is_active, created_at)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          `plan_fit_${Date.now()}`, userId, JSON.stringify(parsedPlan), 1, true, new Date().toISOString()
        ]);
      } else {
        await pool.query("UPDATE diet_plans SET is_active = FALSE WHERE user_id = $1", [userId]);
        await pool.query(`
          INSERT INTO diet_plans (id, user_id, daily_calorie_target, macro_split, week_plan, week_number, is_active, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          `plan_diet_${Date.now()}`, userId, parsedPlan.dailyCalorieTarget || 1800,
          JSON.stringify(parsedPlan.macroSplit || { protein_g: 130, carbs_g: 170, fat_g: 60 }),
          JSON.stringify(parsedPlan.weekPlan || parsedPlan), 1, true, new Date().toISOString()
        ]);
      }
      
      await logAdminAction(`Manually Updated ${planType} Plan`, userId, userEmail, "Success");
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: "Invalid JSON format: " + err.message });
    }
  });

  app.post("/api/admin/regenerate", verifyAdmin, async (req, res) => {
    const { userId, planType } = req.body;
    if (!userId || !planType) {
      return res.status(400).json({ error: "Missing specs of userId or type" });
    }
    
    try {
      const userRes = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
      if (userRes.rows.length === 0) return res.status(404).json({ error: "User not found" });
      const userProfile = toCamel(userRes.rows[0]);
      if (userProfile.equipment && typeof userProfile.equipment === "string") {
        try {
          userProfile.equipment = JSON.parse(userProfile.equipment);
        } catch {}
      }
      
      if (planType === "fitness") {
        const prompt = buildFitnessPrompt(userProfile);
        const result = await callGemini(prompt, "You are a professional trainer. Respond strictly in valid raw JSON. No backticks.");
        
        let parsed: any;
        let usingFallback = false;
        let apiErrorMsg: string | null = null;
        
        if (!result) {
          await logAdminAction("AI Re-Generation failure", userId, userProfile.email, "Error");
          apiErrorMsg = lastApiError || "Failed fitness generation";
          lastApiError = null;
          usingFallback = true;
          parsed = { weekPlan: generateLocalFitnessFallback(userProfile).weekPlan };
        } else {
          try {
            let sanitized = result.trim();
            if (sanitized.startsWith("```")) {
              sanitized = sanitized.replace(/^```(json)?/, "").replace(/```$/, "").trim();
            }
            parsed = JSON.parse(sanitized);
          } catch (err) {
            await logAdminAction("Parsed failure", userId, userProfile.email, "JSON Error");
            apiErrorMsg = "Failed to parse AI response. Using safe high-quality program.";
            usingFallback = true;
            parsed = { weekPlan: generateLocalFitnessFallback(userProfile).weekPlan };
          }
        }
        
        await pool.query("UPDATE fitness_plans SET is_active = FALSE WHERE user_id = $1", [userId]);
        const newPlanId = `plan_fit_${Date.now()}`;
        await pool.query(`
          INSERT INTO fitness_plans (id, user_id, week_plan, week_number, is_active, created_at, using_fallback, api_error_msg)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          newPlanId, userId, JSON.stringify(parsed.weekPlan || []), 2, true, new Date().toISOString(), usingFallback, apiErrorMsg
        ]);
        
        await pool.query("UPDATE users SET api_error_warning = $1, using_fallback_program = $2 WHERE id = $3", [
          apiErrorMsg, usingFallback, userId
        ]);
        
        await logAdminAction(usingFallback ? "Regenerated Fitness Plan (Fallback)" : "Regenerated Fitness Plan", userId, userProfile.email, "Success");
        res.json({ success: true, plan: parsed.weekPlan || [], usingFallback, apiErrorMsg });
      } else {
        const weight = Number(userProfile.weightKg) || 70;
        const height = Number(userProfile.heightCm) || 172;
        const age = Number(userProfile.age) || 25;
        const isMale = userProfile.gender?.toLowerCase() === "male";
        const bmr = isMale
          ? (10 * weight) + (6.25 * height) - (5 * age) + 5
          : (10 * weight) + (6.25 * height) - (5 * age) - 161;
        let actMult = 1.2;
        if (userProfile.activityLevel === "light") actMult = 1.375;
        else if (userProfile.activityLevel === "moderate") actMult = 1.55;
        else if (userProfile.activityLevel === "active") actMult = 1.725;
        
        const tdee = bmr * actMult;
        let calorieTarget = Math.round(tdee);
        if (userProfile.goal === "lose_fat") calorieTarget = Math.round(tdee - 500);
        else if (userProfile.goal === "build_muscle") calorieTarget = Math.round(tdee + 250);
        if (calorieTarget < 1200) calorieTarget = 1200;
        
        const prompt = buildDietPrompt(userProfile, calorieTarget);
        const result = await callGemini(prompt, "You are a professional nutrition planner. Output strictly in valid raw JSON.");
        
        let parsed: any;
        let usingFallback = false;
        let apiErrorMsg: string | null = null;
        
        if (!result) {
          await logAdminAction("AI Re-Generation meal failure", userId, userProfile.email, "Error");
          apiErrorMsg = lastApiError || "Failed diet generation";
          lastApiError = null;
          usingFallback = true;
          parsed = generateLocalDietFallback(userProfile, calorieTarget);
        } else {
          try {
            let sanitized = result.trim();
            if (sanitized.startsWith("```")) {
              sanitized = sanitized.replace(/^```(json)?/, "").replace(/```$/, "").trim();
            }
            parsed = JSON.parse(sanitized);
          } catch (err) {
            await logAdminAction("Parsed failure", userId, userProfile.email, "JSON Error");
            apiErrorMsg = "Failed to parse AI dietitian response. Using safe high-quality diet.";
            usingFallback = true;
            parsed = generateLocalDietFallback(userProfile, calorieTarget);
          }
        }
        
        await pool.query("UPDATE diet_plans SET is_active = FALSE WHERE user_id = $1", [userId]);
        const newPlanId = `plan_diet_${Date.now()}`;
        const macroSplit = parsed.macroSplit || { protein_g: 130, carbs_g: 170, fat_g: 60 };
        const weekPlan = parsed.weekPlan || parsed;
        
        await pool.query(`
          INSERT INTO diet_plans (id, user_id, daily_calorie_target, macro_split, week_plan, week_number, is_active, created_at, using_fallback, api_error_msg)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          newPlanId, userId, calorieTarget, JSON.stringify(macroSplit), JSON.stringify(weekPlan), 2, true, new Date().toISOString(), usingFallback, apiErrorMsg
        ]);
        
        await pool.query("UPDATE users SET api_error_warning = $1, using_fallback_program = $2 WHERE id = $3", [
          apiErrorMsg, usingFallback, userId
        ]);
        
        await logAdminAction(usingFallback ? "Regenerated Nutrition Plan (Fallback)" : "Regenerated Nutrition Plan", userId, userProfile.email, "Success");
        res.json({ success: true, plan: { dailyCalorieTarget: calorieTarget, macroSplit, weekPlan }, usingFallback, apiErrorMsg });
      }
    } catch (err) {
      console.error("Admin regenerate error:", err);
      res.status(500).json({ error: "Failed to regenerate program features." });
    }
  });


  // ----- INTEGRATED VITE DEV/PREVIEW MIDDLEWARE -----
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[STATION] FitTrack full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
