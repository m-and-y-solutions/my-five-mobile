import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  Settings: undefined;
  CreateMatch: undefined;
  MatchDetails: { matchId: string };
  UserStats: undefined;
  TournamentDetails: { tournamentId: string };
  Profile: { userId?: string };
  ProfileMain: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
  Matches: { isUserMatches?: boolean };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  Matches: { isUserMatches?: boolean };
  UserStats: undefined;
}; 
 