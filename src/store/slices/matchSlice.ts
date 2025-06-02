import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Match {
  id: string;
  date: string;
  time: string;
  location: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  players: {
    id: string;
    firstName: string;
    lastName: string;
  }[];
}

interface MatchState {
  matches: Match[];
  currentMatch: Match | null;
  loading: boolean;
  error: string | null;
}

const initialState: MatchState = {
  matches: [],
  currentMatch: null,
  loading: false,
  error: null,
};

const matchSlice = createSlice({
  name: 'match',
  initialState,
  reducers: {
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
});

export const {
  setMatches,
  setCurrentMatch,
  addMatch,
  updateMatch,
  setLoading,
  setError,
} = matchSlice.actions;

export default matchSlice.reducer; 