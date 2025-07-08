import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import matchReducer from './slices/matchSlice';
import fieldReducer from './slices/fieldSlice';
import userReducer from './slices/userSlice';
import groupsReducer from './slices/groupsSlice';
import notificationsReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    match: matchReducer,
    field: fieldReducer,
    user: userReducer,
    groups: groupsReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 