"use client";
import { useState } from "react";

export default function Page() {
  const [data, setData] = useState<any[]>([]);
  const [status, setStatus] = useState<string>("Not running");
  const [isTracking, setIsTracking] = useState(false);
  function checkElectronAPI() {
    console.log("Checking for Electron API...");
    if (!window.electronAPI) {
      console.error("Electron API is not available");
    }
    console.log("Available Electron API:", window.electronAPI);
  }
  
  return (
    <div className="p-6 space-y-4">
      <div className="space-x-2">
        <button

          onClick={() => {
             checkElectronAPI(); 
             const result = window.electronAPI.startTracking();
             setStatus("Starting...");
              setIsTracking(true);
            }}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Start Tracking
        </button>

        <button
          onClick={() =>{
             window.electronAPI.stopTracking()
              setStatus("Stopped");
            }}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Stop Tracking
        </button>

        
        <button
          onClick={async () => {
            const date = "2025-12-20";
            const rows = await window.electronAPI.getDailySummary(date);
            setData(rows);
            console.log("Daily Summary Data:", rows);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Get Daily usage
        </button>
      </div>
      <span>Tracker Status : {status}</span>

      <div className="bg-slate-900 p-4 rounded text-sm">
        {data.map((d) => (
          <div key={d.id}>
            {d.category} → {d.total_sec} seconds
          </div>
        ))}
        {data.length === 0 && <div>No data available</div>}
      </div>
    </div>
  );
}
