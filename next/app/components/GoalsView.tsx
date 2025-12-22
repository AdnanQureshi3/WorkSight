import { useEffect, useState } from "react";
import { Card } from "./Card";
import { ArrowLeft, Trash2, Target } from "lucide-react";

type Goal = {
  id: number;
  name: string;
  target_minutes: number;
  threshold_percent: number;
};

export default function GoalsView({
  setView,
}: {
  setView: (v: "dashboard" | "goals" | "history" | "detail" | "profile") => void;
}) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [name, setName] = useState("");
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [threshold, setThreshold] = useState(80);

  useEffect(() => {
    loadGoals();
  }, []);

  async function loadGoals() {
    const data = await window.electronAPI.getGoals();
    setGoals(data);
  }

  async function handleAddGoal() {
    const targetMinutes = hours * 60 + minutes;
    if (!name || targetMinutes <= 0) return;
    console.log("Adding goal:", { name, targetMinutes, threshold });

    await window.electronAPI.addGoal({
      name,
      target_minutes: targetMinutes,
      threshold_percent: threshold,
    });

    setName("");
    setHours(0);
    setMinutes(0);
    setThreshold(80);
    loadGoals();
  }

  async function handleDeleteGoal(id: number) {
    await window.electronAPI.deleteGoal(id);
    loadGoals();
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
      {/* HEADER */}
      <header className="flex items-center gap-4">
        <button
          onClick={() => setView("dashboard")}
          className="p-2 hover:bg-slate-800 rounded-full"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-3xl font-bold">
            Protocol <span className="text-blue-500">Directives</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Define and enforce productivity constraints
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ACTIVE GOALS */}
        <Card title="Active Protocols">
          {goals.length === 0 ? (
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-300">
                No active protocols found
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                You haven’t defined any productivity directives yet.
                Initialize your first protocol to begin tracking execution.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {goals.map((g) => {
                const required =
                  (g.target_minutes * g.threshold_percent) / 100;

                return (
                  <div
                    key={g.id}
                    className="p-5 rounded-xl bg-slate-900 border border-slate-800"
                  >
                    <div className="flex justify-between mb-2">
                      <div>
                        <p className="font-bold">{g.name}</p>
                        <p className="text-xs text-slate-500 font-mono">
                          Target: {g.target_minutes} min · Threshold:{" "}
                          {g.threshold_percent}%
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Required: {Math.round(required)} min
                        </p>
                        <p>g.current_minutes</p>
                      </div>

                      <button
                        onClick={() => handleDeleteGoal(g.id)}
                        className="text-rose-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* NEW GOAL */}
        <Card title="Initialize New Protocol">
          <div className="space-y-6">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border p-3 rounded-lg"
              placeholder="e.g. LeetCode Practice"
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 bg-slate-900 border p-3 rounded-lg">
                <span className="text-slate-400 text-sm">Hours</span>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="flex-1 bg-transparent outline-none text-right"
                />
              </div>

              <div className="flex items-center gap-2 bg-slate-900 border p-3 rounded-lg">
                <span className="text-slate-400 text-sm">Minutes</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  className="flex-1 bg-transparent outline-none text-right"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Threshold ({threshold}%)
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            <button
              onClick={handleAddGoal}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 py-3 rounded-xl font-bold"
            >
              <Target size={16} />
              INITIALIZE TARGET
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
