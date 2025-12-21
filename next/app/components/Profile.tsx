import { profile } from "console";
import { ArrowLeft, User, Terminal, Target, Pencil, Save } from "lucide-react";
import { useEffect, useState } from "react";

type ProfileProps = {
  setView: (v: "dashboard" | "goals" | "history" | "detail" | "profile") => void;
};

export default function Profile({ setView }: ProfileProps) {
  useEffect(() => {
    // Fetch user profile data from the main process
    window.electronAPI.getUserProfile().then((data) => {  
      console.log("Fetched user profile data:", data);
      setUsername(data.username);
      setAgentNickname(data.agent_nickname);
      setSystemPrompt(data.system_prompt);
      setFinalGoal(data.final_goal);
    });
  }, []); 
  const [isEditing, setIsEditing] = useState(false);

  const [username, setUsername] = useState("Adnan");
  const [agentNickname, setAgentNickname] = useState("AI Assistant");
  const [systemPrompt, setSystemPrompt] = useState(
    "Help me stay focused, disciplined, and productive."
  );
  const [finalGoal, setFinalGoal] = useState(
    "Become a top 1% software engineer."
  );

  const handleSave = () => {
    const profileData = {
      username,
      agent_nickname: agentNickname,
      email: "", // Email field can be added later
      system_prompt: systemPrompt,
      final_goal: finalGoal,
    };

    window.electronAPI.updateUserProfile(profileData);
    console.log("Profile data saved:", profileData);
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView("dashboard")}
            className="p-2 rounded-full hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-4xl font-black tracking-tight text-white">
            User <span className="text-blue-500">Profile</span>
          </h1>
        </div>

        <button
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          className="flex items-center gap-2 text-xs uppercase font-bold text-slate-400 hover:text-white transition"
        >
          {isEditing ? <Save size={14} /> : <Pencil size={14} />}
          {isEditing ? "Save" : "Edit"}
        </button>
      </header>

      {/* PROFILE CARD */}
      <div className=" from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-10 shadow-2xl space-y-10">
        {/* USER HERO */}
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-500 shadow-lg">
            <User size={32} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
              User Name
            </p>
            {isEditing ? (
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-transparent border-b border-slate-600 text-2xl font-black text-white outline-none focus:border-blue-500"
              />
            ) : (
              <p className="text-2xl font-black text-white tracking-tight">
                {username}
              </p>
            )}
          </div>
        </div>

        {/* INFO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* AGENT NICKNAME */}
          <div className="space-y-2">
            <p className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
              Agent Nickname
            </p>
            {isEditing ? (
              <input
                value={agentNickname}
                onChange={(e) => setAgentNickname(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm outline-none focus:border-blue-500"
              />
            ) : (
              <p className="text-slate-200 font-semibold">
                {agentNickname}
              </p>
            )}
          </div>

          {/* FINAL GOAL */}
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-[11px] uppercase font-bold tracking-wider text-slate-400">
              <Target size={12} /> Final Goal
            </p>
            {isEditing ? (
              <input
                value={finalGoal}
                onChange={(e) => setFinalGoal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm outline-none focus:border-blue-500"
              />
            ) : (
              <p className="text-slate-200 font-medium">
                {finalGoal}
              </p>
            )}
          </div>
        </div>

        {/* SYSTEM PROMPT */}
        <div className="pt-8 border-t border-slate-800 space-y-3">
          <p className="flex items-center gap-2 text-[11px] uppercase font-bold tracking-wider text-slate-400">
            <Terminal size={12} /> System Prompt
          </p>
          {isEditing ? (
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={3}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm outline-none focus:border-blue-500 resize-none"
            />
          ) : (
            <p className="text-slate-300 italic leading-relaxed">
              “{systemPrompt}”
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
