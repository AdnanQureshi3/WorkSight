import time
import sqlite3
import datetime
import psutil as ps
import win32gui
import win32process
import os
import json

DB_PATH = os.path.join(os.path.dirname(__file__), "../database/worksight.db")

def get_active_app():
    try:
        hwnd = win32gui.GetForegroundWindow()
        _, pid = win32process.GetWindowThreadProcessId(hwnd)
        process = ps.Process(pid)
        return process.name(), win32gui.GetWindowText(hwnd)
    except:
        return "Unknown", "Unknown"

def extract_domain(title):
    if not title:
        return None
    title = title.lower()
    if "youtube" in title:
        return "youtube.com"
    if "instagram" in title:
        return "instagram.com"
    if "leetcode" in title:
        return "leetcode.com"
    return None

def extract_app_name_from_title(title, app_name):
    if not title:
        return app_name

    t = title.lower()
    if "youtube" in t:
        return "YouTube"
    if "instagram" in t:
        return "Instagram"
    if "leetcode" in t:
        return "LeetCode"

    return app_name  # fallback (Chrome, VSCode, etc.)

def load_user_rules(conn):
    cur = conn.cursor()
    row = cur.execute(
        "SELECT productive_apps, distraction_apps, neutral_apps FROM user_profile WHERE id = 1"
    ).fetchone()

    if not row:
        return [], [], []

    return (
        json.loads(row[0] or "[]"),
        json.loads(row[1] or "[]"),
        json.loads(row[2] or "[]"),
    )

def classify(app_name, domain, title, rules):
    productive, distraction, neutral = rules
    app = app_name.lower()
    title = title.lower() if title else ""

    def matches(rule_list):
        return any(k.lower() in app or k.lower() in title for k in rule_list)

    if matches(productive):
        return "work"
    if matches(distraction):
        return "distraction"
    if matches(neutral):
        return "neutral"

    if domain == "instagram.com":
        return "distraction"
    if domain == "leetcode.com":
        return "work"

    if domain == "youtube.com":
        if any(k in title for k in ["tutorial", "course", "lecture", "python", "react"]):
            return "work"
        if any(k in title for k in ["music", "song", "podcast"]):
            return "distraction"
        return "neutral"

    return "neutral"

def main():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        app_name TEXT,
        window_title TEXT,
        domain TEXT,
        start_time TEXT,
        end_time TEXT,
        duration_sec INTEGER,
        category TEXT
    )
    """)
    conn.commit()

    rules = load_user_rules(conn)
    print("Loaded user rules:", rules)

    last_app, last_title = get_active_app()
    last_domain = extract_domain(last_title)
    start_time = datetime.datetime.now()

    try:
        while True:
            time.sleep(2)
            app, title = get_active_app()

            if app != last_app or title != last_title:
                print(f"Switched from {last_app} - {last_title} to {app} - {title}")
                end_time = datetime.datetime.now()
                duration = int((end_time - start_time).total_seconds())

                if duration >= 5:
                    logical_app = extract_app_name_from_title(last_title, last_app)
                    category = classify(logical_app, last_domain, last_title, rules)

                    cur.execute("""
                        INSERT INTO activity_log
                        (app_name, window_title, domain, start_time, end_time, duration_sec, category)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (
                        logical_app,
                        last_title,
                        last_domain,
                        start_time.isoformat(),
                        end_time.isoformat(),
                        duration,
                        category
                    ))
                    conn.commit()

                last_app = app
                last_title = title
                last_domain = extract_domain(title)
                start_time = end_time

    except KeyboardInterrupt:
        end_time = datetime.datetime.now()
        duration = int((end_time - start_time).total_seconds())

        if duration >= 5:
            logical_app = extract_app_name_from_title(last_title, last_app)
            category = classify(logical_app, last_domain, last_title, rules)

            cur.execute("""
                INSERT INTO activity_log
                (app_name, window_title, domain, start_time, end_time, duration_sec, category)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                logical_app,
                last_title,
                last_domain,
                start_time.isoformat(),
                end_time.isoformat(),
                duration,
                category
            ))
            conn.commit()

        conn.close()

if __name__ == "__main__":
    main()
