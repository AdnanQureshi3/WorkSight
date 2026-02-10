
import { useState, useRef, useEffect } from "react";
import {Copy } from "lucide-react";
type Message = {
  role: "user" | "assistant";
  content: string;
};

const STORAGE_KEY = "worksight_ai_chat";

/* -------- MODELS CONFIG (UI ONLY) -------- */
const MODELS = [
  { label: "GPT-4.1 Mini", value: "gpt-4.1-mini", provider: "openai" },
  { label: "GPT-4o Mini", value: "gpt-4o-mini", provider: "openai" },
  { label: "Gemini 2.5 Flash", value: "gemini-2.5-flash", provider: "gemini" },
  { label: "Gemini 2.5 Pro", value: "gemini-2.5-pro", provider: "gemini" },
];

const MODEL_PROVIDER = Object.fromEntries(
  MODELS.map((m) => [m.value, m.provider])
);

function loadFromSession(): Message[] {
  if (typeof window === "undefined") return [];
  const raw = sessionStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveToSession(messages: Message[]) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

export default function AIQuery() {
  const [messages, setMessages] = useState<Message[]>(loadFromSession);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<string>("gemini-2.5-flash");
  const [username, setUsername] = useState("");
  const [agentNickname, setAgentNickname] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  /* -------- COPY HELPER -------- */
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  /* -------- LOAD PROFILE -------- */
  useEffect(() => {
    window.electronAPI.getUserProfile().then((data) => {
      setUsername(data.username || "");
      setAgentNickname(data.agent_nickname || "");
    });
  }, []);

  /* -------- AUTOSCROLL -------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* -------- PERSIST CHAT -------- */
  useEffect(() => {
    saveToSession(messages);
  }, [messages]);

  async function run() {
    if (!prompt.trim()) return;

    const userMessage: Message = { role: "user", content: prompt };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setPrompt("");
    setLoading(true);

    try {
      const provider = MODEL_PROVIDER[model];

      const res = await window.electronAPI.aiQuery(
        nextMessages,
        model,
        provider
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            res?.analysis?.analysis ||
            "I couldn’t understand that. Try asking differently.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "The AI service is currently unavailable.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl shadow-lg">
      {/* HEADER */}
      <div className="px-4 py-3 border-b border-slate-700 flex justify-between text-slate-200 font-semibold">
        <span>Ask anything about your activity</span>
        <button
          onClick={() => {
            sessionStorage.removeItem(STORAGE_KEY);
            setMessages([]);
          }}
          className="px-3 py-1 rounded bg-slate-800 hover:text-red-500 hover:bg-slate-700 text-sm"
        >
          🧹 New chat
        </button>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <div className="mb-4 w-16 h-16 rounded-2xl bg-emerald-600/10 ring-1 ring-emerald-500/20 flex items-center justify-center">
              <span className="text-3xl">🧠</span>
            </div>

            <h1 className="text-2xl font-bold text-slate-100">
              Hi {username || "there"}
            </h1>
            <p className="text-slate-400 mb-6">
              I’m your AI assistant{agentNickname && `, ${agentNickname}`}.
            </p>

            <div className="grid gap-3 w-full max-w-xl">
              {[
                "Show my most used apps this week",
                "How much time did I spend coding?",
                "Show my daily activity pattern",
                "Give me a productivity summary",
              ].map((q, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(q)}
                  className="text-left p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 transition"
                >
                  <p className="text-sm font-semibold text-slate-200">{q}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`group flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div className="relative max-w-[75%]">
              <div
                className={`px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-emerald-600 text-white rounded-br-sm"
                    : "bg-slate-800 text-slate-200 rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>

              {/* COPY BUTTON */}
              <button
                onClick={() => copyToClipboard(msg.content)}
                className={`absolute -top-2 ${
                  msg.role === "user" ? "-left-10" : "-right-10"
                } opacity-0 cursor-pointer group-hover:opacity-100 transition text-xs px-2 py-1 rounded bg-slate-700 text-slate-200 hover:bg-slate-600`}
              >
                <Copy size={12} className="inline mr-1" />
            
              </button>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex">
            <div className="bg-slate-800 px-4 py-2 rounded-2xl text-sm text-slate-400 animate-pulse">
              Thinking…
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT BAR */}
      <div className="p-3 border-t border-slate-700 bg-slate-800 flex gap-3 items-end">
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="bg-slate-900 text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-700 focus:ring-1 focus:ring-emerald-500"
        >
          {["openai", "gemini"].map((provider) => (
            <optgroup key={provider} label={provider.toUpperCase()}>
              {MODELS.filter((m) => m.provider === provider).map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

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
          placeholder="Ask about your time, apps, productivity…"
          className="flex-1 resize-none bg-slate-900 text-sm p-3 rounded-lg outline-none text-slate-200 border border-slate-700 focus:ring-1 focus:ring-emerald-500"
        />

        <button
          onClick={run}
          disabled={loading || !prompt.trim()}
          className="px-5 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-sm font-medium"
        >
          Send
        </button>
      </div>
    </div>
  );
}
