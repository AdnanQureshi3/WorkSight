import time
import sqlite3
import datetime
import pygetwindow as gw
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "../database/worksight.db")

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
            win = gw.getActiveWindow()
            title = win.title if win else "Unknown"

            cur.execute(
                "INSERT INTO activity (window_title, timestamp) VALUES (?, ?)",
                (title, datetime.datetime.now().isoformat())
            )
            conn.commit()

            time.sleep(5)
    except KeyboardInterrupt:
        print("TRACKING_STOPPED")
        conn.close()

if __name__ == "__main__":
    main()
