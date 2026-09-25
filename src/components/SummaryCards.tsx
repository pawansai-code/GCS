import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { Leaf, Crosshair } from 'lucide-react';

const SummaryCards = () => {
  const { stats } = useSelector((state: RootState) => state.mission);

  return (
    <div className="grid grid-cols-2 gap-2 shrink-0">
      {/* Area Scanned Card */}
      <div className="bg-panel rounded-xl border border-border p-3 shadow-lg flex items-center justify-between hover:bg-[#162231]/30 transition-colors cursor-default">
        <div className="flex flex-col gap-1">
          <div className="flex items-start gap-1.5 text-slate-400">
            <Leaf size={14} className="text-[#10b981] mt-0.5 shrink-0" />
            <span className="text-[10px] font-semibold leading-tight max-w-[60px]">Total Area Scanned</span>
          </div>
          <span className="text-[13px] font-bold text-white tracking-wide mt-1">{stats.areaScanned}</span>
        </div>
        
        {/* Progress Circle (CSS based) */}
        <div className="relative w-[40px] h-[40px] flex justify-center items-center shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3.5" fill="transparent" className="text-[#162231]" />
            <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3.5" fill="transparent" strokeDasharray={`${stats.scannedPercent * 1.0} 100.5`} className="text-[#10b981] drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]" strokeLinecap="round" />
          </svg>
          <span className="absolute text-[9px] font-bold text-white">{stats.scannedPercent}%</span>
        </div>
      </div>

      {/* Locations Sprayed Card */}
      <div className="bg-panel rounded-xl border border-border p-3 shadow-lg flex items-center justify-between hover:bg-[#162231]/30 transition-colors cursor-default">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Crosshair size={14} className="text-[#3b82f6] shrink-0" />
            <span className="text-[10px] font-semibold leading-tight">Total Sprayed</span>
          </div>
          <div className="flex flex-col mt-1 leading-tight">
            <span className="text-[14px] font-bold text-white tracking-wide">3 / 8</span>
            <span className="text-[11px] font-bold text-white">locations</span>
          </div>
        </div>
        
        {/* Progress Circle (CSS based) */}
        <div className="relative w-[40px] h-[40px] flex justify-center items-center shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3.5" fill="transparent" className="text-[#162231]" />
            <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3.5" fill="transparent" strokeDasharray={`${stats.sprayedPercent * 1.0} 100.5`} className="text-[#3b82f6] drop-shadow-[0_0_4px_rgba(59,130,246,0.5)]" strokeLinecap="round" />
          </svg>
          <span className="absolute text-[9px] font-bold text-white">{stats.sprayedPercent}%</span>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
