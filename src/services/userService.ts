import config from '../config/config';
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const userService = {
  async updateUser(id: string, data: any) {
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
  },

  async getMe() {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await api.get(`${config.apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

export default userService; 