import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchNotifications as fetchNotificationsAPI } from '../../services/notificationService';

export interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  groupId?: string;
  matchId?: string;
}

interface NotificationsState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  notifications: [],
  loading: false,
  error: null,
};

// Thunk pour récupérer les notifications
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchNotificationsAPI();
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Erreur lors du chargement des notifications');
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    markAsRead(state, action) {
      const notif = state.notifications.find(n => n.id === action.payload);
      if (notif) notif.read = true;
    },
    markAllAsRead(state) {
      state.notifications.forEach(n => { n.read = true; });
    },
    addNotification(state, action) {
      state.notifications.unshift(action.payload);
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { markAsRead, markAllAsRead, addNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
