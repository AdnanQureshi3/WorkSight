import sys, json, re

# Read input
data = sys.stdin.read()

try:
    payload = json.loads(data)
except:
    print(json.dumps({"status": "error", "msg": "Invalid JSON"}))
    sys.exit(1)

# If input is a list, treat it as analyze
if isinstance(payload, list):
    payload = {"type": "analyze", "rows": payload}


def make_sql(prompt):
    p = prompt.lower()

    date = ""
    if "last month" in p:
        date = " WHERE DATE(start_time) >= DATE('now','-1 month')"
    elif "last week" in p:
        date = " WHERE DATE(start_time) >= DATE('now','-7 days')"
    elif "today" in p:
        date = " WHERE DATE(start_time) = DATE('now')"

    if "app" in p:
        return f"""
        SELECT app_name, SUM(duration_sec) total_sec
        FROM activity_log{date}
        GROUP BY app_name
        ORDER BY total_sec DESC
        LIMIT 10
        """

    if "category" in p:
        return f"""
        SELECT category, SUM(duration_sec) total_sec
        FROM activity_log{date}
        GROUP BY category
        ORDER BY total_sec DESC
        """

    if "youtube" in p:
        return f"""
        SELECT window_title, SUM(duration_sec) total_sec
        FROM activity_log
        WHERE domain='youtube.com'
        GROUP BY window_title
        ORDER BY total_sec DESC
        """

    return "SELECT * FROM activity_log ORDER BY start_time DESC LIMIT 50"


def analyze(rows):
    if not rows:
        return {"summary": "No data"}

    cols = rows[0].keys()
    sec_col = next((c for c in cols if "sec" in c), None)

    total = sum(r.get(sec_col, 0) for r in rows) if sec_col else None

    return {
        "rows": len(rows),
        "total_seconds": total,
        "top_5": rows[:5]
    }


if payload["type"] == "generate_sql":
    sql = make_sql(payload.get("prompt", ""))
    print(json.dumps({"status": "ok", "sql": sql.strip()}))

elif payload["type"] == "analyze":
    print(json.dumps({"status": "ok", "analysis": analyze(payload.get("rows", []))}))

else:
    print(json.dumps({"status": "error", "msg": "Unknown type"}))
