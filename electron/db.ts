import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database", "worksight.db");
export const db = new Database(dbPath);

export function getDailyCategorySummary(date: string) {
  console.log("Fetching daily category summary for date:", date);
  const res =  db.prepare(`
    SELECT category, SUM(duration_sec) as total_sec
    FROM activity_log
    WHERE DATE(start_time) = ?
    GROUP BY category
  `).all(date);
  console.log("Daily category summary result:", res);
  return res;

}

export function getAppUsage(date: string) {
  const res = db.prepare(`  
    SELECT app_name, SUM(duration_sec) as total_sec
    FROM activity_log
    WHERE DATE(start_time) = ?
    GROUP BY app_name
    ORDER BY total_sec DESC
  `).all(date);
  console.log("App usage result:", res);
  return res;
}


export function updateUserProfile(profileData: any) {
  ensureUserProfileTable();

  return db.prepare(`
    UPDATE user_profile
    SET
      username = ?,
      agent_nickname = ?,
      email = ?,
      system_prompt = ?,
      final_goal = ?,
      productive_apps = ?,
      distraction_apps = ?,
      neutral_apps = ?,
      api_key= ?
    WHERE id = 1
  `).run(
    profileData.username,
    profileData.agent_nickname,
    profileData.email,
    profileData.system_prompt,
    profileData.final_goal,
    JSON.stringify(profileData.productive_apps || []),
    JSON.stringify(profileData.distraction_apps || []),
    JSON.stringify(profileData.neutral_apps || []),
    profileData.api_key
  );
}

/* ---------- SAFE TABLE + COLUMN ENSURE ---------- */

function ensureUserProfileTable() {
  // create table safely
 
  db.prepare(`
    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY,
      username TEXT,
      agent_nickname TEXT,
      email TEXT,
      system_prompt TEXT,
      final_goal TEXT,
      productive_apps TEXT,
      distraction_apps TEXT,
      neutral_apps TEXT,
      api_key TEXT
    )
  `).run();


  // ensure row
  db.prepare(`
    INSERT OR IGNORE INTO user_profile (id)
    VALUES (1)
  `).run();

  // ensure columns (OLD DB FIX)
  const cols = db
    .prepare(`PRAGMA table_info(user_profile)`)
    .all()
    .map((c: any) => c.name);

  if (!cols.includes("productive_apps"))
    db.prepare(
      `ALTER TABLE user_profile ADD COLUMN productive_apps TEXT DEFAULT '[]'`
    ).run();

  if (!cols.includes("distraction_apps"))
    db.prepare(
      `ALTER TABLE user_profile ADD COLUMN distraction_apps TEXT DEFAULT '[]'`
    ).run();

  if (!cols.includes("neutral_apps"))
    db.prepare(
      `ALTER TABLE user_profile ADD COLUMN neutral_apps TEXT DEFAULT '[]'`
    ).run();
    if (!cols.includes("api_key"))
  db.prepare(
    `ALTER TABLE user_profile ADD COLUMN api_key TEXT`
  ).run();
}


export function getUserProfile() {
  ensureUserProfileTable();

  const row = db.prepare(
    "SELECT * FROM user_profile WHERE id = 1"
  ).get();

  return {
    ...row,
    productive_apps: JSON.parse(row.productive_apps || "[]"),
    distraction_apps: JSON.parse(row.distraction_apps || "[]"),
    neutral_apps: JSON.parse(row.neutral_apps || "[]"),
  };
}


export function getDaySummary(date: string) {
  return db.prepare(`
    SELECT category, SUM(duration_sec) AS total_sec
    FROM activity_log
    WHERE DATE(start_time) = ?
    GROUP BY category
  `).all(date);
}
export function getDayAppUsage(date: string) {
  return db.prepare(`
    SELECT app_name, SUM(duration_sec) AS total_sec
    FROM activity_log
    WHERE DATE(start_time) = ?
    GROUP BY app_name
    ORDER BY total_sec DESC
  `).all(date);
}
export function getWeekSummary(startDate: string, endDate: string) {
  return db.prepare(`
    SELECT DATE(start_time) AS day, SUM(duration_sec) AS total_sec
    FROM activity_log
    WHERE DATE(start_time) BETWEEN ? AND ?
    GROUP BY day
    ORDER BY day
  `).all(startDate, endDate);
}
export function getCategoryBreakdown(startDate: string, endDate: string) {
  return db.prepare(`
    SELECT category, SUM(duration_sec) AS total_sec
    FROM activity_log
    WHERE DATE(start_time) BETWEEN ? AND ?
    GROUP BY category
    ORDER BY total_sec DESC
  `).all(startDate, endDate);
}
export function getMonthSummary(year: number, month: number) {
  return db.prepare(`
    SELECT DATE(start_time) AS day, SUM(duration_sec) AS total_sec
    FROM activity_log
    WHERE strftime('%Y', start_time) = ?
      AND strftime('%m', start_time) = ?
    GROUP BY day
    ORDER BY day
  `).all(String(year), String(month).padStart(2, "0"));
}


