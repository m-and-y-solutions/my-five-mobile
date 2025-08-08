import React, { useEffect } from 'react';
import { Provider } from "react-redux";
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import Navigation from './src/navigation';
import { RootState, store } from './src/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogBox, View, Text, Alert, Platform } from 'react-native';
import { LightTheme } from './src/theme';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { addNotification } from 'store/slices/notificationSlice';
import config from 'config/config';
import firebase from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import { registerFCMTokenWithBackend } from './src/services/notificationService';

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
  // Configurer les notifications
  // Notifications.setNotificationHandler({
  //   handleNotification: async () => ({
  //     shouldShowAlert: true,
  //     shouldPlaySound: true,
  //     shouldSetBadge: false,
  //     shouldShowBanner: true,
  //     shouldShowList: true,
  //   }),
  // });

  // useEffect(() => {
  //   const subscription = Notifications.addNotificationReceivedListener(notification => {
  //     console.log('Notification reçue pendant que l\'app est ouverte :', notification);
  //     Alert.alert(notification.request.content.title || 'Notification', notification.request.content.body || '');
  //   });

  //   return () => subscription.remove();
  // }, []);

  // Demander les permissions
  // const requestPermissions = async () => {
  //   const { status } = await Notifications.requestPermissionsAsync();
  //   if (status !== 'granted') {
  //     alert('Permission refusée pour les notifications');
  //   }
  // };

  // React.useEffect(() => {
  //   const initializeNotifications = async () => {
  //     await requestPermissions();
      
  //     // Enregistrer le token push
  //     const token = await registerForPushNotificationsAsync();
  //     if (token) {
  //       try {
  //         await api.post('/users/push-token', { token });
  //         console.log('[App] Push token enregistré:', token);
  //       } catch (error) {
  //         console.error('[App] Erreur lors de l\'enregistrement du token:', error);
  //       }
  //     }
  //   };
    
  //   initializeNotifications();
  // }, []);

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

  // Initialiser Firebase
  React.useEffect(() => {
    if (!firebase.apps.length) {
      console.log('[App] Initializing Firebase...');
    } else {
      console.log('[App] Firebase already initialized');
    }

    // Configurer Firebase Messaging
    const initializeFirebaseMessaging = async () => {
      try {
        // Demander les permissions
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('[App] Firebase messaging permission granted');
          
          // Créer le canal de notification pour Android
          if (Platform.OS === 'android') {
            try {
              // Firebase Messaging gère automatiquement les canaux de notification
              // Pas besoin de créer manuellement le canal
              console.log('[App] Android notification channel will be created automatically');
            } catch (error) {
              console.error('[App] Error with notification setup:', error);
            }
          }
          
          // Récupérer et enregistrer le token FCM
          const fcmToken = await messaging().getToken();
          console.log('[App] FCM token:', fcmToken.substring(0, 20) + '...');
          console.log('[App] FCM token length:', fcmToken.length);
          
          // Enregistrer le token FCM avec le backend
          try {
            await registerFCMTokenWithBackend(fcmToken);
            console.log('[App] FCM token registered with backend');
          } catch (error) {
            console.error('[App] Error registering FCM token:', error);
          }
          
          // Écouter les notifications en foreground
          messaging().onMessage(async remoteMessage => {
            console.log('[App] Firebase notification received in foreground:', remoteMessage);
            
            // Vérifier si une alerte est déjà affichée
            if (remoteMessage.notification?.title && remoteMessage.notification?.body) {
              // Utiliser setTimeout pour éviter les conflits
              setTimeout(() => {
                Alert.alert(
                  remoteMessage.notification!.title || 'Notification',
                  remoteMessage.notification!.body || '',
                  [
                    {
                      text: 'OK',
                      onPress: () => console.log('Notification alert dismissed')
                    }
                  ],
                  { cancelable: true }
                );
              }, 100);
            }
          });

        } else {
          console.log('[App] Firebase messaging permission denied');
          Alert.alert(
            'Permissions requises',
            'Les notifications Firebase nécessitent des permissions. Veuillez les activer dans les paramètres.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('[App] Firebase messaging error:', error);
      }
    };

    initializeFirebaseMessaging();
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
