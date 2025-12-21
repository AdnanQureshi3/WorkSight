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