import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchNotifications as fetchNotificationsAPI } from '../../services/notificationService';
import api from '../../services/api';

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

// Thunk pour marquer une notification comme lue côté backend
export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      return notificationId;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Erreur lors du marquage de la notification');
    }
  }
);

// Thunk pour marquer toutes les notifications comme lues côté backend
export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.put('/notifications/read-all');
      return true;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Erreur lors du marquage des notifications');
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
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notif = state.notifications.find(n => n.id === action.payload);
        if (notif) notif.read = true;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(n => { n.read = true; });
      });
  }
});

export const { markAsRead, markAllAsRead, addNotification } = notificationsSlice.actions;

// Sélecteur pour compter les notifications non lues
export const selectUnreadCount = (state: { notifications: NotificationsState }) => 
  state.notifications.notifications.filter(n => !n.read).length;

export default notificationsSlice.reducer;
