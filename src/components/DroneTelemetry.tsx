import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { Crosshair, Battery, Navigation, Compass, Radio, Target } from 'lucide-react';

interface Props {
  type: 'scout' | 'spray';
  title: string;
}

const DroneTelemetry: React.FC<Props> = ({ type, title }) => {
  const data = useSelector((state: RootState) => state.telemetry[type]);
  const isScout = type === 'scout';

  return (
    <div className="bg-panel rounded-xl border border-border p-3 shadow-lg flex flex-col gap-2 h-full min-h-0">
      <div className="flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg ${isScout ? 'bg-[#10b981]/20' : 'bg-[#3b82f6]/20'}`}>
            <Target className={isScout ? 'text-[#10b981]' : 'text-[#3b82f6]'} size={20} />
          </div>
          <h2 className="font-semibold text-white tracking-wide text-[13px]">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#22c55e] shadow-[0_0_8px_#22c55e]"></div>
          <span className="text-[#22c55e] text-[11px] font-semibold">Online</span>
        </div>
      </div>

      <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 flex-1 min-h-0 border border-border">
        <div className="absolute inset-0 flex items-center justify-center bg-[#0d1621] text-gray-500">
           {/* Placeholder for actual video feed */}
           <div className="w-full h-full opacity-30 flex items-center justify-center border border-dashed border-gray-600 m-2">
              <span className="text-[10px] uppercase tracking-widest">{isScout ? 'Scout Feed' : 'Spray Feed'}</span>
           </div>
        </div>
        
        {/* Top Overlay */}
        <div className="absolute top-2 left-2 bg-black/70 px-1.5 py-0.5 rounded text-[9px] text-white backdrop-blur-sm">
          CAM {isScout ? '1' : '2'} - Live Feed
        </div>
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          <div className="bg-black/70 px-1.5 py-0.5 rounded text-[9px] text-white font-bold backdrop-blur-sm">
            HD
          </div>
          {isScout && (
            <div className="border border-accent-red p-1 bg-black/40 backdrop-blur-sm rounded">
               <div className="bg-accent-red/20 px-1.5 py-0.5 text-accent-red text-[9px] font-bold border border-accent-red">Disease</div>
               <div className="w-8 h-8 border-2 border-accent-red mt-1"></div>
            </div>
          )}
        </div>

        {/* Bottom OSD Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-6 pb-1.5 px-2 flex justify-between items-end text-[10px] text-white">
          <div className="flex gap-2 items-center font-bold">
            <span className="flex items-center gap-1 drop-shadow-md"><Navigation size={12} className="text-[#10b981]"/> {data.altitude}</span>
            <span className="flex items-center gap-1 drop-shadow-md"><Compass size={12} className="text-[#10b981]"/> {data.speed}</span>
            <span className="flex items-center gap-1 drop-shadow-md"><Battery size={12} className="text-[#10b981]"/> {data.battery}%</span>
          </div>
          <div className="flex gap-2 items-center text-slate-200 font-medium text-[9px]">
            <span className="drop-shadow-md">{data.heading}</span>
            <span className="drop-shadow-md">{data.gps}</span>
            <span className="flex items-center gap-1 drop-shadow-md text-white font-bold"><Target size={12} className="text-[#10b981]"/> {data.mode}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DroneTelemetry;
