import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

type DayData = {
  day: string;
  total_sec: number;
};

const secToHours = (sec: number) => sec / 3600;

export default function HistoryView({
  setView,
}: {
  setView: (view: "dashboard" | "history" | "detail") => void;
}) {
  const [weeklyData, setWeeklyData] = useState<DayData[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    loadHistory();
  }, [weekOffset]);

  async function loadHistory() {
    const base = new Date();
    base.setDate(base.getDate() - weekOffset * 7);

    const end = new Date(base);
    const start = new Date(base);
    start.setDate(end.getDate() - 6);

    const data = await window.electronAPI.getWeekSummary(
      start.toLocaleDateString("en-CA"),
      end.toLocaleDateString("en-CA")
    );

    setWeeklyData(data);
  }

  const totalHours = weeklyData.reduce(
    (acc, d) => acc + secToHours(d.total_sec),
    0
  );

  const maxHours = Math.max(
    ...weeklyData.map((d) => secToHours(d.total_sec)),
    1
  );

  return (
    <div className="w-full px-8 py-6 space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setView("dashboard")}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">Usage Statistics</h2>
            <p className="text-slate-400 text-sm">Weekly breakdown</p>
          </div>
        </div>

        <div className="flex bg-slate-800/60 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setWeekOffset((w) => w + 1)}
            className="p-2 hover:bg-slate-700 rounded-md transition-colors"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="px-4 flex items-center text-xs text-slate-300 font-medium">
            {weekOffset === 0 ? "This Week" : `${weekOffset} Weeks Ago`}
          </div>

          <button
            onClick={() => setWeekOffset((w) => Math.max(w - 1, 0))}
            disabled={weekOffset === 0}
            className="p-2 hover:bg-slate-700 rounded-md disabled:opacity-30 transition-colors"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-4 max-w-lg">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <p className="text-xs text-slate-500 uppercase font-semibold">Total</p>
          <p className="text-3xl font-bold text-blue-500">
            {totalHours.toFixed(1)}h
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <p className="text-xs text-slate-500 uppercase font-semibold">Daily Avg</p>
          <p className="text-3xl font-bold text-white">
            {(totalHours / 7).toFixed(1)}h
          </p>
        </div>
      </div>

      {/* CHART */}
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full">
        <div className="h-64 flex items-end gap-4 w-full">
          {weeklyData.map((d) => {
            const hours = secToHours(d.total_sec);
            const height = (hours / maxHours) * 100;

            return (
              <div 
                key={d.day} 
                className="flex-1 flex flex-col items-center group cursor-pointer"
                onClick={() => setView("detail")}
              >
                <span className="mb-2 text-[11px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {hours.toFixed(1)}h
                </span>

                <div className="w-full h-48 bg-slate-800/50 rounded-lg overflow-hidden flex items-end border border-transparent group-hover:border-slate-700 transition-all">
                  <div
                    className="w-full bg-blue-600 group-hover:bg-blue-500 transition-all duration-300"
                    style={{ height: `${height}%` }}
                  />
                </div>

                <span className="mt-3 text-[11px] font-medium text-slate-500 group-hover:text-slate-300 transition-colors">
                  {new Date(d.day).toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}