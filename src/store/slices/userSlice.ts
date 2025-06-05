import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config/config';

interface UserStats {
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  goalsScored: number;
  assists: number;
  ranking: number;
  winRate: number;
  averageGoalsPerMatch: number;
  averageAssistsPerMatch: number;
  currentStreak: number;
  bestStreak: number;
  favoritePosition: string;
  totalPlayTime: number;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt: string;
  }>;
}

interface UserSocial {
  groups: number;
  following: number;
  followers: number;
}

interface UserState {
  stats: UserStats | null;
  social: UserSocial | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  stats: null,
  social: null,
  loading: false,
  error: null,
};

export const fetchUserStats = createAsyncThunk(
  'user/fetchStats',
  async () => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) throw new Error('No token found');
    
    const response = await axios.get(`${config.apiUrl}/users/stats`, {
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
    
    const response = await axios.get(`${config.apiUrl}/users/social`, {
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
      });
  },
});

export const { resetUser } = userSlice.actions;
export default userSlice.reducer; 