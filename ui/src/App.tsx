
import { useState, useEffect } from "react";

import DashboardView from "./components/DashboardView";
import SideBar from "./components/SideBar";
import HistoryView from "./components/HistoryView";
import DetailView from "./components/DetailView";
import Profile from "./components/Profile";
import AIQuery from "./components/AIQuery";

export default function App() {
  const [view, setView] = useState<
    "dashboard" | "ai" | "history" | "detail" | "profile"
  >("dashboard");

  const [dayAppUsage, setDayAppUsage] = useState<any[]>([]);
  const [refresh, setRefresh] = useState<boolean>(false);

  useEffect(() => {
    const localtoday = new Date().toLocaleDateString("en-CA");
    window.electronAPI.getDayAppUsage(localtoday).then((data) => {
      setDayAppUsage(data);
    });
  }, [refresh]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0c1021] text-slate-200">
      <SideBar setRefresh={setRefresh} view={view} setView={setView} />

      <main className="ml-64 flex-1 p-8 overflow-hidden">
        {view === "dashboard" && (
          <div className="h-full overflow-y-auto">
            <DashboardView data={dayAppUsage} setView={setView} />
          </div>
        )}

        {view === "detail" && (
          <div className="h-full overflow-y-auto">
            <DetailView data={dayAppUsage} setView={setView} />
          </div>
        )}

        {view === "ai" && (
          <div className="h-full overflow-y-auto">
            <AIQuery />
          </div>
        )}

        {view === "history" && (
          <div className="h-full overflow-y-auto">
            <HistoryView setView={setView} />
          </div>
        )}

        {view === "profile" && (
          <div className="h-full overflow-y-auto">
            <Profile setView={setView} />
          </div>
        )}
      </main>
    </div>
  );
}
