import { getApiKeyForModel, getUserProfile, runSafeSQL } from "./db";
import { runPythonAI } from "./pythonRunner";

 export function classifyApiError(err: any): string {
  const msg = String(err).toLowerCase();

  if (msg.includes("invalid api key") || msg.includes("api key not valid"))
    return "Your API key is invalid. Please check and update it.";

  if (msg.includes("quota") || msg.includes("rate limit") || msg.includes("resource_exhausted"))
    return "Your API usage limit has been reached. Please try again later or upgrade your plan.";

  if (msg.includes("not_found") || msg.includes("model"))
    return "This model is not available for your API key.";

  return "Something went wrong while contacting the AI service.";
}
function getHardCoreSQLQuery(user_query: string) {
  const query = user_query.toLowerCase();

  const map = {
    today: `
SELECT 
  window_title,
  app_name,
  SUM(duration_sec) AS total_duration
FROM activity_log
WHERE date(start_time) = date('now')
GROUP BY window_title, app_name
ORDER BY total_duration DESC
`,

    yesterday: `
SELECT 
  window_title,
  app_name,
  SUM(duration_sec) AS total_duration
FROM activity_log
WHERE date(start_time) = date('now', '-1 day')
GROUP BY window_title, app_name
ORDER BY total_duration DESC
`,

    week: `
SELECT 
  window_title,
  app_name,
  SUM(duration_sec) AS total_duration
FROM activity_log
WHERE start_time BETWEEN datetime('now', '-7 days') AND datetime('now')
GROUP BY window_title, app_name
ORDER BY total_duration DESC
`,

    "last week": `
SELECT 
  window_title,
  app_name,
  SUM(duration_sec) AS total_duration
FROM activity_log
WHERE start_time BETWEEN datetime('now', '-14 days') 
AND datetime('now', '-7 days')
GROUP BY window_title, app_name
ORDER BY total_duration DESC
`,

    month: `
SELECT 
  window_title,
  app_name,
  SUM(duration_sec) AS total_duration
FROM activity_log
WHERE strftime('%Y-%m', start_time) = strftime('%Y-%m', 'now')
GROUP BY window_title, app_name
ORDER BY total_duration DESC
`,

    "last month": `
SELECT 
  window_title,
  app_name,
  SUM(duration_sec) AS total_duration
FROM activity_log
WHERE strftime('%Y-%m', start_time) = strftime('%Y-%m', 'now', '-1 month')
GROUP BY window_title, app_name
ORDER BY total_duration DESC
`
  };

  if (query.includes("last week")) return map["last week"];
  if (query.includes("last month")) return map["last month"];

  if (
    query.includes("today") ||
    query.includes("day")
  ) {
    return map.today;
  }

  if (query.includes("yesterday")) {
    return map.yesterday;
  }

  if (query.includes("week")) {
    return map.week;
  }

  if (query.includes("month")) {
    return map.month;
  }
  
  return "NOT_FOUND";
}
export async function AiQueryHandler( messages: any[], model: string, provider: string) {
    const user = getUserProfile();
    const user_query = messages[messages.length - 1]?.content ?? "";

   
    

    const api_key = getApiKeyForModel(provider);

    if (!api_key)
      return {
        status: "ok",
        sql: "",
        analysis: {
          analysis: `No API key found for ${provider}. Please add it in Profile → LLM Settings.`
        }
      };
      



    // ---- SQL generation

    let gen, sql = "", analysis = { analysis: "" };
     const hardCodedSQL = getHardCoreSQLQuery(user_query);
    console.log("Hardcoded SQL check:", { hardCodedSQL });

    if (hardCodedSQL !== "NOT_FOUND") { 
       gen = {
    status: "ok",
    sql_generated: "yes",
    sql: hardCodedSQL
  };

  sql = hardCodedSQL;

  console.log("Using hardcoded SQL: and NO AI", sql);

      

    }
    else {
      try {
        console.log("Running AI SQL generation with model:", model, "and provider:", provider);
      gen = await runPythonAI({
        type: "generate_sql",
        messages, user_query, user,
        model, provider, api_key
      });
    } catch (err) {
      console.error("SQL generation error:", err);
      return {
        status: "ok",
        sql: "",
        analysis: {
          analysis: classifyApiError(err)
        }
      };
    }

    }
    

    if (!gen || gen.status !== "ok")
      return {
        status: "ok",
        sql: "",
        analysis: {
          analysis: "I couldn’t figure out what data you’re looking for."
        }
      };

    if (gen.sql_generated === "no")
      return {
        status: "ok",
        sql: "",
        analysis: { analysis: gen.reply || "" }
      };

    // ---- SQL execution + analysis
    try {
      sql = gen.sql;
      console.log("Generated SQL:", sql);
      const rows = runSafeSQL(sql);

      try {
        analysis = await runPythonAI({
          type: "analyze",
          messages, rows, user, user_query,
          model, provider, api_key
        });
      } catch (err) {
        console.error("Analysis error:", err);
        analysis = {
          analysis: classifyApiError(err)
        };
      }
    } catch (err) {
      console.error("Database error:", err);
      return {
        status: "ok",
        sql,
        analysis: {
          analysis: classifyApiError(err)
        }
      };
    }
    return { status: "ok", sql, analysis };
}