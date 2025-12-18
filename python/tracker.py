import time
import sqlite3
import datetime
import psutil as ps
import win32gui
import win32process
import os
import re

DB_PATH = os.path.join(os.path.dirname(__file__), "../database/worksight.db")


def get_active_app():
    try:
        hwnd = win32gui.GetForegroundWindow()
        _, pid = win32process.GetWindowThreadProcessId(hwnd)
        process = ps.Process(pid)
        return process.name(), win32gui.GetWindowText(hwnd)
    except:
        return "Unknown", "Unknown"


def extract_domain(title: str | None):
    if not title:
        return None
    match = re.search(r"(youtube\.com|leetcode\.com|instagram\.com)", title.lower())
    return match.group(1) if match else None


def classify(app_name, domain, title):
    title = title.lower() if title else ""

    if domain == "instagram.com":
        return "distraction"

    if domain == "leetcode.com":
        return "work"

    if "code" in app_name.lower():
        return "work"

    if domain == "youtube.com" or "youtube" in title:
        if any(k in title for k in ["tutorial", "course", "lecture", "react", "python"]):
            return "work"
        elif any(k in title for k in ["music", "podcast"]):
            return "neutral"
        else:
            return "distraction"

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

    print("TRACKING_STARTED")

    last_app, last_title = get_active_app()
    last_domain = extract_domain(last_title)
    start_time = datetime.datetime.now()

    try:
        while True:
            time.sleep(2)
            app, title = get_active_app()

            if app != last_app or title != last_title:
                print(f"SWITCHED_From: {last_app} - {last_domain} - {last_title} To: {app} - {extract_domain(title)} - {title} ")
                end_time = datetime.datetime.now()##ending the session
                duration = int((end_time - start_time).total_seconds())

                if duration >= 5:
                    category = classify(last_app, last_domain, last_title)

                    cur.execute("""
                        INSERT INTO activity_log
                        (app_name, window_title, domain, start_time, end_time, duration_sec, category)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (
                        last_app,
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
            category = classify(last_app, last_domain, last_title)
            cur.execute("""
                INSERT INTO activity_log
                (app_name, window_title, domain, start_time, end_time, duration_sec, category)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                last_app,
                last_title,
                last_domain,
                start_time.isoformat(),
                end_time.isoformat(),
                duration,
                category
            ))
            conn.commit()

        conn.close()
        print("TRACKING_STOPPED")


if __name__ == "__main__":
    main()
