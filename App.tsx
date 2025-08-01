import React, { useEffect, useRef } from 'react';
import { Provider } from "react-redux";
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import Navigation from './src/navigation';
import { store } from './src/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogBox, View, Text, Platform, AppState } from 'react-native';
import { LightTheme } from './src/theme';
import * as Notifications from 'expo-notifications';
import api from './src/services/api';

// Ignore specific warnings
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
]);

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  state = { hasError: false, error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>Something went wrong</Text>
          <Text style={{ color: 'red' }}>{this.state.error?.message}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const appState = useRef(AppState.currentState);

  // Configure notifications handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  // Setup Android notification channel
  const setupAndroidChannel = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }
  };

  // Register push token with backend
  const registerPushToken = async (token: string) => {
    try {
      await api.post('/users/push-token', { token });
      await AsyncStorage.setItem('pushToken', token);
      console.log('Push token registered successfully');
    } catch (error) {
      console.error('Failed to register push token:', error);
    }
  };

  // Full notification setup
  const setupNotifications = async () => {
    try {
      await setupAndroidChannel();
      
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.warn('Notification permission denied');
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Expo Push Token:', token);
      
      const savedToken = await AsyncStorage.getItem('pushToken');
      if (token !== savedToken) {
        await registerPushToken(token);
      }

      // Check if app was opened from notification
      const initialNotification = await Notifications.getLastNotificationResponseAsync();
      if (initialNotification) {
        console.log('App opened from notification:', initialNotification);
      }

    } catch (error) {
      console.error('Notification setup failed:', error);
    }
  };

  // Set up notification listeners
  useEffect(() => {
    setupNotifications();

    // Foreground notification listener
    const notificationSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Notification response listener
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
    });

    // App state listener
    const appStateSubscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        Notifications.getLastNotificationResponseAsync()
          .then(response => {
            if (response) {
              console.log('App brought to foreground by notification:', response);
            }
          });
      }
      appState.current = nextAppState;
    });

    return () => {
      notificationSubscription.remove();
      responseSubscription.remove();
      appStateSubscription.remove();
    };
  }, []);

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <SafeAreaProvider>
          <PaperProvider theme={LightTheme}>
            <NavigationContainer>
              <Navigation />
            </NavigationContainer>
          </PaperProvider>
        </SafeAreaProvider>
      </Provider>
    </ErrorBoundary>
  );
}