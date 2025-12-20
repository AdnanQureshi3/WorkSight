import React from 'react'
import { Card } from './Card';
import { ArrowLeft } from 'lucide-react';
const RAW_DAILY_LOG = [
    { id: 1, app: "VS Code", log: "Refactoring IPC types 1h 15m", timeStart: "09:00", timeEnd: "10:15" },
    { id: 2, app: "Chrome", log: "Next.js Static Exports Docs 45m, Twitter Scroll 15m", timeStart: "10:15", timeEnd: "11:15" },
    { id: 3, app: "YouTube", log: "Coding Tutorial 1h 0m, Songs 1h 30m", timeStart: "11:15", timeEnd: "13:45" },
    { id: 4, app: "Figma", log: "UX Review 45m", timeStart: "13:45", timeEnd: "14:30" },
    
] 


function DetailView({ setView }: { setView: (view: "dashboard" | "goals" | "history" | "detail") => void }) {
  return (
      <div className="space-y-8 animate-in zoom-in-95 duration-500">
             <header className="flex items-center gap-4">
               <button onClick={() => setView('dashboard')} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                <ArrowLeft size={20} />
               </button>
              <h2 className="text-3xl font-bold">Temporal <span className="text-blue-500">Breakdown</span></h2>
            </header>

            <Card title="AI-Classified Sequential Logic">
              <div className="space-y-6">
                {RAW_DAILY_LOG.map((log, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="h-px bg-slate-700 flex-1" />
                      <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">{log.timeStart} - {log.timeEnd}</span>
                      <div className="h-px bg-slate-700 flex-1" />
                    </div>
                    
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                       <div className="flex items-center justify-between">
                         <span className="text-lg font-black tracking-tighter text-white">{log.app}</span>
                         <span className="text-xs text-slate-500 italic">Context: Active Window</span>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {log.log.split(',').map((task, idx) => {
                             const isWork = task.toLowerCase().includes('coding') || task.toLowerCase().includes('refactor') || task.toLowerCase().includes('tutorial');
                             return (
                               <div key={idx} className={`p-3 rounded-lg border flex items-center justify-between ${
                                 isWork ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'
                               }`}>
                                 <div>
                                   <p className={`text-xs font-bold ${isWork ? 'text-emerald-400' : 'text-rose-400'}`}>{task.replace(/\d+h|\d+m/g, '')}</p>
                                   <p className="text-[10px] text-slate-500 font-bold">{task.match(/\d+h|\d+m/g)?.join(' ')}</p>
                                 </div>
                                 <span className={`text-[8px] font-black uppercase px-2 py-1 rounded ${isWork ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-slate-950'}`}>
                                   {isWork ? 'Productive' : 'Distraction'}
                                 </span>
                               </div>
                             );
                          })}
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
  )
}

export default DetailView