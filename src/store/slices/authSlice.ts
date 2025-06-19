import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import { LoginCredentials, RegisterData } from '../../types/auth.types';

export const restoreAuth = createAsyncThunk(
  'auth/restore',
  async () => {
    try {
      const [accessToken, refreshToken, userStr] = await Promise.all([
        AsyncStorage.getItem('accessToken'),
        AsyncStorage.getItem('refreshToken'),
        AsyncStorage.getItem('user')
      ]);
      
      if (accessToken && refreshToken && userStr) {
        const user = JSON.parse(userStr);
        return { accessToken, refreshToken, user };
      }
      return null;
    } catch (error) {
      console.error('Error restoring auth state:', error);
      return null;
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    if (response.success && response.data?.accessToken && response.data?.refreshToken) {
      if (response.data.user) {
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
    } else {
      console.error('Login response missing tokens:', response);
    }
    return response;
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (data: RegisterData) => {
    const response = await authService.register(data);
    // if (response.success && response.data?.accessToken && response.data?.refreshToken) {
    //   if (response.data.user) {
    //     await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    //   }
    // } else {
    //   console.error('Register response missing tokens:', response);
    // }
    return response;
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async () => {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const response = await authService.refreshToken(refreshToken);
    return response;
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    const response = await authService.logout();
    return response;
  }
);

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: any | null;
  loading: boolean;
  error: string | null;
  hasSeenOnboarding: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  loading: false,
  error: null,
  hasSeenOnboarding: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setOnboardingSeen: (state, action: { payload: boolean }) => {
      state.hasSeenOnboarding = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Restore Auth
      .addCase(restoreAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreAuth.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
          state.user = action.payload.user;
        }
      })
      .addCase(restoreAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to restore auth state';
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.accessToken = action.payload.data.accessToken;
          state.refreshToken = action.payload.data.refreshToken;
          state.user = action.payload.data.user;
        } else {
          state.error = action.payload.message;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.accessToken = action.payload.data.accessToken;
          state.refreshToken = action.payload.data.refreshToken;
          state.user = action.payload.data.user;
        } else {
          state.error = action.payload.message;
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
      })
      // Refresh Token
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          state.accessToken = action.payload.data.accessToken;
          state.refreshToken = action.payload.data.refreshToken;
        } else {
          state.error = action.payload.message;
          state.accessToken = null;
          state.refreshToken = null;
          state.user = null;
        }
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Token refresh failed';
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        // console.log('🔒 Auth Store - Before logout:', {
        //   accessToken: state.accessToken ? 'Present' : 'Missing',
        //   refreshToken: state.refreshToken ? 'Present' : 'Missing',
        //   user: state.user ? 'Present' : 'Missing'
        // });
        
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
        state.error = null;
        // state.hasSeenOnboarding = false; // Remettre à false lors du logout
        
        // console.log('🧹 Auth Store - After logout:', {
        //   accessToken: state.accessToken ? 'Present' : 'Missing',
        //   refreshToken: state.refreshToken ? 'Present' : 'Missing',
        //   user: state.user ? 'Present' : 'Missing'
        // });
      });
  },
});

export const { setOnboardingSeen, clearError } = authSlice.actions;

export default authSlice.reducer;