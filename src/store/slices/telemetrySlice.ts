import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  scout: {
    altitude: '32 m',
    speed: '5.2 m/s',
    battery: 68,
    gps: '10.7423, 79.1256',
    mode: 'AUTO',
    heading: '182°',
    status: 'Online',
  },
  spray: {
    altitude: '28 m',
    speed: '4.8 m/s',
    battery: 72,
    gps: '10.7428, 79.1261',
    mode: 'AUTO',
    heading: '176°',
    status: 'Online',
  }
};

const telemetrySlice = createSlice({
  name: 'telemetry',
  initialState,
  reducers: {}
});

export default telemetrySlice.reducer;
