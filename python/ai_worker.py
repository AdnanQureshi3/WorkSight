import sys, json, re
from openai import OpenAI
# from dotenv import load_dotenv
# load_dotenv()
from datetime import datetime
import os
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

from datetime import datetime
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage


def get_llm(provider, model, api_key):
    if provider == "openai":
        return ChatOpenAI(
            model=model,
            api_key=api_key,
            temperature=0
        )

    if provider == "gemini":
        return ChatGoogleGenerativeAI(
            model=model,
            google_api_key=api_key,
            temperature=0
        )

    raise ValueError("Unsupported provider")

def make_sql(**kwargs):
    user_query = (kwargs.get("user_query") or "").strip()
    user = kwargs.get("user", {})
    messages = kwargs.get("messages", [])
    agent_name = user.get("agent_nickname", "WorkSight Assistant")
    username = user.get("username", "User")

    provider = kwargs.get("provider")
    model = kwargs.get("model")
    api_key = kwargs.get("api_key")
    if not api_key:
        raise RuntimeError("Missing api_key")


    llm = get_llm(provider, model, api_key)

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
        """

    # 🔴 YOUR SQL RULES — UNCHANGED
    system_prompt = f"""

You are an AI decision  engine for an activity-tracking assistant.
your name is {agent_name}. username is : {username}.


You MUST return ONLY valid JSON in this exact format:


  "status": "ok",
  "sql_generated": "yes" | "no",
  "sql": "",
  "reply": ""


  in json format only. no markdown, no explanations, no comments.


Hard rules:
- Output ONLY JSON. No markdown. No explanations.
- status MUST always be "ok".
- Never fill both sql and reply.

Decision rules:
- Generate SQL ONLY when the user asks about activity, apps, time spent, productivity, focus, stats, summaries, or timelines.
- DO NOT generate SQL for greetings, acknowledgements, confirmations, or small talk.

SQL rules (STRICT — DO NOT CHANGE):
- Output ONLY raw SQL.
- No markdown, no backticks, no comments.
- One executable SQLite SELECT query only.
- Always:
  GROUP BY window_title, app_name
  Use SUM(duration_sec) AS total_duration

Data model rules (CRITICAL):
- app_name = application or browser (Chrome, Brave, Edge, VS Code).
- Social platforms NEVER appear in app_name.
- Social platforms appear in window_title (primary) or domain (secondary).
- NEVER search social names in app_name.
- app_name MUST still be selected and grouped.

Semantic intent rules:
- “coding / development / programming” (any language) = CATEGORY-BASED intent.
- Coding includes:
  category = 'Coding',
  OR editors (VS Code, IntelliJ, PyCharm, etc.) in app_name,
  OR GitHub / GitLab / LeetCode / HackerRank, ETC in window_title.

  dont use .com, use only names like github, gitlab, leetcode, hackerrank

Time rules:
- If no date mentioned → last 7 days.
- If a specific day is mentioned (today, yesterday, kal, parso, etc.) → only that date.

Analysis intent:
- Words like “kaisa”, “progress”, “summary”, “analysis” mean:
  analyze the FULL grouped result ordered by total_duration DESC.

  Example user queries for analysis:
  SQL EXAMPLES (REFERENCE ONLY — FOLLOW THIS STYLE):

Example 1: Social media time waste (last 7 days)
User intent:
"Social media par time waste toh nahi kar raha?"

SQL example:
SELECT window_title, app_name, SUM(duration_sec) AS total_duration
FROM activity_log
WHERE start_time BETWEEN 'YYYY-MM-DD 00:00:00' AND 'YYYY-MM-DD 23:59:59'
  AND (
    window_title LIKE '%facebook%'
    OR window_title LIKE '%instagram%'
    OR window_title LIKE '%x.com%'
    OR window_title LIKE '%twitter%'
    OR window_title LIKE '%linkedin%'
    OR window_title LIKE '%reddit%'
    OR window_title LIKE '%youtube%'
    OR window_title LIKE '%tiktok%'
    OR window_title LIKE '%pinterest%'
    OR window_title LIKE '%snapchat%'
    OR window_title LIKE '%whatsapp%'
  )
