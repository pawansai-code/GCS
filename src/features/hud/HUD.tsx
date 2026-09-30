import { Telemetry } from "../../lib/telemetry";

// ---------------------------------------------------------
// HUD CONFIGURATION CONSTANTS
// ---------------------------------------------------------
const COMPASS_SPAN = 60; // Degrees of heading shown on either side of the center marker
const TAPE_SPAN = 14; // Units (m or m/s) shown on either side of the center value on speed/altitude tapes
const PITCH_MARKS = [20, 10, 5, -5, -10, -20]; // The pitch degrees where ladder rungs will be drawn
const ROLL_MARKS = [-60, -45, -30, -20, -10, 0, 10, 20, 30, 45, 60]; // The bank angles shown on the roll arc
const HEADING_NAMES: Record<number, string> = {
  45: "NE",
  90: "E",
  135: "SE",
  180: "S",
  225: "SW",
  270: "W",
  315: "NW",
};
const GPS_NAMES = [
  "No GPS",
  "No Fix",
  "2D Fix",
  "3D Fix",
  "DGPS",
  "RTK Float",
  "RTK Fixed",
];

// ---------------------------------------------------------
// UTILITY FUNCTIONS
// ---------------------------------------------------------
// Pads a number with leading zeros (e.g., 5 -> "05")
const pad = (n: number) => String(Math.floor(n)).padStart(2, "0");
// Formats seconds into HH:MM:SS
const formatTime = (s: number) =>
  `${pad(s / 3600)}:${pad((s % 3600) / 60)}:${pad(s % 60)}`;
// Wraps heading values between 0 and 360 degrees (e.g., -10 -> 350)
const normalizeHeading = (d: number) => ((Math.round(d) % 360) + 360) % 360;

