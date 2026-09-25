import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  logs: [
    { id: 1, time: '10:21', type: 'scout', message: 'Scout Drone detected Leaf Blight at (13.1416, 79.9073)', level: 'success' },
    { id: 2, time: '10:18', type: 'spray', message: 'Spray Drone started spraying at (13.1416, 79.9073)', level: 'info' },
    { id: 3, time: '10:15', type: 'scout', message: 'Scout Drone completed area scan (2.3 ha)', level: 'success' },
    { id: 4, time: '10:12', type: 'alert', message: '3 new detections found (Aphids, Leaf Spot, Leaf Blight)', level: 'error' },
    { id: 5, time: '10:08', type: 'info', message: 'Spray Drone reached waypoint 3', level: 'info' },
    { id: 6, time: '10:05', type: 'success', message: 'Mission started', level: 'success' }
  ]
};

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {}
});

export default activitySlice.reducer;
