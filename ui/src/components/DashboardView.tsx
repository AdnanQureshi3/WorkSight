import { Card } from "./Card.js";
import { useState, useMemo } from "react";
import {
  Brain,
  Clock,
  Loader2,
  ChevronRight,
  Layout,
  BarChart3,
  Sparkles
} from "lucide-react";

type DashboardViewProps = {
  data: any[];
  setView: (view: "dashboard" | "ai" | "history" | "detail" | "profile") => void;
};

export default function DashboardView({ data, setView }: DashboardViewProps) {
  const [aiAnalysis, setAiAnalysis] = useState<{
    score: number;
    summary: string;
  } | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const totalMinutes = useMemo(
    () => Math.round(data.reduce((s, d) => s + d.total_sec, 0) / 60),
    [data]
  );
  const unitConversion = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins === 0 ? `${hrs} hr` : `${hrs} hr ${mins} min`;
  }

  const topApp = useMemo(
    () => [...data].sort((a, b) => b.total_sec - a.total_sec)[0],
    [data]
  );

  const activities = useMemo(() => {
    const max = Math.max(...data.map((d) => d.total_sec));
    return data.map((d) => ({
      app: d.app_name,
      min: Math.round(d.total_sec / 60),
      pct: (d.total_sec / max) * 100,
    }));
  }, [data]);


  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6 text-slate-100">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight">
            Activity <span className="text-blue-500 underline decoration-blue-500/30 underline-offset-8">Overview</span>
          </h2>
          <p className="text-slate-400 mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Local timeline • Today
          </p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-5 border-slate-800 bg-slate-900/50 hover:border-blue-500/50 transition-colors">
          <Clock className="text-blue-400 mb-3" size={20} />
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Time</p>
        <p className="text-2xl font-bold mt-1">
          {unitConversion(totalMinutes)}
        </p>
        </Card>

        <Card className="p-5 border-slate-800 bg-slate-900/50 hover:border-blue-500/50 transition-colors">
          <Layout className="text-blue-400 mb-3" size={20} />
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Top App</p>
          <p className="text-2xl font-bold mt-1 truncate">{topApp?.app_name.split(".")[0] || "--"}</p>
        </Card>

        <Card className="p-5 border-slate-800 bg-slate-900/50 hover:border-blue-500/50 transition-colors">
          <BarChart3 className="text-blue-400 mb-3" size={20} />
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Apps Used</p>
          <p className="text-2xl font-bold mt-1">{data.length}</p>
        </Card>
      </div>

    

      {/* Usage List */}
      <Card className="bg-slate-900 border-slate-800 p-6">
        <h3 className="text-lg font-bold mb-6">Application Usage</h3>
        <div className="space-y-5">
          {activities.map((a, i) => (
            <div key={i} className="group">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">{a.app.split(".")[0]}</span>
                <span className="text-slate-400 tabular-nums">{a.min} min</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-700"
                  style={{ width: `${a.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setView("detail")}
          className="mt-8 flex items-center gap-1 text-blue-500 hover:text-blue-400 text-xs font-bold transition-colors group"
        >
          VIEW DETAILED TIMELINE 
          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </Card>
    </div>
  );
}