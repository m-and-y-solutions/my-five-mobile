import { Match } from '../services/matchService';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage: string;
  phone: string;
  gender: string;
  birthDate: Date;
  address: string;
  country: string;
  state: string;
  city: string;
  score: number;
  ranking: number;
  description: string;
  interests: string[];
  preferences: {
    notifications: boolean;
    language: string;
    theme: string;
    privacy: {
      showEmail: boolean;
      showPhone: boolean;
      showLocation: boolean;
    };
  };
  role: string;
  isPublic: boolean;
  position: string;
  rating: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  goalsScored: number;
  assists: number;
  cleanSheets: number;
  yellowCards: number;
  redCards: number;
  createdAt: string;
  updatedAt: string;
}

interface Field {
  id: string;
  name: string;
  address: string;
  country: string;
  state: string;
  city: string;
  isAvailable: boolean;
}

export const MOCK_FIELDS: Field[] = [
  {
    id: '1',
    name: 'FitFive – Laeken',
    address: 'Rue Tielemans 2, 1020 Laeken',
    country: 'Belgique',
    state: 'Bruxelles',
    city: 'Laeken (Ville de Bruxelles)',
    isAvailable: true,
  },
  {
    id: '2',
    name: 'FitFive – Forest',
    country: 'Belgique',
    state: 'Bruxelles',
    address: 'Rue Lusambo 36, 1190 Forest',
    city: 'Forest',
    isAvailable: true,
  },
  {
    id: '3',
    name: 'City Five – Molenbeek-Saint-Jean',
    address: 'Rue de l\'Indépendance 83, 1080 Molenbeek-Saint-Jean',
    city: 'Molenbeek-Saint-Jean',
    country: 'Belgique',
    state: 'Bruxelles',
    isAvailable: true,
  },
];

