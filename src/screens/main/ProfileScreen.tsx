import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { Text, Button, Avatar, List, useTheme, Card, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../../types/user.types';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, MainTabParamList, ProfileStackParamList } from '../../types/navigation.types';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { AppDispatch } from '../../store';
import { RootState } from '../../store';
import config from '../../config/config';
import axios from 'axios';
import { API_URL } from '../../config/config';
import { MOCK_USERS } from '../../constants/mockdata.constantes';

type ProfileScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList & RootStackParamList, 'ProfileMain'>;

interface UserStats {
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  goalsScored: number;
  assists: number;
  ranking: number;
  winRate: number;
  averageGoalsPerMatch: number;
  averageAssistsPerMatch: number;
  currentStreak: number;
  bestStreak: number;
  favoritePosition: string;
  totalPlayTime: number;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt: string;
  }>;
}

interface UserSocial {
  groups: number;
  following: number;
  followers: number;
}

const ProfileScreen = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const theme = useTheme();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [social, setSocial] = useState<UserSocial>({ groups: 0, following: 0, followers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      console.log('Fetching user data...');
      setLoading(true);
      setError('');
      setUsingMockData(false);

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        setError('Please login to view profile');
        return;
      }

      // Try to get user data from localStorage first
      const storedUserData = await AsyncStorage.getItem('userData');
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        console.log('Using stored user data:', userData);
        setStats(userData.stats);
        setSocial(userData.social);
      }

      // Try to fetch fresh data from backend
      try {
        const [statsResponse, socialResponse] = await Promise.all([
          axios.get(`${API_URL}/users/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/users/social`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        console.log('Fresh data fetched successfully');
        setStats(statsResponse.data);
        setSocial(socialResponse.data);

        // Update localStorage with fresh data
        await AsyncStorage.setItem('userData', JSON.stringify({
          stats: statsResponse.data,
          social: socialResponse.data,
        }));
      } catch (err: any) {
        console.error('Error fetching fresh data:', err);
        if (!storedUserData) {
          // If no stored data and backend fails, use mock data
          console.log('Using mock data instead...');
          setUsingMockData(true);
          setStats({
            totalMatches: 15,
            wins: 10,
            losses: 3,
            draws: 2,
            goalsScored: 25,
            assists: 15,
            ranking: 0,
            winRate: 66.67,
            averageGoalsPerMatch: 1.67,
            averageAssistsPerMatch: 1.0,
            currentStreak: 3,
            bestStreak: 5,
            favoritePosition: 'Forward',
            totalPlayTime: 1350,
            achievements: [],
          });
          setSocial({
            groups: 3,
            following: 100,
            followers: 150,
          });
        }
      }
    } catch (err: any) {
      console.error('Error in fetchUserData:', err);
      setError(err.response?.data?.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
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
        <ActivityIndicator size="large" />
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
        >
          Retry
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
      {usingMockData && (
        <View style={styles.mockDataWarning}>
          <Text style={styles.mockDataText}>
            Using mock data - {error}
          </Text>
        </View>
      )}
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
                <Text variant="titleLarge" style={styles.statNumber}>{social.groups}</Text>
                <Text variant="bodyMedium">Groupes</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="titleLarge" style={styles.statNumber}>{social.following}</Text>
                <Text variant="bodyMedium">Suivis</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="titleLarge" style={styles.statNumber}>{social.followers}</Text>
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
          left={props => <List.Icon {...props} icon="email" />}
        />
        <List.Item
          title="Modifier le profil"
          description="Mettre à jour vos informations personnelles"
          right={(props: { color: string; style?: any }) => <List.Icon {...props} icon="chevron-right" />}
        />

        <List.Item
          title="Préférences"
          description="Définir vos préférences de match"
          right={(props: { color: string; style?: any }) => <List.Icon {...props} icon="chevron-right" />}
        />
      </View>

      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Activité
        </Text>
        <List.Item
          title="Mes matchs"
          description="Voir mes matchs à venir et passés"
          right={(props: { color: string; style?: any }) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('Matches', { isUserMatches: true })}
        />
        <List.Item
          title="Statistiques"
          description="Voir mes statistiques et réalisations"
          right={(props: { color: string; style?: any }) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('UserStats')}
        />
        <List.Item
          title="Groupes"
          description="Gérer vos groupes"
          right={(props: { color: string; style?: any }) => <List.Icon {...props} icon="chevron-right" />}
        />
      </View>

      <View style={styles.section}>
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
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
    color: '#6B4EFF',
  },
  name: {
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
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
    color: '#333',
  },
  logoutButton: {
    borderColor: '#ff4444',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
  },
  mockDataWarning: {
    backgroundColor: '#fff3cd',
    padding: 8,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 4,
  },
  mockDataText: {
    color: '#856404',
    textAlign: 'center',
    fontSize: 12,
  },
});

export default ProfileScreen; 