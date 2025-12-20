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
