"use client";
import { useState } from "react";
import App from "./app";

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
    <App/>
  );
}