// ---------------------------------------------------------
// COMPASS COMPONENT
// The horizontal strip at the top showing aircraft heading.
// ---------------------------------------------------------
function Compass({ heading }: { heading: number }) {
  const ticks = [];
  
  // Calculate which ticks are currently visible based on the aircraft's current heading
  for (
    let d = Math.ceil((heading - COMPASS_SPAN) / 5) * 5;
    d <= heading + COMPASS_SPAN;
    d += 5
  ) {
    const n = normalizeHeading(d);
    const major = n % 15 === 0; // Draw a thicker line and add a label every 15 degrees
    
    ticks.push(
      <div
        key={d}
        // Tailwind styling for the tick mark itself
        className={`absolute bottom-0 bg-white ${major ? "h-[1.6cqw]" : "h-[1cqw]"} w-[0.1cqw]`}
        // Dynamically shift the tick left or right depending on the exact aircraft heading
        style={{ left: `calc(50% + ${d - heading} * 0.38 * 1cqw)` }}
      >
        {major && (
          <span className="absolute bottom-[1.9cqw] left-1/2 -translate-x-1/2 text-[1.5cqw] font-bold whitespace-nowrap">
            {HEADING_NAMES[n] ?? n}
          </span>
        )}
      </div>,
    );
  }
  
  return (
    <div className="absolute top-0 left-1/2 w-[46cqw] h-[4.6cqw] -translate-x-1/2 overflow-hidden z-[3] bg-gradient-to-b from-[#4b4fc2] to-[#2f3390] border-b-[0.15cqw] border-white/50">
      {/* Render the dynamically positioned ticks */}
      {ticks}
      {/* Fixed red center marker triangle */}
      <div className="absolute left-1/2 top-0 z-[1] -translate-x-1/2 border-x-[0.9cqw] border-x-transparent border-t-[1.2cqw] border-t-[#e5202a]" />
      {/* Box showing the exact current heading in numbers */}
      <div className="absolute left-1/2 top-[1cqw] w-[5.2cqw] h-[2.6cqw] -translate-x-1/2 grid place-items-center bg-white text-black text-[1.7cqw] font-bold">
        {String(normalizeHeading(heading)).padStart(3, "0")}
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// ROLL ARC COMPONENT
// The curved meter that visually represents bank angle (roll).
// ---------------------------------------------------------
const ARC = { cx: 200, cy: 140, r: 110 }; // Center X, Center Y, and Radius of the SVG arc

// Converts a degree and a radius into precise X,Y coordinates on the SVG canvas
const polar = (deg: number, r: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  return [ARC.cx + r * Math.sin(a), ARC.cy - r * Math.cos(a)];
};

function RollArc({ roll }: { roll: number }) {
  // Calculate the start (-60 deg) and end (+60 deg) points of the curved path
  const [x1, y1] = polar(-60, ARC.r);
  const [x2, y2] = polar(60, ARC.r);
  
  return (
    <svg
      className="absolute top-[0.4cqw] left-1/2 w-[34cqw] -translate-x-1/2 overflow-visible drop-shadow-[0_0_0.2cqw_#000]"
      viewBox="0 0 400 100"
    >
      {/* The main curved track line */}
      <path
        d={`M${x1} ${y1} A${ARC.r} ${ARC.r} 0 0 1 ${x2} ${y2}`}
        fill="none"
        stroke="#ddd"
        strokeWidth="1.5"
      />
      
      {/* Draw the tick marks and text numbers along the curved track */}
      {ROLL_MARKS.map((m) => {
        const major = m % 30 === 0;
        const [ax, ay] = polar(m, ARC.r);
        const [bx, by] = polar(m, ARC.r + (major ? 12 : 8));
        const [tx, ty] = polar(m, ARC.r + 21);
        
        return (
          <g key={m}>
            <line
              x1={ax}
              y1={ay}
              x2={bx}
              y2={by}
              stroke="#fff"
              strokeWidth="2"
            />
            <text
              x={tx}
              y={ty + 4}
              textAnchor="middle"
              fill="#fff"
              fontSize="11"
              fontWeight="bold"
            >
              {Math.abs(m)}
            </text>
          </g>
        );
      })}
      
      {/* Fixed red center reference triangle at 0 degrees */}
      <polygon points="200,30 195,20 205,20" fill="#e5202a" />
      
      {/* Moving white pointer that rotates along the arc according to the aircraft's roll */}
      <g transform={`rotate(${roll} ${ARC.cx} ${ARC.cy})`}>
        <polygon
          points="200,32 194,45 206,45"
          fill="#fff"
          stroke="#000"
          strokeWidth="0.8"
        />
      </g>
    </svg>
  );
}

// ---------------------------------------------------------
// TAPE COMPONENT (Speed & Altitude)
// Vertical scrolling number ladders on the left and right.
// ---------------------------------------------------------
function Tape({
  value,
  side, // "left" for speed, "right" for altitude
  unit,
  decimals = 0,
}: {
  value: number;
  side: string;
  unit: string;
  decimals?: number;
}) {
  const ticks = [];
  
  // Calculate which numbers should be visible within the tape's viewport
  for (
    let i = Math.floor(value - TAPE_SPAN);
    i <= Math.ceil(value + TAPE_SPAN);
    i++
  ) {
    const major = i % 5 === 0; // Display a number string every 5 units
    
    ticks.push(
      <div
        key={i}
        className={`absolute bg-white h-[0.1cqw] ${major ? "w-[2.2cqw]" : "w-[1.2cqw]"} ${side === "left" ? "right-0" : "left-0"}`}
        // Shift the tick up or down dynamically based on exact telemetry values (smooth scrolling)
        style={{ top: `calc(50% - ${i - value} * 1.1 * 1cqw)` }}
      >
        {major && (
          <span
            className={`absolute top-1/2 -translate-y-1/2 text-[1.5cqw] font-bold drop-shadow-[0_0_0.3cqw_rgba(0,0,0,1)] ${side === "left" ? "right-[2.8cqw]" : "left-[2.8cqw]"}`}
          >
            {i}
          </span>
        )}
      </div>,
    );
  }
  
  return (
    <div
      className={`absolute top-1/2 w-[7cqw] h-[26cqw] -translate-y-1/2 bg-black/30 border-[0.12cqw] border-white/55 ${side === "left" ? "left-[5cqw]" : "right-[5cqw]"}`}
    >
      {/* CSS Mask makes the top and bottom of the tape gently fade to transparent */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(transparent, #000 15%, #000 85%, transparent)",
          WebkitMaskImage:
            "linear-gradient(transparent, #000 15%, #000 85%, transparent)",
        }}
      >
        {ticks}
      </div>
      
      {/* The solid black box in the center showing the exact current value */}
      <div
        className={`absolute top-1/2 min-w-[8cqw] -translate-y-1/2 px-[0.6cqw] py-[0.3cqw] bg-black border-[0.12cqw] border-white text-[1.8cqw] font-bold text-center whitespace-nowrap ${side === "left" ? "left-0" : "right-0"}`}
      >
        {value.toFixed(decimals)} {unit}
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// MAIN HUD COMPONENT
// Combines everything and handles the Artificial Horizon background.
// ---------------------------------------------------------
export default function HUD({ telemetry }: { telemetry: Telemetry }) {
  const t = telemetry;
  const status = t.status ?? (t.armed ? "ARMED" : "DISARMED");
  const gs = t.groundSpeed ?? t.speed;
  const gpsText = GPS_NAMES[t.gps] ?? "Unknown";
  
  // Ready to Arm condition: Needs good 3D GPS lock, healthy EKF, and acceptable vibration
  const ready = t.gps >= 3 && t.ekf && t.vibration === "OK";
  
  const batteryLevel =
    t.battery < 15
      ? "bg-[#e5202a]"
      : t.battery < 30
        ? "bg-[#ffb020]"
        : "bg-[#3ee05a]";

  return (
    // Base container uses `cqw` (Container Query Width). 
    // This allows all text and padding inside to scale perfectly whether the HUD is fullscreen or in a tiny window!
    <div
      className="relative w-[min(100%,calc(100vh*16/9))] aspect-video mx-auto overflow-hidden bg-black text-white font-sans select-none"
      style={{ containerType: "size" }}
    >
      <Compass heading={t.heading} />

      {/* Viewport for the artificial horizon, cropped below the compass */}
      <div className="absolute inset-x-0 top-[4.6cqw] bottom-0 overflow-hidden">
        
        {/* 
          ARTIFICIAL HORIZON CONTAINER
          This is an oversized square box containing the sky, ground, and pitch ladder.
          By rotating and shifting this single massive container, we emulate the movement of the aircraft!
          Note: Roll is negated because when the aircraft banks right, the world appears to tilt left.
        */}
        <div
          className="absolute left-1/2 top-1/2 w-[300cqw] h-[300cqw] -ml-[150cqw] -mt-[150cqw] will-change-transform"
          style={{
            transform: `rotate(calc(${t.roll} * -1deg)) translateY(calc(${t.pitch} * 0.8 * 1cqw))`,
          }}
        >
          {/* Blue Sky */}
          <div className="absolute inset-x-0 top-0 bottom-1/2 bg-gradient-to-t from-[#8ccdf0] via-[#4aa0da] via-[25cqw] to-[#2a78c0]" />
          {/* Brown Ground */}
          <div className="absolute inset-x-0 top-1/2 bottom-0 bg-gradient-to-b from-[#8a8a3a] via-[#6b6a2a] via-[25cqw] to-[#3f3d17]" />
          {/* The true horizon line separating sky and ground */}
          <div className="absolute left-0 right-0 top-1/2 h-[0.18cqw] -mt-[0.09cqw] bg-white shadow-[0_0_0.3cqw_rgba(0,0,0,0.6)]" />

          {/* Render the Pitch Ladder lines on top of the sky/ground */}
          {PITCH_MARKS.map((p) => (
            <div
              key={p}
              className="absolute left-1/2 flex items-center gap-[0.6cqw] drop-shadow-[0_0_0.3cqw_rgba(0,0,0,1)]"
              style={{
                top: `calc(50% - ${p} * 0.8 * 1cqw)`, // 0.8 is the scaling factor for pitch
                transform: "translate(-50%, -50%)",
              }}
            >
              <span className="w-[2.8cqw] text-center text-[1.4cqw] font-bold">
                {p > 0 ? `+${p}` : p}
              </span>
              <i
                className={`block h-[0.14cqw] bg-white shadow-[0_0_0.2cqw_#000] ${Math.abs(p) === 5 ? "w-[5cqw]" : "w-[11cqw]"}`}
              />
              <span className="w-[2.8cqw] text-center text-[1.4cqw] font-bold">
                {p > 0 ? `+${p}` : p}
              </span>
            </div>
          ))}
        </div>

        {/* The components below are fixed to the screen glass, they DO NOT tilt with the horizon */}
        
        <RollArc roll={t.roll} />

        {/* Fixed red aircraft reticle in the dead center */}
        <svg
          className="absolute left-1/2 top-1/2 w-[20cqw] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_0.2cqw_#000]"
          viewBox="0 0 200 60"
        >
          <path
            d="M8 30 H72 L100 52 L128 30 H192"
            fill="none"
            stroke="#e5202a"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <circle cx="100" cy="30" r="4.5" fill="#3ee05a" />
        </svg>
        
        {/* Arming Status Text (ARMED, DISARMED, etc) */}
        <div
          className={`absolute left-1/2 top-[calc(50%-9cqw)] -translate-x-1/2 text-[2.6cqw] font-bold drop-shadow-[0_0_0.3cqw_rgba(0,0,0,1)] ${status.toLowerCase() === "armed" ? "text-[#3ee05a]" : status.toLowerCase() === "standby" ? "text-[#ffb020]" : "text-[#e5202a]"}`}
        >
          {status}
        </div>

        <Tape value={t.speed} side="left" unit="m/s" decimals={1} />
        <Tape value={t.altitude} side="right" unit="m" />

        {/* Top Right: Battery Indicator */}
        <div className="absolute top-[1cqw] right-[1.5cqw] flex items-center gap-[0.8cqw] text-[1.9cqw] font-bold drop-shadow-[0_0_0.3cqw_rgba(0,0,0,1)]">
          <div className="relative w-[4cqw] h-[2cqw] border-[0.2cqw] border-white rounded-[0.3cqw] bg-black/45 after:content-[''] after:absolute after:-right-[0.7cqw] after:top-[0.4cqw] after:w-[0.4cqw] after:h-[0.8cqw] after:bg-white">
            <div
              className={`absolute left-0 top-0 bottom-0 ${batteryLevel}`}
              style={{ width: `${Math.min(100, Math.max(0, t.battery))}%` }}
            />
          </div>
          <span>{Math.round(t.battery)}%</span>
          <span className="tabular-nums">{formatTime(t.flightTime)}</span>
        </div>

        {/* Bottom Left: Speed and Battery Stats */}
        <div className="absolute bottom-[1cqw] left-[1.5cqw] drop-shadow-[0_0_0.3cqw_rgba(0,0,0,1)] font-bold">
          <div className="text-[2.4cqw] leading-[1.15]">
            <div>AS {t.speed.toFixed(1)} m/s</div>
            <div>GS {gs.toFixed(1)} m/s</div>
          </div>
          <div className="text-[1.5cqw]">
            Bat {t.voltage.toFixed(2)}v {t.current.toFixed(1)} A{" "}
            {Math.round(t.battery)}%
          </div>
        </div>

        {/* Bottom Center: System Health & Flight Mode Alerts */}
        <div className="absolute bottom-[1cqw] left-1/2 -translate-x-1/2 text-center drop-shadow-[0_0_0.3cqw_rgba(0,0,0,1)] font-bold">
          <div
            className={`text-[2.4cqw] ${ready ? "text-[#3ee05a]" : "text-[#e5202a]"}`}
          >
            {t.armed
              ? t.flightMode
              : ready
                ? "Ready to Arm"
                : "Not Ready to Arm"}
          </div>
          <div className="flex justify-center gap-[2cqw] text-[1.6cqw]">
            <span className={t.ekf ? "text-[#3ee05a]" : "text-[#ff4b4b]"}>
              EKF
            </span>
            <span
              className={
                t.vibration === "OK" ? "text-[#3ee05a]" : "text-[#ff4b4b]"
              }
            >
              Vibe
            </span>
          </div>
        </div>

        {/* Bottom Right: GPS & Navigation Data */}
        <div className="absolute bottom-[1cqw] right-[1.5cqw] text-right text-[2cqw] leading-[1.2] drop-shadow-[0_0_0.3cqw_rgba(0,0,0,1)] font-bold">
          <div>{t.flightMode}</div>
          <div>
            {Math.round(t.wpDistance)}m&gt;{t.wpIndex}
          </div>
          <div className={t.gps >= 3 ? "text-[#3ee05a]" : "text-[#ff4b4b]"}>
            GPS: {gpsText}
          </div>
        </div>
      </div>
    </div>
  );
}
