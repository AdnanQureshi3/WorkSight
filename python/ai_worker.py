import sys, json, re
from openai import OpenAI
# from dotenv import load_dotenv
# load_dotenv()
from datetime import datetime
import os
# Read input
data = sys.stdin.read()

client = OpenAI(
    api_key = "api_key",
    base_url="https://generativelanguage.googleapis.com/v1beta/"
)
try:
    payload = json.loads(data)
except:
    print(json.dumps({"status": "error", "msg": "Invalid JSON"}))
    sys.exit(1)

# If input is a list, treat it as analyze
if isinstance(payload, list):
    payload = {"type": "analyze", "rows": payload}

from datetime import datetime

def make_sql(prompt):

    date = datetime.now().strftime("%Y-%m-%d %H:%M:%S %A")

    schema = """
        Table: activity_log
        Columns:
        - id (INTEGER)
        - app_name (TEXT)
        - window_title (TEXT)
        - domain (TEXT)
        - start_time (TEXT)
        - end_time (TEXT)
        - duration_sec (INTEGER)
        - category (TEXT)
        """

    system_prompt = """
       You are an expert SQL generator for SQLite.

STRICT RULES:
- Output ONLY raw SQL text.
- Do NOT use markdown.
- Do NOT use triple backticks.
- Do NOT write ```sql or ```sqlite.
- Do NOT add explanations, comments, or extra text.
- Return a single executable SQL query only.

Always:
GROUP BY window_title, app_name
Use SUM(duration_sec) AS total_duration
        """

    user_prompt = f"""
Using the table schema below:

{schema}

Today's datetime: {date}

Generate an SQL query for this request:
{prompt}
"""

    response = client.chat.completions.create(
        model="gemini-2.5-flash",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
    )
    sql = response.choices[0].message.content.strip()
    sql = sql.rstrip(";")

    return sql
   

    


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

