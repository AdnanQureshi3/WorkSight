import { ArrowLeft, User, Terminal, Target, Pencil, Save, Key } from "lucide-react";
import { useEffect, useState } from "react";

type ProfileProps = {
  setView: (v: "dashboard" | "history" | "detail" | "profile") => void;
};

export default function Profile({ setView }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);

  // profile fields
  const [username, setUsername] = useState("");
  const [agentNickname, setAgentNickname] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [finalGoal, setFinalGoal] = useState("");
  const [apiKey, setApiKey] = useState("");

  // app classification
  // const [productiveApps, setProductiveApps] = useState<string[]>([]);
  // const [distractionApps, setDistractionApps] = useState<string[]>([]);
  // const [neutralApps, setNeutralApps] = useState<string[]>([]);

  // // input helpers
  // const [prodInput, setProdInput] = useState("");
  // const [distInput, setDistInput] = useState("");
  // const [neutralInput, setNeutralInput] = useState("");

  /* -------- FETCH PROFILE -------- */
  useEffect(() => {
    window.electronAPI.getUserProfile().then((data) => {
      setUsername(data.username || "");
      setAgentNickname(data.agent_nickname || "");
      setSystemPrompt(data.system_prompt || "");
      setFinalGoal(data.final_goal || "");

      // setProductiveApps(data.productive_apps || []);
      // setDistractionApps(data.distraction_apps || []);
      // setNeutralApps(data.neutral_apps || []);

      setApiKey(data.api_key || "");
    });
  }, []);

  /* -------- SAVE PROFILE -------- */
  const handleSave = () => {
    window.electronAPI.updateUserProfile({
      username,
      agent_nickname: agentNickname,
      email: "",
      system_prompt: systemPrompt,
      final_goal: finalGoal,

      api_key: apiKey,
    });
    setIsEditing(false);
  };

  const addTag = (
    value: string,
    list: string[],
    setList: (v: string[]) => void,
    setInput: (v: string) => void
  ) => {
    if (!value.trim()) return;
    setList([...list, value.trim()]);
    setInput("");
  };

  const removeTag = (i: number, list: string[], setList: (v: string[]) => void) =>
    setList(list.filter((_, idx) => idx !== i));

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView("dashboard")}
            className="p-2 rounded-full hover:bg-slate-800"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-4xl font-black">
            User <span className="text-blue-500">Profile</span>
          </h1>
        </div>

        <button
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white"
        >
          {isEditing ? <Save size={14} /> : <Pencil size={14} />}
          {isEditing ? "Save" : "Edit"}
        </button>
      </header>

      {/* CARD */}
      <div className="border border-slate-800 rounded-2xl p-10 space-y-10 bg-slate-950">
        {/* USER */}
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-blue-600/20 flex items-center justify-center">
            <User size={32} />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold">User Name</p>
            {isEditing ? (
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-transparent border-b border-slate-600 text-2xl font-black outline-none"
              />
            ) : (
              <p className="text-2xl font-black">{username}</p>
            )}
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-xs uppercase text-slate-400 font-bold">
              Agent Nickname
            </p>
            {isEditing ? (
              <input
                value={agentNickname}
                onChange={(e) => setAgentNickname(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 p-3 rounded-lg"
              />
            ) : (
              <p>{agentNickname}</p>
            )}
          </div>

          <div>
            <p className="flex items-center gap-2 text-xs uppercase text-slate-400 font-bold">
              <Target size={12} /> Final Goal
            </p>
            {isEditing ? (
              <input
                value={finalGoal}
                onChange={(e) => setFinalGoal(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 p-3 rounded-lg"
              />
            ) : (
              <p>{finalGoal}</p>
            )}
          </div>
        </div>

        {/* API KEY */}
        <div>
          <p className="flex items-center gap-2 text-xs uppercase text-slate-400 font-bold">
            <Key size={12} /> API Key
          </p>
          {isEditing ? (
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 p-3 rounded-lg"
              placeholder="Enter your API key"
            />
          ) : (
            <p className="tracking-widest">
              {apiKey ? "••••••••••••••••••" : "Not set"}
            </p>
          )}
        </div>

        {/* SYSTEM PROMPT */}
        <div className="border-t border-slate-800 pt-6">
          <p className="flex items-center gap-2 text-xs uppercase text-slate-400 font-bold">
            <Terminal size={12} /> System Prompt
          </p>
          {isEditing ? (
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={3}
              className="w-full bg-slate-900 border border-slate-700 p-3 rounded-lg"
            />
          ) : (
            <p className="italic text-slate-300">“{systemPrompt}”</p>
          )}
        </div>

        {/* APP CLASSIFICATION */}
        {/* <div className="border-t border-slate-800 pt-6 space-y-6">
          {[
            {
              label: "🟢 Productive Apps",
              list: productiveApps,
              setList: setProductiveApps,
              input: prodInput,
              setInput: setProdInput,
              placeholder: "LeetCode",
            },
            {
              label: "🚨 Distraction Apps",
              list: distractionApps,
              setList: setDistractionApps,
              input: distInput,
              setInput: setDistInput,
              placeholder: "Instagram",
            },
            {
              label: "⚪ Neutral Apps",
              list: neutralApps,
              setList: setNeutralApps,
              input: neutralInput,
              setInput: setNeutralInput,
              placeholder: "Chrome",
            },
          ].map((sec, i) => (
            <div key={i}>
              <p className="text-xs uppercase text-slate-400 font-bold mb-2">
                {sec.label}
              </p>

              <div className="flex flex-wrap gap-2 mb-2">
                {sec.list.map((v, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-slate-800 text-xs font-semibold flex items-center gap-2"
                  >
                    {v}
                    {isEditing && (
                      <button
                        onClick={() =>
                          removeTag(idx, sec.list, sec.setList)
                        }
                        className="text-rose-400"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <input
                    value={sec.input}
                    onChange={(e) => sec.setInput(e.target.value)}
                    placeholder={`e.g. ${sec.placeholder}`}
                    className="flex-1 bg-slate-900 border border-slate-700 p-2 rounded-lg"
                  />
                  <button
                    onClick={() =>
                      addTag(
                        sec.input,
                        sec.list,
                        sec.setList,
                        sec.setInput
                      )
                    }
                    className="px-4 bg-blue-600 rounded-lg font-bold"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          ))}
        </div> */}
      </div>
    </div>
  );
}
