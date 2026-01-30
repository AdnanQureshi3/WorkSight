import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Card } from "./Card";

type DayData = {
  day: string;
  work: number;
  distraction: number;
  neutral: number;
};

type WeeklyStats = {
  avgDailyHours: number;
  peakApp: string;
  peakHours: number;
};

function HistoryView({
  setView,
}: {
  setView: (view: "dashboard" | "history" | "detail") => void;
}) {
  const [weeklyData, setWeeklyData] = useState<DayData[]>([]);
  const [stats, setStats] = useState<WeeklyStats | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    const [week, stats] = await Promise.all([
      window.electronAPI.getWeeklyHistory(),
      window.electronAPI.getWeeklyStats(),
    ]);

    console.log("weeklyData", week);
    console.log("weeklyStats", stats);
    week.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const map = Object.fromEntries(week.map(d => [d.date, d]));
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const date = d.toISOString().slice(0, 10);
      if (!map[date]) {
        week.push({
          date,
          day: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()],
          work: 0, distraction: 0, neutral: 0,
        });
      }
    }

    week.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setWeeklyData(week);


    setWeeklyData(week);
    setStats(stats);
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* HEADER */}
      <header className="flex items-center gap-4">
        <button
          onClick={() => setView("dashboard")}
          className="p-2 hover:bg-slate-800 rounded-full"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-3xl font-bold text-white">
          Historical <span className="text-blue-500">Archives</span>
        </h2>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT STATS */}
        <div className="space-y-4">
          <Card className="text-center">
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">
              Avg Daily Usage
            </p>
            <p className="text-4xl font-black text-emerald-500">
              {stats ? `${stats.avgDailyHours}h` : "--"}
            </p>
          </Card>

          <Card className="text-center">
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">
              Peak Distraction
            </p>
            {stats ? (
              <>
                <p className="text-lg font-bold text-rose-500">
                  {stats.peakApp}
                </p>
                <p className="text-[10px] text-slate-500">
                  {stats.peakHours} hrs total
                </p>
              </>
            ) : (
              <p className="text-xs text-slate-500">No data</p>
            )}
          </Card>
        </div>

        {/* CHART */}
        <Card className="lg:col-span-3" title="Weekly Usage Breakdown">
          {weeklyData.length === 0 ? (
            <div className="h-80 flex items-center justify-center text-xs text-slate-500">
              No historical data available
            </div>
          ) : (
            <>
              <div className="h-80 flex items-end justify-between px-4 pb-4">
                {weeklyData.map((d, i) => {
                  const max = 8;
                  const workH = ((d.work ?? 0) / max) * 100;
                  const disH = ((d.distraction ?? 0) / max) * 100;
                  const neuH = ((d.neutral ?? 0) / max) * 100;

                  return (
                    <div
                      key={i}
                      className="flex flex-col items-center group w-12"
                    >
                      <div
                        className="relative w-full flex flex-col justify-end gap-1"
                        style={{ height: "240px" }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 p-1 rounded text-[10px] whitespace-nowrap z-10 border border-slate-700">
                          Total: {(d.work + d.distraction + d.neutral).toFixed(1)}h
                        </div>

                        <div
                          title="Neutral"
                          className="bg-slate-500/40 w-full rounded-t-sm"
                          style={{ height: `${neuH}%` }}
                        />
                        <div
                          title="Distraction"
                          className="bg-rose-500/50 w-full rounded-sm"
                          style={{ height: `${disH}%` }}
                        />
                        <div
                          title="Work"
                          className="bg-blue-500 w-full rounded-sm shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                          style={{ height: `${workH}%` }}
                        />
                      </div>

                      <p className="mt-3 text-[10px] font-black text-slate-500">
                        {d.day}
                      </p>
                      <p className="text-[10px] font-bold text-white">
                        {(d.work + d.distraction + d.neutral).toFixed(1)}h
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center gap-6 mt-2 pt-4 border-t border-slate-700/50">
                <Legend color="bg-blue-500" label="WORK" />
                <Legend color="bg-rose-500/50" label="DISTRACTION" />
                <Legend color="bg-slate-500/40" label="NEUTRAL" />
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      {label}
    </div>
  );
}

export default HistoryView;
