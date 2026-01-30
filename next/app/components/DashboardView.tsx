import { Card } from "./Card";
import { useState, useMemo } from "react";
import {
  Lightbulb,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Loader2,
  Brain,
  Clock,
} from "lucide-react";

type DashboardViewProps = {
  data: any[];
  setView: (view: "dashboard" | "ai" | "history" | "detail" | "profile") => void;
};

export default function DashboardView({ data, setView }: DashboardViewProps) {
  const [aiAnalysis, setAiAnalysis] = useState<{
    score: number;
    summary: string;
    suggestion: string;
  } | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  /* -------- DERIVED METRICS -------- */
  const stats = useMemo(() => {
    let work = 0;
    let distraction = 0;

    data.forEach((d) => {
      const mins = d.total_sec / 60;
      d.app_name.toLowerCase().includes("code")
        ? (work += mins)
        : (distraction += mins);
    });

    return {
      work: Math.round(work),
      distraction: Math.round(distraction),
      total: Math.round(work + distraction),
    };
  }, [data]);

  /* -------- ACTIVITY LIST -------- */
  const parsedActivities = useMemo(() => {
    return data.map((item) => ({
      app: item.app_name,
      duration: `${Math.round(item.total_sec / 60)} min`,
      isWork: item.app_name.toLowerCase().includes("code"),
    }));
  }, [data]);

  /* -------- AI ANALYSIS -------- */
  const performAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      setAiAnalysis({
        score: 82,
        summary: "Your focus is strong with clear work dominance.",
        suggestion: "Reduce passive app usage to push beyond 90%.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER */}
      <header>
        <h2 className="text-3xl font-bold">
          Productivity <span className="text-blue-500">Overview</span>
        </h2>
        <p className="text-slate-500">
          Local activity analyzed • Today
        </p>
      </header>

      {/* KPI ROW */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <Clock className="text-blue-400" />
            <div>
              <p className="text-xs text-slate-400">Total Time</p>
              <p className="text-xl font-bold">{stats.total} min</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-emerald-400" />
            <div>
              <p className="text-xs text-slate-400">Work</p>
              <p className="text-xl font-bold">{stats.work} min</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <XCircle className="text-rose-400" />
            <div>
              <p className="text-xs text-slate-400">Distraction</p>
              <p className="text-xl font-bold">{stats.distraction} min</p>
            </div>
          </div>
        </Card>
      </div>

      {/* AI INSIGHT */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Brain className="text-blue-400" />
            <h3 className="text-lg font-bold">AI Insight</h3>
          </div>

          <button
            onClick={performAIAnalysis}
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-xs font-bold"
          >
            ANALYZE
          </button>
        </div>

        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full border-4 border-slate-700 flex items-center justify-center">
            {isAnalyzing ? (
              <Loader2 className="animate-spin text-blue-500" />
            ) : (
              <span className="text-3xl font-black text-emerald-500">
                {aiAnalysis?.score || "--"}%
              </span>
            )}
          </div>

          <div>
            <p className="italic text-slate-300">
              {aiAnalysis?.summary || "Awaiting neural analysis…"}
            </p>
            <p className="mt-2 text-sm text-orange-400 flex items-center">
              <Lightbulb size={14} className="mr-2" />
              {aiAnalysis?.suggestion || "Click analyze to generate insight"}
            </p>
          </div>
        </div>
      </Card>

      {/* ACTIVITY LIST */}
      <Card title="Application Breakdown">
        <div className="space-y-2">
          {parsedActivities.map((act, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 hover:bg-slate-900 transition"
            >
              <div>
                <p className="font-semibold">{act.app}</p>
                <p className="text-xs text-slate-500">{act.duration}</p>
              </div>

              <span
                className={`text-xs font-bold px-2 py-1 rounded ${
                  act.isWork
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-rose-500/10 text-rose-400"
                }`}
              >
                {act.isWork ? "WORK" : "DISTRACTION"}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setView("detail")}
          className="mt-4 flex items-center text-blue-500 text-xs font-bold hover:translate-x-1 transition-transform"
        >
          VIEW FULL TIMELINE <ChevronRight size={14} />
        </button>
      </Card>
    </div>
  );
}
