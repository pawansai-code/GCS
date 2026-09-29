import { useEffect, useState } from "react";

// ============================================================
// TELEMETRY MODEL — the ONLY shape the HUD ever sees.
// Any source (simulator, MAVLink, MAVSDK, ROS 2, WebSocket, serial)
// just has to produce an object like this.
// ============================================================
export const DEFAULT_TELEMETRY = {
  roll: 0, // deg, + = right wing down
  pitch: 0, // deg, + = nose up
  heading: 0, // deg, 0..360
  altitude: 0, // m
  speed: 0, // m/s (airspeed)
  groundSpeed: null, // m/s, falls back to speed when null
  verticalSpeed: 0, // m/s
  gps: 3, // 0 none, 1 no fix, 2 2D, 3 3D, 4 DGPS, 5 RTK float, 6 RTK fixed
  battery: 100, // %
  voltage: 16.4, // V
  current: 0, // A
  armed: false,
  status: null, // optional override: "ARMED" | "DISARMED" | "STANDBY"
  flightMode: "STABILIZE",
  ekf: true,
  vibration: "OK", // "OK" | "WARN" | "BAD"
  flightTime: 0, // s
  wpDistance: 0, // m to next waypoint
  wpIndex: 0,
};

let latest = { ...DEFAULT_TELEMETRY };

/** Latest snapshot, for non-React code. */
export function getTelemetry() {
  return latest;
}

// ============================================================
// TEST OVERRIDES — open e.g. /?roll=20&pitch=0 to freeze the HUD
// on fixed values (acceptance tests 1–7). Supported keys below.
// ============================================================
const OVERRIDE_KEYS = ["roll", "pitch", "heading", "altitude", "speed", "verticalSpeed", "gps", "battery", "voltage", "current"];

function readOverrides() {
  const q = new URLSearchParams(window.location.search);
  const o = {};
  OVERRIDE_KEYS.forEach((k) => q.has(k) && (o[k] = Number(q.get(k))));
  if (q.has("armed")) o.armed = q.get("armed") === "true";
  return Object.keys(o).length ? o : null;
}

// ============================================================
// SIMULATOR — smooth sinusoids, no random jumps.
// ============================================================
export function startTelemetrySimulation(callback, hz = 30) {
  const overrides = readOverrides();
  if (overrides) {
    latest = { ...DEFAULT_TELEMETRY, ...overrides };
    callback(latest);
    return () => {};
  }

  const t0 = performance.now();
  const timer = setInterval(() => {
    const t = (performance.now() - t0) / 1000;
    const battery = Math.max(0, 100 - t * 0.02);
    const speed = 5 + 3 * Math.sin(t * 0.3);
    latest = {
      ...DEFAULT_TELEMETRY,
      roll: 25 * Math.sin(t * 0.6),
      pitch: 12 * Math.sin(t * 0.4 + 1),
      heading: (t * 6) % 360,
      altitude: 6 + 4 * Math.sin(t * 0.25),
      verticalSpeed: 4 * 0.25 * Math.cos(t * 0.25),
      speed,
      groundSpeed: speed * 0.95,
      battery,
      voltage: 12 + 4.4 * (battery / 100),
      flightTime: t,
    };
    callback(latest);
  }, 1000 / hz);
  return () => clearInterval(timer);
}

// ============================================================
// PROVIDER HOOK — Telemetry Provider -> telemetry object -> HUD
//
// PIXHAWK / PX4 LATER: write a function with the same signature,
//   startMavlinkTelemetry(callback) { ...connect...; on each message
//   call callback({ ...DEFAULT_TELEMETRY, roll, pitch, ... }); return stopFn }
// then pass it in App.jsx: useTelemetry(startMavlinkTelemetry).
// The HUD itself never changes.
// ============================================================
export function useTelemetry(start = startTelemetrySimulation) {
  const [telemetry, setTelemetry] = useState(getTelemetry);
  useEffect(() => start(setTelemetry), [start]);
  return telemetry;
}

// ============================================================
// PIXHAWK BRIDGE PROVIDER — receives telemetry from bridge/server.js
// ============================================================
export function startBridgeTelemetry(callback, url = "ws://localhost:8787") {
  let ws;
  let retry;
  let stopped = false;
  let lastMsg = 0;

  const connect = () => {
    ws = new WebSocket(url);
    ws.onmessage = (e) => {
      lastMsg = Date.now();
      latest = { ...DEFAULT_TELEMETRY, ...JSON.parse(e.data) };
      callback(latest);
    };
    ws.onclose = () => !stopped && (retry = setTimeout(connect, 1000));
    ws.onerror = () => ws.close();
  };
  connect();

  // If the bridge itself is not running, show NO LINK instead of stale numbers.
  const watchdog = setInterval(() => {
    if (Date.now() - lastMsg > 2000) {
      latest = { ...DEFAULT_TELEMETRY, status: "NO LINK", gps: 0, ekf: false };
      callback(latest);
    }
  }, 1000);

  return () => {
    stopped = true;
    clearTimeout(retry);
    clearInterval(watchdog);
    ws.close();
  };
}