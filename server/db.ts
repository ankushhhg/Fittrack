import pg from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

dotenv.config();

const { Pool } = pg;

const defaultDbUrl = "postgresql://neondb_owner:npg_9TaZNHCeMi7r@ep-fragrant-wildflower-aq8gysq7.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require";
const connectionString = process.env.DATABASE_URL || defaultDbUrl;

// Initialize connection pool
export const pool = new Pool({
  connectionString,
  ssl: connectionString.includes("sslmode=require") || connectionString.includes("neon.tech")
    ? { rejectUnauthorized: false }
    : false,
});

// Row converters for camelCase (JS) to snake_case (Postgres)
export function toCamel(row: any) {
  if (!row) return row;
  const res: any = {};
  for (const key of Object.keys(row)) {
    res[key] = row[key];
    const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    res[camelKey] = row[key];
  }
  return res;
}

export function toSnake(obj: any) {
  if (!obj) return obj;
  const res: any = {};
  for (const key of Object.keys(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    res[snakeKey] = obj[key];
  }
  return res;
}

export async function initDB() {
  console.log("[DB] Starting Neon DB table initialization...");
  const client = await pool.connect();
  try {
    const schemaCheck = await client.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      ORDER BY table_name, column_name
    `);
    console.log("[DB SCHEMA] Inspecting database columns:");
    for (const r of schemaCheck.rows) {
      console.log(`  - ${r.table_name}.${r.column_name}: ${r.data_type}`);
    }

    // 1. Create table users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        onboarding_done BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        gender VARCHAR(50),
        age INTEGER,
        height_cm NUMERIC,
        weight_kg NUMERIC,
        activity_level VARCHAR(50),
        goal VARCHAR(50),
        equipment TEXT,
        workout_location VARCHAR(100),
        api_error_warning TEXT,
        using_fallback_program BOOLEAN DEFAULT FALSE
      )
    `);

    // Ensure all required columns exist in the users table in case it was pre-created
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_done BOOLEAN DEFAULT FALSE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(50);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS age INTEGER;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS height_cm NUMERIC;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS weight_kg NUMERIC;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS activity_level VARCHAR(50);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS goal VARCHAR(50);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS equipment TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS workout_location VARCHAR(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS api_error_warning TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS using_fallback_program BOOLEAN DEFAULT FALSE;
    `);

    // 2. Create table fitness_plans
    await client.query(`
      CREATE TABLE IF NOT EXISTS fitness_plans (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        week_plan TEXT,
        week_number INTEGER DEFAULT 1,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        using_fallback BOOLEAN DEFAULT FALSE,
        api_error_msg TEXT,
        modified_at TIMESTAMP
      )
    `);

    // 3. Create table diet_plans
    await client.query(`
      CREATE TABLE IF NOT EXISTS diet_plans (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        daily_calorie_target INTEGER,
        macro_split TEXT,
        week_plan TEXT,
        week_number INTEGER DEFAULT 1,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        using_fallback BOOLEAN DEFAULT FALSE,
        api_error_msg TEXT,
        modified_at TIMESTAMP
      )
    `);

    // 4. Create table workout_sessions
    await client.query(`
      CREATE TABLE IF NOT EXISTS workout_sessions (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        date VARCHAR(50),
        day_name VARCHAR(50),
        muscle_group VARCHAR(100),
        exercises_logged TEXT,
        duration_mins INTEGER DEFAULT 50,
        total_volume_kg NUMERIC DEFAULT 0,
        completed BOOLEAN DEFAULT TRUE
      )
    `);

    // 5. Create table meal_logs
    await client.query(`
      CREATE TABLE IF NOT EXISTS meal_logs (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        date VARCHAR(50),
        meal_type VARCHAR(50),
        food_name VARCHAR(255),
        quantity_g NUMERIC DEFAULT 100,
        calories NUMERIC,
        protein_g NUMERIC DEFAULT 0,
        carbs_g NUMERIC DEFAULT 0,
        fat_g NUMERIC DEFAULT 0,
        water_glasses INTEGER DEFAULT 0
      )
    `);

    // 6. Create table weigh_ins
    await client.query(`
      CREATE TABLE IF NOT EXISTS weigh_ins (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        date VARCHAR(50),
        weight_kg NUMERIC,
        body_fat_percent NUMERIC,
        notes TEXT
      )
    `);

    // 7. Create table personal_records
    await client.query(`
      CREATE TABLE IF NOT EXISTS personal_records (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        exercise_name VARCHAR(255),
        best_weight_kg NUMERIC,
        best_reps INTEGER,
        total_volume_kg NUMERIC,
        achieved_on VARCHAR(50)
      )
    `);

    // 8. Create table admin_logs
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_logs (
        id VARCHAR(255) PRIMARY KEY,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        action TEXT,
        user_id VARCHAR(255),
        user_email VARCHAR(255),
        status VARCHAR(50)
      )
    `);

    // Ensure all required columns exist in the other tables in case they were pre-created
    await client.query(`
      ALTER TABLE fitness_plans ADD COLUMN IF NOT EXISTS week_number INTEGER DEFAULT 1;
      ALTER TABLE fitness_plans ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
      ALTER TABLE fitness_plans ADD COLUMN IF NOT EXISTS using_fallback BOOLEAN DEFAULT FALSE;
      ALTER TABLE fitness_plans ADD COLUMN IF NOT EXISTS api_error_msg TEXT;
      ALTER TABLE fitness_plans ADD COLUMN IF NOT EXISTS modified_at TIMESTAMP;

      ALTER TABLE diet_plans ADD COLUMN IF NOT EXISTS daily_calorie_target INTEGER;
      ALTER TABLE diet_plans ADD COLUMN IF NOT EXISTS macro_split TEXT;
      ALTER TABLE diet_plans ADD COLUMN IF NOT EXISTS week_number INTEGER DEFAULT 1;
      ALTER TABLE diet_plans ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
      ALTER TABLE diet_plans ADD COLUMN IF NOT EXISTS using_fallback BOOLEAN DEFAULT FALSE;
      ALTER TABLE diet_plans ADD COLUMN IF NOT EXISTS api_error_msg TEXT;
      ALTER TABLE diet_plans ADD COLUMN IF NOT EXISTS modified_at TIMESTAMP;

      ALTER TABLE workout_sessions ADD COLUMN IF NOT EXISTS duration_mins INTEGER DEFAULT 50;
      ALTER TABLE workout_sessions ADD COLUMN IF NOT EXISTS total_volume_kg NUMERIC DEFAULT 0;
      ALTER TABLE workout_sessions ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT TRUE;

      ALTER TABLE meal_logs ADD COLUMN IF NOT EXISTS quantity_g NUMERIC DEFAULT 100;
      ALTER TABLE meal_logs ADD COLUMN IF NOT EXISTS protein_g NUMERIC DEFAULT 0;
      ALTER TABLE meal_logs ADD COLUMN IF NOT EXISTS carbs_g NUMERIC DEFAULT 0;
      ALTER TABLE meal_logs ADD COLUMN IF NOT EXISTS fat_g NUMERIC DEFAULT 0;
      ALTER TABLE meal_logs ADD COLUMN IF NOT EXISTS water_glasses INTEGER DEFAULT 0;

      ALTER TABLE weigh_ins ADD COLUMN IF NOT EXISTS body_fat_percent NUMERIC;
      ALTER TABLE weigh_ins ADD COLUMN IF NOT EXISTS notes TEXT;

      ALTER TABLE personal_records ADD COLUMN IF NOT EXISTS total_volume_kg NUMERIC;
    `);

    console.log("[DB] Neon DB tables verified/created successfully!");

    // 9. Execute file migration to Neon DB if users table is empty
    const userCountResult = await client.query("SELECT COUNT(*) FROM users");
    const count = parseInt(userCountResult.rows[0].count, 10);
    if (count === 0) {
      console.log("[DB] Postgres is empty. Checking for local JSON database to migrate...");
      await migrateJsonToPostgres(client);
    }

  } catch (error) {
    console.error("[DB] Error initializing database tables:", error);
  } finally {
    client.release();
  }
}

