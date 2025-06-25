import api from './api';
import config from '../config/config';
import { User } from 'types/user.types';
import { Match } from './matchService';

export interface Group {
  id: string;
  name: string;
  description: string;
  isMember: boolean;
  creatorId?: string;
  rules?: string[];
  members?: User[];
  matches?: Match[];
}

const groupService = {
  async getGroups(country: string): Promise<Group[]> {
    const response = await api.get(`${config.apiUrl}/groups`, {
      params: { country },
    }
    );
    // On suppose que l'API renvoie la liste des groupes et qu'on doit déterminer isMember pour chaque groupe
    // Si l'API ne renvoie pas isMember, il faudra faire un appel supplémentaire par groupe (peu optimal)
    // Ici, on suppose que l'API renvoie déjà isMember OU que le backend est adapté pour le faire
    return response.data;
  },

  async joinGroup(groupId: string) {
    const response = await api.post(`${config.apiUrl}/groups/${groupId}/join`);
    return response.data;
  },

  async leaveGroup(groupId: string) {
    const response = await api.post(`${config.apiUrl}/groups/${groupId}/leave`);
    return response.data;
  },

  async createGroup(data: { name: string; description: string; rules: string[] }) {
    const response = await api.post(`${config.apiUrl}/groups`, data);
    return response.data;
  },

  async removeMember(groupId: string, userId: string) {
    const response = await api.post(`${config.apiUrl}/groups/${groupId}/members/${userId}`);
    return response.data;
  },

  async deleteGroup(groupId: string) {
    const response = await api.delete(`${config.apiUrl}/groups/${groupId}`);
    return response.data;
  },
};

export default groupService; 