GROUP BY window_title, app_name
ORDER BY total_duration DESC


Example 2: Coding analysis (last 7 days, category based)
User intent:
"coding kesi chal rahi hai?"

SQL example:
SELECT window_title, app_name, SUM(duration_sec) AS total_duration
FROM activity_log
WHERE start_time BETWEEN 'YYYY-MM-DD 00:00:00' AND 'YYYY-MM-DD 23:59:59'
  AND (
    category = 'Coding'
    OR window_title LIKE '%github%'
    OR window_title LIKE '%gitlab%'
    OR window_title LIKE '%leetcode%'
    OR window_title LIKE '%hackerrank%'
  )
GROUP BY window_title, app_name
ORDER BY total_duration DESC


Example 3: Yesterday’s activity
User intent:
"kal kya kiya maine?"

SQL example:
SELECT window_title, app_name, SUM(duration_sec) AS total_duration
FROM activity_log
WHERE date(start_time) = date('now','-1 day')
GROUP BY window_title, app_name
ORDER BY total_duration DESC


Example 4: Today’s full activity
User intent:
"aaj kya kya kiya?"

SQL example:
SELECT window_title, app_name, SUM(duration_sec) AS total_duration
FROM activity_log
WHERE date(start_time) = date('now')
GROUP BY window_title, app_name
ORDER BY total_duration DESC


"""

    user_prompt = f"""
Schema:
Table: activity_log
Columns:
id, app_name, window_title, start_time, end_time, duration_sec, category

Current datetime:
{date}

User request:
{user_query}


"""


    response = llm.invoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_prompt)
    ])

    text = response.content.strip()

    try:
        result = json.loads(text)
    except:
        raise RuntimeError("AI did not return valid JSON")

    # Enforce contract
    if result.get("sql_generated") == "yes":
        result["reply"] = ""
        result["sql"] = result.get("sql", "").rstrip(";").strip()
    else:
        result["sql"] = ""

    return result



def analyze(**kwargs):
    rows = kwargs.get("rows", [])
    user = kwargs.get("user", {})
    user_query = kwargs.get("user_query", "")
   
    final_goal = user.get("final_goal", "")
    user_system_prompt = user.get("system_prompt", "")
    messages = kwargs.get("messages", [])

    provider = kwargs.get("provider")
    model = kwargs.get("model")
    api_key = kwargs.get("api_key")
    if not api_key:
        raise RuntimeError("Missing api_key")


    llm = get_llm(provider, model, api_key)

    system_prompt = """
    You are an expert data analyst. Given tabular data, provide insights, trends, and summaries in natural language.
    Always relate insights to the user's goal if provided.
    Be concise and clear.
    """

    user_prompt = f"""
Given the following data rows:
{json.dumps(rows)}
User's goal: {final_goal}
User's Prompt:{user_query}
Provide a natural language analysis of the data.
Provide a suggestions how can user improve based on his goal.
Tell where is waste of time and how to reduce it.
Please give response in English or Hinglish.(based on users prompt)

unit of time is seconds.
but output like 1 hr 30 min 


Imp: output as a simple text, dont use * , ' or ", or underline
example- ChatGPT for SQL Generation Tips,
not like this: **`ChatGPT` for 'SQL Generation Tips'**,

    """

    
    response = llm.invoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_prompt)
    ])

    analysis = response.content.strip()
   
    return analysis


if payload["type"] == "generate_sql":
    result = make_sql(**payload)

    print(json.dumps({
        "status": "ok",
        "sql": result.get("sql", ""),
        "sql_generated": result.get("sql_generated", "no"),
        "reply": result.get("reply", "")
    }))

elif payload["type"] == "analyze":
    analysis_text = analyze(**payload)
    print(json.dumps({
        "status": "ok",
        "analysis": analysis_text
    }))

