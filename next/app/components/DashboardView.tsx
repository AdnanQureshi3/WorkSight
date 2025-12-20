import { Card } from "./Card";
import  {DashboardViewProps } from "../../types/types";
import { Lightbulb, Terminal, ChevronRight, CheckCircle2, XCircle, Loader2 } from "lucide-react";
export default function DashboardView({
 setView
}: DashboardViewProps) { 
    return ( 
      
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header className="flex items-center gap-4">
                    <h2 className="text-3xl font-bold">Protocol <span className="text-blue-500">Overview</span></h2>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card title="System Status">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-700">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={20} className="text-green-500" />
                                    <span>System Operational</span>
                                </div>
                                <span className="text-xs text-slate-500">Online</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-700">
                                <div className="flex items-center gap-2">
                                    <Loader2 size={20} className="text-blue-500 animate-spin" />
                                    <span>Processing Logs</span>
                                </div>
                                <span className="text-xs text-slate-500">Active</span>
                            </div>
                        </div>
                    </Card>

                    <Card title="Recent Activity">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-700">
                                <div className="flex items-center gap-2">
                                    <Terminal size={20} />
                                    <span>Terminal Session Started</span>
                                </div>
                                <ChevronRight size={16} />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-700">
                                <div className="flex items-center gap-2">
                                    <Lightbulb size={20} />
                                    <span>Task Completed Successfully</span>
                                </div>
                                <ChevronRight size={16} />
                            </div>
                        </div>
                    </Card>

                    {/* Add more cards here if needed */}
                </div>

          </div>
    
); }
