// firebase-messaging.js
import messaging from '@react-native-firebase/messaging';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('[firebase-messaging.js] Message handled in background!', remoteMessage);
  
  // Firebase devrait automatiquement afficher la notification si le champ "notification" est présent
  // Si ce n'est pas le cas, c'est un problème de configuration
  console.log('[firebase-messaging.js] Notification title:', remoteMessage.notification?.title);
  console.log('[firebase-messaging.js] Notification body:', remoteMessage.notification?.body);
  
  // Retourner une promesse pour indiquer que le message a été traité
  return Promise.resolve();
}); 