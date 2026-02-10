
import { Card } from "./Card.js";
import { ArrowLeft } from "lucide-react";

type DetailViewProps = {
  data: any[];
  setView: (view: "dashboard" | "ai" | "history" | "detail" | "profile") => void;
};

export default function DetailView({ data, setView }: DetailViewProps) {
  const maxSec = Math.max(...data.map(d => d.total_sec));
  const unitConversion = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins === 0 ? `${hrs} hr` : `${hrs} hr ${mins} min`;
  };

  return (
    <div className="space-y-12  animate-in zoom-in-95 duration-500">
      <header className="flex items-center gap-4">
        <button
          onClick={() => setView("dashboard")}
          className="p-2 rounded-full hover:bg-slate-800 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Temporal Breakdown
          </h2>
          <p className="text-xs text-slate-500 mt-1">Activity · Today</p>
        </div>
      </header>

      <Card title="Application Usage">
        <div className="space-y-6">
          {data.map((log, i) => (
            <div
              key={i}
              className="group rounded-2xl border border-slate-800 bg-slate-900/40 p-6 hover:border-slate-600 transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-white">
                    {log.app_name.split(".")[0]}
                  </p>
                 
                </div>

                <p className="text-sm font-mono text-slate-300">
                  {unitConversion(Math.round(log.total_sec / 60))}
                </p>
              </div>

              <div className="relative h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-blue-500/70 group-hover:bg-blue-400 transition-all"
                  style={{
                    width: `${(log.total_sec / maxSec) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
