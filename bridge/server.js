// Pixhawk -> HUD bridge.
// Reads MAVLink from a serial port and sends simple telemetry JSON to the browser over WebSocket.
//   node server.js list            (show serial ports)
//   node server.js COM5 115200     (connect; USB ignores baud, telemetry radios usually 57600)
import { SerialPort } from "serialport";
import { WebSocketServer } from "ws";
import { MavParser, encodeHeartbeat, encodeRequestStreams } from "./mavlink.js";

const [path, baud = "115200"] = process.argv.slice(2);
if (!path || path === "list") {
  const ports = await SerialPort.list();
  console.log(ports.length ? ports.map((p) => `${p.path}  ${p.manufacturer ?? ""}`).join("\n") : "No serial ports found.");
  process.exit(0);
}

const WS_PORT = 8787;
const COPTER_MODES = { 0: "STABILIZE", 1: "ACRO", 2: "ALT_HOLD", 3: "AUTO", 4: "GUIDED", 5: "LOITER", 6: "RTL", 7: "CIRCLE", 9: "LAND", 11: "DRIFT", 13: "SPORT", 14: "FLIP", 15: "AUTOTUNE", 16: "POSHOLD", 17: "BRAKE", 18: "THROW", 20: "GUIDED_NOGPS", 21: "SMART_RTL" };
const PX4_MODES = { 1: "MANUAL", 2: "ALTCTL", 3: "POSCTL", 4: "AUTO", 5: "ACRO", 6: "OFFBOARD", 7: "STABILIZED" };
const deg = (r) => (r * 180) / Math.PI;

// Latest values from the autopilot (same field names the HUD's telemetry object uses)
const t = { roll: 0, pitch: 0, heading: 0, altitude: 0, airspeed: 0, groundspeed: 0, verticalSpeed: 0, gps: 0, battery: 0, voltage: 0, current: 0, armed: false, flightMode: "UNKNOWN", ekf: false, vibration: "OK", wpDistance: 0 };
let lastRx = 0;
let target = null;
let armedAt = null;
let firstMsg = true;

const parser = new MavParser((name, m, src) => {
  lastRx = Date.now();
  if (firstMsg) { firstMsg = false; console.log("Receiving MAVLink data."); }
  switch (name) {
    case "HEARTBEAT": {
      if (m.autopilot === 8 || m.type === 6) return; // ignore other GCS / non-autopilot
      target = { sys: src.sysid, comp: src.compid };
      const armed = !!(m.baseMode & 0x80);
      armedAt = armed ? armedAt ?? Date.now() : null;
      t.armed = armed;
      t.flightMode = m.autopilot === 12 ? PX4_MODES[(m.customMode >> 16) & 255] ?? "PX4" : m.type === 1 ? `MODE ${m.customMode}` : COPTER_MODES[m.customMode] ?? `MODE ${m.customMode}`;
      break;
    }
    case "ATTITUDE": t.roll = deg(m.roll); t.pitch = deg(m.pitch); break;
    case "VFR_HUD": t.airspeed = m.airspeed; t.groundspeed = m.groundspeed; t.verticalSpeed = m.climb; t.heading = (m.heading + 360) % 360; break;
    case "GLOBAL_POSITION_INT": t.altitude = m.relAlt; break; // relative to home
    case "SYS_STATUS": t.voltage = m.voltage; t.current = m.current; if (m.remaining >= 0) t.battery = m.remaining; break;
    case "GPS_RAW_INT": t.gps = m.fixType; break;
    case "NAV_CONTROLLER_OUTPUT": t.wpDistance = m.wpDist; break;
    case "VIBRATION": t.vibration = m.vibe < 30 ? "OK" : m.vibe < 60 ? "WARN" : "BAD"; break;
    case "EKF_STATUS_REPORT": t.ekf = !!(m.flags & 1) && !!(m.flags & 2) && !!(m.flags & (8 | 16)); break;
  }
});

const port = new SerialPort({ path, baudRate: Number(baud) }, (err) => {
  if (err) { console.error(`Could not open ${path}: ${err.message}\nClose Mission Planner/QGroundControl first (only one program can use the port).`); process.exit(1); }
  console.log(`Opened ${path} @ ${baud}. WebSocket on ws://localhost:${WS_PORT}`);
});
port.on("data", (d) => parser.push(d));
port.on("close", () => { console.error("Serial port closed."); process.exit(1); });
port.on("error", (e) => console.error("Serial error:", e.message));

// Say hello once a second; ask for data streams every 5 s once we know the autopilot's ID.
let tick = 0;
setInterval(() => {
  port.write(encodeHeartbeat());
  if (target && tick++ % 5 === 0) port.write(encodeRequestStreams(target.sys, target.comp, 10));
}, 1000);

// Send telemetry to every browser at 20 Hz.
const wss = new WebSocketServer({ port: WS_PORT });
setInterval(() => {
  const { airspeed, groundspeed, ...rest } = t;
  const msg = JSON.stringify({
    ...rest,
    speed: airspeed > 0 ? airspeed : groundspeed, // copters have no airspeed sensor
    groundSpeed: groundspeed,
    flightTime: armedAt ? (Date.now() - armedAt) / 1000 : 0,
    status: Date.now() - lastRx > 2000 ? "NO LINK" : null,
  });
  wss.clients.forEach((c) => c.readyState === 1 && c.send(msg));
}, 50);