import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Match } from '../../services/matchService';
import matchService from '../../services/matchService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchAllMatches = createAsyncThunk(
  'match/fetchAllMatches',
  async (status: string) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No token found');
    return await matchService.getMatches(token, { status, visibility: 'public' });
  }
);

export const fetchUserMatches = createAsyncThunk(
  'match/fetchUserMatches',
  async (status: string) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No token found');
    const userStr = await AsyncStorage.getItem('user');
    if (!userStr) throw new Error('No user found');
    const user = JSON.parse(userStr);
    return await matchService.getUserMatches(user.id, token);
  }
);

interface MatchState {
  matches: Match[];
  allMatches: Match[];
  userMatches: Match[];
  currentMatch: Match | null;
  loading: boolean;
  error: string | null;
}

const initialState: MatchState = {
  matches: [],
  allMatches: [],
  userMatches: [],
  currentMatch: null,
  loading: false,
  error: null,
};

const matchSlice = createSlice({
  name: 'match',
  initialState,
  reducers: {
    resetMatches: (state) => {
      state.matches = [];
      state.allMatches = [];
      state.userMatches = [];
      state.currentMatch = null;
      state.error = null;
    },
    setMatches: (state, action: PayloadAction<Match[]>) => {
      state.matches = action.payload;
      state.error = null;
    },
    setCurrentMatch: (state, action: PayloadAction<Match>) => {
      state.currentMatch = action.payload;
      state.error = null;
    },
    addMatch: (state, action: PayloadAction<Match>) => {
      state.matches.push(action.payload);
      state.error = null;
    },
    updateMatch: (state, action: PayloadAction<Match>) => {
      const index = state.matches.findIndex(match => match.id === action.payload.id);
      if (index !== -1) {
        state.matches[index] = action.payload;
      }
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Matches
      .addCase(fetchAllMatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllMatches.fulfilled, (state, action) => {
        state.loading = false;
        state.allMatches = action.payload;
        state.matches = action.payload;
      })
      .addCase(fetchAllMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch matches';
      })
      // Fetch User Matches
      .addCase(fetchUserMatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserMatches.fulfilled, (state, action) => {
        state.loading = false;
        state.userMatches = action.payload;
        state.matches = action.payload;
      })
      .addCase(fetchUserMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user matches';
      });
  },
});

export const {
  resetMatches,
  setMatches,
  setCurrentMatch,
  addMatch,
  updateMatch,
  setLoading,
  setError,
} = matchSlice.actions;

export default matchSlice.reducer; 