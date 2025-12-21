import React from "react";
import { Card } from "./Card";
import { ArrowLeft } from "lucide-react";

type DetailViewProps = {
  data: any[];
  setView: (view: "dashboard" | "goals" | "history" | "detail" | "profile") => void;
};

export default function DetailView({ data, setView }: DetailViewProps) {
  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-500">
      {/* HEADER */}
      <header className="flex items-center gap-4">
        <button
          onClick={() => setView("dashboard")}
          className="p-2 hover:bg-slate-800 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-3xl font-bold">
          Temporal <span className="text-blue-500">Breakdown</span>
        </h2>
      </header>

      {/* TIMELINE */}
      <Card title="AI-Classified Sequential Logic">
        <div className="space-y-6">
          {data.map((log, i) => {
            const isWork = log.app_name.toLowerCase().includes("code");

            return (
              <div key={i} className="space-y-3">
                {/* TIME SEPARATOR */}
                <div className="flex items-center gap-4">
                  <div className="h-px bg-slate-700 flex-1" />
                  <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                    Today
                  </span>
                  <div className="h-px bg-slate-700 flex-1" />
                </div>

                {/* LOG CARD */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black tracking-tighter text-white">
                      {log.app_name}
                    </span>
                    <span className="text-xs text-slate-500 italic">
                      Context: Active Window
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-lg border flex items-center justify-between ${
                      isWork
                        ? "bg-emerald-500/5 border-emerald-500/20"
                        : "bg-rose-500/5 border-rose-500/20"
                    }`}
                  >
                    <div>
                      <p
                        className={`text-xs font-bold ${
                          isWork
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        Total Usage
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold">
                        {Math.round(log.total_sec / 60)} min
                      </p>
                    </div>

                    <span
                      className={`text-[8px] font-black uppercase px-2 py-1 rounded ${
                        isWork
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-rose-500 text-slate-950"
                      }`}
                    >
                      {isWork ? "Productive" : "Distraction"}
                    </span>
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
