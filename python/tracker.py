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
                    

                    cur.execute("""
                        INSERT INTO activity_log
                        (app_name, window_title,  start_time, end_time, duration_sec)
                        VALUES (?, ?, ?, ?, ?)
                    """, (
                        last_app,
                        last_title,
                        start_time.isoformat(),
                        end_time.isoformat(),
                        duration,
                    
                    ))
                    conn.commit()

                last_app = app
                last_title = title
                start_time = end_time

    except KeyboardInterrupt:
        end_time = datetime.datetime.now()
        duration = int((end_time - start_time).total_seconds())

        if duration >= 5:
            
            cur.execute("""
                INSERT INTO activity_log
                (app_name, window_title,  start_time, end_time, duration_sec)
                VALUES (?, ?, ?, ?, ?)
            """, (
                last_app,
                last_title,
                start_time.isoformat(),
                end_time.isoformat(),
                duration,
            
            ))
            conn.commit()

        conn.close()

if __name__ == "__main__":
    main()
