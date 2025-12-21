import { Card } from "./Card";
import { useState, useMemo } from "react";
import {
  Lightbulb,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

type DashboardViewProps = {
  data: any[];
  setView: (view: "dashboard" | "goals" | "history" | "detail" | "profile") => void;
};

export default function DashboardView({ data, setView }: DashboardViewProps) {
  const [aiAnalysis, setAiAnalysis] = useState<{
    score: number;
    summary: string;
    suggestion: string;
  } | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  /* -------- PARSE DATA FOR UI -------- */
  const parsedActivities = useMemo(() => {
    return data.map((item) => ({
      app: item.app_name,
      duration: `${Math.round(item.total_sec / 60)} min`,
      type: item.app_name.toLowerCase().includes("code")
        ? "work"
        : "distraction",
    }));
  }, [data]);

  /* -------- AI ANALYSIS -------- */
  const performAIAnalysis = async () => {
    setIsAnalyzing(true);

    try {
      setAiAnalysis({
        score: 82,
        summary: "Strong focus on productive applications.",
        suggestion: "Reduce time on distracting apps for higher efficiency.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-bold text-white">
          System Status: <span className="text-blue-500">Optimal</span>
        </h2>
        <p className="text-slate-500">Local data synced.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI SUMMARY */}
        <Card className="lg:col-span-2" title="AI Protocol Summary">
          <div className="flex items-center gap-8 mb-6">
            <div className="w-32 h-32 rounded-full border-4 border-slate-700 flex items-center justify-center">
              {isAnalyzing ? (
                <Loader2 className="animate-spin text-blue-500" />
              ) : (
                <span className="text-4xl font-black text-emerald-500">
                  {aiAnalysis?.score || "--"}%
                </span>
              )}
            </div>

            <div className="flex-1">
              <p className="text-slate-300 italic text-lg">
                "{aiAnalysis?.summary || "Ready for analysis"}"
              </p>
              <div className="mt-4 flex items-center text-orange-400 text-sm font-bold">
                <Lightbulb size={16} className="mr-2" />
                {aiAnalysis?.suggestion || "Click analyze to begin"}
              </div>
            </div>
          </div>

          <button
            onClick={performAIAnalysis}
            className="bg-blue-600 px-4 py-2 rounded text-sm font-bold"
          >
            ANALYZE
          </button>
        </Card>

        {/* OBJECTIVES */}
        <Card title="Current Objectives">
          <button
            onClick={() => setView("goals")}
            className="w-full bg-slate-700 py-2 rounded text-xs font-bold"
          >
            Modify Protocols
          </button>
        </Card>
      </div>

      {/* TIMELINE */}
      <Card title="Timeline Sequence">
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {parsedActivities.map((act, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 bg-slate-900/50 rounded"
            >
              <div>
                <p className="font-bold">{act.app}</p>
                <p className="text-xs text-slate-500">{act.duration}</p>
              </div>
              <div
                className={`text-xs font-bold ${
                  act.type === "work"
                    ? "text-emerald-400"
                    : "text-rose-400"
                }`}
              >
                {act.type === "work" ? <CheckCircle2 /> : <XCircle />}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setView("detail")}
          className="mt-4 flex items-center text-blue-500 text-xs font-bold"
        >
          OPEN FULL LOG <ChevronRight size={14} />
        </button>
      </Card>
    </div>
  );
}