export const MOCK_USERS: User[] = [
  {
    id: '1',
    username: 'johndoe',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    profileImage: 'https://i.pravatar.cc/150?img=1',
    phone: '+32470123456',
    gender: 'M',
    birthDate: new Date('1990-01-01'),
    address: 'Street 1, Brussels',
    country: 'Belgium',
    state: 'Brussels',
    city: 'Brussels',
    score: 85,
    ranking: 1,
    description: 'Football enthusiast',
    interests: ['Football', 'Fitness'],
    preferences: {
      notifications: true,
      language: 'en',
      theme: 'light',
      privacy: {
        showEmail: false,
        showPhone: false,
        showLocation: true
      }
    },
    role: 'USER',
    isPublic: true,
    position: 'forward',
    rating: 4.5,
    matchesPlayed: 10,
    matchesWon: 7,
    matchesLost: 3,
    goalsScored: 15,
    assists: 8,
    cleanSheets: 0,
    yellowCards: 2,
    redCards: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    username: 'janesmith',
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    profileImage: 'https://i.pravatar.cc/150?img=2',
    phone: '+32470123457',
    gender: 'F',
    birthDate: new Date('1992-02-02'),
    address: 'Street 2, Brussels',
    country: 'Belgium',
    state: 'Brussels',
    city: 'Brussels',
    score: 82,
    ranking: 2,
    description: 'Midfielder',
    interests: ['Football', 'Music'],
    preferences: {
      notifications: true,
      language: 'en',
      theme: 'light',
      privacy: {
        showEmail: false,
        showPhone: false,
        showLocation: true
      }
    },
    role: 'USER',
    isPublic: true,
    position: 'midfielder',
    rating: 4.2,
    matchesPlayed: 8,
    matchesWon: 5,
    matchesLost: 3,
    goalsScored: 8,
    assists: 12,
    cleanSheets: 0,
    yellowCards: 1,
    redCards: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    username: 'mikejohnson',
    email: 'mike@example.com',
    firstName: 'Mike',
    lastName: 'Johnson',
    profileImage: 'https://i.pravatar.cc/150?img=3',
    phone: '+32470123458',
    gender: 'M',
    birthDate: new Date('1988-03-03'),
    address: 'Street 3, Brussels',
    country: 'Belgium',
    state: 'Brussels',
    city: 'Brussels',
    score: 80,
    ranking: 3,
    description: 'Defender',
    interests: ['Football', 'Gaming'],
    preferences: {
      notifications: true,
      language: 'en',
      theme: 'light',
      privacy: {
        showEmail: false,
        showPhone: false,
        showLocation: true
      }
    },
    role: 'USER',
    isPublic: true,
    position: 'defender',
    rating: 4.0,
    matchesPlayed: 12,
    matchesWon: 8,
    matchesLost: 4,
    goalsScored: 3,
    assists: 5,
    cleanSheets: 4,
    yellowCards: 3,
    redCards: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    username: 'sarahwilson',
    email: 'sarah@example.com',
    firstName: 'Sarah',
    lastName: 'Wilson',
    profileImage: 'https://i.pravatar.cc/150?img=4',
    phone: '+32470123459',
    gender: 'F',
    birthDate: new Date('1995-04-04'),
    address: 'Street 4, Brussels',
    country: 'Belgium',
    state: 'Brussels',
    city: 'Brussels',
    score: 78,
    ranking: 4,
    description: 'Goalkeeper',
    interests: ['Football', 'Photography'],
    preferences: {
      notifications: true,
      language: 'en',
      theme: 'light',
      privacy: {
        showEmail: false,
        showPhone: false,
        showLocation: true
      }
    },
    role: 'USER',
    isPublic: true,
    position: 'goalkeeper',
    rating: 4.8,
    matchesPlayed: 15,
    matchesWon: 10,
    matchesLost: 5,
    goalsScored: 0,
    assists: 0,
    cleanSheets: 8,
    yellowCards: 1,
    redCards: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '5',
    username: 'alexbrown',
    email: 'alex@example.com',
    firstName: 'Alex',
    lastName: 'Brown',
    profileImage: 'https://i.pravatar.cc/150?img=5',
    phone: '+32470123460',
    gender: 'M',
    birthDate: new Date('1993-05-05'),
    address: 'Street 5, Brussels',
    country: 'Belgium',
    state: 'Brussels',
    city: 'Brussels',
    score: 75,
    ranking: 5,
    description: 'Forward',
    interests: ['Football', 'Cooking'],
    preferences: {
      notifications: true,
      language: 'en',
      theme: 'light',
      privacy: {
        showEmail: false,
        showPhone: false,
        showLocation: true
      }
    },
    role: 'USER',
    isPublic: true,
    position: 'forward',
    rating: 4.3,
    matchesPlayed: 9,
    matchesWon: 6,
    matchesLost: 3,
    goalsScored: 12,
    assists: 6,
    cleanSheets: 0,
    yellowCards: 2,
    redCards: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const MOCK_MATCHES: Match[] = [
  {
    id: '1',
    title: 'Weekend Friendly Match',
    date: new Date('2024-03-30').toISOString(),
    time: '15:00',
    maxPlayers: 10,
    type: 'friendly',
    visibility: 'public',
    price: 10,
    currency: 'EUR',
    status: 'upcoming',
    fieldId: MOCK_FIELDS[0].id,
    field: MOCK_FIELDS[0],
    creator: MOCK_USERS[0],
    participants: [MOCK_USERS[0], MOCK_USERS[1]],
  },
  {
    id: '2',
    title: 'Weekend Friendly Match 2',
    date: new Date('2024-04-01').toISOString(),
    time: '18:00',
    maxPlayers: 10,
    type: 'friendly',
    visibility: 'public',
    price: 15,
    currency: 'EUR',
    status: 'ongoing',
    fieldId: MOCK_FIELDS[1].id,
    field: MOCK_FIELDS[1],
    creator: MOCK_USERS[1],
    participants: [MOCK_USERS[0], MOCK_USERS[1]],
  },
  {
    id: '3',
    title: 'Private Match',
    date: new Date('2024-04-01').toISOString(),
    time: '18:00',
    maxPlayers: 10,
    type: 'friendly',
    visibility: 'private',
    price: 15,
    currency: 'EUR',
    status: 'completed',
    fieldId: MOCK_FIELDS[2].id,
    field: MOCK_FIELDS[2],
    creator: MOCK_USERS[1],
    participants: [MOCK_USERS[0], MOCK_USERS[1]],
  },
];
