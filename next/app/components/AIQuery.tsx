"use client";

import next from "next";
import React, { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
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

  const [username, setUsername] = useState("");
  const [agentNickname, setAgentNickname] = useState("");


  // 🔥 Persist chat to Electron main memory whenever it changes
  useEffect(() => {
    window.electronAPI.getUserProfile().then((data) => {
      setUsername(data.username || "");
      setAgentNickname(data.agent_nickname || "");

    });
    
  }, []);

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
    const nextMessages = [...messages, userMessage];
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setLoading(true);

    try {
      console.log("Sending messages to Electron main for AI processing:", nextMessages);
      const res = await window.electronAPI.aiQuery(nextMessages);

      const aiText =
        res?.analysis?.analysis ||
        "Sorry, I couldn't understand that. Try asking in a different way.";

      const aiMessage: Message = { role: "assistant", content: aiText };
      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
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
  <div className="h-full flex flex-col items-center justify-center text-center px-6">
    {/* Hero */}
    <div className="mb-6 flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600/10 ring-1 ring-emerald-500/20">
      <span className="text-3xl">🧠</span>
    </div>

    <h1 className="text-2xl font-bold text-slate-100 mb-1">
      Hi {username || "there"}
    </h1>
    <p className="text-slate-400 mb-6 max-w-md">
      I’m your AI assistant{agentNickname && `, ${agentNickname}`}.  
      Ask me anything about how you spend your time.
    </p>

    {/* Prompt cards */}
    <div className="grid gap-3 w-full max-w-xl">
      {[
        {
          title: "Top apps",
          text: "Show my most used apps this week",
        },
        {
          title: "Focus time",
          text: "How much time did I spend coding?",
        },
        {
          title: "Daily pattern",
          text: "Show my daily activity pattern",
        },
        {
          title: "Productivity insight",
          text: "Give me a productivity summary",
        },
      ].map((item, i) => (
        <button
          key={i}
          onClick={() => setPrompt(item.text)}
          className="group text-left p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/40 transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-200">
                {item.title}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {item.text}
              </p>
            </div>
            <span className="opacity-0 group-hover:opacity-100 transition text-emerald-400">
              ↵
            </span>
          </div>
        </button>
      ))}
    </div>

    {/* Footer hint */}
    <p className="mt-6 text-xs text-slate-500">
      Press <kbd className="px-1 rounded bg-slate-800 border border-slate-700">Enter</kbd>{" "}
      to send • <kbd className="px-1 rounded bg-slate-800 border border-slate-700">Shift</kbd>
      +Enter for new line
    </p>
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
