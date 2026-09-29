import "./HUD.css";

const COMPASS_SPAN = 60; // degrees shown each side of heading
const TAPE_SPAN = 14; // units shown each side of value on tapes
const PITCH_MARKS = [20, 10, 5, -5, -10, -20]; // 0 is the horizon line itself
const ROLL_MARKS = [-60, -45, -30, -20, -10, 0, 10, 20, 30, 45, 60];
const HEADING_NAMES = { 45: "NE", 90: "E", 135: "SE", 180: "S", 225: "SW", 270: "W", 315: "NW" };
const GPS_NAMES = ["No GPS", "No Fix", "2D Fix", "3D Fix", "DGPS", "RTK Float", "RTK Fixed"];

const pad = (n) => String(Math.floor(n)).padStart(2, "0");
const formatTime = (s) => `${pad(s / 3600)}:${pad((s % 3600) / 60)}:${pad(s % 60)}`;
const normalizeHeading = (d) => ((Math.round(d) % 360) + 360) % 360;

// ---------------- COMPASS ----------------
function Compass({ heading }) {
  const ticks = [];
  for (let d = Math.ceil((heading - COMPASS_SPAN) / 5) * 5; d <= heading + COMPASS_SPAN; d += 5) {
    const n = normalizeHeading(d);
    const major = n % 15 === 0;
    ticks.push(
      <div key={d} className={`compass__tick${major ? " compass__tick--major" : ""}`} style={{ "--off": d - heading }}>
        {major && <span>{HEADING_NAMES[n] ?? n}</span>}
      </div>
    );
  }
  return (
    <div className="compass">
      {ticks}
      <div className="compass__marker" />
      <div className="compass__center">{String(normalizeHeading(heading)).padStart(3, "0")}</div>
    </div>
  );
}

// ---------------- ROLL ARC (fixed) ----------------
const ARC = { cx: 200, cy: 140, r: 110 };
const polar = (deg, r) => {
  const a = (deg * Math.PI) / 180;
  return [ARC.cx + r * Math.sin(a), ARC.cy - r * Math.cos(a)];
};

function RollArc({ roll }) {
  const [x1, y1] = polar(-60, ARC.r);
  const [x2, y2] = polar(60, ARC.r);
  return (
    <svg className="roll-arc" viewBox="0 0 400 100">
      <path d={`M${x1} ${y1} A${ARC.r} ${ARC.r} 0 0 1 ${x2} ${y2}`} fill="none" stroke="#ddd" strokeWidth="1.5" />
      {ROLL_MARKS.map((m) => {
        const major = m % 30 === 0;
        const [ax, ay] = polar(m, ARC.r);
        const [bx, by] = polar(m, ARC.r + (major ? 12 : 8));
        const [tx, ty] = polar(m, ARC.r + 21);
        return (
          <g key={m}>
            <line x1={ax} y1={ay} x2={bx} y2={by} stroke="#fff" strokeWidth="2" />
            <text x={tx} y={ty + 4} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">
              {Math.abs(m)}
            </text>
          </g>
        );
      })}
      {/* fixed reference (red) and moving bank pointer (white) both ride on the fixed arc */}
      <polygon points="200,30 195,20 205,20" fill="#e5202a" />
      <g transform={`rotate(${roll} ${ARC.cx} ${ARC.cy})`}>
        <polygon points="200,32 194,45 206,45" fill="#fff" stroke="#000" strokeWidth="0.8" />
      </g>
    </svg>
  );
}

// ---------------- SPEED / ALTITUDE TAPE ----------------
function Tape({ value, side, unit, decimals = 0 }) {
  const ticks = [];
  for (let i = Math.floor(value - TAPE_SPAN); i <= Math.ceil(value + TAPE_SPAN); i++) {
    const major = i % 5 === 0;
    ticks.push(
      <div key={i} className={`tape__tick${major ? " tape__tick--major" : ""}`} style={{ "--off": i - value }}>
        {major && <span>{i}</span>}
      </div>
    );
  }
  return (
    <div className={`tape tape--${side}`}>
      <div className="tape__scale">{ticks}</div>
      <div className="tape__value">
        {value.toFixed(decimals)} {unit}
      </div>
    </div>
  );
}

