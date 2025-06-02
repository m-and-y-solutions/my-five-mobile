import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Avatar, List, TextInput, Portal, Modal } from 'react-native-paper';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation.types';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

type MatchDetailsRouteProp = RouteProp<RootStackParamList, 'MatchDetails'>;

const MatchDetailsScreen = () => {
  const route = useRoute<MatchDetailsRouteProp>();
  const { matchId } = route.params;
  const { user } = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [playerStats, setPlayerStats] = useState<{[key: string]: {goals: number, assists: number}}>({});

  // TODO: Replace with actual API call
  const match = {
    id: matchId,
    date: '2024-03-20',
    time: '19:00',
    location: 'Terrain de foot municipal',
    status: 'confirmed',
    maxPlayers: 10,
    creator: { id: '0db94dab-0c30-4e90-becc-dd92476f5650' }, // Simuler que l'utilisateur est le créateur
    players: [
      { id: '0db94dab-0c30-4e90-becc-dd92476f5650', firstName: 'Houda', lastName: 'Chetali', avatar: 'https://i.pravatar.cc/150?img=1' },
      { id: '2', firstName: 'Jane', lastName: 'Smith', avatar: 'https://i.pravatar.cc/150?img=2' },
    ],
    score: { team1: 3, team2: 2 },
  };

  const isCreator = match.creator.id === user?.id;

  const handleSaveStats = () => {
    // TODO: Sauvegarder les stats dans l'API
    setShowStatsModal(false);
  };

  const updatePlayerStats = (playerId: string, field: 'goals' | 'assists', value: string) => {
    setPlayerStats(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [field]: parseInt(value) || 0
      }
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            Détails du match
          </Text>
          <List.Item
            title="Date"
            description={new Date(match.date).toLocaleDateString()}
            left={props => <List.Icon {...props} icon="calendar" />}
          />
          <List.Item
            title="Heure"
            description={match.time}
            left={props => <List.Icon {...props} icon="clock-outline" />}
          />
          <List.Item
            title="Lieu"
            description={match.location}
            left={props => <List.Icon {...props} icon="map-marker" />}
          />
          <List.Item
            title="Statut"
            description={match.status === 'confirmed' ? 'Confirmé' : match.status === 'cancelled' ? 'Annulé' : 'En attente'}
            left={props => (
              <List.Icon 
                {...props} 
                icon={
                  match.status === 'confirmed' 
                    ? 'check-circle' 
                    : match.status === 'cancelled' 
                      ? 'close-circle' 
                      : 'clock-outline'
                }
                color={
                  match.status === 'confirmed' 
                    ? '#4CAF50' 
                    : match.status === 'cancelled' 
                      ? '#F44336' 
                      : '#FFA000'
                }
              />
            )}
            descriptionStyle={{
              color: match.status === 'confirmed' 
                ? '#4CAF50' 
                : match.status === 'cancelled' 
                  ? '#F44336' 
                  : '#FFA000'
            }}
          />
          <List.Item
            title="Joueurs"
            description={`${match.players.length}/${match.maxPlayers}`}
            left={props => <List.Icon {...props} icon="account-group" />}
          />
          {match.score && (
            <List.Item
              title="Score"
              description={`${match.score.team1} - ${match.score.team2}`}
              left={props => <List.Icon {...props} icon="scoreboard" />}
            />
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.participantsHeader}>
            <Text variant="titleLarge" style={styles.title}>
              Participants
            </Text>
            {isCreator && match.status === 'confirmed' && (
              <Button
                mode="contained"
                onPress={() => setShowStatsModal(true)}
                style={styles.editButton}
              >
                Modifier stats
              </Button>
            )}
          </View>
          {match.players.map(player => (
            <List.Item
              key={player.id}
              title={`${player.firstName} ${player.lastName}`}
              description={
                playerStats[player.id] 
                  ? `Buts: ${playerStats[player.id].goals}, Passes: ${playerStats[player.id].assists}`
                  : undefined
              }
              left={props => (
                <Avatar.Image
                  {...props}
                  size={40}
                  source={{ uri: player.avatar }}
                />
              )}
            />
          ))}
        </Card.Content>
      </Card>

      <Portal>
        <Modal
          visible={showStatsModal}
          onDismiss={() => setShowStatsModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView>
            <Text variant="titleLarge" style={styles.modalTitle}>
              Statistiques des joueurs
            </Text>
            {match.players.map(player => (
              <View key={player.id} style={styles.playerStatsContainer}>
                <Text style={styles.playerName}>
                  {player.firstName} {player.lastName}
                </Text>
                <View style={styles.statsInputs}>
                  <TextInput
                    label="Buts"
                    keyboardType="numeric"
                    value={playerStats[player.id]?.goals?.toString() || '0'}
                    onChangeText={(value) => updatePlayerStats(player.id, 'goals', value)}
                    style={styles.statsInput}
                  />
                  <TextInput
                    label="Passes"
                    keyboardType="numeric"
                    value={playerStats[player.id]?.assists?.toString() || '0'}
                    onChangeText={(value) => updatePlayerStats(player.id, 'assists', value)}
                    style={styles.statsInput}
                  />
                </View>
              </View>
            ))}
            <Button
              mode="contained"
              onPress={handleSaveStats}
              style={styles.saveButton}
            >
              Sauvegarder
            </Button>
          </ScrollView>
        </Modal>
      </Portal>

      {!isCreator && new Date(match.date + 'T' + match.time) > new Date() && match.status === 'confirmed' && (
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => {}}
            style={styles.button}
          >
            Rejoindre le match
          </Button>
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
  card: {
    margin: 16,
  },
  title: {
    marginBottom: 16,
  },
  participantsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: '#6B4EFF',
  },
  buttonContainer: {
    padding: 16,
  },
  button: {
    backgroundColor: '#6B4EFF',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  playerStatsContainer: {
    marginBottom: 20,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statsInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  statsInput: {
    flex: 1,
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: '#6B4EFF',
  },
});

export default MatchDetailsScreen; 