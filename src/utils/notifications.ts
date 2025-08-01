import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync() {
  console.log('[PushNotif] Starting push notification registration...');
  
  let token;
  if (Device.isDevice) {
    console.log('[PushNotif] Device detected, checking permissions...');
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log('[PushNotif] Existing permission status:', existingStatus);
    
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      console.log('[PushNotif] Requesting permissions...');
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log('[PushNotif] New permission status:', status);
    }
    
    if (finalStatus !== 'granted') {
      console.error('[PushNotif] Permission denied!');
      alert('Failed to get push token for push notification!');
      return;
    }
    
    console.log('[PushNotif] Getting Expo push token...');
    try {
      const tokenResult = await Notifications.getExpoPushTokenAsync({
        projectId: 'be32c2b9-9554-4ceb-a2e0-6e15ca5e9e33'
      });
      token = tokenResult.data;
      console.log('[PushNotif] Token received:', token);
    } catch (error) {
      console.error('[PushNotif] Error getting token:', error);
      return;
    }
  } else {
    console.log('[PushNotif] Not a physical device, cannot get push token');
    alert('Must use physical device for Push Notifications');
  }
  
  if (Platform.OS === 'android') {
    console.log('[PushNotif] Setting up Android notification channel...');
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  
  console.log('[PushNotif] Registration complete, token:', token);
  return token;
}
