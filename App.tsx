import React, { useEffect } from 'react';
import { Provider } from "react-redux";
import { NavigationContainer, DefaultTheme, LinkingOptions } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import Navigation from './src/navigation';
import { RootState, store } from './src/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogBox, View, Text } from 'react-native';
import { LightTheme } from './src/theme';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { addNotification } from 'store/slices/notificationSlice';
import config from 'config/config';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from './src/utils/notifications';
import api from './src/services/api';

// Ignore specific warnings
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
]);

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Error boundary component
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('App Error:', error, errorInfo);
  }

  render(): React.ReactNode {
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
  const linking: LinkingOptions<any> = {
    prefixes: ['myfive://'],
    config: {
      screens: {
        Main: {
          screens: {
            Matches: 'matches',
          },
        },
        MatchDetails: 'match/:matchId',
      },
    },
  };
  // Configurer les notifications
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  // Demander les permissions
  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission refusée pour les notifications');
    }
  };

  React.useEffect(() => {
    const initializeNotifications = async () => {
      await requestPermissions();
      
      // Enregistrer le token push
      const token = await registerForPushNotificationsAsync();
      if (token) {
        try {
          await api.post('/users/push-token', { token });
          console.log('[App] Push token enregistré:', token);
        } catch (error) {
          console.error('[App] Erreur lors de l\'enregistrement du token:', error);
        }
      }
    };
    
    initializeNotifications();
  }, []);

  React.useEffect(() => {
    const testAsyncStorage = async () => {
      try {
        await AsyncStorage.setItem('test', 'test');
        const value = await AsyncStorage.getItem('test');
      } catch (error) {
        console.error('❌ AsyncStorage error:', error);
      }
    };
    testAsyncStorage();
  }, []);

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <SafeAreaProvider>
          <PaperProvider theme={LightTheme}>
            <NavigationContainer linking={linking}>
              <Navigation />
            </NavigationContainer>
          </PaperProvider>
        </SafeAreaProvider>
      </Provider>
    </ErrorBoundary>
  );
}
