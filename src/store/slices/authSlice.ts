import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import { LoginCredentials, RegisterData } from '../../types/auth.types';
import api from 'services/api';
import config from 'config/config';
// import { registerForPushNotificationsAsync } from 'utils/notifications';

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
export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        await AsyncStorage.setItem('user', JSON.stringify(response.data));
        // console.log('-----------------',response.data)
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Erreur lors de la récupération du profil');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la récupération du profil');
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
        // to do restore when notif fixed
        //  const token = await registerForPushNotificationsAsync();
        // if (token) {
        //   await api.post('/users/push-token', { token });
        // }
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

export const updateProfil = createAsyncThunk(
  'auth/updateProfil',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'profileImage' && value && typeof value !== 'string') {
            formData.append('profileImage', value as any);
          } else {
            formData.append(key, String(value));
          }
        }
      });
      const response = await api.put(
        `${config.apiUrl}/users/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    const response = await authService.forgotPassword(email);
    if (response.success) {
      return response.message;
    } else {
      return rejectWithValue(response.message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ email, token, newPassword }: { email: string; token: string; newPassword: string }, { rejectWithValue }) => {
    const response = await authService.resetPassword({ email, token, newPassword });
    if (response.success) {
      return response.message;
    } else {
      return rejectWithValue(response.message);
    }
  }
);

export const sendCode = createAsyncThunk('auth/sendCode', async (email: string) => {
  await authService.sendVerificationCode(email);
});

export const checkCode = createAsyncThunk('auth/checkCode', async ({ email, code }: { email: string, code: string }) => {
  await authService.verifyCode(email, code);
});

export const verifyResetCodeThunk = createAsyncThunk(
  'auth/verifyResetCode',
  async ({ email, code }: { email: string; code: string }, { rejectWithValue }) => {
    const response = await authService.verifyResetCode(email, code);
    if (response.success) {
      return response.message;
    } else {
      return rejectWithValue(response.message);
    }
  }
);

export const resetPasswordWithCodeThunk = createAsyncThunk(
  'auth/resetPasswordWithCode',
  async ({ email, code, newPassword }: { email: string; code: string; newPassword: string }, { rejectWithValue }) => {
    const response = await authService.resetPasswordWithCode(email, code, newPassword);
    if (response.success) {
      return response.message;
    } else {
      return rejectWithValue(response.message);
    }
  }
);

export const deleteAccount = createAsyncThunk(
  'auth/deleteAccount',
  async (_, { dispatch }) => {
    await authService.deleteAccount();
    // Optionnel : déconnecte l'utilisateur après suppression
    dispatch(logout());
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
      // GetMe
      .addCase(getMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getMe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Erreur lors de la récupération du profil';
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
      })    // Update Profil
      .addCase(updateProfil.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfil.fulfilled, (state, action) => {
        state.loading = false;
        // Met à jour selectedUser si c'est le user affiché
        state.user = action.payload;

      })
      .addCase(updateProfil.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Erreur lors de la mise à jour du profil';
      })
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Erreur lors de la demande de réinitialisation';
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Erreur lors de la réinitialisation';
      })
      .addCase(verifyResetCodeThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyResetCodeThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(verifyResetCodeThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Erreur lors de la vérification du code';
      })
      .addCase(resetPasswordWithCodeThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPasswordWithCodeThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetPasswordWithCodeThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Erreur lors de la réinitialisation avec code';
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
        state.error = null;
      })
      ;
  },
});

export const { setOnboardingSeen, clearError } = authSlice.actions;

export default authSlice.reducer;