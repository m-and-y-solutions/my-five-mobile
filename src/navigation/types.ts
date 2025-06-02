export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  MatchDetails: { matchId: string };
  CreateMatch: undefined;
  Matches: { isUserMatches?: boolean };
  Profile: undefined;
  Settings: undefined;
  UserStats: undefined;
}; 