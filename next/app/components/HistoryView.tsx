import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Card } from "./Card";

type DayData = {
  day: string;
  total_sec: number;
};

function secToHours(sec: number) {
  return sec / 3600;
}

export default function HistoryView({
  setView,
}: {
  setView: (view: "dashboard" | "history" | "detail") => void;
}) {
  const [weeklyData, setWeeklyData] = useState<DayData[]>([]);
  const [total_duration, setTotalDuration] = useState<number>(0);
  useEffect(() => {
    loadHistory();
  }, []);
  
  async function loadHistory() {
    const date = new Date();
    const endDate = date.toISOString().slice(0, 10);
    date.setDate(date.getDate() - 6);
    const startDate = date.toISOString().slice(0, 10);
    
    const data = await window.electronAPI.getWeekSummary(
      startDate,
      endDate
    );
    setTotalDuration( data.reduce((sum:any, day:any) => sum + day.total_sec, 0));
   

    setWeeklyData(data);
  }

  const maxHours =
    Math.max(...weeklyData.map((d) => secToHours(d.total_sec)), 1);

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
          Weekly <span className="text-blue-500">Usage</span>
        </h2>
      </header>

      {/* BAR CHART */}
      <Card>
        <div className="h-56 flex items-end justify-between gap-4 px-2">
          {weeklyData.map((d) => {
            const hours = secToHours(d.total_sec);
            const height = (hours / maxHours) * 100;

            return (
              <div
                key={d.day}
                className="flex flex-col items-center gap-2 w-full"
              >
                <div className="text-[11px] text-slate-400">
                  {hours.toFixed(1)}h
                </div>

                <div className="relative w-full h-44 bg-slate-800 rounded-md overflow-hidden">
                  <div
                    className="absolute bottom-0 w-full bg-blue-500 rounded-md transition-all duration-500"
                    style={{ height: `${height}%` }}
                  />
                </div>

                <div className="text-[11px] text-slate-500">
                 {d.day.slice(5).replace("-", "/")}
                  

                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
