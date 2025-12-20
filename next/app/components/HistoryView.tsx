import React from 'react'
import { ArrowLeft } from 'lucide-react';
import { Card } from "./Card";
const WEEKLY_DATA = [
  { day: "Mon", work: 4.5, distraction: 2.0, score: 78 },
  { day: "Tue", work: 5.2, distraction: 1.8, score: 82 },
  { day: "Wed", work: 3.8, distraction: 3.2, score: 65 },
  { day: "Thu", work: 6.0, distraction: 1.0, score: 90 },
  { day: "Fri", work: 4.7, distraction: 2.5, score: 75 },
];
function HistoryView({ setView }: { setView: (view: "dashboard" | "goals" | "history" | "detail") => void }) {
  return (
       <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <header className="flex items-center gap-4">
               <button onClick={() => setView('dashboard')} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                <ArrowLeft size={20} />
               </button>
              <h2 className="text-3xl font-bold text-white">Historical <span className="text-blue-500">Archives</span></h2>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="space-y-4">
                <Card className="text-center">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Rolling Avg</p>
                  <p className="text-4xl font-black text-emerald-500">85%</p>
                </Card>
                <Card className="text-center">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Peak Distraction</p>
                  <p className="text-lg font-bold text-rose-500">YouTube.exe</p>
                  <p className="text-[10px] text-slate-500">14.2 hrs total</p>
                </Card>
              </div>

              <Card className="lg:col-span-3" title="Weekly Productivity Delta">
                <div className="h-80 flex items-end justify-between px-4 pb-4">
                  {WEEKLY_DATA.map((d, i) => {
                    const max = 8; // scale
                    const wH = (d.work / max) * 100;
                    const dH = (d.distraction / max) * 100;
                    return (
                      <div key={i} className="flex flex-col items-center group w-12">
                        <div className="relative w-full flex flex-col justify-end gap-1" style={{ height: '240px' }}>
                           <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 p-1 rounded text-[10px] whitespace-nowrap z-10 border border-slate-700">
                            Score: {d.score}%
                           </div>
                           <div title="Distraction" className="bg-rose-500/50 w-full rounded-t-sm" style={{ height: `${dH}%` }} />
                           <div title="Work" className="bg-blue-500 w-full rounded-sm shadow-[0_0_15px_rgba(59,130,246,0.3)]" style={{ height: `${wH}%` }} />
                        </div>
                        <p className="mt-3 text-[10px] font-black text-slate-500">{d.day}</p>
                        <p className="text-[10px] font-bold text-white">{(d.work+d.distraction).toFixed(1)}h</p>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-center gap-6 mt-2 pt-4 border-t border-slate-700/50">
                   <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400"><div className="w-2 h-2 bg-blue-500 rounded-full" /> WORK PRODUCT</div>
                   <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400"><div className="w-2 h-2 bg-rose-500/50 rounded-full" /> SIGNAL NOISE</div>
                </div>
              </Card>
            </div>
          </div>
  )
}

export default HistoryView