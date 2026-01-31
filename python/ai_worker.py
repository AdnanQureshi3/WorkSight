import sys, json, re
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()
from datetime import datetime
import os
# Read input
data = sys.stdin.read()

client = OpenAI(
    api_key = os.getenv("gemini_api_key"),
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
   

    


def analyze(rows, goal, prompt):
    system_prompt = """
    You are an expert data analyst. Given tabular data, provide insights, trends, and summaries in natural language.
    Always relate insights to the user's goal if provided.
    Be concise and clear.
    """

    user_prompt = f"""
Given the following data rows:
{json.dumps(rows)}
User's goal: {goal}
User's Prompt:{prompt}
Provide a natural language analysis of the data.
Provide a suggestions how can user improve based on his goal.
Tell where is waste of time and how to reduce it.
Please give response in English or Hinglish.(based on users prompt)


Imp: output as a simple text
example- ChatGPT for SQL Generation Tips,
not like this: **`ChatGPT` for 'SQL Generation Tips'**,

    """

    response = client.chat.completions.create(
        model="gemini-2.5-flash",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
    )
    analysis = response.choices[0].message.content.strip()
    return analysis


if payload["type"] == "generate_sql":
    sql = make_sql(payload.get("prompt", ""))
    print(json.dumps({"status": "ok", "sql": sql.strip()}))

elif payload["type"] == "analyze":
    print(json.dumps({"status": "thik hia", "analysis": analyze(payload.get("rows", []), payload.get("goal", ""), payload.get("prompt", ""))}))

else:
    print(json.dumps({"status": "error", "msg": "Unknown type"}))

