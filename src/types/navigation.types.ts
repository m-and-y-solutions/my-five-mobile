import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: { message?: string } | undefined;
  Register: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  Settings: undefined;
  CreateMatch: undefined;
  CreateGroup: undefined;
  MatchDetails: { matchId: string };
  UserStats: undefined;
  TournamentDetails: { tournamentId: string };
  Profile: { userId?: string };
  ProfileMain: undefined;
  Groups: { isUserGroups?: boolean };
  ForgotPassword: undefined;
  Matches: { isUserMatches?: boolean };
  GroupDetails: { groupId: string };
  GroupJoinRequests: { groupId: string };
  Notifications: undefined;
  VerifyCode: { email: string };
  VerifyCodeReset: { email: string };
  ResetPassword: { email: string; code: string };
};

export type MainTabParamList = {
  Home: undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
  Matches: { isUserMatches?: boolean };
  Groups: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  Matches: { isUserMatches?: boolean };
  Groups: { isUserGroups?: boolean };
  UserStats: undefined;
  EditProfile: undefined;
}; 
 