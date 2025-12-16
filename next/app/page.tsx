"use client";
import { useState } from "react";

export default function Page() {
  const [data, setData] = useState<any[]>([]);
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

          onClick={() => { checkElectronAPI(); window.electronAPI.startTracking();}}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Start Tracking
        </button>

        <button
          onClick={() => window.electronAPI.stopTracking()}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Stop Tracking
        </button>

        <button
          onClick={async () => {
            const rows = await window.electronAPI.getData();
            setData(rows);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Get Data
        </button>
      </div>

      <div className="bg-slate-900 p-4 rounded text-sm">
        {data.map((d) => (
          <div key={d.id}>
            {d.timestamp} → {d.window_title}
          </div>
        ))}
      </div>
    </div>
  );
}
