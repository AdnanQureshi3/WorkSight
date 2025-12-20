import React from 'react'
import { LayoutDashboard, Target, History, User } from 'lucide-react';
import { SideBarProps } from '../../types/types';
function SideBar({

    view, setView,
    
}: SideBarProps
) {
  return (
    <div><aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-black text-blue-500 tracking-tighter italic">WORKSIGHT.</h1>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Terminal V1.0</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'goals', icon: Target, label: 'Targets' },
            { id: 'history', icon: History, label: 'Archives' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id as any)}
              className={`w-full flex items-center p-3 rounded-lg transition-all ${
                view === item.id ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="font-semibold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

     
      </aside></div>
  )
}

export default SideBar