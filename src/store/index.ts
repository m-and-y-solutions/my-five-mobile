import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import matchReducer from './slices/matchSlice';
import userReducer from './slices/userSlice';
import fieldReducer from './slices/fieldSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    match: matchReducer,
    user: userReducer,
    field: fieldReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 