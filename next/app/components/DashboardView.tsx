import { Card } from "./Card";
import { useState, useMemo } from "react";
import { RAW_DAILY_LOG } from "../../data/logs";

import { DashboardViewProps } from "../../types/types";
import {
  Lightbulb,
  Terminal,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
export default function DashboardView({ setView }: DashboardViewProps) {
    const [aiAnalysis, setAiAnalysis] = useState<{
    score: number;
    summary: string;    
    suggestion: string;
    } | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [chatInput, setChatInput] = useState("");
    const [chatResponse, setChatResponse] = useState("");


    const performAIAnalysis = async () => {
    setIsAnalyzing(true);
    const logStr = RAW_DAILY_LOG.map(l => `${l.app}: ${l.log}`).join('; ');
    const prompt = `Analyze this log: [${logStr}]. Categorize "Coding Tutorial" as Work and "Songs/Twitter" as Distraction. 
    Return JSON: { "score": number, "summary": string, "suggestion": string }`;
    
    try {
   
      setAiAnalysis({ score: 85, summary: "Good focus on work-related tasks.", suggestion: "Reduce time on YouTube distractions." } );
    } catch (e) {
      setAiAnalysis({ score: 72, summary: "Offline analysis: Good focus on coding.", suggestion: "Limit YouTube music sessions." });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAskAI = async () => {
    if (!chatInput) return;
    setChatResponse("Processing Command...");
    const prompt = `Based on these logs: ${JSON.stringify(RAW_DAILY_LOG)}, answer: ${chatInput}`;
    try {
      
      setChatResponse("Based on your logs, you had a productive coding session but spent significant time on distractions like YouTube. Keep up the good work and try to limit distractions!");
    } catch (e) {
      setChatResponse("Error connecting to neural link.");
    }
  };

  const parsedActivities = useMemo(() => {
    const list: any[] = [];
    RAW_DAILY_LOG.forEach(entry => {
      const parts = entry.log.split(',').map(p => p.trim());
      parts.forEach(p => {
        const isWork = p.toLowerCase().includes('coding') || p.toLowerCase().includes('tutorial') || p.toLowerCase().includes('refactor');
        list.push({
          app: entry.app,
          task: p.replace(/\d+h|\d+m/g, '').trim(),
          duration: p.match(/\d+h|\d+m/g)?.join(' ') || '',
          type: isWork ? 'work' : 'distraction',
          time: entry.timeStart
        });
      });
    });
    return list;
  }, []);
  return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
              <h2 className="text-3xl font-bold text-white">System Status: <span className="text-blue-500">Optimal</span></h2>
              <p className="text-slate-500">Welcome back, Adnna. Local data synced.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2" title="AI Protocol Summary">
                <div className="flex items-center gap-8 mb-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-slate-700 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                      {isAnalyzing ? (
                        <Loader2 className="animate-spin text-blue-500" />
                      ) : (
                        <>
                          <span className={`text-4xl font-black ${aiAnalysis?.score && aiAnalysis.score > 80 ? 'text-emerald-500' : 'text-orange-400'}`}>
                            {aiAnalysis?.score || '--'}%
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold">FOCUS</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-300 italic text-lg leading-relaxed">
                      "{aiAnalysis?.summary || "Analyzing temporal data patterns..."}"
                    </p>
                    <div className="mt-4 flex items-center text-orange-400 text-sm font-bold bg-orange-400/10 p-2 rounded-lg border border-orange-400/20">
                      <Lightbulb size={16} className="mr-2" />
                      {aiAnalysis?.suggestion || "Classification in progress..."}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-700">
                  <div className="flex items-center text-blue-500 font-bold text-xs mb-3">
                    <Terminal size={14} className="mr-2" /> AI QUERY INTERFACE
                  </div>
                  <div className="bg-slate-950 rounded-lg p-3 font-mono text-xs text-emerald-400 border border-slate-800 mb-3 shadow-inner">
                    {chatResponse ? `> ${chatResponse}` : `> Agent Adnan, waiting for input...`}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:border-blue-500 outline-none"
                      placeholder="Ask AI about your productivity patterns..."
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAskAI()}
                    />
                    <button 
                      onClick={handleAskAI}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-lg font-bold text-sm transition-colors"
                    >
                      EXEC
                    </button>
                  </div>
                </div>
              </Card>

              <Card title="Current Objectives">
                <div className="space-y-6">
                  {[
                    { label: 'Deep Work', cur: 3.5, target: 6, unit: 'hrs', color: 'bg-blue-500' },
                    { label: 'Learning (YT)', cur: 1.0, target: 2, unit: 'hrs', color: 'bg-emerald-500' },
                    { label: 'Distraction Cap', cur: 1.5, target: 1, unit: 'hrs', color: 'bg-rose-500' },
                  ].map((goal, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-400 uppercase tracking-tighter">{goal.label}</span>
                        <span className="text-white">{goal.cur} / {goal.target} {goal.unit}</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${goal.color} shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-1000`} 
                          style={{ width: `${(goal.cur/goal.target)*100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setView('goals')} className="w-full mt-4 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-xs font-bold transition-colors uppercase">
                    Modify Protocols
                  </button>
                </div>
              </Card>
            </div>

            <Card title="Timeline Sequence">
              <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                {parsedActivities.map((act, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-slate-600 transition-colors group">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-slate-500">{act.time}</span>
                      <div>
                        <p className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{act.app}: {act.task}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">{act.duration}</p>
                      </div>
                    </div>
                    <div className={`flex items-center text-[10px] font-black uppercase px-2 py-1 rounded border ${
                      act.type === 'work' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' : 'text-rose-400 border-rose-400/20 bg-rose-400/5'
                    }`}>
                      {act.type === 'work' ? <CheckCircle2 size={12} className="mr-1" /> : <XCircle size={12} className="mr-1" />}
                      {act.type}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setView('detail')} className="mt-4 flex items-center text-blue-500 text-xs font-bold hover:translate-x-1 transition-transform">
                OPEN FULL SEQUENTIAL LOG <ChevronRight size={14} />
              </button>
            </Card>
          </div>
  );
}
