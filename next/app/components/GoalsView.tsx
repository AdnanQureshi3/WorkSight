import { Card } from "./Card";
import { ArrowLeft, Trash2, Target } from "lucide-react";

const DUMMY_GOALS = [
  { name: "Code for 6 hours", current: 3.2, target: 6, unit: "hrs" },
  { name: "Documentation", current: 75, target: 100, unit: "%" },
  { name: "Limit Distractions", current: 0.8, target: 1, unit: "hrs" },
];

export default function GoalsView({
  setView,
}: {
  setView: (v: "dashboard" | "goals" | "history" | "detail" | "profile") => void;
}) {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
      {/* HEADER */}
      <header className="flex items-center gap-4">
        <button
          onClick={() => setView("dashboard")}
          className="p-2 hover:bg-slate-800 rounded-full transition-colors"
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
          <div className="space-y-5">
            {DUMMY_GOALS.map((g, i) => {
              const progress = Math.min((g.current / g.target) * 100, 100);
              const isGood = progress >= 70;

              return (
                <div
                  key={i}
                  className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-600 transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-white">{g.name}</p>
                      <p className="text-xs text-slate-500 font-mono">
                        {g.current}/{g.target} {g.unit}
                      </p>
                    </div>

                    <button className="text-rose-500 hover:text-rose-400">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* PROGRESS BAR */}
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        isGood ? "bg-emerald-500" : "bg-orange-400"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <p
                    className={`mt-2 text-[10px] font-bold uppercase ${
                      isGood ? "text-emerald-400" : "text-orange-400"
                    }`}
                  >
                    {isGood ? "On Track" : "Attention Required"}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* NEW GOAL */}
        <Card title="Initialize New Protocol">
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Objective Description
              </label>
              <input
                type="text"
                className="w-full bg-slate-900 border border-slate-700 p-3 rounded-lg outline-none focus:border-blue-500"
                placeholder="e.g. Master Rust Fundamentals"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  Threshold
                </label>
                <input
                  type="number"
                  className="w-full bg-slate-900 border border-slate-700 p-3 rounded-lg outline-none focus:border-blue-500"
                  placeholder="10"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  Metric
                </label>
                <select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-lg outline-none focus:border-blue-500">
                  <option>Hours</option>
                  <option>Percent</option>
                  <option>Tasks</option>
                </select>
              </div>
            </div>

            <button className="w-full flex items-center justify-center gap-2 bg-blue-600 py-3 rounded-xl font-bold hover:bg-blue-500 transition shadow-lg shadow-blue-600/20">
              <Target size={16} />
              INITIALIZE TARGET
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
