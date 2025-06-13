import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, List, Switch, Button, useTheme, Avatar, Divider } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { SafeAreaView } from 'react-native-safe-area-context';

const SettingsScreen = () => {
  const [settings, setSettings] = useState({
    profileVisibility: true,
    shareActivity: true,
    shareLocation: true,
    notifications: {
      likes: true,
      comments: true,
      tags: true,
      connections: true,
    },
  });
  const theme = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);



  const toggleSetting = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  const toggleNotification = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key as keyof typeof prev.notifications],
      },
    }));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>

    <ScrollView style={styles.container}>
      <View style={styles.userSection}>
        <Avatar.Image
          size={80}
          source={user?.profileImage ? { uri: user.profileImage } : require('../../../assets/default-avatar.png')}
        />
        <Text variant="headlineSmall" style={[styles.userName, { color: '#4CAF50' }]}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text variant="bodyMedium" style={styles.userEmail}>
          {user?.email}
        </Text>
      </View>

      <Divider />

      <View style={styles.section}>
        <Text variant="titleLarge" style={[styles.sectionTitle, { color: "#000000" }]}>
          Paramètres de confidentialité
        </Text>
        <List.Item
          title="Profil public"
          description="Autoriser les autres à voir votre profil"
          left={props => <List.Icon {...props} icon="account-lock" color="#4CAF50" />}
          right={() => (
            <Switch
              value={settings.profileVisibility}
              onValueChange={() => toggleSetting('profileVisibility')}
              color="#4CAF50"
            />
          )}
        />

        <List.Item
          title="Partager l'activité"
          description="Partager vos activités de match avec les autres"
          left={props => <List.Icon {...props} icon="share-variant" color="#4CAF50" />}
          right={() => (
            <Switch
              value={settings.shareActivity}
              onValueChange={() => toggleSetting('shareActivity')}
              color="#4CAF50"
            />
          )}
        />

        <List.Item
          title="Partager la localisation"
          description="Partager votre localisation approximative"
          left={props => <List.Icon {...props} icon="map-marker" color="#4CAF50" />}
          right={() => (
            <Switch
              value={settings.shareLocation}
              onValueChange={() => toggleSetting('shareLocation')}
              color="#4CAF50"
            />
          )}
        />
      </View>

      <View style={styles.section}>
        <Text variant="titleLarge" style={[styles.sectionTitle, { color: "#000000" }]}>
          Notifications
        </Text>
        <List.Item
          title="J'aime"
          description="Notifier quand quelqu'un aime votre publication"
          left={props => <List.Icon {...props} icon="heart" color="#4CAF50" />}
          right={() => (
            <Switch
              value={settings.notifications.likes}
              onValueChange={() => toggleNotification('likes')}
              color="#4CAF50"
            />
          )}
        />

        <List.Item
          title="Commentaires"
          description="Notifier quand quelqu'un commente votre publication"
          left={props => <List.Icon {...props} icon="comment" color="#4CAF50" />}
          right={() => (
            <Switch
              value={settings.notifications.comments}
              onValueChange={() => toggleNotification('comments')}
              color="#4CAF50"
            />
          )}
        />

        <List.Item
          title="Mentions"
          description="Notifier quand quelqu'un vous mentionne"
          left={props => <List.Icon {...props} icon="at" color="#4CAF50" />}
          right={() => (
            <Switch
              value={settings.notifications.tags}
              onValueChange={() => toggleNotification('tags')}
              color="#4CAF50"
            />
          )}
        />

        <List.Item
          title="Connexions"
          description="Notifier quand quelqu'un vous suit"
          left={props => <List.Icon {...props} icon="account-plus" color="#4CAF50" />}
          right={() => (
            <Switch
              value={settings.notifications.connections}
              onValueChange={() => toggleNotification('connections')}
              color="#4CAF50"
            />
          )}
        />
      </View>

      <View style={styles.section}>
        <Text variant="titleLarge" style={[styles.sectionTitle, { color: "#000000" }]}>
          Compte
        </Text>
        <List.Item
          title="Utilisateurs bloqués"
          description="Gérer les connexions bloquées"
          left={props => <List.Icon {...props} icon="block-helper" color="#4CAF50" />}
          right={(props: { color: string; style?: any }) => <List.Icon {...props} icon="chevron-right" color="#4CAF50" />}
        />

        <List.Item
          title="Aide et support"
          description="Obtenir de l'aide avec l'application"
          left={props => <List.Icon {...props} icon="help-circle" color="#4CAF50" />}
          right={(props: { color: string; style?: any }) => <List.Icon {...props} icon="chevron-right" color="#4CAF50" />}
        />

        <List.Item
          title="Mentions légales"
          description="Conditions d'utilisation et politique de confidentialité"
          left={props => <List.Icon {...props} icon="file-document" color="#4CAF50" />}
          right={(props: { color: string; style?: any }) => <List.Icon {...props} icon="chevron-right" color="#4CAF50" />}
        />
      </View>

      <View style={styles.section}>
        <Button
          mode="outlined"
          textColor="red"
          style={[styles.deleteButton, { borderColor: 'red' }]}
          onPress={() => {
            // Handle account deletion
          }}
        >
          Supprimer le compte
        </Button>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  userSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  userName: {
    marginTop: 10,
  },
  userEmail: {
    color: '#666',
    marginTop: 5,
  },
  section: {
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 15,
  },
  sectionTitle: {
    marginBottom: 10,
    color: '#4CAF50',
  },
  deleteButton: {
    borderColor: 'red',
  },
  deleteButtonText: {
    color: 'red',
  },
});

export default SettingsScreen; 