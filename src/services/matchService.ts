import api from './api';
import config from '../config/config';
import { CreateMatchData } from '../types/match.types';

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
  duration?: number;
  creatorId?: string;
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
  team1?: {
    id: string;
    name: string;
    score: number;
    players: Array<{
      id: string;
      position?: string;
      isCaptain: boolean;
      player: {
        id: string;
        firstName: string;
        lastName: string;
        profileImage?: string;
      };
      stats?: {
        goals: number;
        assists: number;
        yellowCards: number;
        redCards: number;
      };
    }>;
  };
  team2?: {
    id: string;
    name: string;
    score: number;
    players: Array<{
      id: string;
      position?: string;
      isCaptain: boolean;
      player: {
        id: string;
        firstName: string;
        lastName: string;
        profileImage?: string;
      };
      stats?: {
        goals: number;
        assists: number;
        yellowCards: number;
        redCards: number;
      };
    }>;
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

export interface UserStatsData {
  goals?: number;
  assists?: number;
  yellowCards?: number;
  redCards?: number;
}

export interface UpdatePlayerStatsData {
  playerId: string;
  team?: string;
  stats: UserStatsData;
}

const matchService = {
  async getMatches(filters?: {
    creatorId?: string;
    status?: string;
    type?: string;
    visibility?: string;
    country?: string
  }) {
    const response = await api.get(`${config.apiUrl}/matches`, {
      params: filters,
    });
    return response.data;
  },

  async getMatchById(id: string) {
    const response = await api.get(`${config.apiUrl}/matches/${id}`);
    return response.data;
  },

  async getUserMatches(userId: string) {
    const response = await api.get(`${config.apiUrl}/matches`, {
      params: { creatorId: userId },
    });
    return response.data;
  },

  async createMatch(data: CreateMatchData) {
    const response = await api.post(`${config.apiUrl}/matches`, data);
    return response.data;
  },

  async updateMatch(id: string, data: UpdateMatchData) {
    const response = await api.patch(`${config.apiUrl}/matches/${id}`, data);
    return response.data;
  },

  async joinMatch(id: string, team: "team1" | "team2") {
    const response = await api.post(`${config.apiUrl}/matches/${id}/join`, {
      team,
    });
    return response.data;
  },

  async leaveMatch(id: string, userId?: string) {
    const url = `${config.apiUrl}/matches/${id}/leave/${userId}`
    const response = await api.post(url);
    return response.data;
  },

 async updateMatchStatus(id: string, status: string) {
    const response = await api.put(
      `${config.apiUrl}/matches/${id}/status`,
      {status}
    );
    return response.data;
  },
  async updateScore(id: string, data: UpdateScoreData) {
    const response = await api.put(
      `${config.apiUrl}/matches/${id}/score`,
      data
    );
    return response.data;
  },

  async updatePlayerStats(id: string, data: UpdatePlayerStatsData) {
    const response = await api.put(
      `${config.apiUrl}/matches/${id}/stats`,
      data
    );
    return response.data;
  },

  async updateCaptain(id: string, playerId: string, team: "team1" | "team2") {
    const response = await api.put(`${config.apiUrl}/matches/${id}/captain`, {
      playerId,
      team,
    });
    return response.data;
  },

  async updateMatchScore(id: string, data: UpdateScoreData) {
    const response = await api.put(
      `${config.apiUrl}/matches/${id}/score`,
      data
    );
    return response.data;
  },

  async deleteMatch(id: string) {
    const response = await api.delete(`${config.apiUrl}/matches/${id}`);
    return response.data;
  },
};

export default matchService;