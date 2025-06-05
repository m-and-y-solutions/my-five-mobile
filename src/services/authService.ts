import axios from 'axios';
import config from '../config/config';
import { LoginCredentials, RegisterData } from '../types/auth.types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const authService = {
  async login(credentials: LoginCredentials) {
    try {
      const response = await axios.post(`${config.apiUrl}/auth/login`, credentials);
      console.log('Login response:', response.data);
      
      if (!response.data?.data?.accessToken || !response.data?.data?.refreshToken) {
        throw new Error('Tokens manquants dans la réponse');
      }

      // Stocker les tokens
      await AsyncStorage.setItem('accessToken', response.data.data.accessToken);
      await AsyncStorage.setItem('refreshToken', response.data.data.refreshToken);

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error('Login error:', error);
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

      const response = await axios.post(
        `${config.apiUrl}/auth/register`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Register response:', response.data);

      if (!response.data?.data?.accessToken || !response.data?.data?.refreshToken) {
        throw new Error('Tokens manquants dans la réponse');
      }

      // Stocker les tokens
      await AsyncStorage.setItem('accessToken', response.data.data.accessToken);
      await AsyncStorage.setItem('refreshToken', response.data.data.refreshToken);

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
      const response = await axios.get(`${config.apiUrl}/auth/me`, {
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
      const response = await axios.post(`${config.apiUrl}/auth/refresh`, {
        refreshToken,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async logout() {
    try {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false };
    }
  },

  async clearTokens() {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
  }
};

export default authService; 