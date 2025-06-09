import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Modal, ViewStyle } from 'react-native';
import { Text, Button, useTheme, ActivityIndicator, Avatar, IconButton, TextInput } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchMatchById, joinMatch, leaveMatch, updateCaptain, updatePlayerStats, updateMatchScore } from '../../store/slices/matchSlice';
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
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<'team1' | 'team2' | null>(null);
  const [scoreModalVisible, setScoreModalVisible] = useState(false);
  const [statsModalVisible, setStatsModalVisible] = useState(false);
  const [selectedPlayerStats, setSelectedPlayerStats] = useState<{ goals: number; assists: number } | null>(null);
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedPlayerTeam, setSelectedPlayerTeam] = useState<'team1' | 'team2' | null>(null);
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

  const handleJoinPress = (team: 'team1' | 'team2') => {
    setSelectedTeam(team);
    setJoinModalVisible(true);
  };

  const handleConfirmJoin = async () => {
    if (!selectedMatch || !selectedTeam) return;
    try {
      await dispatch(joinMatch({ matchId: selectedMatch.id, team: selectedTeam }));
      setJoinModalVisible(false);
      setSelectedTeam(null);
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

  const isParticipant = selectedMatch?.team1?.players.some(p => p.player.id === user?.id) || 
                       selectedMatch?.team2?.players.some(p => p.player.id === user?.id) || 
                       false;

  const totalPlayers = (selectedMatch?.team1?.players.length || 0) + (selectedMatch?.team2?.players.length || 0);

  const handleToggleCaptain = async (playerId: string, team: 'team1' | 'team2') => {
    try {
      await dispatch(updateCaptain({ matchId: selectedMatch!.id, playerId, team }));
      await fetchMatchDetails();
    } catch (err: any) {
      console.error('Error in handleToggleCaptain:', err);
    }
  };

  const handleEditStats = (playerId: string, team: 'team1' | 'team2') => {
    const teamData = team === 'team1' ? selectedMatch?.team1 : selectedMatch?.team2;
    const player = teamData?.players.find(p => p.player.id === playerId);
    if (player?.stats) {
      setSelectedPlayerStats(player.stats);
      setSelectedPlayerId(playerId);
      setSelectedPlayerTeam(team);
      setStatsModalVisible(true);
    }
  };

  const handleUpdateStats = async () => {
    if (!selectedPlayerId || !selectedPlayerTeam || !selectedPlayerStats) return;
    try {
      await dispatch(updatePlayerStats({
        matchId: selectedMatch!.id,
        playerId: selectedPlayerId,
        team: selectedPlayerTeam,
        stats: selectedPlayerStats
      }));
      setStatsModalVisible(false);
      setSelectedPlayerStats(null);
      setSelectedPlayerId(null);
      setSelectedPlayerTeam(null);
      await fetchMatchDetails();
    } catch (err: any) {
      console.error('Error in handleUpdateStats:', err);
    }
  };

  const handleUpdateScore = async () => {
    try {
      await dispatch(updateMatchScore({
        matchId: selectedMatch!.id,
        team1Score,
        team2Score
      }));
      setScoreModalVisible(false);
      await fetchMatchDetails();
    } catch (err: any) {
      console.error('Error in handleUpdateScore:', err);
    }
  };

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
          {new Date(selectedMatch.date).toLocaleDateString()} à{' '}
          {selectedMatch.time}
        </Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, styles[`status${selectedMatch.status}` as keyof typeof styles] as ViewStyle]}>
            <Text style={styles.statusText}>
              {selectedMatch.status === 'upcoming' ? 'À venir' : 
               selectedMatch.status === 'ongoing' ? 'En cours' : 
               selectedMatch.status === 'completed' ? 'Terminé' : 'Annulé'}
            </Text>
          </View>
        </View>
      </View>

      {user && !isParticipant && selectedMatch.status === 'upcoming' && (
        <View style={styles.joinSection}>
          <Text style={styles.joinTitle}>Rejoindre une équipe</Text>
          <View style={styles.joinButtons}>
            <Button
              mode="contained"
              onPress={() => handleJoinPress('team1')}
              style={styles.joinButton}
              buttonColor="#4CAF50"
              disabled={totalPlayers >= selectedMatch.maxPlayers}
            >
              {selectedMatch.team1?.name || 'Équipe 1'}
            </Button>
            <Button
              mode="contained"
              onPress={() => handleJoinPress('team2')}
              style={styles.joinButton}
              buttonColor="#4CAF50"
              disabled={totalPlayers >= selectedMatch.maxPlayers}
            >
              {selectedMatch.team2?.name || 'Équipe 2'}
            </Button>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Équipes ({totalPlayers}/{selectedMatch.maxPlayers})
        </Text>
        <View style={styles.teamsContainer}>
          <View style={styles.teamSection}>
            <View style={styles.teamHeader}>
              <Text style={styles.teamTitle}>{selectedMatch.team1?.name || 'Équipe 1'}</Text>
              {isParticipant && selectedMatch.team1?.players.some(p => p.player.id === user?.id) && (
                <Button
                  mode="contained"
                  onPress={handleLeaveMatch}
                  style={styles.leaveButton}
                  buttonColor="#ff4444"
                >
                  Quitter
                </Button>
              )}
            </View>
            <View style={styles.participantsList}>
              {selectedMatch.team1?.players.map((teamPlayer) => (
                <View key={teamPlayer.player.id} style={styles.participantItem}>
                  <Avatar.Image
                    size={40}
                    source={
                      teamPlayer.player.profileImage
                        ? { uri: config.serverUrl + teamPlayer.player.profileImage }
                        : require('../../../assets/default-avatar.png')
                    }
                  />
                  <View style={styles.participantInfo}>
                    <Text style={styles.participantName}>
                      {teamPlayer.player.firstName} {teamPlayer.player.lastName}
                    </Text>
                    {teamPlayer.isCaptain && (
                      <Text style={styles.captainText}>Capitaine</Text>
                    )}
                    {selectedMatch.status === 'completed' && teamPlayer.stats && (
                      <View style={styles.statsContainer}>
                        <Text style={styles.statsText}>
                          {teamPlayer.stats.goals}G {teamPlayer.stats.assists}A
                        </Text>
                      </View>
                    )}
                  </View>
                  {user?.id === selectedMatch.creator.id && (
                    <View style={styles.playerActions}>
                      <IconButton
                        icon={teamPlayer.isCaptain ? "star" : "star-outline"}
                        size={20}
                        onPress={() => handleToggleCaptain(teamPlayer.player.id, 'team1')}
                        iconColor={teamPlayer.isCaptain ? "#FFD700" : "#666"}
                      />
                      {selectedMatch.status === 'completed' && (
                        <IconButton
                          icon="pencil"
                          size={20}
                          onPress={() => handleEditStats(teamPlayer.player.id, 'team1')}
                        />
                      )}
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>

          <View style={styles.teamSection}>
            <View style={styles.teamHeader}>
              <Text style={styles.teamTitle}>{selectedMatch.team2?.name || 'Équipe 2'}</Text>
              {isParticipant && selectedMatch.team2?.players.some(p => p.player.id === user?.id) && (
                <Button
                  mode="contained"
                  onPress={handleLeaveMatch}
                  style={styles.leaveButton}
                  buttonColor="#ff4444"
                >
                  Quitter
                </Button>
              )}
            </View>
            <View style={styles.participantsList}>
              {selectedMatch.team2?.players.map((teamPlayer) => (
                <View key={teamPlayer.player.id} style={styles.participantItem}>
                  <Avatar.Image
                    size={40}
                    source={
                      teamPlayer.player.profileImage
                        ? { uri: config.serverUrl + teamPlayer.player.profileImage }
                        : require('../../../assets/default-avatar.png')
                    }
                  />
                  <View style={styles.participantInfo}>
                    <Text style={styles.participantName}>
                      {teamPlayer.player.firstName} {teamPlayer.player.lastName}
                    </Text>
                    {teamPlayer.isCaptain && (
                      <Text style={styles.captainText}>Capitaine</Text>
                    )}
                    {selectedMatch.status === 'completed' && teamPlayer.stats && (
                      <View style={styles.statsContainer}>
                        <Text style={styles.statsText}>
                          {teamPlayer.stats.goals}G {teamPlayer.stats.assists}A
                        </Text>
                      </View>
                    )}
                  </View>
                  {user?.id === selectedMatch.creator.id && (
                    <View style={styles.playerActions}>
                      <IconButton
                        icon={teamPlayer.isCaptain ? "star" : "star-outline"}
                        size={20}
                        onPress={() => handleToggleCaptain(teamPlayer.player.id, 'team2')}
                        iconColor={teamPlayer.isCaptain ? "#FFD700" : "#666"}
                      />
                      {selectedMatch.status === 'completed' && (
                        <IconButton
                          icon="pencil"
                          size={20}
                          onPress={() => handleEditStats(teamPlayer.player.id, 'team2')}
                        />
                      )}
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      {selectedMatch.status === 'completed' && (
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Score final
          </Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>
              {selectedMatch.team1?.score || 0} - {selectedMatch.team2?.score || 0}
            </Text>
            {user?.id === selectedMatch.creator.id && (
              <Button
                mode="outlined"
                onPress={() => setScoreModalVisible(true)}
                style={styles.editScoreButton}
              >
                Modifier le score
              </Button>
            )}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Informations
        </Text>
        <Text style={styles.infoText}>
          Créé par : {selectedMatch.creator.firstName} {selectedMatch.creator.lastName}
        </Text>
      </View>

      <Modal
        visible={joinModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setJoinModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rejoindre le match</Text>
            <Text style={styles.modalText}>
              Voulez-vous rejoindre {selectedTeam === 'team1' ? selectedMatch.team1?.name || 'Équipe 1' : selectedMatch.team2?.name || 'Équipe 2'} ?
            </Text>
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setJoinModalVisible(false)}
                style={styles.modalButton}
              >
                Annuler
              </Button>
              <Button
                mode="contained"
                onPress={handleConfirmJoin}
                style={[styles.modalButton, styles.confirmButton]}
              >
                Confirmer
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={scoreModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setScoreModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifier le score</Text>
            <View style={styles.scoreInputs}>
              <TextInput
                label="Score Équipe 1"
                value={String(selectedMatch.team1?.score || 0)}
                onChangeText={(text) => setTeam1Score(parseInt(text) || 0)}
                keyboardType="numeric"
                style={styles.scoreInput}
              />
              <Text style={styles.scoreSeparator}>-</Text>
              <TextInput
                label="Score Équipe 2"
                value={String(selectedMatch.team2?.score || 0)}
                onChangeText={(text) => setTeam2Score(parseInt(text) || 0)}
                keyboardType="numeric"
                style={styles.scoreInput}
              />
            </View>
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setScoreModalVisible(false)}
                style={styles.modalButton}
              >
                Annuler
              </Button>
              <Button
                mode="contained"
                onPress={handleUpdateScore}
                style={[styles.modalButton, styles.confirmButton]}
              >
                Confirmer
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={statsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setStatsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifier les statistiques</Text>
            <View style={styles.statsInputs}>
              <TextInput
                label="Buts"
                value={String(selectedPlayerStats?.goals || 0)}
                onChangeText={(text) => setSelectedPlayerStats(prev => prev ? { ...prev, goals: parseInt(text) || 0 } : null)}
                keyboardType="numeric"
                style={styles.statsInput}
              />
              <TextInput
                label="Passes décisives"
                value={String(selectedPlayerStats?.assists || 0)}
                onChangeText={(text) => setSelectedPlayerStats(prev => prev ? { ...prev, assists: parseInt(text) || 0 } : null)}
                keyboardType="numeric"
                style={styles.statsInput}
              />
            </View>
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setStatsModalVisible(false)}
                style={styles.modalButton}
              >
                Annuler
              </Button>
              <Button
                mode="contained"
                onPress={handleUpdateStats}
                style={[styles.modalButton, styles.confirmButton]}
              >
                Confirmer
              </Button>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 12,
    backgroundColor: '#f8f8f8',
    padding: 8,
    borderRadius: 8,
  },
  participantName: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
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
  joinSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 20,
    marginHorizontal: 15,
    borderRadius: 8,
    elevation: 2,
  },
  joinTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 15,
    textAlign: 'center',
  },
  joinButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  joinButton: {
    flex: 1,
    borderRadius: 8,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  leaveButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  teamSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 1,
  },
  teamTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  teamsContainer: {
    marginTop: 10,
  },
  participantInfo: {
    marginLeft: 12,
    flex: 1,
  },
  captainText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 2,
  },
  statusContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusupcoming: {
    backgroundColor: '#4CAF50',
  },
  statusin_progress: {
    backgroundColor: '#FFA000',
  },
  statuscompleted: {
    backgroundColor: '#2196F3',
  },
  statuscancelled: {
    backgroundColor: '#F44336',
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  playerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  statsText: {
    color: '#fff',
    fontSize: 12,
  },
  scoreContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  editScoreButton: {
    marginTop: 10,
  },
  scoreInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  scoreInput: {
    width: 100,
    textAlign: 'center',
  },
  scoreSeparator: {
    fontSize: 24,
    marginHorizontal: 20,
  },
  statsInputs: {
    marginVertical: 20,
  },
  statsInput: {
    marginBottom: 10,
  },
});

export default MatchDetailsScreen; 