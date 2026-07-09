import { createSlice } from '@reduxjs/toolkit';

const activitySlice = createSlice({
  name: 'activity',
  initialState: {
    logs: JSON.parse(localStorage.getItem('recentActivities')) || [] 
  },
  reducers: {
    addActivity: (state, action) => {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const entry = `[${timestamp}] ${action.payload}`;
      
      state.logs.unshift(entry); 
      
      if (state.logs.length > 8) {
        state.logs.pop(); 
      }

      localStorage.setItem('recentActivities', JSON.stringify(state.logs));
    }
  }
});

export const { addActivity } = activitySlice.actions;
export default activitySlice.reducer;