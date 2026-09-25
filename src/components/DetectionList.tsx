import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { Leaf, Bug, CheckCircle2, Clock } from 'lucide-react';

const DetectionList = () => {
  const { list, count } = useSelector((state: RootState) => state.detections);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'leaf': return <Leaf size={14} className="text-[#10b981]" />;
      case 'leaf-yellow': return <Leaf size={14} className="text-[#eab308]" />;
      case 'bug': return <Bug size={14} className="text-[#ef4444]" />;
      default: return <Leaf size={14} />;
    }
  };

  return (
    <div className="bg-panel rounded-xl border border-border p-4 shadow-lg h-full flex flex-col min-h-0">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-[15px] font-bold text-white tracking-wide">Pest / Disease Detections</h2>
        <div className="bg-[#162231] px-3 py-1 rounded text-[11px] font-bold text-slate-300">
          {count} detected
        </div>
      </div>

      <div className="overflow-auto flex-1 pr-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[11px] text-slate-500 border-b border-border">
              <th className="pb-2 font-semibold">#</th>
              <th className="pb-2 font-semibold">Type</th>
              <th className="pb-2 font-semibold">Location (Lat, Long)</th>
              <th className="pb-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="text-[13px]">
            {list.map((item) => (
              <tr key={item.id} className="border-b border-border/50 hover:bg-[#162231]/40 transition-colors">
                <td className="py-2 text-slate-500 font-medium">{item.id}</td>
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    {getIcon(item.icon)}
                    <span className="text-slate-300 font-medium">{item.type}</span>
                  </div>
                </td>
                <td className="py-2 text-slate-400 font-mono text-[11px]">{item.location}</td>
                <td className="py-2">
                  {item.status === 'Sprayed' ? (
                    <div className="flex items-center gap-1.5 text-[#10b981]">
                      <CheckCircle2 size={14} />
                      <span className="text-[11px] font-bold uppercase">Sprayed</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[#eab308]">
                      <Clock size={14} />
                      <span className="text-[11px] font-bold uppercase">Pending</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-2 mt-3 pt-3 border-t border-border text-[10px] text-slate-400 font-semibold justify-center uppercase tracking-wider shrink-0">
        <div className="flex items-center gap-1"><CheckCircle2 size={12} className="text-[#10b981]" /> Sprayed</div>
        <div className="flex items-center gap-1"><Clock size={12} className="text-[#eab308]" /> Pending</div>
        <div className="flex items-center gap-1"><Bug size={12} className="text-[#ef4444]" /> Disease</div>
        <div className="flex items-center gap-1"><Leaf size={12} className="text-[#eab308]" /> Nutrient</div>
      </div>
    </div>
  );
};

export default DetectionList;
