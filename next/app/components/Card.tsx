import React, { useState } from 'react'

type CardProps = {
  appdata: {
    app_name: string;
    total_time: number;
    windows: {
      window_title: string;
      time: number;
    }[];
  };
};

export default function Card({ appdata }: CardProps) {
  const [isOpen, setOpen] = useState(false);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return "< 1 min";

    const mins = Math.floor(seconds / 60);
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const rem = mins % 60;
      return `${hrs} hr ${rem} min`;
    }

    return `${mins} min`;
  };

  return (
    <div className="p-3">
      <h3 className="font-bold">{appdata.app_name}</h3>

      <p>Total Time: {formatTime(appdata.total_time)}</p>

      {isOpen && (
        <ul className="mt-2 text-sm text-slate-400">
          {appdata.windows.map((w, i) => (
            <li key={i}>
              {w.window_title} — {formatTime(w.time)}
            </li>
          ))}
        </ul>
      )}

      <button onClick={() => setOpen(!isOpen)}>
        Show/Hide
      </button>
    </div>
  );
}
