import { Card } from "./Card";
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

  const analyze = async () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setAiAnalysis({
        score: 78,
        summary: "Usage is concentrated in a small set of applications with long continuous sessions.",
      });
      setIsAnalyzing(false);
    }, 800);
  };

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
          <p className="text-2xl font-bold mt-1">{totalMinutes} <span className="text-sm font-normal text-slate-400">min</span></p>
        </Card>

        <Card className="p-5 border-slate-800 bg-slate-900/50 hover:border-blue-500/50 transition-colors">
          <Layout className="text-blue-400 mb-3" size={20} />
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Top App</p>
          <p className="text-2xl font-bold mt-1 truncate">{topApp?.app_name || "--"}</p>
        </Card>

        <Card className="p-5 border-slate-800 bg-slate-900/50 hover:border-blue-500/50 transition-colors">
          <BarChart3 className="text-blue-400 mb-3" size={20} />
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Apps Used</p>
          <p className="text-2xl font-bold mt-1">{data.length}</p>
        </Card>
      </div>

      {/* AI Insight Section */}
      <div className="relative group">
        <div className="absolute -inset-0.5  from-blue-500 to-cyan-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
        <Card className="relative bg-slate-900 border-slate-800 p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Brain className="text-blue-400" size={24} />
              </div>
              <h3 className="text-lg font-bold">AI Insight</h3>
            </div>
            <button
              onClick={analyze}
              disabled={isAnalyzing}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 px-5 py-2 rounded-full text-xs font-bold transition-all transform active:scale-95"
            >
              {isAnalyzing ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
              ANALYZE
            </button>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="absolute w-full h-full -rotate-90">
                <circle cx="56" cy="56" r="50" fill="transparent" stroke="currentColor" strokeWidth="6" className="text-slate-800" />
                <circle 
                  cx="56" cy="56" r="50" fill="transparent" stroke="currentColor" strokeWidth="6" 
                  strokeDasharray={314}
                  strokeDashoffset={314 - (314 * (aiAnalysis?.score || 0)) / 100}
                  className="text-blue-500 transition-all duration-1000 ease-out" 
                />
              </svg>
              {isAnalyzing ? (
                <Loader2 className="animate-spin text-blue-500" size={32} />
              ) : (
                <div className="text-center">
                  <span className="text-3xl font-black">{aiAnalysis?.score || "--"}</span>
                  <span className="text-[10px] block font-bold text-slate-500">SCORE</span>
                </div>
              )}
            </div>

            <div className="flex-1">
              <p className="text-slate-300 text-lg leading-relaxed font-medium italic">
                "{aiAnalysis?.summary || "Click analyze to discover behavioral patterns and productivity trends."}"
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Usage List */}
      <Card className="bg-slate-900 border-slate-800 p-6">
        <h3 className="text-lg font-bold mb-6">Application Usage</h3>
        <div className="space-y-5">
          {activities.map((a, i) => (
            <div key={i} className="group">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">{a.app}</span>
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