import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  status: 'In Progress',
  steps: [
    { id: 1, title: 'Scout Drone - Land Analysis', subtitle: 'Scanned Area: 4.2 / 4.5 ha', progress: 93, status: 'Completed' },
    { id: 2, title: 'Disease/Pest Detection', subtitle: 'Found: 8 locations', progress: 100, status: 'Completed' },
    { id: 3, title: 'Spray Drone - Pesticide Application', subtitle: 'Spraying at 3 / 8 locations', progress: 38, status: 'In Progress' },
    { id: 4, title: 'Mission Completion', subtitle: 'Pending', progress: 0, status: 'Pending' }
  ],
  stats: {
    areaScanned: '4.2 / 4.5 ha',
    scannedPercent: 93,
    locationsSprayed: '3 / 8 locations',
    sprayedPercent: 38
  }
};

const missionSlice = createSlice({
  name: 'mission',
  initialState,
  reducers: {}
});

export default missionSlice.reducer;
