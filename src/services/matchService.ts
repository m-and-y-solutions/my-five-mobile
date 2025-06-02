import axios from 'axios';
import { API_URL } from '../config/config';

export interface Match {
  id: string;
  title: string;
  date: string;
  time: string;
  fieldId: string;
  maxPlayers: number;
  type: 'friendly' | 'competitive';
  visibility: 'public' | 'private';
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  price?: number;
  currency?: string;
  team1Score?: number;
  team2Score?: number;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  field: {
    id: string;
    name: string;
    address: string;
    city: string;
  };
  participants: Array<{
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  }>;
  playerStats?: Array<{
    id: string;
    player: {
      id: string;
      firstName: string;
      lastName: string;
    };
    goals: number;
    assists: number;
  }>;
}

export interface CreateMatchData {
  title: string;
  date: string;
  time: string;
  fieldId: string;
  maxPlayers: number;
  type: 'friendly' | 'competitive';
  visibility: 'public' | 'private';
  price?: number;
  currency?: string;
}

export interface UpdateMatchData {
  title?: string;
  date?: string;
  time?: string;
  fieldId?: string;
  maxPlayers?: number;
  type?: 'friendly' | 'competitive';
  visibility?: 'public' | 'private';
  price?: number;
  currency?: string;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export interface UpdateScoreData {
  team1Score: number;
  team2Score: number;
}

export interface UpdatePlayerStatsData {
  playerId: string;
  goals: number;
  assists: number;
}

const matchService = {
  async getMatches(token: string, filters?: { status?: string; type?: string; visibility?: string }) {
    const response = await axios.get(`${API_URL}/matches`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: filters,
    });
    return response.data;
  },

  async getMatchById(id: string, token: string) {
    const response = await axios.get(`${API_URL}/matches/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async getUserMatches(userId: string, token: string) {
    const response = await axios.get(`${API_URL}/matches/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async createMatch(data: CreateMatchData, token: string) {
    const response = await axios.post(`${API_URL}/matches`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async updateMatch(id: string, data: UpdateMatchData, token: string) {
    const response = await axios.patch(`${API_URL}/matches/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async joinMatch(id: string, token: string) {
    const response = await axios.post(
      `${API_URL}/matches/${id}/join`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  async leaveMatch(id: string, token: string) {
    const response = await axios.post(
      `${API_URL}/matches/${id}/leave`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  async updateScore(id: string, data: UpdateScoreData, token: string) {
    const response = await axios.patch(`${API_URL}/matches/${id}/score`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async updatePlayerStats(id: string, data: UpdatePlayerStatsData, token: string) {
    const response = await axios.patch(`${API_URL}/matches/${id}/stats`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};

export default matchService; 