// TABLE USED (STRICTLY):
// activity_log(
//   id INTEGER,
//   app_name TEXT,
//   window_title TEXT,
//   domain TEXT,
//   start_time TEXT,
//   end_time TEXT,
//   duration_sec INTEGER,
//   category TEXT
// )

export function getWeeklyHistory() {
  
  const result = db.prepare(`
    SELECT
      DATE(start_time) AS date,
      SUM(CASE WHEN category = 'neutral' THEN duration_sec ELSE 0 END) / 3600.0 AS neutral,
      SUM(CASE WHEN category = 'work' THEN duration_sec ELSE 0 END) / 3600.0 AS work,
      SUM(CASE WHEN category = 'distraction' THEN duration_sec ELSE 0 END) / 3600.0 AS distraction
    FROM activity_log
    WHERE DATE(start_time) >= DATE('now','-6 days')
    GROUP BY DATE(start_time)
    ORDER BY DATE(start_time)
  `).all()
  console.log("Weekly History Result:", result);
  return result.map((r: any) => ({
    day: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date(r.date).getDay()],
    work: +(r.work || 0).toFixed(1),
    distraction: +(r.distraction || 0).toFixed(1),
    neutral: +(r.neutral || 0).toFixed(1),
    date: r.date,
  }));

}

export function getWeeklyStats() {
  const avgDailyTotal = db.prepare(`
    SELECT AVG(day_total) AS avg
    FROM (
      SELECT SUM(duration_sec) / 3600.0 AS day_total
      FROM activity_log
      WHERE DATE(start_time) >= DATE('now','-6 days')
      GROUP BY DATE(start_time)
    )
  `).get()?.avg ?? 0;

  const peak = db.prepare(`
    SELECT
      app_name,
      SUM(duration_sec) / 3600.0 AS hrs
    FROM activity_log
    WHERE
      category = 'distraction'
      AND DATE(start_time) >= DATE('now','-6 days')
    GROUP BY app_name
    ORDER BY hrs DESC
    LIMIT 1
  `).get();

  return {
    avgDailyHours: +avgDailyTotal.toFixed(1),
    peakApp: peak?.app_name ?? "None",
    peakHours: peak ? +peak.hrs.toFixed(1) : 0,
  };
}



export function getDailyGroupedUsage(date: string) {
  console.log("Fetching daily grouped usage for date:", date);
  const stmt = db.prepare(`
    SELECT
      app_name,
      window_title,
      SUM(duration_sec) AS total_seconds
    FROM activity_log
    WHERE date(start_time) = ?
    GROUP BY app_name, window_title
    ORDER BY total_seconds DESC
  `);

  return stmt.all(date);
}

/**
 * Run a SAFE SELECT-only SQL query generated by the AI.
 * - Only allows single SELECT statements
 * - Must reference at least one allowed table
 */
export function runSafeSQL(sql: string) {
  console.log("Running safe SQL query:");
  
  const cleaned = (sql || "").trim();
  const lowered = cleaned.toLowerCase();

  if (!lowered.startsWith("select")) {
    throw new Error("Only SELECT queries are allowed for safety reasons.");
  }

  if (lowered.includes(";")) {
    throw new Error("Multiple statements are not allowed.");
  }

  // ensure it references an allowed table
  const allowedTables = ["activity_log", "user_profile"];
  const referencesTable = allowedTables.some((t) => lowered.includes(t));
  if (!referencesTable) {
    throw new Error(
      `Query must reference one of the allowed tables: ${allowedTables.join(", ")}`
    );
  }

  return db.prepare(cleaned).all();
}

export function getuserGoal(){
  ensureUserProfileTable();
  const row = db.prepare(
    "SELECT final_goal , api_key FROM user_profile WHERE id = 1"
  ).get();
  return { finalGoal: row.final_goal, apiKey: row.api_key };
}