// ---------------- HUD ----------------
export default function HUD({ telemetry }) {
  const t = telemetry;
  const status = t.status ?? (t.armed ? "ARMED" : "DISARMED");
  const gs = t.groundSpeed ?? t.speed;
  const gpsText = GPS_NAMES[t.gps] ?? "Unknown";
  const ready = t.gps >= 3 && t.ekf && t.vibration === "OK";
  const batteryLevel = t.battery < 15 ? "critical" : t.battery < 30 ? "low" : "ok";

  return (
    <div className="hud">
      {/* COMPASS (fixed) */}
      <Compass heading={t.heading} />

      <div className="hud-screen">
        {/* MOVING HORIZON — one container, one transform: sky + ground + horizon + ladder */}
        <div className="horizon" style={{ "--pitch": t.pitch, "--roll": t.roll }}>
          <div className="horizon__sky" />
          <div className="horizon__ground" />
          <div className="horizon__line" />

          {/* PITCH LADDER (0° is the horizon line above, so no duplicate) */}
          {PITCH_MARKS.map((p) => (
            <div key={p} className={`pitch${Math.abs(p) === 5 ? " pitch--minor" : ""}`} style={{ "--p": p }}>
              <span>{p > 0 ? `+${p}` : p}</span>
              <i />
              <span>{p > 0 ? `+${p}` : p}</span>
            </div>
          ))}
        </div>

        {/* ROLL ARC (fixed) */}
        <RollArc roll={t.roll} />

        {/* AIRCRAFT (fixed) */}
        <svg className="aircraft" viewBox="0 0 200 60">
          <path d="M8 30 H72 L100 52 L128 30 H192" fill="none" stroke="#e5202a" strokeWidth="5" strokeLinejoin="round" />
          <circle cx="100" cy="30" r="4.5" fill="#3ee05a" />
        </svg>
        <div className={`arm-status arm-status--${status.toLowerCase()}`}>{status}</div>

        {/* SPEED */}
        <Tape value={t.speed} side="left" unit="m/s" decimals={1} />

        {/* ALTITUDE */}
        <Tape value={t.altitude} side="right" unit="m" />

        {/* BATTERY */}
        <div className="battery">
          <div className="battery__icon">
            <div className={`battery__fill battery__fill--${batteryLevel}`} style={{ width: `${Math.min(100, Math.max(0, t.battery))}%` }} />
          </div>
          <span>{Math.round(t.battery)}%</span>
          <span className="battery__timer">{formatTime(t.flightTime)}</span>
        </div>

        {/* BOTTOM STATUS */}
        <div className="bottom bottom--left">
          <div className="speeds">
            <div>AS {t.speed.toFixed(1)} m/s</div>
            <div>GS {gs.toFixed(1)} m/s</div>
          </div>
          <div className="readout">
            Bat {t.voltage.toFixed(2)}v {t.current.toFixed(1)} A {Math.round(t.battery)}%
          </div>
        </div>

        <div className="bottom bottom--center">
          <div className={`ready ready--${ready ? "ok" : "bad"}`}>
            {t.armed ? t.flightMode : ready ? "Ready to Arm" : "Not Ready to Arm"}
          </div>
          <div className="flags">
            <span className={t.ekf ? "flag--ok" : "flag--bad"}>EKF</span>
            <span className={t.vibration === "OK" ? "flag--ok" : "flag--bad"}>Vibe</span>
          </div>
        </div>

        <div className="bottom bottom--right">
          <div>{t.flightMode}</div>
          <div>
            {Math.round(t.wpDistance)}m&gt;{t.wpIndex}
          </div>
          <div className={t.gps >= 3 ? "flag--ok" : "flag--bad"}>GPS: {gpsText}</div>
        </div>
      </div>
    </div>
  );
}