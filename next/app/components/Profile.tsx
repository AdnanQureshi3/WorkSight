import {
  ArrowLeft,
  User,
  Terminal,
  Target,
  Pencil,
  Save
} from "lucide-react";
import { useEffect, useState } from "react";
import LLM from "./LLM";

type ProfileProps = {
  setView: (v: "dashboard" | "history" | "detail" | "profile") => void;
};

export default function Profile({ setView }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);

  const [username, setUsername] = useState("");
  const [agentNickname, setAgentNickname] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [finalGoal, setFinalGoal] = useState("");

  useEffect(() => {
    window.electronAPI.getUserProfile().then((data) => {
      setUsername(data.username || "");
      setAgentNickname(data.agent_nickname || "");
      setSystemPrompt(data.system_prompt || "");
      setFinalGoal(data.final_goal || "");
    });
  }, []);

  const handleSave = () => {
    window.electronAPI.updateUserProfile({
      username,
      agent_nickname: agentNickname,
      email: "",
      system_prompt: systemPrompt,
      final_goal: finalGoal
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* HEADER */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView("dashboard")}
            className="p-2 rounded-md hover:bg-slate-800"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-3xl font-black">
            User <span className="text-blue-500">Profile</span>
          </h1>
        </div>

        <button
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
        >
          {isEditing ? <Save size={14} /> : <Pencil size={14} />}
          {isEditing ? "Save" : "Edit"}
        </button>
      </header>

      {/* PROFILE CARD */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 space-y-6">
        {/* USER ROW */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center">
            <User size={28} />
          </div>

          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">
              User Name
            </p>
            {isEditing ? (
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-transparent border-b border-slate-600 text-xl font-bold outline-none"
              />
            ) : (
              <p className="text-xl font-bold">{username}</p>
            )}
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <p className="text-xs uppercase text-slate-400 font-semibold mb-1">
              Agent Nickname
            </p>
            {isEditing ? (
              <input
                value={agentNickname}
                onChange={(e) => setAgentNickname(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 p-2 rounded-md"
              />
            ) : (
              <p>{agentNickname}</p>
            )}
          </div>

          <div>
            <p className="flex items-center gap-1.5 text-xs uppercase text-slate-400 font-semibold mb-1">
              <Target size={12} /> Final Goal
            </p>
            {isEditing ? (
              <input
                value={finalGoal}
                onChange={(e) => setFinalGoal(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 p-2 rounded-md"
              />
            ) : (
              <p>{finalGoal}</p>
            )}
          </div>
        </div>

        {/* SYSTEM PROMPT */}
        <div>
          <p className="flex items-center gap-1.5 text-xs uppercase text-slate-400 font-semibold mb-1">
            <Terminal size={12} /> System Prompt
          </p>
          {isEditing ? (
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={2}
              className="w-full bg-slate-900 border border-slate-700 p-2 rounded-md"
            />
          ) : (
            <p className="italic text-slate-300">
              “{systemPrompt || "—"}”
            </p>
          )}
        </div>
      </div>

      {/* LLM SETTINGS */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
        <LLM />
      </div>
    </div>
  );
}
