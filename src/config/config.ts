const config = {
  apiUrl: 'http://192.168.1.16:3000/api',
  serverUrl: 'http://192.168.1.16:3000',
  //  apiUrl: 'http://192.168.1.16:3000/api',
  // serverUrl: 'http://192.168.1.16:3000',
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


