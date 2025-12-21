import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database", "worksight.db");
export const db = new Database(dbPath);

export function getDailyCategorySummary(date: string) {
  console.log("Fetching daily category summary for date:", date);
  return db.prepare(`
    SELECT category, SUM(duration_sec) as total_sec
    FROM activity_log
    WHERE DATE(start_time) = ?
    GROUP BY category
  `).all(date);
}

export function getAppUsage(date: string) {
  return db.prepare(`
    SELECT app_name, SUM(duration_sec) as total_sec
    FROM activity_log
    WHERE DATE(start_time) = ?
    GROUP BY app_name
    ORDER BY total_sec DESC
  `).all(date);
}

export function getYouTubeBreakdown(date: string) {
  return db.prepare(`
    SELECT category, SUM(duration_sec) as total_sec
    FROM activity_log
    WHERE domain = 'youtube.com'
      AND DATE(start_time) = ?
    GROUP BY category
  `).all(date);
}

export function updateUserProfile(profileData: any) {   
  if (!isTableExists("user_profile")) {
  createUserProfileTable();
}
console.log("db:", profileData);
  return db.prepare(`
    UPDATE user_profile
    SET username = ?,
        agent_nickname = ?,
        email = ?,
        system_prompt = ?,
        final_goal = ?
    WHERE id = 1
  `).run(profileData.username, profileData.agent_nickname, profileData.email, profileData.system_prompt, profileData.final_goal);
}


function isTableExists(tableName: string): boolean {
  const row = db.prepare(`
    SELECT 1 FROM sqlite_master
    WHERE type='table' AND name = ?
  `).get(tableName);

  return !!row;
}
function createUserProfileTable() {
  db.prepare(`
    CREATE TABLE user_profile (
      id INTEGER PRIMARY KEY,
      username TEXT,
      agent_nickname TEXT,
      email TEXT,
      system_prompt TEXT,
      final_goal TEXT
    )
  `).run();

  db.prepare(`INSERT INTO user_profile (id) VALUES (1)`).run();
}


export function getUserProfile() {
  if (!isTableExists("user_profile")) {
    createUserProfileTable();
    updateUserProfile({
      username: "User",
      agent_nickname: "AI Assistant",
      email: "",
      system_prompt: "Help me stay focused, disciplined, and productive.",
      final_goal: "",
    });
  }

  return db.prepare("SELECT * FROM user_profile WHERE id = 1").get();
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



//Goal and habit functions can be added here in the future
export function ensureGoalsTable() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      current REAL DEFAULT 0,
      target REAL NOT NULL,
      unit TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
}
export function getGoals() {
  ensureGoalsTable();
  return db.prepare(`SELECT * FROM goals ORDER BY created_at DESC`).all();
}

export function addGoal(goal: {
  name: string;
  target: number;
  unit: string;
}) {
  ensureGoalsTable();
  return db.prepare(`
    INSERT INTO goals (name, target, unit)
    VALUES (?, ?, ?)
  `).run(goal.name, goal.target, goal.unit);
}
export function updateGoalProgress(id: number, current: number) {
  return db.prepare(`
    UPDATE goals
    SET current = ?
    WHERE id = ?
  `).run(current, id);
}

export function deleteGoal(id: number) {
  return db.prepare(`DELETE FROM goals WHERE id = ?`).run(id);
}
