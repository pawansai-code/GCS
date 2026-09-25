import React from 'react';
import Header from './components/Header';
import DroneTelemetry from './components/DroneTelemetry';
import LiveMap from './components/LiveMap';
import MissionStatus from './components/MissionStatus';
import DetectionList from './components/DetectionList';
import ActivityLog from './components/ActivityLog';
import SummaryCards from './components/SummaryCards';

function App() {
  return (
    <div className="h-screen w-screen bg-background text-slate-200 flex flex-col p-2 font-sans overflow-auto box-border min-w-[1280px] min-h-[720px]">
      <Header />
      
      <div className="flex-1 grid grid-cols-[330px_minmax(0,1fr)_330px] gap-2 mt-2 min-h-0 pb-1">
        
        {/* Left Column */}
        <div className="grid grid-rows-[minmax(0,1fr)_minmax(0,1fr)] gap-2 min-h-0 min-w-0">
          <div className="min-h-0 min-w-0"><DroneTelemetry type="scout" title="Scout Drone (Analysis)" /></div>
          <div className="min-h-0 min-w-0"><DroneTelemetry type="spray" title="Spray Drone (Pesticide)" /></div>
        </div>
        
        {/* Center Column */}
        <div className="grid grid-rows-[minmax(0,1fr)_190px] gap-2 min-h-0 min-w-0">
          <div className="min-h-0 min-w-0"><LiveMap /></div>
          <div className="min-h-0 min-w-0"><ActivityLog /></div>
        </div>
        
        {/* Right Column */}
        <div className="grid grid-rows-[auto_minmax(0,1fr)_auto] gap-2 min-h-0 min-w-0">
          <div className="min-h-0 min-w-0"><MissionStatus /></div>
          <div className="min-h-0 min-w-0"><DetectionList /></div>
          <div className="min-h-0 min-w-0"><SummaryCards /></div>
        </div>
        
      </div>
    </div>
  );
}

export default App;
