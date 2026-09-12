import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { AlertCircle, CheckCircle2, PlayCircle, Crosshair, Navigation, ChevronDown } from 'lucide-react';

const ActivityLog = () => {
  const { logs } = useSelector((state: RootState) => state.activity);

  const getIcon = (level: string, type: string) => {
    if (type === 'scout' && level === 'success') return <CheckCircle2 size={16} className="text-[#10b981]" />;
    if (type === 'spray' && level === 'info') return <Crosshair size={16} className="text-[#3b82f6]" />;
    if (level === 'error') return <AlertCircle size={16} className="text-[#ef4444]" />;
    if (level === 'info') return <Navigation size={16} className="text-[#3b82f6]" />;
    if (level === 'success') return <PlayCircle size={16} className="text-[#10b981]" />;
    return <CheckCircle2 size={16} className="text-[#10b981]" />; // fallback
  };

  return (
    <div className="bg-panel rounded-xl border border-border p-4 shadow-lg h-full flex flex-col min-h-0">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-[15px] font-bold text-white tracking-wide">Activity Log</h2>
        <div className="relative">
          <select className="appearance-none bg-[#0a111a] text-xs text-slate-300 font-medium rounded-lg pl-3 pr-8 py-1.5 border border-border outline-none focus:border-[#3b82f6] transition-colors cursor-pointer">
            <option>All Events</option>
            <option>Errors</option>
            <option>Scout Events</option>
            <option>Spray Events</option>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="overflow-auto flex-1 pr-2 space-y-0.5 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-3 py-1.5 hover:bg-[#162231]/50 rounded px-2 transition-colors">
            <span className="text-[11px] text-slate-400 font-mono w-10 shrink-0 mt-0.5">{log.time}</span>
            <div className="mt-0.5 shrink-0">
              {getIcon(log.level, log.type)}
            </div>
            <p className="text-[13px] text-slate-300 leading-snug">
              {log.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityLog;
