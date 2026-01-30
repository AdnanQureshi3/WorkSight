import React, { useState } from "react";
import { LayoutDashboard, Target, History, User,Bot } from "lucide-react";
import { SideBarProps } from "../../types/types";

function SideBar({ setRefresh, view, setView }: SideBarProps) {
  const [isTracking, setIsTracking] = useState(false);
  const toggleTracking = () => {
   console.log("Toggling tracking. Current state:", isTracking);
    try{
      if (!isTracking) {
        window.electronAPI.startTracking();
      } else {
        window.electronAPI.stopTracking();
      } 
       setIsTracking(!isTracking);
    }
    catch (error) {
        console.error("Error toggling tracking:", error);
      } 
  }
 

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed h-full z-20">
      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-black text-blue-500 tracking-tighter italic">
          WORKSIGHT.
        </h1>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
          Terminal V1.0
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {[
          { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { id: "history", icon: History, label: "Archives" },
          { id: "ai", icon: Bot, label: "AI Chat" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as any)}
            className={`w-full flex items-center p-3 rounded-lg transition-all ${
              view === item.id
                ? "bg-blue-600/20 text-blue-400 border border-blue-500/20"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span className="font-semibold text-sm">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="px-4 pb-4">
  <button
    onClick={() => setRefresh(prev => !prev)}
    className="w-full py-2 rounded-lg text-sm font-semibold
               bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
  >
    Refresh Data
  </button>
  <button
    onClick={() => {
      window.electronAPI.getData().then((data) => {
        console.log("AI Data:", data);
      });
    }}

    className="w-full py-2 rounded-lg text-sm font-semibold
               bg-slate-800 text-slate-300 m-8 hover:bg-slate-700 transition"
  >
    AI
  </button>
</div>


      {/* Start / Stop Tracking */}
      <div className="px-4 pb-4">
        <button onClick={toggleTracking}
  className={`w-full py-3 rounded-lg cursor-pointer font-semibold text-sm transition-all
    ${
      isTracking
        ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
        : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
    }
  `}
>
  {isTracking ? "Stop Tracking" : "Start Tracking"}
</button>

      </div>

      {/* Profile */}
      <div
        className="flex items-center px-6 py-4 text-slate-400 cursor-pointer hover:text-white"
        onClick={() => setView("profile")}
      >
        <User className="w-6 h-6 mr-3" />
        <span className="text-sm font-medium">Profile</span>
      </div>
    </div>
  );
}

export default SideBar;
