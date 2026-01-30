"use client";

import React, { useState } from "react";

export default function AIQuery() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // @ts-ignore - injected by preload
      if (!window.electronAPI || typeof window.electronAPI.aiQuery !== "function") {
        throw new Error(
          "api_missing: 'aiQuery' not exposed by preload. Try restarting Electron or rebuild the preload script."
        );
      }
      // @ts-ignore - injected by preload
      const res = await window.electronAPI.aiQuery(prompt);
      setResult(res);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 bg-slate-800 rounded-md">
      <h3 className="font-bold text-sm mb-2">AI SQL Query</h3>
      <textarea
        className="w-full p-2 bg-slate-900 rounded text-sm"
        rows={3}
        placeholder={`e.g. "Tell me my last month's top 10 apps by usage"`}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <div className="flex gap-2 mt-2">
        <button
          onClick={run}
          disabled={loading || !prompt.trim()}
          className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40"
        >
          {loading ? "Running…" : "Run"}
        </button>
      </div>

      {error && <div className="text-red-400 mt-2">{error}</div>}

      {result && (
        <div className="mt-3 text-sm text-slate-200">
          <div className="mb-2">
            <strong>SQL:</strong>
            <pre className="text-xs bg-slate-900 p-2 rounded mt-1 overflow-auto">
              {result.sql}
            </pre>
          </div>

          <div className="mb-2">
            <strong>AI Analysis:</strong>
            <pre className="text-xs bg-slate-900 p-2 rounded mt-1 overflow-auto">
              {JSON.stringify(result.analysis, null, 2)}
            </pre>
          </div>

          <div>
            <strong>Rows (sample):</strong>
            <pre className="text-xs bg-slate-900 p-2 rounded mt-1 overflow-auto">
              {JSON.stringify(result.rows?.slice(0, 20) || [], null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
