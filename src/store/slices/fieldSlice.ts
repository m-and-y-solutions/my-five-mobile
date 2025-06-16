import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config/config';
import api from 'services/api';

export interface Field {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  state: string;
  isAvailable: boolean;
  latitude: number;
  longitude: number;
  price: number;
  currency: string;
  images: string[];
  amenities: string[];
  openingHours: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
  rating: number;
  reviews: number;
  isIndoor: boolean;
  isOutdoor: boolean;
  surfaceType: string;
  size: string;
  maxPlayers: number;
  minPlayers: number;
  createdAt: string;
  updatedAt: string;
  matches?: Array<{
    id: string;
    title: string;
    date: string;
    time: string;
    status: string;
  }>;
  bookings?: Array<{
    id: string;
    startTime: string;
    endTime: string;
    isBlocked: boolean;
    match?: {
      id: string;
      title: string;
      date: string;
      time: string;
      status: string;
    };
  }>;
}

interface FieldState {
  fields: Field[];
  currentField: Field | null;
  loading: boolean;
  error: string | null;
}

const initialState: FieldState = {
  fields: [],
  currentField: null,
  loading: false,
  error: null,
};

export const fetchFields = createAsyncThunk(
  'field/fetchFields',
  async (params?: {
    cityId?: string;
    date?: Date;
    duration?: number;
  }) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) throw new Error('No token found');
    
    const queryParams = new URLSearchParams();
    if (params?.cityId) queryParams.append('cityId', params.cityId);
    if (params?.date) queryParams.append('date', params.date.toISOString());
    if (params?.duration) queryParams.append('duration', params.duration.toString());
    
    const response = await api.get(`${config.serverUrl}/api/fields?${queryParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }
);

export const fetchFieldById = createAsyncThunk(
  'field/fetchFieldById',
  async (fieldId: string) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) throw new Error('No token found');
    
    const response = await api.get(`${config.serverUrl}/api/fields/${fieldId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }
);

const fieldSlice = createSlice({
  name: 'field',
  initialState,
  reducers: {
    resetFields: (state) => {
      state.fields = [];
      state.currentField = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Fields
      .addCase(fetchFields.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFields.fulfilled, (state, action) => {
        state.loading = false;
        state.fields = action.payload;
      })
      .addCase(fetchFields.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch fields';
      })
      // Fetch Field by ID
      .addCase(fetchFieldById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFieldById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentField = action.payload;
      })
      .addCase(fetchFieldById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch field';
      });
  },
});

export const { resetFields } = fieldSlice.actions;
export default fieldSlice.reducer; 