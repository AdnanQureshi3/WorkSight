"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [msg, setMsg] = useState("");
  const [count, setCount] = useState(0);

  useEffect(() => {
    window.electronAPI.receive(
      "electron-to-nextjs",
      (message: string) => {
        setMsg(message);
      }
    );
  }, []);

  const sendToElectron = () => {
    setCount(count + 1);
    console.log("Sending message to Electron...");
    window.electronAPI.send("nextjs-to-electron", {
      message: "Hello from Next.js",
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <button onClick={sendToElectron}>Send {count}</button>
      <p>{msg}</p>
    </div>
  );
}
