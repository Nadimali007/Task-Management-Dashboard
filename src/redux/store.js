import { configureStore } from '@reduxjs/toolkit';
import activityReducer from './activitySlice';

export const store = configureStore({
  reducer: {
    activity: activityReducer
  }
});