const config = {
  // apiUrl: 'https://my-five-server.onrender.com/api',
  // serverUrl: 'https://my-five-server.onrender.com',
   apiUrl: 'http://192.168.1.11:3001/api',
  serverUrl: 'http://192.168.1.11:3001',
};

export default config;


export const MATCH_TYPES = {
  FRIENDLY: 'friendly',
  COMPETITIVE: 'competitive',
} as const;

export const MATCH_VISIBILITY = {
  PUBLIC: 'public',
  PRIVATE: 'private',
} as const;

export const MATCH_STATUS = {
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;


