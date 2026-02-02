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
DB_PATH = os.path.join(BASE_DIR, "worksight.db")
os.makedirs(BASE_DIR, exist_ok=True)

LOCK = os.path.join(BASE_DIR, "tracker.lock")

def is_tracker_process(pid: int) -> bool:
    try:
        p = psutil.Process(pid)
        return "worksight-tracker" in p.name().lower()
    except:
        return False

# check existing lock
if os.path.exists(LOCK):
    try:
        with open(LOCK, "r") as f:
            old_pid = int(f.read().strip())
        if is_tracker_process(old_pid):
            sys.exit(0)  # real tracker already running
    except:
        pass
    # stale lock → remove
    try:
        os.remove(LOCK)
    except:
        pass

# create new lock
with open(LOCK, "w") as f:
    f.write(str(os.getpid()))

def cleanup():
    try:
        os.remove(LOCK)
    except:
        pass

atexit.register(cleanup)





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
                print(f"Switched from {last_app} - {last_title} to {app} - {title}")
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
