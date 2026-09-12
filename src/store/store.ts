import { configureStore } from '@reduxjs/toolkit';
import telemetryReducer from './slices/telemetrySlice';
import missionReducer from './slices/missionSlice';
import activityReducer from './slices/activitySlice';
import detectionReducer from './slices/detectionSlice';

export const store = configureStore({
  reducer: {
    telemetry: telemetryReducer,
    mission: missionReducer,
    activity: activityReducer,
    detections: detectionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
