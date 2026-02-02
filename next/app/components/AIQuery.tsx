"use client";

import React, { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "ai";
  content: string;
};
const STORAGE_KEY = "worksight_ai_chat";

function loadFromSession() {
  if (typeof window === "undefined") return [];
  const raw = sessionStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveToSession(messages: any[]) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

export default function AIQuery() {

  const [messages, setMessages] = useState<Message[]>(loadFromSession);

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);


  // 🔥 Persist chat to Electron main memory whenever it changes

  // auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);
  useEffect(() => {
  saveToSession(messages);
}, [messages]);


  async function run() {
    if (!prompt.trim()) return;

    const userMessage: Message = { role: "user", content: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setLoading(true);

    try {
      const res = await window.electronAPI.aiQuery(userMessage.content);

      const aiText =
        res?.analysis?.analysis ||
        "Sorry, I couldn't understand that. Try asking in a different way.";

      const aiMessage: Message = { role: "ai", content: aiText };
      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "⚠️ Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
      <div className="flex flex-col h-full bg-slate-900 rounded-xl shadow-lg">

      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700 text-slate-200 font-semibold flex justify-between">
        <span>Ask anything about your activity</span>

        {/* 🧹 New Chat */}
      <button
        onClick={async () => {
         sessionStorage.removeItem(STORAGE_KEY);
  setMessages([]);
        }}
        className="px-3 py-1 rounded bg-slate-800 cursor-pointer hover:text-red-500 hover:bg-slate-700 text-s text-slate-200"
      >
        <span className="text-xl ">
🧹
        </span>
         Start new chat
      </button>


      </div>

      {/* Chat area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">

        {messages.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 px-6">
            <div className="text-3xl mb-3">👋</div>
            <h2 className="text-lg font-semibold text-slate-200 mb-2">
              Ask me anything about your activity
            </h2>
            <p className="text-sm mb-6 max-w-md">
              I can understand natural language and show insights from your data.
            </p>

            <div className="grid gap-3 w-full max-w-xl">
              {[
                "Show me last month's top apps by usage",
                "How much time did I spend coding this week?",
                "Which apps do I open most frequently?",
                "Show my daily activity pattern",
              ].map((example, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(example)}
                  className="text-left bg-slate-800 hover:bg-slate-700 transition px-4 py-3 rounded-lg text-sm text-slate-300 border border-slate-700"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
              ${
                msg.role === "user"
                  ? "bg-emerald-600 text-white rounded-br-sm"
                  : "bg-slate-800 text-slate-200 rounded-bl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 px-4 py-2 rounded-2xl text-sm text-slate-400 animate-pulse">
              Thinking...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-700 bg-slate-800 flex gap-2">
        <textarea
          rows={1}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              run();
            }
          }}
          placeholder="Ask like: Show me last month's top apps by usage..."
          className="flex-1 resize-none bg-slate-900 text-sm p-3 rounded-lg outline-none text-slate-200"
        />
        <button
          onClick={run}
          disabled={loading || !prompt.trim()}
          className="px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
}
