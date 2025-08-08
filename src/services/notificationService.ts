import api from './api';
import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';

export const fetchNotifications = async () => {
  const res = await api.get('/notifications');
  return res.data;
};

export const sendTestNotification = async () => {
  try {
    // Demander les permissions pour Firebase
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log('Firebase messaging permission not granted');
      throw new Error('Firebase messaging permission not granted');
    }

    // Récupérer le token FCM
    const fcmToken = await messaging().getToken();
    console.log("FCM token:", fcmToken);

    // Appel au backend pour envoyer via Firebase
    const response = await api.post('/users/test-firebase-notification', {
      token: fcmToken,
      title: "Test Firebase Notification",
      body: "Ceci est une notification de test via Firebase!",
      data: {
        type: 'firebase_test',
        timestamp: new Date().toISOString(),
      }
    });

    console.log('Firebase notification response:', response.data);
    return { success: true, message: 'Notification Firebase de test envoyée' };
  } catch (error) {
    console.error('Error sending Firebase test notification:', error);
    throw error;
  }
};

export const sendFirebaseTestNotification = async () => {
  try {
    // Demander les permissions pour Firebase
    const authStatus = await messaging().requestPermission();
    console.log('[FCM] Auth status:', authStatus);
    
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log('Firebase messaging permission not granted');
      throw new Error('Firebase messaging permission not granted');
    }

    // Récupérer le token FCM
    const fcmToken = await messaging().getToken();
    console.log("[FCM] Token complet:", fcmToken);
    console.log("[FCM] Token length:", fcmToken.length);
    console.log("[FCM] Token starts with:", fcmToken.substring(0, 10));

    // Appel au backend pour envoyer via Firebase
    const response = await api.post('/users/test-firebase-notification', {
      token: fcmToken,
      title: "Test Firebase Notification",
      body: "Ceci est une notification de test via Firebase!",
      data: {
        type: 'firebase_test',
        timestamp: new Date().toISOString(),
      }
    });

    console.log('Firebase notification response:', response.data);
    return { success: true, message: 'Notification Firebase de test envoyée' };
  } catch (error) {
    console.error('Error sending Firebase test notification:', error);
    throw error;
  }
};

export const registerFCMTokenWithBackend = async (fcmToken: string) => {
  try {
    const response = await api.post('/users/fcm-token', { token: fcmToken });
    console.log('FCM token registered with backend:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error registering FCM token with backend:', error);
    throw error;
  }
};

export const logFCMTokenForTesting = async () => {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log('Firebase messaging permission not granted');
      return;
    }

    const fcmToken = await messaging().getToken();
    console.log('=== FCM TOKEN POUR TEST FIREBASE CONSOLE ===');
    console.log('Copiez ce token et testez depuis Firebase Console:');
    console.log(fcmToken);
    console.log('=== FIN DU TOKEN ===');
    
    Alert.alert(
      'Token FCM copié',
      'Le token FCM a été affiché dans la console. Copiez-le et testez depuis Firebase Console.',
      [{ text: 'OK' }]
    );
    
    return fcmToken;
  } catch (error) {
    console.error('Error getting FCM token:', error);
  }
};

export const sendDelayedFirebaseTest = async () => {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log('Firebase messaging permission not granted');
      throw new Error('Firebase messaging permission not granted');
    }

    const fcmToken = await messaging().getToken();
    console.log("[FCM] Token pour test différé:", fcmToken.substring(0, 20) + "...");

    // Envoyer la notification après un délai
    setTimeout(async () => {
      try {
        const response = await api.post('/users/test-firebase-notification', {
          token: fcmToken,
          title: "Test en arrière-plan",
          body: "Cette notification devrait apparaître dans la barre de notifications",
          data: {
            type: 'background_test',
            timestamp: new Date().toISOString(),
          }
        });
        console.log('Notification en arrière-plan envoyée:', response.data);
      } catch (error) {
        console.error('Erreur notification arrière-plan:', error);
      }
    }, 3000);

    return { success: true, message: 'Test en arrière-plan configuré - fermez l\'app dans 3 secondes' };
  } catch (error) {
    console.error('Error setting up delayed test:', error);
    throw error;
  }
};
