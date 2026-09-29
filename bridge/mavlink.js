// Minimal MAVLink v1/v2 parser + encoder. No dependencies.
// Only the messages the HUD needs. `min` = bytes we read (v2 trims trailing zeros, so we pad).
const META = {
  0: { name: "HEARTBEAT", min: 9, crc: 50 },
  1: { name: "SYS_STATUS", min: 31, crc: 124 },
  24: { name: "GPS_RAW_INT", min: 30, crc: 24 },
  30: { name: "ATTITUDE", min: 28, crc: 39 },
  33: { name: "GLOBAL_POSITION_INT", min: 28, crc: 104 },
  62: { name: "NAV_CONTROLLER_OUTPUT", min: 26, crc: 183 },
  66: { name: "REQUEST_DATA_STREAM", min: 6, crc: 148 },
  74: { name: "VFR_HUD", min: 20, crc: 20 },
  193: { name: "EKF_STATUS_REPORT", min: 22, crc: 71 },
  241: { name: "VIBRATION", min: 32, crc: 90 },
};

function crc16(bytes, extra) {
  let crc = 0xffff;
  const acc = (d) => {
    let t = d ^ (crc & 0xff);
    t = (t ^ (t << 4)) & 0xff;
    crc = ((crc >> 8) ^ (t << 8) ^ (t << 3) ^ (t >> 4)) & 0xffff;
  };
  for (const b of bytes) acc(b);
  acc(extra);
  return crc;
}

// ---------------- PARSER ----------------
export class MavParser {
  constructor(onMessage) {
    this.buf = Buffer.alloc(0);
    this.onMessage = onMessage;
  }
  push(chunk) {
    this.buf = Buffer.concat([this.buf, chunk]);
    const b = this.buf;
    let i = 0;
    while (i < b.length) {
      const stx = b[i];
      if (stx !== 0xfd && stx !== 0xfe) { i++; continue; }
      const v2 = stx === 0xfd;
      const hdr = v2 ? 10 : 6;
      if (b.length - i < hdr) break;
      const len = b[i + 1];
      const signed = v2 && (b[i + 2] & 1) ? 13 : 0;
      const total = hdr + len + 2 + signed;
      if (b.length - i < total) break;
      const msgid = v2 ? b[i + 7] | (b[i + 8] << 8) | (b[i + 9] << 16) : b[i + 5];
      const meta = META[msgid];
      if (!meta) { i++; continue; }
      const crc = crc16(b.subarray(i + 1, i + hdr + len), meta.crc);
      const rx = b[i + hdr + len] | (b[i + hdr + len + 1] << 8);
      if (crc !== rx) { i++; continue; }
      const payload = Buffer.alloc(Math.max(meta.min, len));
      b.copy(payload, 0, i + hdr, i + hdr + len);
      this.onMessage(meta.name, decode(msgid, payload), { sysid: b[i + (v2 ? 5 : 3)], compid: b[i + (v2 ? 6 : 4)] });
      i += total;
    }
    this.buf = b.subarray(i);
  }
}

// ---------------- DECODERS ----------------
function decode(id, p) {
  switch (id) {
    case 0: return { customMode: p.readUInt32LE(0), type: p[4], autopilot: p[5], baseMode: p[6] };
    case 1: return { voltage: p.readUInt16LE(14) / 1000, current: p.readInt16LE(16) / 100, remaining: p.readInt8(30) };
    case 24: return { fixType: p[28] };
    case 30: return { roll: p.readFloatLE(4), pitch: p.readFloatLE(8), yaw: p.readFloatLE(12) };
    case 33: return { relAlt: p.readInt32LE(16) / 1000 };
    case 62: return { wpDist: p.readUInt16LE(24) };
    case 74: return { airspeed: p.readFloatLE(0), groundspeed: p.readFloatLE(4), climb: p.readFloatLE(12), heading: p.readInt16LE(16) };
    case 193: return { flags: p.readUInt16LE(20) };
    case 241: return { vibe: Math.max(p.readFloatLE(8), p.readFloatLE(12), p.readFloatLE(16)) };
    default: return {};
  }
}

// ---------------- ENCODER (MAVLink v2, we are "GCS" sysid 255) ----------------
let seq = 0;
function frame(msgid, payload) {
  const head = Buffer.from([0xfd, payload.length, 0, 0, seq++ & 255, 255, 190, msgid & 255, (msgid >> 8) & 255, (msgid >> 16) & 255]);
  const body = Buffer.concat([head, payload]);
  const c = crc16(body.subarray(1), META[msgid].crc);
  return Buffer.concat([body, Buffer.from([c & 255, c >> 8])]);
}

/** Tell the autopilot a GCS is here (sent once per second). */
export function encodeHeartbeat() {
  const p = Buffer.alloc(9);
  p[4] = 6; // type: GCS
  p[5] = 8; // autopilot: none
  p[7] = 4; // status: active
  p[8] = 3; // mavlink version
  return frame(0, p);
}

/** Ask the autopilot to stream all data at `rate` Hz. */
export function encodeRequestStreams(targetSys, targetComp, rate = 10) {
  const p = Buffer.alloc(6);
  p.writeUInt16LE(rate, 0);
  p[2] = targetSys;
  p[3] = targetComp;
  p[4] = 0; // MAV_DATA_STREAM_ALL
  p[5] = 1; // start
  return frame(66, p);
}