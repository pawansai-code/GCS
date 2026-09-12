import React from 'react';
import { Compass, Bug, Crosshair, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Polygon, Polyline, Marker, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Center Coordinate (Tiruvallur area)
const CENTER: [number, number] = [13.1416, 79.9073];

// Farm Boundary
const farmPolygon: [number, number][] = [
  [13.1436, 79.9033],
  [13.1440, 79.9113],
  [13.1400, 79.9105],
  [13.1390, 79.9025],
];

// Scout Route
const scoutRoute: [number, number][] = [
  [13.1430, 79.9040],
  [13.1420, 79.9050],
  [13.1405, 79.9045],
  [13.1393, 79.9060],
  [13.1400, 79.9080],
  [13.1415, 79.9090],
];

// Spray Route
const sprayRoute: [number, number][] = [
  [13.1400, 79.9080],
  [13.1410, 79.9100],
  [13.1390, 79.9110],
];

const createIcon = (colorHex: string, label: string = '', svgIcon: string = '') => L.divIcon({
  className: 'bg-transparent border-0',
  html: `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; transform: scale(1); transition: transform 0.2s;">
       <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="${colorHex}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: ${colorHex}; filter: drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06));"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
       <div style="position: absolute; top: 4px; color: white; font-size: 11px; font-weight: bold; z-index: 10; display: flex; align-items: center; justify-content: center;">
         ${label}
         ${svgIcon}
       </div>
    </div>
  `,
  iconSize: [26, 26],
  iconAnchor: [13, 26]
});

const icons = {
  scout: createIcon('#10b981', 'S'),
  spray: createIcon('#3b82f6', 'S'),
  sprayActive: createIcon('#3b82f6', '', '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/></svg>'),
  pest: createIcon('#ef4444', '', '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4-4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M17.47 9c1.93-.2 3.53-1.9 3.53-4"/><path d="M8 14H4"/><path d="M20 14h-4"/><path d="M9 18h-5"/><path d="M20 18h-5"/></svg>'),
  warning: createIcon('#eab308', '8'),
};

const LiveMap = () => {
  return (
    <div className="bg-panel rounded-xl border border-border shadow-lg h-full relative overflow-hidden flex flex-col">
      {/* Map Header Tabs */}
      <div className="absolute top-4 left-4 z-[400] flex gap-2">
        <button className="bg-[#10b981] text-white px-4 py-1.5 rounded font-medium text-sm shadow-md">Live Map</button>
        <button className="bg-[#0a111a]/80 text-gray-300 hover:text-white px-4 py-1.5 rounded font-medium text-sm border border-border backdrop-blur-sm transition-colors">Heat Map</button>
        <button className="bg-[#0a111a]/80 text-gray-300 hover:text-white px-4 py-1.5 rounded font-medium text-sm border border-border backdrop-blur-sm transition-colors">Satellite</button>
      </div>

      {/* Compass */}
      <div className="absolute top-4 right-4 z-[400] bg-[#0a111a]/80 p-2 rounded-full border border-border backdrop-blur-sm shadow-lg flex flex-col items-center">
        <span className="text-[10px] font-bold text-gray-300 mb-0.5">N</span>
        <Compass size={24} className="text-[#ef4444]" style={{ transform: 'rotate(-45deg)' }} />
      </div>

      {/* Leaflet Map Content */}
      <div className="flex-1 relative bg-[#060b11] z-0">
        <MapContainer 
          center={CENTER} 
          zoom={16} 
          scrollWheelZoom={true} 
          style={{ height: '100%', width: '100%', backgroundColor: '#060b11' }}
          zoomControl={false}
        >
          {/* Dark Mode Tile Layer via OSM + CSS Filter */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="dark-map-tiles"
          />

          {/* Farm Boundary */}
          <Polygon positions={farmPolygon} pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#22c55e', fillOpacity: 0.1 }} />

          {/* Heatmap approximations using Circles */}
          <Circle center={[13.1400, 79.9050]} radius={90} pathOptions={{ color: 'transparent', fillColor: '#ef4444', fillOpacity: 0.6, className: 'blur-md' }} />
          <Circle center={[13.1420, 79.9090]} radius={110} pathOptions={{ color: 'transparent', fillColor: '#ef4444', fillOpacity: 0.6, className: 'blur-md' }} />
          <Circle center={[13.1405, 79.9075]} radius={70} pathOptions={{ color: 'transparent', fillColor: '#eab308', fillOpacity: 0.6, className: 'blur-md' }} />
          <Circle center={[13.1390, 79.9095]} radius={80} pathOptions={{ color: 'transparent', fillColor: '#ef4444', fillOpacity: 0.4, className: 'blur-md' }} />

          {/* Spray Drone Radius Effect */}
          <Circle center={[13.1410, 79.9100]} radius={40} pathOptions={{ color: '#3b82f6', weight: 1, fillColor: '#3b82f6', fillOpacity: 0.2 }} />

          {/* Routes */}
          <Polyline positions={scoutRoute} pathOptions={{ color: '#22c55e', weight: 3, dashArray: '8, 6' }} />
          <Polyline positions={sprayRoute} pathOptions={{ color: '#3b82f6', weight: 3, dashArray: '8, 6' }} />

          {/* Scout Route Markers */}
          {scoutRoute.map((pos, idx) => (
            <Marker key={`scout-${idx}`} position={pos} icon={icons.scout} />
          ))}

          {/* Pest Detections */}
          <Marker position={[13.1405, 79.9045]} icon={icons.pest} />
          <Marker position={[13.1425, 79.9095]} icon={icons.pest} />
          <Marker position={[13.1415, 79.9085]} icon={icons.pest} />
          <Marker position={[13.1385, 79.9105]} icon={icons.pest} />

          {/* Yellow Warning */}
          <Marker position={[13.1405, 79.9075]} icon={icons.warning} />

          {/* Spray Route Markers */}
          <Marker position={[13.1400, 79.9080]} icon={icons.spray} />
          <Marker position={[13.1410, 79.9100]} icon={icons.sprayActive} />
          <Marker position={[13.1390, 79.9110]} icon={icons.spray} />

        </MapContainer>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 right-3 z-[400] bg-[#0a111a]/90 rounded-xl border border-border p-2 backdrop-blur-md shadow-lg flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-[#ef4444] fill-current" />
            <span className="text-[10px] text-slate-300 font-medium">Pest/Disease Detected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-[#3b82f6] fill-current" />
            <span className="text-[10px] text-slate-300 font-medium">Sprayed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 border-b-2 border-[#10b981] border-dashed"></div>
            <span className="text-[10px] text-slate-300 font-medium">Scout Route</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 border-b-2 border-[#3b82f6] border-dashed"></div>
            <span className="text-[10px] text-slate-300 font-medium">Spray Route</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 min-w-[120px] max-w-[150px]">
          <span className="text-[10px] text-slate-400 font-medium">Low</span>
          <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-[#10b981] via-[#eab308] to-[#ef4444] shadow-inner"></div>
          <span className="text-[10px] text-slate-400 font-medium">High</span>
        </div>
      </div>
    </div>
  );
};

export default LiveMap;
