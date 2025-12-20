export const Card = ({ children, className = "", title }: { children: React.ReactNode, className?: string, title?: string }) => (

  <div className={`bg-slate-800/50 border border-slate-700 rounded-xl p-5 shadow-xl backdrop-blur-sm hover:border-blue-500/30 transition-all ${className}`}>
    {title && <h3 className="text-blue-400 font-bold mb-4 uppercase tracking-tighter text-sm">{title}</h3>}
    {children}
  </div>
);