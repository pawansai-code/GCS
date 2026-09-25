import React from 'react';
import { Leaf, Wifi, Cloud, Clock } from 'lucide-react';

const Header = () => {
  return (
    <header className="flex justify-between items-center bg-panel px-5 py-2.5 rounded-xl border border-border shadow-lg shrink-0">
      <div className="flex items-center gap-3">
        <div className="bg-[#10b981]/20 p-2 rounded-xl">
          <Leaf className="text-[#10b981]" size={24} />
        </div>
        <div className="flex flex-col">
          <h1 className="text-[17px] font-bold text-white tracking-wide leading-tight">Smart Farming Assistant</h1>
          <p className="text-[12px] text-slate-400 font-medium mt-0.5 leading-tight">Drone Ground Control Station</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 bg-[#064e3b]/40 px-3 py-1.5 rounded-full border border-[#10b981]/30">
          <div className="w-2 h-2 rounded-full bg-[#22c55e] shadow-[0_0_8px_#22c55e]"></div>
          <span className="text-[#22c55e] text-xs font-semibold">System Online</span>
        </div>
        
        <div className="flex items-center gap-2 text-slate-400">
          <Wifi size={18} className="text-[#10b981]" />
          <span className="text-xs font-medium">GPS Good</span>
        </div>

        <div className="w-px h-6 bg-border"></div>

        <div className="flex items-center gap-2.5 text-slate-400">
          <Cloud size={20} />
          <div className="flex flex-col">
            <span className="text-xs text-white font-bold leading-tight">28°C</span>
            <span className="text-[10px] font-medium leading-tight">Partly Cloudy</span>
          </div>
        </div>

        <div className="w-px h-6 bg-border"></div>

        <div className="flex items-center gap-2.5 text-slate-400">
          <Clock size={20} />
          <div className="flex flex-col">
            <span className="text-xs text-white font-bold leading-tight">10:24 AM</span>
            <span className="text-[10px] font-medium leading-tight">12 Sep 2026</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
