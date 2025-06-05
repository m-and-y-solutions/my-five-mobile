import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Button, Avatar, List, useTheme, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ProfileStackParamList } from '../../types/navigation.types';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { fetchUserStats, fetchUserSocial } from '../../store/slices/userSlice';
import { AppDispatch, RootState } from '../../store';
import config from '../../config/config';

type ProfileScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList & RootStackParamList, 'ProfileMain'>;

const ProfileScreen = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { stats, social, loading, error } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      await dispatch(fetchUserStats());
      await dispatch(fetchUserSocial());
    } catch (err: any) {
      console.error('Error in fetchUserData:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error && !stats) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          mode="contained"
          onPress={fetchUserData}
          style={styles.retryButton}
          buttonColor="#4CAF50"
        >
          Réessayer
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.avatarContainer}>
            <Avatar.Image
              size={80}
              source={
                user.profileImage
                  ? { uri: config.serverUrl + user.profileImage }
                  : require('../../../assets/default-avatar.png')
              }
            />
            <Text variant="titleMedium" style={styles.name}>
              {user.firstName} {user.lastName}
            </Text>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text variant="titleLarge" style={styles.statNumber}>{social?.groups || 0}</Text>
                <Text variant="bodyMedium">Groupes</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="titleLarge" style={styles.statNumber}>{social?.following || 0}</Text>
                <Text variant="bodyMedium">Suivis</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="titleLarge" style={styles.statNumber}>{social?.followers || 0}</Text>
                <Text variant="bodyMedium">Abonnés</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text variant="titleLarge" style={styles.statNumber}>{stats?.totalMatches || 0}</Text>
                <Text variant="bodyMedium">Matchs</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="titleLarge" style={styles.statNumber}>{user.score}</Text>
                <Text variant="bodyMedium">Score</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="titleLarge" style={styles.statNumber}>{user.ranking}</Text>
                <Text variant="bodyMedium">Classement</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Informations du profil
        </Text>
        <List.Item
          title="Email"
          description={user.email}
          left={props => <List.Icon {...props} icon="email" color="#4CAF50" />}
        />
        <List.Item
          title="Modifier le profil"
          description="Mettre à jour vos informations personnelles"
          right={(props: { color: string; style?: any }) => <List.Icon {...props} icon="chevron-right" color="#4CAF50" />}
        />

        <List.Item
          title="Préférences"
          description="Définir vos préférences de match"
          right={(props: { color: string; style?: any }) => <List.Icon {...props} icon="chevron-right" color="#4CAF50" />}
        />
      </View>

      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Activité
        </Text>
        <List.Item
          title="Mes matchs"
          description="Voir mes matchs à venir et passés"
          right={(props: { color: string; style?: any }) => <List.Icon {...props} icon="chevron-right" color="#4CAF50" />}
          onPress={() => navigation.navigate('Matches', { isUserMatches: true })}
        />
        <List.Item
          title="Statistiques"
          description="Voir mes statistiques et réalisations"
          right={(props: { color: string; style?: any }) => <List.Icon {...props} icon="chevron-right" color="#4CAF50" />}
          onPress={() => navigation.navigate('UserStats')}
        />
        <List.Item
          title="Groupes"
          description="Gérer vos groupes"
          right={(props: { color: string; style?: any }) => <List.Icon {...props} icon="chevron-right" color="#4CAF50" />}
        />
      </View>

      <View style={styles.section}>
        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          buttonColor="#4CAF50"
        >
          Déconnexion
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  avatarContainer: {
    marginRight: 20,
    alignItems: 'center',
  },
  statsContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 60,
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  name: {
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
    color: '#4CAF50',
  },
  section: {
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 15,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 15,
    color: '#4CAF50',
  },
  logoutButton: {
    marginTop: 10,
    borderRadius: 8,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    borderRadius: 8,
  },
});

export default ProfileScreen; 