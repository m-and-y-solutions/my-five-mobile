import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { User, UserState } from '../../types/user.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config/config';
import api from 'services/api';


const initialState: UserState = {
  stats: null,
  social: null,
  loading: false,
  error: null,
  selectedUser: null,
};

export const fetchUserStats = createAsyncThunk(
  'user/fetchStats',
  async () => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) throw new Error('No token found');
    
    const response = await api.get(`${config.apiUrl}/users/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
);

export const fetchUserSocial = createAsyncThunk(
  'user/fetchSocial',
  async () => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) throw new Error('No token found');
    
    const response = await api.get(`${config.apiUrl}/users/social`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
);

export const fetchUserById = createAsyncThunk(
  'user/fetchById',
  async (userId: string) => {
    const token = await AsyncStorage.getItem('accessToken');

    const response = await api.get(`${config.apiUrl}/users/${userId}`,{
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    resetUser: (state) => {
      state.stats = null;
      state.social = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Stats
      .addCase(fetchUserStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user stats';
      })
      // Fetch Social
      .addCase(fetchUserSocial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserSocial.fulfilled, (state, action) => {
        state.loading = false;
        state.social = action.payload;
      })
      .addCase(fetchUserSocial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user social data';
      })
      // Fetch User by ID
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Une erreur est survenue';
      });
  },
});

export const { resetUser } = userSlice.actions;
export default userSlice.reducer; 