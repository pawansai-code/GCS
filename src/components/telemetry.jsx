let telemetry = {
  roll: 0,
  pitch: 0,
  heading: 105,
  altitude: 5,
  speed: 0,
  verticalSpeed: 0,
  gps: 12,
  battery: 100,
  voltage: 16.4,
};

export function getTelemetry() {
  return telemetry;
}

export function startTelemetrySimulation(callback) {
  setInterval(() => {

    // Roll
    telemetry.roll =
      Math.sin(Date.now() / 2500) * 15;

    // Pitch
    telemetry.pitch =
      Math.sin(Date.now() / 2000) * 10;

    // Heading
    telemetry.heading =
      (telemetry.heading + 0.5) % 360;

    // Altitude
    telemetry.altitude =
      5 + Math.sin(Date.now() / 3000) * 3;

    // Air speed
    telemetry.speed =
      5 + Math.sin(Date.now() / 1800) * 2;

    // Vertical speed
    telemetry.verticalSpeed =
      Math.sin(Date.now() / 1500) * 1.5;

    // Battery
    telemetry.battery =
      Math.max(0, telemetry.battery - 0.001);

    callback({ ...telemetry });

  }, 100);
}