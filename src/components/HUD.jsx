import { useEffect, useState } from "react";
import { getTelemetry, startTelemetrySimulation } from "./telemetry";
import "./HUD.css";

function HUD() {
  const [telemetry, setTelemetry] = useState(getTelemetry());

  useEffect(() => {
    startTelemetrySimulation((data) => {
      setTelemetry(data);
    });
  }, []);

  const {
    roll,
    pitch,
    heading,
    altitude,
    speed,
    gps,
    battery,
  } = telemetry;

  const sideTicks = [-10, -5, 0, 5, 10, 15, 20];

  return (
    <div className="hud-wrapper">

      {/* ================= COMPASS ================= */}
      <div className="compass">

        <div className="compass-scale">
          <span>NE</span>
          <span>60</span>
          <span>75</span>
          <span>E</span>
          <span>105</span>
          <span>120</span>
          <span>SE</span>
          <span>150</span>
          <span>165</span>
        </div>

        <div className="compass-ticks">
          {Array.from({ length: 49 }).map((_, i) => (
            <span
              key={i}
              className={i % 4 === 0 ? "major-tick" : ""}
            />
          ))}
        </div>

        <div className="heading-marker">▲</div>
      </div>


      {/* ================= MAIN HUD ================= */}
      <div className="hud-screen">

        {/* ================= MOVING HORIZON ================= */}
        <div className="horizon-container">

          <div
            className="horizon"
            style={{
              transform: `
                translateY(${pitch * 3.5}px)
                rotate(${roll}deg)
              `,
            }}
          >

            <div className="sky"></div>
            <div className="ground"></div>
            <div className="horizon-line"></div>


            {/* ================= PITCH LADDER ================= */}

            <div className="pitch pitch-20">
              <span>20</span>
              <i></i>
            </div>

            <div className="pitch pitch-10">
              <span>10</span>
              <i></i>
            </div>

            <div className="pitch pitch-5">
              <span>5</span>
              <i></i>
            </div>

            <div className="pitch pitch-0">
              <span>0</span>
              <i></i>
            </div>

            <div className="pitch pitch-minus5">
              <span>-5</span>
              <i></i>
            </div>

            <div className="pitch pitch-minus10">
              <span>-10</span>
              <i></i>
            </div>

            <div className="pitch pitch-minus20">
              <span>-20</span>
              <i></i>
            </div>

          </div>


          {/* ================= ROLL ARC ================= */}

          <div className="roll-arc">

            <span className="roll r-30">-30</span>
            <span className="roll r-20">-20</span>
            <span className="roll r-10">-10</span>
            <span className="roll r-0">0</span>
            <span className="roll r-10p">10</span>
            <span className="roll r-20p">20</span>
            <span className="roll r-30p">30</span>

            <div className="roll-tick t1"></div>
            <div className="roll-tick t2"></div>
            <div className="roll-tick t3"></div>
            <div className="roll-tick t4"></div>
            <div className="roll-tick t5"></div>
          </div>


          {/* ================= AIRCRAFT ================= */}

          <div className="aircraft">

            <div className="aircraft-left"></div>

            <div className="aircraft-center"></div>

            <div className="aircraft-right"></div>

            <div className="green-dot left-dot"></div>
            <div className="green-dot right-dot"></div>

          </div>


          {/* ================= LEFT SPEED ================= */}

          <div className="left-speed">

            {sideTicks.map((value, index) => (
              <div className="speed-scale-row" key={index}>
                <span>{value}</span>
                <i></i>
              </div>
            ))}

            <div className="speed-current">
              {speed.toFixed(1)} m/s
            </div>

          </div>


          {/* ================= RIGHT ALTITUDE ================= */}

          <div className="right-altitude">

            {sideTicks.map((value, index) => (
              <div className="alt-scale-row" key={index}>
                <i></i>
                <span>{value}</span>
              </div>
            ))}

            <div className="alt-current">
              {Math.round(altitude)} m
            </div>

          </div>


          {/* ================= BATTERY ================= */}

          <div className="battery">

            <div className="battery-icon">
              <span
                style={{
                  height: `${Math.max(0, battery)}%`,
                }}
              ></span>
            </div>

            <strong>
              {Math.round(battery)}%
            </strong>

            <div className="time">
              10:24:15
            </div>

          </div>


          {/* ================= BOTTOM LEFT ================= */}

          <div className="bottom-left">
            <div>AS {speed.toFixed(1)} m/s</div>
            <div>GS {speed.toFixed(1)} m/s</div>
          </div>


          {/* ================= BOTTOM RIGHT ================= */}

          <div className="bottom-right">

            <div className="flight-mode">
              AltHold
            </div>

            <div>
              GPS: {gps > 0 ? "3D Fix" : "No Fix"}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default HUD;