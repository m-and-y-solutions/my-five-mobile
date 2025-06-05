import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Button, useTheme, ActivityIndicator, Avatar } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchMatchById, joinMatch, leaveMatch } from '../../store/slices/matchSlice';
import config from '../../config/config';

type MatchDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MatchDetails'>;
type MatchDetailsScreenRouteProp = RouteProp<RootStackParamList, 'MatchDetails'>;

const MatchDetailsScreen = () => {
  const route = useRoute<MatchDetailsScreenRouteProp>();
  const navigation = useNavigation<MatchDetailsScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedMatch, loading, error } = useSelector((state: RootState) => state.match);
  const { user } = useSelector((state: RootState) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    fetchMatchDetails();
  }, [route.params.matchId]);

  const fetchMatchDetails = async () => {
    try {
      await dispatch(fetchMatchById(route.params.matchId));
    } catch (err: any) {
      console.error('Error in fetchMatchDetails:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMatchDetails();
    setRefreshing(false);
  };

  const handleJoinMatch = async () => {
    if (!selectedMatch) return;
    try {
      await dispatch(joinMatch(selectedMatch.id));
      await fetchMatchDetails();
    } catch (err: any) {
      console.error('Error in handleJoinMatch:', err);
    }
  };

  const handleLeaveMatch = async () => {
    if (!selectedMatch) return;
    try {
      await dispatch(leaveMatch(selectedMatch.id));
      await fetchMatchDetails();
    } catch (err: any) {
      console.error('Error in handleLeaveMatch:', err);
    }
  };

  const isParticipant = selectedMatch?.participants.some(p => p.id === user?.id);

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error || !selectedMatch) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Match non trouvé'}</Text>
        <Button
          mode="contained"
          onPress={fetchMatchDetails}
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
        <Text variant="headlineMedium" style={styles.title}>
          {selectedMatch.field.name}
        </Text>
        <Text variant="titleMedium" style={styles.subtitle}>
          {new Date(selectedMatch.time).toLocaleDateString()} à{' '}
          {new Date(selectedMatch.time).toLocaleTimeString()}
        </Text>
      </View>

      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Participants ({selectedMatch.participants.length}/{selectedMatch.maxPlayers})
        </Text>
        <View style={styles.participantsList}>
          {selectedMatch.participants.map((participant) => (
            <View key={participant.id} style={styles.participantItem}>
              <Avatar.Image
                size={40}
                source={
                  participant.profileImage
                    ? { uri: config.serverUrl + participant.profileImage }
                    : require('../../../assets/default-avatar.png')
                }
              />
              <Text style={styles.participantName}>
                {participant.firstName} {participant.lastName}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Informations
        </Text>
        {/* <Text style={styles.infoText}>
          Niveau requis : {selectedMatch.level}
        </Text> */}
        <Text style={styles.infoText}>
          Créé par : {selectedMatch.creator.firstName} {selectedMatch.creator.lastName}
        </Text>
      </View>

      {user && (
        <View style={styles.actions}>
          {isParticipant ? (
            <Button
              mode="contained"
              onPress={handleLeaveMatch}
              style={styles.actionButton}
              buttonColor="#ff4444"
            >
              Quitter le match
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={handleJoinMatch}
              style={styles.actionButton}
              buttonColor="#4CAF50"
              disabled={selectedMatch.participants.length >= selectedMatch.maxPlayers}
            >
              Rejoindre le match
            </Button>
          )}
        </View>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    color: '#4CAF50',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    padding: 20,
    borderRadius: 8,
    marginHorizontal: 15,
  },
  sectionTitle: {
    color: '#4CAF50',
    marginBottom: 15,
  },
  participantsList: {
    marginTop: 10,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  participantName: {
    marginLeft: 10,
    fontSize: 16,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  actions: {
    padding: 20,
  },
  actionButton: {
    borderRadius: 8,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 8,
    borderRadius: 8,
  },
});

export default MatchDetailsScreen; 