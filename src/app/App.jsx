import HUD from "../features/hud/HUD";
import { useTelemetry, startBridgeTelemetry, startTelemetrySimulation } from "../lib/telemetry";

// Real Pixhawk data by default. Open http://localhost:5173/?source=sim for the simulator.
const source = new URLSearchParams(window.location.search).get("source") === "sim" ? startTelemetrySimulation : startBridgeTelemetry;

export default function App() {
  const telemetry = useTelemetry(source);

  return (
    <div className="app-shell">
      <HUD telemetry={telemetry} />
    </div>
  );
}