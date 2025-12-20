"use client";

import { useState, useEffect, useMemo } from "react";

import DashboardView from "./components/DashboardView";
import GoalsView from "./components/GoalsView";
import SideBar from "./components/SideBar";



export default function App() {
  const [view, setView] = useState<"dashboard" | "goals" | "history" | "detail">("dashboard");

  return (
    <div className="flex min-h-screen bg-[#0c1021] text-slate-200">
        <SideBar view={view} setView={setView} />
    

      <main className="ml-64 flex-1 p-8">
        {view === "dashboard" && (
          <DashboardView
         
            setView={setView}
          />
        )}

        {view === "goals" && <GoalsView setView={setView} />}
        
     
      </main>
    </div>
  );
}
