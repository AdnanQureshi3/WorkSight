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

    let gen, sql = "", analysis = { analysis: "" };

    // ---- SQL generation
    try {
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