async function migrateJsonToPostgres(client: any) {
  const DB_PATH = path.join(process.cwd(), "fittrack_db.json");
  if (!fs.existsSync(DB_PATH)) {
    console.log("[DB] No local fittrack_db.json found. No data is migrated.");
    return;
  }

  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    const db = JSON.parse(raw);
    console.log(`[DB] Starting migration of local data: ${db.users?.length || 0} users found.`);

    // Migrate users
    if (db.users) {
      for (const u of db.users) {
        // Enforce hashed passwords on migration
        let hashedPassword = u.password;
        if (!u.password.startsWith("$2a$") && !u.password.startsWith("$2b$")) {
          hashedPassword = await bcrypt.hash(u.password, 10);
        }

        await client.query(`
          INSERT INTO users (
            id, email, name, password, role, onboarding_done, created_at,
            gender, age, height_cm, weight_kg, activity_level, goal,
            equipment, workout_location, api_error_warning, using_fallback_program
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
          ON CONFLICT (id) DO NOTHING
        `, [
          u.id, 
          u.email, 
          u.name, 
          hashedPassword, 
          u.role || "user", 
          u.onboarding_done || false, 
          u.created_at || new Date().toISOString(),
          u.gender || null,
          u.age ? parseInt(u.age, 10) : null,
          u.height_cm ? parseFloat(u.height_cm) : null,
          u.weight_kg ? parseFloat(u.weight_kg) : null,
          u.activity_level || null,
          u.goal || null,
          u.equipment ? JSON.stringify(u.equipment) : null,
          u.workout_location || null,
          u.api_error_warning || null,
          u.using_fallback_program || false
        ]);
      }
    }

    // Migrate fitness plans
    if (db.fitness_plans) {
      for (const p of db.fitness_plans) {
        await client.query(`
          INSERT INTO fitness_plans (
            id, user_id, week_plan, week_number, is_active, created_at, using_fallback, api_error_msg, modified_at
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
          ON CONFLICT (id) DO NOTHING
        `, [
          p.id, p.userId, JSON.stringify(p.weekPlan || []), p.weekNumber || 1, p.isActive !== undefined ? p.isActive : true,
          p.created_at || new Date().toISOString(), p.usingFallback || false, p.apiErrorMsg || null, p.modified_at || null
        ]);
      }
    }

    // Migrate diet plans
    if (db.diet_plans) {
      for (const d of db.diet_plans) {
        await client.query(`
          INSERT INTO diet_plans (
            id, user_id, daily_calorie_target, macro_split, week_plan, week_number, is_active, created_at, using_fallback, api_error_msg, modified_at
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
          ON CONFLICT (id) DO NOTHING
        `, [
          d.id, d.userId, d.dailyCalorieTarget || 2000, JSON.stringify(d.macroSplit || {}), JSON.stringify(d.weekPlan || []),
          d.weekNumber || 1, d.isActive !== undefined ? d.isActive : true, d.created_at || new Date().toISOString(),
          d.usingFallback || false, d.apiErrorMsg || null, d.modified_at || null
        ]);
      }
    }

    // Migrate workout sessions
    if (db.workout_sessions) {
      for (const s of db.workout_sessions) {
        await client.query(`
          INSERT INTO workout_sessions (
            id, user_id, date, day_name, muscle_group, exercises_logged, duration_mins, total_volume_kg, completed
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
          ON CONFLICT (id) DO NOTHING
        `, [
          s.id, s.userId, s.date, s.dayName, s.muscleGroup, JSON.stringify(s.exercisesLogged || []), s.durationMins || 50,
          s.totalVolumeKg || 0, s.completed !== undefined ? s.completed : true
        ]);
      }
    }

    // Migrate meal logs
    if (db.meal_logs) {
      for (const m of db.meal_logs) {
        await client.query(`
          INSERT INTO meal_logs (
            id, user_id, date, meal_type, food_name, quantity_g, calories, protein_g, carbs_g, fat_g, water_glasses
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
          ON CONFLICT (id) DO NOTHING
        `, [
          m.id, m.userId, m.date, m.mealType, m.foodName, m.quantityG || 100, m.calories || 0, m.protein_g || 0,
          m.carbs_g || 0, m.fat_g || 0, m.water_glasses || 0
        ]);
      }
    }

    // Migrate weigh ins
    if (db.weigh_ins) {
      for (const w of db.weigh_ins) {
        await client.query(`
          INSERT INTO weigh_ins (
            id, user_id, date, weight_kg, body_fat_percent, notes
          ) VALUES ($1,$2,$3,$4,$5,$6)
          ON CONFLICT (id) DO NOTHING
        `, [
          w.id, w.userId, w.date, w.weight_kg, w.body_fat_percent || null, w.notes || ""
        ]);
      }
    }

    // Migrate personal records
    if (db.personal_records) {
      for (const r of db.personal_records) {
        await client.query(`
          INSERT INTO personal_records (
            id, user_id, exercise_name, best_weight_kg, best_reps, total_volume_kg, achieved_on
          ) VALUES ($1,$2,$3,$4,$5,$6,$7)
          ON CONFLICT (id) DO NOTHING
        `, [
          r.id, r.userId, r.exerciseName, r.bestWeightKg, r.bestReps, r.totalVolumeKg, r.achievedOn
        ]);
      }
    }

    // Migrate admin logs
    if (db.admin_logs) {
      for (const l of db.admin_logs) {
        await client.query(`
          INSERT INTO admin_logs (
            id, date, action, user_id, user_email, status
          ) VALUES ($1,$2,$3,$4,$5,$6)
          ON CONFLICT (id) DO NOTHING
        `, [
          l.id, l.date || new Date().toISOString(), l.action, l.userId, l.userEmail, l.status
        ]);
      }
    }

    console.log("[DB] Local JSON database successfully migrated to Neon Postgres!");
  } catch (err) {
    console.error("[DB] Error migrating local JSON to Postgres (continuing):", err);
  }
}
