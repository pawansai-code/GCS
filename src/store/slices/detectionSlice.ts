import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  list: [
    { id: 1, type: 'Leaf Blight', location: '13.1416, 79.9073', status: 'Sprayed', icon: 'leaf' },
    { id: 2, type: 'Leaf Spot', location: '13.1420, 79.9077', status: 'Sprayed', icon: 'leaf' },
    { id: 3, type: 'Aphids', location: '13.1423, 79.9085', status: 'Pending', icon: 'bug' },
    { id: 4, type: 'Leaf Blight', location: '13.1425, 79.9092', status: 'Pending', icon: 'bug' },
    { id: 5, type: 'Aphids', location: '13.1417, 79.9096', status: 'Sprayed', icon: 'leaf' },
    { id: 6, type: 'Leaf Spot', location: '13.1422, 79.9103', status: 'Pending', icon: 'leaf' },
    { id: 7, type: 'Nutrient Deficiency', location: '13.1426, 79.9108', status: 'Pending', icon: 'leaf-yellow' },
    { id: 8, type: 'Leaf Blight', location: '13.1430, 79.9114', status: 'Pending', icon: 'leaf' },
  ],
  count: 8
};

const detectionSlice = createSlice({
  name: 'detections',
  initialState,
  reducers: {}
});

export default detectionSlice.reducer;
