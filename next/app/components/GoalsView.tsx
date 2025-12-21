import { Card } from "./Card";
import { ArrowLeft } from "lucide-react";
const DUMMY_GOALS = [
    { name: "Code for 6 hours", current: 3.2, target: 6, unit: "hrs" },
    { name: "Documentation", current: 75, target: 100, unit: "%" },
    { name: "Limit Distractions", current: 0.8, target: 1, unit: "hrs" },
];
export default function GoalsView( { setView }: { setView: (v: "dashboard" | "goals" | "history" | "detail" | "profile") => void }) { 

    return ( 
          <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
             <header className="flex items-center gap-4">
               <button onClick={() => setView('dashboard')} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                <ArrowLeft size={20} />
               </button>
              <h2 className="text-3xl font-bold">Protocol <span className="text-blue-500">Directives</span></h2>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Current Active Targets">
                 <div className="space-y-4">
                    {DUMMY_GOALS.map((g, i) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-slate-900 rounded-xl border border-slate-700">
                        <span className="font-bold">{g.name}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-slate-500 font-mono">{g.current}/{g.target} {g.unit}</span>
                          <button className="text-rose-500 text-xs font-bold hover:underline">ABORT</button>
                        </div>
                      </div>
                    ))}
                 </div>
              </Card>

              <Card title="New Objective Parameter">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Description</label>
                    <input type="text" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-lg outline-none focus:border-blue-500" placeholder="e.g. Master Rust Fundamentals" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Threshold</label>
                      <input type="number" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-lg outline-none focus:border-blue-500" placeholder="10" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Metric</label>
                      <select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-lg outline-none focus:border-blue-500">
                        <option>Hours</option>
                        <option>Percent</option>
                        <option>Tasks</option>
                      </select>
                    </div>
                  </div>
                  <button className="w-full bg-blue-600 py-3 rounded-xl font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20">INITIALIZE TARGET</button>
                </div>
              </Card>
            </div>
          </div>

); }
