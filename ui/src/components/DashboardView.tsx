import { Card } from "./Card.js";
import { useMemo } from "react";
import { Clock, ChevronRight, ChevronLeft, Layout, BarChart3, RotateCcw } from "lucide-react";

type DashboardViewProps = {
  data: any[];
  setView: (view: "dashboard" | "ai" | "history" | "detail" | "profile") => void;
  currentDate: Date;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
};

export default function DashboardView({ data, setView, currentDate, onPrevDay, onNextDay, onToday }: DashboardViewProps) {
  const totalMinutes = useMemo(() => Math.round(data.reduce((s, d) => s + d.total_sec, 0) / 60), [data]);
  const isToday = currentDate.toLocaleDateString() === new Date().toLocaleDateString();

  const unitConversion = (minutes: number) => {
    if(minutes < 1) return "<1 min";
    if (minutes < 60) return `${minutes} min`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins === 0 ? `${hrs} hr` : `${hrs} hr ${mins} min`;
  };

  const topApp = useMemo(() => [...data].sort((a, b) => b.total_sec - a.total_sec)[0], [data]);

  const activities = useMemo(() => {
    const max = Math.max(...data.map((d) => d.total_sec), 1);
    return data.map((d) => ({
      app: d.app_name,
      min: Math.round(d.total_sec / 60),
      pct: (d.total_sec / max) * 100,
    }));
  }, [data]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6 text-slate-100">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight">
            Activity <span className="text-blue-500 underline decoration-blue-500/30 underline-offset-8">Overview</span>
          </h2>
          <div className="flex items-center gap-3 mt-4">
  <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
    {/* Previous Day Button - Always Enabled */}
    <button 
      onClick={onPrevDay} 
      className="p-1 hover:text-blue-500 cursor-pointer transition-colors"
    >
      <ChevronLeft size={20}/>
    </button>
    
    <span className="px-4 text-sm font-bold text-center">
      {isToday ? "Today" : currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
    </span>

    {/* Next Day Button - Disabled if isToday is true */}
    <button 
      onClick={onNextDay} 
      disabled={isToday}
      className={`p-1 transition-colors  ${
        isToday 
          ? 'opacity-20 cursor-not-allowed text-slate-600' 
          : 'hover:text-blue-500 text-slate-100 cursor-pointer'
      }`}
    >
      <ChevronRight size={20}/>
    </button>
  </div>

  {!isToday && (
    <button 
      onClick={onToday} 
      className="p-2 cursor-pointer text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all flex items-center gap-1 text-xs font-bold"
    >
      <RotateCcw size={14}/> TODAY
    </button>
  )}
</div>
        </div>
        <div className="text-right">
          <p className="text-slate-400 text-sm flex items-center justify-end gap-2">
            <span className={`w-2 h-2 rounded-full ${isToday ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`} />
            {isToday ? "Live Tracking" : "Historical View"}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-5 border-slate-800 bg-slate-900/50 hover:border-blue-500/50 transition-colors">
          <Clock className="text-blue-400 mb-3" size={20} />
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Time</p>
          <p className="text-2xl font-bold mt-1">{unitConversion(totalMinutes)}</p>
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

      <Card className="bg-slate-900 border-slate-800 p-6">
        <h3 className="text-lg font-bold mb-6">Application Usage</h3>
        <div className="space-y-5">
          {activities.map((a, i) => (
            <div key={i} className="group">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">{a.app.split(".")[0]}</span>
                <span className="text-slate-400 tabular-nums">{unitConversion(a.min)}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-blue-500 transition-all duration-700" style={{ width: `${a.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => setView("detail")} className="mt-8 flex items-center gap-1 text-blue-500 hover:text-blue-400 text-xs font-bold transition-colors group">
          VIEW DETAILED TIMELINE <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </Card>
    </div>
  );
}