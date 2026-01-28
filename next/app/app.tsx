"use client";

import { useState, useEffect } from "react";

import DashboardView from "./components/DashboardView";
import GoalsView from "./components/GoalsView";
import SideBar from "./components/SideBar";
import HistoryView from "./components/HistoryView";
import DetailView from "./components/DetailView";
import PythonTracker from "./components/PythonTracker";
import Profile from "./components/Profile";

export default function App() {
  const [view, setView] = useState<
    "dashboard" | "goals" | "history" | "detail" | "profile"
  >("dashboard");

  const [dayAppUsage, setDayAppUsage] = useState<any[]>([]);
  const [refresh, setRefresh] = useState<boolean>(false);


  // 🔹 FETCH ONCE
  useEffect(() => {
    // const today = new Date().toISOString().slice(0, 10);
    // console.log("Fetching app usage for date:", today);
    const today = new Date().toISOString().slice(0, 10);

window.electronAPI.getDayAppUsage(today).then(res => {
  type WindowEntry = { time: number };

const arr = Object.entries(res).map(([app_name, value]) => ({
  app_name,
  total_time: value.total_time,
  windows: value.window.sort((a: any, b: any) => b.time - a.time)
})).sort((a, b) => b.total_time - a.total_time); 

  
  setDayAppUsage(arr);
});
console.log("App usage data for the day:", dayAppUsage);
  }, [refresh]);

  return (
    <div className="flex min-h-screen bg-[#0c1021] text-slate-200">
      <SideBar setRefresh={setRefresh} view={view} setView={setView} />

      <main className="ml-64 flex-1 p-8">
        {view === "dashboard" && (
          <DashboardView data={dayAppUsage} setView={setView} />
        )}

        {view === "detail" && (
          <DetailView data={dayAppUsage} setView={setView} />
        )}

        {view === "goals" && <GoalsView setView={setView} />}
        {view === "history" && <HistoryView setView={setView} />}
        {view === "profile" && <Profile setView={setView} />}
      </main>

      <PythonTracker />
    </div>
  );
}
