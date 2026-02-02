import sys
import win32event
import win32api
import winerror

mutex = win32event.CreateMutex(
    None,
    False,
    "Global\\WorkSightTrackerMutex"
)

if win32api.GetLastError() == winerror.ERROR_ALREADY_EXISTS:
    sys.exit(0)


import time
import sqlite3
import datetime
import psutil as ps
import win32gui
import win32process
import os
import json
import os, sys, atexit

BASE_DIR = os.path.join(os.environ["APPDATA"], "WorkSight")
os.makedirs(BASE_DIR, exist_ok=True)
DB_PATH = os.path.join(BASE_DIR, "worksight.db")



def get_active_app():
    try:
        hwnd = win32gui.GetForegroundWindow()
        _, pid = win32process.GetWindowThreadProcessId(hwnd)
        process = ps.Process(pid)
        return process.name(), win32gui.GetWindowText(hwnd)
    except:
        return "Unknown", "Unknown"



def main():
    conn = sqlite3.connect(DB_PATH, timeout=30)

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


    last_app, last_title = get_active_app()
    start_time = datetime.datetime.now()

    try:
        while True:
            time.sleep(2)
            app, title = get_active_app()

            if app != last_app or title != last_title:
                # print(f"Switched from {last_app} - {last_title} to {app} - {title}")
                end_time = datetime.datetime.now()
                duration = int((end_time - start_time).total_seconds())

                if duration >= 5 and last_app != "Unknown" and last_app != "" and last_app != "LockApp.exe":
                    

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
