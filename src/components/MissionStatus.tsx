import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { CheckCircle2, Leaf, Target, Flag, Crosshair, Loader2 } from 'lucide-react';

const MissionStatus = () => {
  const { status, steps } = useSelector((state: RootState) => state.mission);

  const getStepIcon = (id: number) => {
    switch (id) {
      case 1: return <Target size={16} />;
      case 2: return <Leaf size={16} />;
      case 3: return <Crosshair size={16} />;
      case 4: return <Flag size={16} />;
      default: return <Target size={16} />;
    }
  };

  return (
    <div className="bg-panel rounded-xl border border-border p-3 shadow-lg shrink-0">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-[14px] font-bold text-white tracking-wide">Mission Status</h2>
        <div className="bg-[#064e3b]/40 text-[#22c55e] px-2 py-0.5 rounded-md border border-[#10b981]/30 text-[10px] font-semibold">
          {status}
        </div>
      </div>

      <div className="relative ml-4 space-y-4">
        {/* Continuous timeline line */}
        <div className="absolute left-[11px] top-3 bottom-3 w-px bg-[#162231]"></div>
        
        {steps.map((step, index) => {
          const isCompleted = step.status === 'Completed';
          const isInProgress = step.status === 'In Progress';
          
          let circleColor = 'border-[#162231] text-gray-500 bg-[#0a111a]';
          let textColor = 'text-gray-500';
          if (isCompleted) {
            circleColor = 'border-[#10b981] text-[#10b981] bg-[#064e3b]/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
            textColor = 'text-white';
          } else if (isInProgress) {
            circleColor = 'border-[#3b82f6] text-[#3b82f6] bg-[#1e3a8a]/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]';
            textColor = 'text-white';
          }

          return (
            <div key={step.id} className="relative pl-9 flex flex-col">
              {/* Custom Icon Dot */}
              <div className={`absolute -left-3 top-0 w-7 h-7 rounded-full border-2 flex items-center justify-center z-10 ${circleColor}`}>
                {getStepIcon(step.id)}
              </div>
              
              <div className="flex justify-between items-start mb-0.5">
                <span className={`text-[12px] font-bold tracking-wide leading-tight ${textColor} w-32`}>
                  {step.id}. {step.title}
                </span>
                
                {isCompleted && (
                  <div className="flex items-center gap-1 text-[#10b981]">
                    <CheckCircle2 size={10} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Completed</span>
                  </div>
                )}
                {isInProgress && (
                  <div className="flex flex-col items-end gap-0.5 text-[#3b82f6]">
                    <div className="flex items-center gap-1">
                      <Loader2 size={10} className="animate-spin" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">In Progress</span>
                    </div>
                  </div>
                )}
                {!isCompleted && !isInProgress && (
                  <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Pending</span>
                )}
              </div>
              
              <div className="flex justify-between items-center mb-1">
                 <p className="text-[10px] text-slate-400 font-medium">
                   {step.subtitle.includes('8 locations') ? (
                     <>Found: <span className="text-[#3b82f6] cursor-pointer hover:underline">8 locations</span></>
                   ) : step.subtitle}
                 </p>
                 {step.progress > 0 && <span className="text-[10px] font-bold text-white">{step.progress}%</span>}
              </div>
              
              {step.progress > 0 && (
                <div className="w-full bg-[#162231] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-[#10b981]' : 'bg-[#3b82f6]'}`}
                    style={{ width: `${step.progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MissionStatus;
