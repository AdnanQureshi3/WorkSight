import React, { useState } from 'react'

function PythonTracker() {
    const [isConnected, setIsConnected] = useState(false);
  return (
    <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-full">
           <div className={`w-2 h-2 ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'} rounded-full animate-pulse`} />
           <p className="text-xs font-bold text-slate-300  uppercase">Python Tracker: <span className={`text-emerald-500 ${isConnected ? 'text-emerald-500' : 'text-rose-500' }`}>{isConnected ? 'Connected' : 'Disconnected'}</span></p>
        </div>
      </div>
  )
}

export default PythonTracker