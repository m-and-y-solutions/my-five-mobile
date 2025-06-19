import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  RootStackParamList,
  MainTabParamList,
  ProfileStackParamList,
} from "../types/navigation.types";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import { IconButton } from "react-native-paper";
import { useNavigation, CommonActions } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { restoreAuth, setOnboardingSeen } from "../store/slices/authSlice";

// Auth Screens
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import VerifyCodeScreen from "../screens/auth/VerifyCodeScreen";

// Main Screens
import HomeScreen from "../screens/main/HomeScreen";
import ProfileScreen from "../screens/main/ProfileScreen";
import MatchesScreen from "../screens/main/MatchesScreen";
import SettingsScreen from "../screens/main/SettingsScreen";
import CreateMatchScreen from "../screens/main/CreateMatchScreen";
import MatchDetailsScreen from "../screens/main/MatchDetailsScreen";
import UserStatsScreen from "../screens/main/UserStatsScreen";
import GroupsScreen from '../screens/main/GroupsScreen';
import GroupDetailsScreen from '../screens/main/GroupDetailsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

type MainTabsNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProfileNavigator = () => {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen
        name="Matches"
        component={MatchesScreen}
        options={({ navigation }) => ({
          headerShown: true,
          title: "Mes matchs",
          headerLeft: () => (
            <IconButton
              icon="arrow-left"
              onPress={() => navigation.navigate("ProfileMain")}
            />
          ),
        })}
      />
        <ProfileStack.Screen
        name="Groups"
        component={GroupsScreen}
        options={({ navigation }) => ({
          headerShown: true,
          title: "Mes groupes",
          headerLeft: () => (
            <IconButton
              icon="arrow-left"
              onPress={() => navigation.navigate("ProfileMain")}
            />
          ),
        })}
      />
      <ProfileStack.Screen
        name="UserStats"
        component={UserStatsScreen}
        options={({ navigation }) => ({
          headerShown: true,
          title: "Statistiques",
          headerLeft: () => (
            <IconButton
              icon="arrow-left"
              onPress={() => navigation.navigate("ProfileMain")}
            />
          ),
        })}
      />
    </ProfileStack.Navigator>
  );
};

const MainTabs = () => {
  const navigation = useNavigation<MainTabsNavigationProp>();

  return (
    <Tab.Navigator
      screenOptions={{
        headerRight: () => (
          <IconButton
            icon="menu"
            onPress={() => navigation.navigate("Settings")}
          />
        ),
        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: "#666",
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#e0e0e0",
          paddingBottom: 5,
          paddingTop: 5,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <IconButton icon="home" size={size} iconColor={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Matches"
        component={MatchesScreen}
        options={{
          title: "Matchs",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <IconButton icon="soccer" size={size} iconColor={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Groups"
        component={GroupsScreen}
        options={{
          title: "Groupes",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <IconButton icon="account-group" size={size} iconColor={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <IconButton icon="account" size={size} iconColor={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const Navigation = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const { accessToken, hasSeenOnboarding } = useSelector(
    (state: RootState) => state.auth
  );
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<MainTabsNavigationProp>();

  React.useEffect(() => {
    const init = async () => {
      try {
        console.log('🔄 Navigation - Starting auth restoration...');
        await dispatch(restoreAuth());
        const onboardingSeen = await AsyncStorage.getItem("onboardingSeen");
        console.log('📱 Navigation - Onboarding seen:', onboardingSeen);
        if (onboardingSeen === "true") {
          dispatch(setOnboardingSeen(true));
        }
      } catch (error) {
        console.error('❌ Navigation - Error initializing app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [dispatch]);

  console.log('🔑 Navigation State:', {
    accessToken: accessToken ? "Present" : "Missing",
    hasSeenOnboarding,
    isLoading
  });

  if (isLoading) {
    console.log('⏳ Navigation - Still loading...');
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {accessToken ? (
        <>
          {!hasSeenOnboarding ? (
          // {true ? (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          ) : (
            <>
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                  headerShown: true,
                  title: "Paramètres",
                  headerLeft: () => (
                    <IconButton
                      icon="arrow-left"
                      onPress={() => navigation.goBack()}
                    />
                  ),
                }}
              />
              <Stack.Screen
                name="CreateMatch"
                component={CreateMatchScreen}
                options={{
                  headerShown: true,
                  title: "Créer un match",
                  headerLeft: () => (
                    <IconButton
                      icon="arrow-left"
                      onPress={() => navigation.goBack()}
                    />
                  ),
                }}
              />
              <Stack.Screen
                name="MatchDetails"
                component={MatchDetailsScreen}
                options={{
                  headerShown: true,
                  title: "Détails du match",
                  headerLeft: () => (
                    <IconButton
                      icon="arrow-left"
                      onPress={() => navigation.goBack()}
                    />
                  ),
                }}
              />
              <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                  headerShown: true,
                  title: "Profil",
                  headerLeft: () => (
                    <IconButton
                      icon="arrow-left"
                      onPress={() => navigation.goBack()}
                    />
                  ),
                }}
              />
              <Stack.Screen
                name="CreateGroup"
                component={require('../screens/main/CreateGroupScreen').default}
                options={{
                  headerShown: true,
                  title: "Créer un groupe",
                  headerLeft: () => (
                    <IconButton
                      icon="arrow-left"
                      onPress={() => navigation.goBack()}
                    />
                  ),
                }}
              />
              <Stack.Screen
                name="GroupDetails"
                component={GroupDetailsScreen}
                options={{
                  headerShown: true,
                  title: "Détails du groupe",
                  headerLeft: () => (
                    <IconButton
                      icon="arrow-left"
                      onPress={() => navigation.goBack()}
                    />
                  ),
                }}
              />
            </>
          )}
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default Navigation;
