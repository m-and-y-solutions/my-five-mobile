import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import { LoginCredentials, RegisterData } from '../../types/auth.types';

export const restoreAuth = createAsyncThunk(
  'auth/restore',
  async () => {
    try {
      const [token, userStr] = await Promise.all([
        AsyncStorage.getItem('token'),
        AsyncStorage.getItem('user')
      ]);
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        return { token, user };
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
    if (response.success && response.data?.token) {
      await AsyncStorage.setItem('token', response.data.token);
      if (response.data.user) {
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
    } else {
      console.error('Login response missing token:', response);
    }
    return response;
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (data: RegisterData) => {
    const response = await authService.register(data);
    if (response.success && response.data?.token) {
      console.log('Storing token:', response.data.token);
      await AsyncStorage.setItem('token', response.data.token);
      if (response.data.user) {
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
    } else {
      console.error('Register response missing token:', response);
    }
    return response;
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      // Nettoyer le stockage local
      await AsyncStorage.multiRemove(['token', 'user',]);
      // Nettoyer le stockage local todo remove after testing
      await AsyncStorage.removeItem('onboardingSeen');
      // Retourner un objet pour indiquer le succès
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  }
);

interface AuthState {
  user: any | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  hasSeenOnboarding: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  hasSeenOnboarding: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setOnboardingSeen: (state, action) => {
      state.hasSeenOnboarding = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Restore auth cases
      .addCase(restoreAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.token = action.payload.token;
          state.user = action.payload.user;
        }
      })
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.user = action.payload.data.user;
          state.token = action.payload.data.token;
        } else {
          state.error = action.payload.message;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Une erreur est survenue';
      })
      // Register cases
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.user = action.payload.data.user;
          state.token = action.payload.data.token;
        } else {
          state.error = action.payload.message;
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Une erreur est survenue';
      })
      // Logout cases
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Une erreur est survenue lors de la déconnexion';
      });
  },
});

export const { clearError, setOnboardingSeen } = authSlice.actions;
export default authSlice.reducer; 