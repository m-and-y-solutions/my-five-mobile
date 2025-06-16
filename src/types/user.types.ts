export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    birthDate?: string;
    address?: string;
    profileImage?: string;
    stats?: UserStats;
  }

  
export interface UserStats {
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  goalsScored: number;
  assists: number;
  ranking: number;
  winRate: number;
  averageGoalsPerMatch: number;
  averageAssistsPerMatch: number;
  currentStreak: number;
  bestStreak: number;
  favoritePosition: string;
  totalPlayTime: number;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt: string;
  }>;
}

export interface UserSocial {
  groups: number;
  following: number;
  followers: number;
}

export interface UserState {
  stats: UserStats | null;
  social: UserSocial | null;
  loading: boolean;
  error: string | null;
  selectedUser: User | null;
}