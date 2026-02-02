"use client";

import { useState, useEffect } from "react";

import DashboardView from "./components/DashboardView";
import SideBar from "./components/SideBar";
import HistoryView from "./components/HistoryView";
import DetailView from "./components/DetailView";
// import PythonTracker from "./components/PythonTracker";
import Profile from "./components/Profile";
import AIQuery from "./components/AIQuery";

export default function App() {
  const [view, setView] = useState<
    "dashboard" | "ai" | "history" | "detail" | "profile"
  >("dashboard");

  const [dayAppUsage, setDayAppUsage] = useState<any[]>([]);
  const [refresh, setRefresh] = useState<boolean>(false);

  // 🔹 FETCH ONCE
  useEffect(() => {
    // const today = new Date().toISOString().slice(0, 10);
    // console.log("Fetching app usage for date:", today);
    // const today = "2026-02-02"
    const today = new Date().toLocaleDateString('en-CA').slice(0, 10);
    window.electronAPI.getDayAppUsage(today).then(setDayAppUsage);
  }, [refresh]);

 return (
  <div className="flex h-screen overflow-hidden bg-[#0c1021] text-slate-200">
    <SideBar setRefresh={setRefresh} view={view} setView={setView} />

    <main className="ml-64 flex-1 p-8 overflow-hidden">
      {view === "dashboard" && (
        <DashboardView data={dayAppUsage} setView={setView} />
      )}

      {view === "detail" && (
        <DetailView data={dayAppUsage} setView={setView} />
      )}

      {view === "ai" && (
        <div className="h-full">
          <AIQuery />
        </div>
      )}

      {view === "history" && <HistoryView setView={setView} />}
      {view === "profile" && <Profile setView={setView} />}
    </main>
  </div>
);

}
