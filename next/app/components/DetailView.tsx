import React from "react";
import { Card } from "./Card";
import { ArrowLeft } from "lucide-react";

type DetailViewProps = {
  data: any[];
  setView: (view: "dashboard" | "history" | "detail" | "profile") => void;
};

export default function DetailView({ data, setView }: DetailViewProps) {
  return (
    <div className="space-y-10 animate-in zoom-in-95 duration-500">
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
            Temporal <span className="text-blue-500">Breakdown</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">Today</p>
        </div>
      </header>

      {/* CONTENT */}
      <Card title="AI-Classified Sequential Logic">
        <div className="space-y-5">
          {data.map((log, i) => {
            const isWork = log.app_name.toLowerCase().includes("code");

            return (
              <div
                key={i}
                className="p-5 rounded-xl  from-slate-900/80 to-slate-900 border border-slate-800 hover:border-slate-600 transition-colors"
              >
                {/* APP HEADER */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xl font-black tracking-tight text-white">
                      {log.app_name}
                    </p>
                    <p className="text-xs text-slate-500 italic">
                      Context: Active Window
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                      isWork
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-rose-500/15 text-rose-400"
                    }`}
                  >
                    {isWork ? "Productive" : "Distraction"}
                  </span>
                </div>

                {/* USAGE BAR */}
                <div
                  className={`p-4 rounded-lg border flex items-center justify-between ${
                    isWork
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : "bg-rose-500/5 border-rose-500/20"
                  }`}
                >
                  <div>
                    <p
                      className={`text-sm font-bold ${
                        isWork ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      Total Usage
                    </p>
                    <p className="text-xs text-slate-500 font-semibold mt-1">
                      {Math.round(log.total_sec / 60)} minutes
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
