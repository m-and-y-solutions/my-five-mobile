export interface Match {
  id: string;
  title: string;
  date: string;
  time: string;
  fieldId: string;
  maxPlayers: number;
  type: 'friendly' | 'competitive';
  visibility: 'public' | 'private'| 'group';
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  price?: number;
  currency?: string;
  team1Score?: number;
  team2Score?: number;
  duration?: number;
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
}

export interface CreateMatchData {
  title: string;
  description?: string;
  date: Date;
  location: string;
  type: string;
  visibility: 'public' | 'private'| 'group';
  maxPlayers?: number;
  duration?: number;
  groupIds?: string[];
}

export interface UpdateMatchData {
  title?: string;
  description?: string;
  date?: string;
  location?: string;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  type?: string;
  visibility?: 'public' | 'private' | 'group';
  maxPlayers?: number;
}

export interface UpdateScoreData {
  team1: number;
  team2: number;
}

export interface UpdatePlayerStatsData {
  playerId: string;
  stats: {
    goals?: number;
    assists?: number;
    yellowCards?: number;
    redCards?: number;
  };
} 