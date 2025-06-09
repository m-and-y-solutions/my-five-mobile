import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Button, Avatar, List, useTheme, ActivityIndicator } from 'react-native-paper';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, ProfileStackParamList } from '../../types/navigation.types';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { fetchUserStats, fetchUserSocial, fetchUserById } from '../../store/slices/userSlice';
import { AppDispatch, RootState } from '../../store';
import config from '../../config/config';

type ProfileScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList & RootStackParamList, 'ProfileMain'>;
type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;

const ProfileScreen = () => {
  const route = useRoute<ProfileScreenRouteProp>();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { stats, social, loading, error, selectedUser } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const userId = route.params?.userId || currentUser?.id;
  const isCurrentUser = !route.params?.userId || route.params.userId === currentUser?.id;
  const user = isCurrentUser ? currentUser : selectedUser;

  // useEffect(() => {
  //   console.log('--------',route.params?.userId, userId, currentUser?.id)
  //   if (userId) {
  //     console.log('navigation to userid',route.params?.userId,'current',currentUser?.id)
  //     fetchUserData();
  //   }
  // }, [userId]);

  useFocusEffect(
    React.useCallback(() => {
       console.log('--------',route.params, userId, currentUser?.id)

      if (userId) {
        console.log('Screen focused, fetching data for user:', userId);
        fetchUserData();
      }
    }, [userId])
  );

  const fetchUserData = async () => {
    try {
      console.log(isCurrentUser);

      if (isCurrentUser) {
        await dispatch(fetchUserStats());
        await dispatch(fetchUserSocial());
      } else {
        await dispatch(fetchUserById(userId));
      }
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
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Avatar.Image
            size={100}
            source={
              user.profileImage
                ? { uri: config.serverUrl + user.profileImage }
                : require('../../../assets/default-avatar.png')
            }
            style={styles.avatar}
          />
          <Text variant="titleLarge" style={styles.name}>
            {user.firstName} {user.lastName}
          </Text>
          <Text variant="bodyMedium" style={styles.email}>
            {user.email}
          </Text>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text variant="titleLarge" style={styles.statValue}>{social?.groups || 0}</Text>
            <Text variant="bodyMedium" style={styles.statLabel}>Groupes</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="titleLarge" style={styles.statValue}>{social?.following || 0}</Text>
            <Text variant="bodyMedium" style={styles.statLabel}>Suivis</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="titleLarge" style={styles.statValue}>{social?.followers || 0}</Text>
            <Text variant="bodyMedium" style={styles.statLabel}>Abonnés</Text>
          </View>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text variant="titleLarge" style={styles.statValue}>{stats?.totalMatches || 0}</Text>
            <Text variant="bodyMedium" style={styles.statLabel}>Matchs</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="titleLarge" style={styles.statValue}>{user.score}</Text>
            <Text variant="bodyMedium" style={styles.statLabel}>Score</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="titleLarge" style={styles.statValue}>{user.ranking}</Text>
            <Text variant="bodyMedium" style={styles.statLabel}>Classement</Text>
          </View>
        </View>
      </View>

      {isCurrentUser && (
        <>
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
              buttonColor="red"
            >
              Déconnexion
            </Button>
          </View>
        </>
      )}
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
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    margin: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  avatarContainer: {
    marginRight: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    flexWrap: 'wrap',
  },
  statItem: {
    alignItems: 'center',
    width: '30%',
    marginBottom: 15,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
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