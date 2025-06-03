import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, List, Switch, Button, useTheme, Avatar, Divider } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

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
    <ScrollView style={styles.container}>
      <View style={styles.userSection}>
        <Avatar.Image
          size={80}
          source={user?.profileImage ? { uri: user.profileImage } : require('../../../assets/default-avatar.png')}
        />
        <Text variant="headlineSmall" style={styles.userName}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text variant="bodyMedium" style={styles.userEmail}>
          {user?.email}
        </Text>
      </View>

      <Divider />

      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Paramètres de confidentialité
        </Text>
        <List.Item
          title="Profil public"
          description="Autoriser les autres à voir votre profil"
          right={() => (
            <Switch
              value={settings.profileVisibility}
              onValueChange={() => toggleSetting('profileVisibility')}
            />
          )}
        />

        <List.Item
          title="Partager l'activité"
          description="Partager vos activités de match avec les autres"
          right={() => (
            <Switch
              value={settings.shareActivity}
              onValueChange={() => toggleSetting('shareActivity')}
            />
          )}
        />

        <List.Item
          title="Partager la localisation"
          description="Partager votre localisation approximative"
          right={() => (
            <Switch
              value={settings.shareLocation}
              onValueChange={() => toggleSetting('shareLocation')}
            />
          )}
        />
      </View>

      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Notifications
        </Text>
        <List.Item
          title="J'aime"
          description="Notifier quand quelqu'un aime votre publication"
          right={() => (
            <Switch
              value={settings.notifications.likes}
              onValueChange={() => toggleNotification('likes')}
            />
          )}
        />

        <List.Item
          title="Commentaires"
          description="Notifier quand quelqu'un commente votre publication"
          right={() => (
            <Switch
              value={settings.notifications.comments}
              onValueChange={() => toggleNotification('comments')}
            />
          )}
        />

        <List.Item
          title="Mentions"
          description="Notifier quand quelqu'un vous mentionne"
          right={() => (
            <Switch
              value={settings.notifications.tags}
              onValueChange={() => toggleNotification('tags')}
            />
          )}
        />

        <List.Item
          title="Connexions"
          description="Notifier quand quelqu'un vous suit"
          right={() => (
            <Switch
              value={settings.notifications.connections}
              onValueChange={() => toggleNotification('connections')}
            />
          )}
        />
      </View>

      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Compte
        </Text>
        <List.Item
          title="Utilisateurs bloqués"
          description="Gérer les connexions bloquées"
          right={(props: { color: string; style?: any }) => <List.Icon {...props} icon="chevron-right" />}
        />

        <List.Item
          title="Aide et support"
          description="Obtenir de l'aide avec l'application"
          right={(props: { color: string; style?: any }) => <List.Icon {...props} icon="chevron-right" />}
        />

        <List.Item
          title="Mentions légales"
          description="Conditions d'utilisation et politique de confidentialité"
          right={(props: { color: string; style?: any }) => <List.Icon {...props} icon="chevron-right" />}
        />
      </View>

      <View style={styles.section}>
        <Button
          mode="outlined"
          textColor="red"
          style={styles.deleteButton}
          onPress={() => {
            // Handle account deletion
          }}
        >
          Supprimer le compte
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
  },
  deleteButton: {
    borderColor: 'red',
  },
  deleteButtonText: {
    color: 'red',
  },
});

export default SettingsScreen; 