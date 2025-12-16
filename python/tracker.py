import time
import sqlite3
import datetime
import psutil as ps
import win32gui
import win32process
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "../database/worksight.db")
def get_active_app(): 
    try: 
        hwnd = win32gui.GetForegroundWindow() 
        pid = win32process.GetWindowThreadProcessId(hwnd)[1] 
        process = ps.Process(pid) 
        # print(f"{hwnd} and process is {process}") 
        return process.name(), win32gui.GetWindowText(hwnd) 
    except: return "Unknown", "Unknown"

    
def main():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS activity (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        window_title TEXT,
        timestamp TEXT
    )
    """)
    conn.commit()

    print("TRACKING_STARTED")

    try:
        while True:
            app_name, window_title = get_active_app()
            print(f"Active application: {app_name}, Window title: {window_title}")
            title = f"{app_name} - {window_title}"
            

            cur.execute(
                "INSERT INTO activity (window_title, timestamp) VALUES (?, ?)",
                (window_title, datetime.datetime.now().isoformat())
            )
            conn.commit()

            time.sleep(5)
    except KeyboardInterrupt:
        print("TRACKING_STOPPED")
        conn.close()

if __name__ == "__main__":
    main()
