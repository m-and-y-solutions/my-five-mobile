import config from '../config/config';
import { LoginCredentials, RegisterData } from '../types/auth.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const authService = {
  async login(credentials: LoginCredentials) {
    try {
      console.log('🔑 Starting login process...');
      const response = await api.post(`${config.apiUrl}/auth/login`, credentials);
      //todo remove
            await AsyncStorage.multiRemove(['onboardingSeen']);
            await AsyncStorage.setItem('onboardingSeen', 'false');

      
      if (!response.data?.data?.accessToken || !response.data?.data?.refreshToken) {
        throw new Error('Tokens manquants dans la réponse');
      }

      // Stocker les tokens
      await AsyncStorage.setItem('accessToken', response.data.data.accessToken);
      await AsyncStorage.setItem('refreshToken', response.data.data.refreshToken);
      
      // Vérifier que les tokens sont bien stockés
      const storedAccessToken = await AsyncStorage.getItem('accessToken');
      const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
      console.log('💾 Stored tokens after login:', {
        accessToken: storedAccessToken ? 'Stored' : 'Missing',
        refreshToken: storedRefreshToken ? 'Stored' : 'Missing'
      });

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error('❌ Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Une erreur est survenue',
      };
    }
  },

  async register(data: RegisterData) {
    try {
      const formData = new FormData();
      
      // Append user data
      formData.append('firstName', data.firstName);
      formData.append('lastName', data.lastName);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('birthDate', data?.birthDate || '');
      formData.append('country', data?.country || '');
      formData.append('state', data?.state || '');
      formData.append('city', data?.city || '');
      formData.append('address', data?.address || '');
      formData.append('telephone', data?.telephone || '');

      // Append image if exists
      if (data.profileImage) {
        formData.append('profileImage', data.profileImage);
      }

      const response = await api.post(
        `${config.apiUrl}/auth/register`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // console.log('Register response:', response.data);

      // if (!response.data?.data?.accessToken || !response.data?.data?.refreshToken) {
      //   throw new Error('Tokens manquants dans la réponse');
      // }

      // // Stocker les tokens
      // await AsyncStorage.setItem('accessToken', response.data.data.accessToken);
      // await AsyncStorage.setItem('refreshToken', response.data.data.refreshToken);

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error('Register error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Une erreur est survenue',
      };
    }
  },

  async getCurrentUser() {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await api.get(`${config.apiUrl}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Une erreur est survenue',
      };
    }
  },

  async refreshToken(refreshToken: string) {
    try {
      const response = await api.post(`${config.apiUrl}/auth/refresh-token`, {
        refreshToken
      });
      
      if (!response.data?.data?.accessToken) {
        throw new Error('No access token in response');
      }

      return {
        success: true,
        data: {
          accessToken: response.data.data.accessToken,
          refreshToken: response.data.data.refreshToken
        }
      };
    } catch (error: any) {
      console.error('Refresh token error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Une erreur est survenue'
      };
    }
  },

  async logout() {
    try {
      console.log('🔒 Starting logout process...');
      const token = await AsyncStorage.getItem('accessToken');
      console.log('🔑 Current access token:', token);
      
      await api.post(`${config.apiUrl}/auth/logout`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('✅ Backend logout successful');

      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user', 'token']);
      console.log('🧹 Local storage cleared');
      
      // Vérifier que tout est bien supprimé
      const remainingToken = await AsyncStorage.getItem('accessToken');
      const remainingRefreshToken = await AsyncStorage.getItem('refreshToken');
      const remainingUser = await AsyncStorage.getItem('user');
      console.log('🔍 Storage check after logout:', {
        accessToken: remainingToken ? 'Still present' : 'Cleared',
        refreshToken: remainingRefreshToken ? 'Still present' : 'Cleared',
        user: remainingUser ? 'Still present' : 'Cleared'
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Logout error:', error);
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
      return { success: false };
    }
  },

  async clearTokens() {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
  },

  sendVerificationCode: (email: string) =>
    api.post('/auth/send-code', { email }),

  verifyCode: (email: string, code: string) =>
    api.post('/auth/verify-code', { email, code })
};

export default authService; 