import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Button, Avatar, List, useTheme, ActivityIndicator, MD3Theme } from 'react-native-paper';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, ProfileStackParamList } from '../../types/navigation.types';
import { useDispatch, useSelector } from 'react-redux';
import { deleteAccount, logout } from '../../store/slices/authSlice';
import { fetchUserStats, fetchUserSocial, fetchUserById } from '../../store/slices/userSlice';
import { AppDispatch, RootState } from '../../store';
import config from '../../config/config';
import { fetchGroups } from '../../store/slices/groupsSlice';

type ProfileScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList & RootStackParamList, 'ProfileMain'>;
type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;

const ProfileScreen = () => {
  const route = useRoute<ProfileScreenRouteProp>();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { stats, social, loading, error, selectedUser } = useSelector((state: RootState) => state.user);
  const { groups } = useSelector((state: RootState) => state.groups);
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

      if (userId) {
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

  useEffect(() => {
    dispatch(fetchGroups());
  }, [dispatch]);

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Supprimer le compte",
      "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            const result = await dispatch(deleteAccount());
            if (deleteAccount.fulfilled.match(result)) {
              Alert.alert("Compte supprimé", "Votre compte a bien été supprimé.");
              // Redirige ou logout ici si besoin
              // navigation.replace('Login');
              // dispatch(logout());
            } else {
              Alert.alert("Erreur", "Une erreur est survenue lors de la suppression.");
            }
          }
        }
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles(theme).container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (loading && !refreshing) {
    return (
      <View style={styles(theme).centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error && !stats) {
    return (
      <View style={styles(theme).centerContainer}>
        <Text style={styles(theme).errorText}>{error}</Text>
        <Button
          mode="contained"
          onPress={fetchUserData}
          style={styles(theme).retryButton}
          buttonColor={theme.colors.primary}
        >
          Réessayer
        </Button>
      </View>
    );
  }

  return (
    
    <ScrollView
      style={styles(theme).container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
      }
    >
      <View style={styles(theme).profileCard}>
        <View style={styles(theme).avatarContainer}>
          <Avatar.Image
            size={100}
            source={
              user.profileImage
                ? { uri: config.serverUrl + user.profileImage }
                : require('../../../assets/default-avatar.png')
            }
            style={styles(theme).avatar}
          />
          <Text variant="titleLarge" style={styles(theme).name}>
            {user.firstName} {user.lastName}
          </Text>
          <Text variant="bodyMedium" style={styles(theme).email}>
            {user.email}
          </Text>
        </View>
        <View style={styles(theme).statsContainer}>
          <View style={styles(theme).statItem}>
            <Text variant="titleLarge" style={styles(theme).statValue}>{social?.groups || 0}</Text>
            <Text variant="bodyMedium" style={styles(theme).statLabel}>Groupes</Text>
          </View>
          <View style={styles(theme).statItem}>
            <Text variant="titleLarge" style={styles(theme).statValue}>{social?.following || 0}</Text>
            <Text variant="bodyMedium" style={styles(theme).statLabel}>Suivis</Text>
          </View>
          <View style={styles(theme).statItem}>
            <Text variant="titleLarge" style={styles(theme).statValue}>{social?.followers || 0}</Text>
            <Text variant="bodyMedium" style={styles(theme).statLabel}>Abonnés</Text>
          </View>
        </View>
        <View style={styles(theme).statsContainer}>
          <View style={styles(theme).statItem}>
            <Text variant="titleLarge" style={styles(theme).statValue}>
              {isCurrentUser ? (stats?.totalMatches || 0) : (selectedUser?.stats?.totalMatches || 0)}
            </Text>
            <Text variant="bodyMedium" style={styles(theme).statLabel}>Matchs</Text>
          </View>
          <View style={styles(theme).statItem}>
            <Text variant="titleLarge" style={styles(theme).statValue}>
              {isCurrentUser ? (stats?.wins || 0) : (selectedUser?.stats?.wins || 0)}
            </Text>
            <Text variant="bodyMedium" style={styles(theme).statLabel}>Victoires</Text>
          </View>
          <View style={styles(theme).statItem}>
            <Text variant="titleLarge" style={styles(theme).statValue}>
              {isCurrentUser ? (stats?.goalsScored || 0) : (selectedUser?.stats?.goalsScored || 0)}
            </Text>
            <Text variant="bodyMedium" style={styles(theme).statLabel}>Buts</Text>
          </View>
        </View>
      </View>

      {isCurrentUser && (
        <>
          <View style={styles(theme).section}>
            <Text variant="titleLarge" style={[styles(theme).sectionTitle, { color: theme.colors.onSurface }]}>
              Informations du profil
            </Text>
            <List.Item
              title="Email"
              titleStyle={{ color: theme.colors.onSurface }}
              description={user.email}
              descriptionStyle={{ color: theme.colors.onSurface }}
              left={props => <List.Icon {...props} icon="email" color={theme.colors.primary} />}
            />
            <List.Item
              title="Modifier le profil"
              titleStyle={{ color: theme.colors.onSurface }}
              description="Mettre à jour vos informations personnelles"
              descriptionStyle={{ color: theme.colors.onSurface }}
              left={props => <List.Icon {...props} icon="account-edit" color={theme.colors.primary} />}
              right={(props: { color: string; style?: any }) => <List.Icon {...props} icon="chevron-right" color={theme.colors.primary} />}
              onPress={() => navigation.navigate('EditProfile')}
            />
            <Button
              mode="outlined"
              style={{ borderColor: '#e53935', marginTop: 16, borderRadius: 8 }}
              textColor="#e53935"
              onPress={handleDeleteAccount}
              icon="delete-outline"
            >
              Supprimer le compte
            </Button>
          </View>

          <View style={styles(theme).section}>
            <Text variant="titleLarge" style={[styles(theme).sectionTitle, { color: theme.colors.onSurface }]}>
              Activité
            </Text>
            <List.Item
              title="Mes matchs"
              titleStyle={{ color: theme.colors.onSurface }}
              description="Voir mes matchs à venir et passés"
              descriptionStyle={{ color: theme.colors.onSurface }}
              left={props => <List.Icon {...props} icon="soccer" color={theme.colors.primary} />}
              right={(props: { color: string; style?: any }) => <List.Icon {...props} icon="chevron-right" color={theme.colors.primary} />}
              onPress={() => navigation.navigate('Matches', { isUserMatches: true })}
            />
            <List.Item
              title="Statistiques"
              titleStyle={{ color: theme.colors.onSurface }}
              description="Voir mes statistiques et réalisations"
              descriptionStyle={{ color: theme.colors.onSurface }}
              left={props => <List.Icon {...props} icon="chart-line" color={theme.colors.primary} />}
              right={(props: { color: string; style?: any }) => <List.Icon {...props} icon="chevron-right" color={theme.colors.primary} />}
              onPress={() => navigation.navigate('UserStats')}
            />
            <List.Item
              title="Mes Groupes"
              titleStyle={{ color: theme.colors.onSurface }}
              description="Gérer vos groupes"
              descriptionStyle={{ color: theme.colors.onSurface }}
              left={props => <List.Icon {...props} icon="account-group" color={theme.colors.primary} />}
              right={(props: { color: string; style?: any }) => <List.Icon {...props} icon="chevron-right" color={theme.colors.primary} />}
              onPress={() => navigation.navigate('Groups', { isUserGroups: true })}
            />
          </View>


          <View style={styles(theme).section}>
            <Button
              mode="contained"
              onPress={handleLogout}
              style={styles(theme).logoutButton}
              buttonColor={theme.colors.error}
            >
              Déconnexion
            </Button>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = (theme: MD3Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,

  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: theme.colors.surface,
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline, 
  },
  profileCard: {
    backgroundColor: theme.colors.surface, 
    padding: 20,
    margin: 16,
    borderRadius: 12,
    elevation: 3,
    alignItems: "center",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    marginBottom: 8,
  },
  name: {
    fontWeight: "bold",
    color: theme.colors.onSurface, 
  },
  email: {
    color: theme.colors.onSurface, 
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontWeight: "bold",
    color: theme.colors.onSurface, 
  },
  statLabel: {
    color: theme.colors.onSurface, 
  },
  section: {
    backgroundColor: theme.colors.surface, 
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 12,
    color: theme.colors.onSurface, 
  },
  logoutButton: {
    marginTop: 20,
    borderRadius: 8,
  },
  errorText: {
    color: theme.colors.error, 
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
  },
});

export default ProfileScreen; 