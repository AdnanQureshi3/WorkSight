import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database", "worksight.db");
export const db = new Database(dbPath);

/* ---------- USER PROFILE ---------- */

function ensureUserProfileTable() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY,
      username TEXT,
      agent_nickname TEXT,
      email TEXT,
      system_prompt TEXT,
      final_goal TEXT,
      productive_apps TEXT DEFAULT '[]',
      distraction_apps TEXT DEFAULT '[]',
      neutral_apps TEXT DEFAULT '[]'
    )
  `).run();

  db.prepare(`INSERT OR IGNORE INTO user_profile (id) VALUES (1)`).run();
}

export function updateUserProfile(profileData: any) {
  ensureUserProfileTable();
  return db.prepare(`
    UPDATE user_profile
    SET username = ?, agent_nickname = ?, email = ?, system_prompt = ?, 
        final_goal = ?, productive_apps = ?, distraction_apps = ?, neutral_apps = ?
    WHERE id = 1
  `).run(
    profileData.username,
    profileData.agent_nickname,
    profileData.email,
    profileData.system_prompt,
    profileData.final_goal,
    JSON.stringify(profileData.productive_apps || []),
    JSON.stringify(profileData.distraction_apps || []),
    JSON.stringify(profileData.neutral_apps || [])
  );
}

export function getUserProfile() {
  ensureUserProfileTable();
  const row = db.prepare("SELECT * FROM user_profile WHERE id = 1").get();
  return {
    ...row,
    productive_apps: JSON.parse(row.productive_apps || "[]"),
    distraction_apps: JSON.parse(row.distraction_apps || "[]"),
    neutral_apps: JSON.parse(row.neutral_apps || "[]"),
  };
}

/* ---------- ANALYTICS ---------- */

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
  `).all();

  return result.map((r: any) => ({
    day: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date(r.date).getDay()],
    work: +(r.work || 0).toFixed(1),
    distraction: +(r.distraction || 0).toFixed(1),
    neutral: +(r.neutral || 0).toFixed(1),
    date: r.date,
  }));
}

export function getAppUsage(date: string) {
  const events = db.prepare(`
    SELECT app_name, window_title, SUM(duration_sec) AS total_sec
    FROM activity_log
    WHERE date(start_time) = ?
    GROUP BY app_name, window_title
  `).all(date);

  const result: any = {};
  for (const { app_name, window_title, total_sec } of events) {
    if (!result[app_name]) {
      result[app_name] = { total_time: 0, window: [] };
    }
    result[app_name].window.push({ window_title, time: total_sec });
    result[app_name].total_time += total_sec;
  }
  return result;
}

/* ---------- GOALS ---------- */

export function ensureGoalsTable() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      target_minutes INTEGER NOT NULL,
      threshold_percent INTEGER NOT NULL,
      current_minutes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
}

export function getGoals() {
  ensureGoalsTable();
  return db.prepare(`SELECT * FROM goals ORDER BY created_at DESC`).all();
}

export function addGoal(goal: { name: string; target_minutes: number; threshold_percent: number }) {
  ensureGoalsTable();
  return db.prepare(`
    INSERT INTO goals (name, target_minutes, threshold_percent)
    VALUES (?, ?, ?)
  `).run(goal.name, goal.target_minutes, goal.threshold_percent);
}

export function deleteGoal(id: number) {
  return db.prepare(`DELETE FROM goals WHERE id = ?`).run(id);
}