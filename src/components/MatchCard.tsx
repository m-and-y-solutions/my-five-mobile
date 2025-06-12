import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Card, Text, Avatar, Button, useTheme, Badge } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Match } from '../services/matchService';
import { useDispatch, useSelector } from 'react-redux';
import { joinMatch } from '../store/slices/matchSlice';
import { AppDispatch, RootState } from '../store';
import config from 'config/config';

type MatchCardProps = {
  match: Match;
  onPress?: () => void;
};

type MatchCardNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MatchCard = ({ match, onPress }: MatchCardProps) => {
  const navigation = useNavigation<MatchCardNavigationProp>();
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<'team1' | 'team2' | null>(null);
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  const isCreator = match.creator.id=== userId;
  const isParticipant = match.team1?.players.some(p => p.player.id === userId) || 
                       match.team2?.players.some(p => p.player.id === userId);

  const handlePlayerPress = (userId: string) => {
    console.log('Navigating to profile with userId:', userId);
    navigation.navigate('Profile', { userId: userId });
  };

  // const handlePlayerPress = (userId: string) => {
  //   console.log('Navigating to profile with userId:', userId);
  //   navigation.navigate('ProfileMain', { userId: userId }); // Changez 'Profile' en 'ProfileMain'
  // };

  const handleJoinPress = (team: 'team1' | 'team2') => {
    setSelectedTeam(team);
    setJoinModalVisible(true);
  };

  const handleConfirmJoin = async () => {
    if (selectedTeam) {
      try {
        await dispatch(joinMatch({ matchId: match.id, team: selectedTeam }));
        setJoinModalVisible(false);
        setSelectedTeam(null);
      } catch (error) {
        console.error('Error joining match:', error);
      }
    }
  };

  const renderPlayerAvatar = (teamPlayer: any) => {
    return (
      <View style={styles.avatarContainer}>
        <Avatar.Image
          size={40}
          source={
            teamPlayer.player.profileImage
              ? { uri: config.serverUrl + teamPlayer.player.profileImage }
              : require('../../assets/default-avatar.png')
          }
        />
        {teamPlayer.isCaptain && (
          <View style={styles.captainBadge}>
            <Text style={styles.captainText}>C</Text>
          </View>
        )}
        {match.status === 'completed' && teamPlayer.stats && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              {teamPlayer.stats.goals}G {teamPlayer.stats.assists}A
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderTeam = (team: Match['team1'] | Match['team2'], isTeam1: boolean) => {
    if (!team) return null;
    
    const maxPlayers = match.maxPlayers / 2;
    const spots = maxPlayers - team.players.length;

    return (
      <View style={styles.teamContainer}>
        <View style={styles.teamHeader}>
          <Text style={styles.teamName} numberOfLines={1}>{team.name}</Text>
        </View>
        <View style={styles.playersContainer}>
          {Array.from({ length: maxPlayers }).map((_, index) => {
            const teamPlayer = team.players[index];
            if (teamPlayer) {
              return (
                <TouchableOpacity
                  key={teamPlayer.id}
                  onPress={() => handlePlayerPress(teamPlayer.player.id)}
                  style={styles.playerAvatar}
                >
                  {renderPlayerAvatar(teamPlayer)}
                </TouchableOpacity>
              );
            } else {
              return (
                <View key={`empty-${index}`} style={styles.emptyPlayerSlot}>
                  {match.status === 'upcoming' ? (
                    <TouchableOpacity
                      onPress={() => handleJoinPress(isTeam1 ? 'team1' : 'team2')}
                      style={styles.joinButton}
                    >
                      <Text style={styles.joinButtonText}>+</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={[styles.joinButton, styles.disabledButton]}>
                      <Text style={[styles.joinButtonText, styles.disabledButtonText]}>+</Text>
                    </View>
                  )}
                </View>
              );
            }
          })}
        </View>
        <Text style={styles.teamSpots}>{spots} place{spots !== 1 ? 's' : ''} disponible{spots !== 1 ? 's' : ''}</Text>
      </View>
    );
  };

  return (
    <>
      <Card style={styles.card} onPress={onPress}>
        <Card.Title
          title={match.title}
          subtitle={`${match.field.name}, ${match.field.city}`}
          titleStyle={styles.cardTitle}
          subtitleStyle={styles.cardSubtitle}
          right={(props) => (
            <View style={styles.badgeContainer}>
              {isCreator && (
                <Badge style={styles.creatorBadge} size={24}>Créateur</Badge>
              )}
              {isParticipant && (
                <Badge style={styles.participantBadge} size={24}>Participant</Badge>
              )}
            </View>
          )}
        />
        <Card.Content>
          <View style={styles.matchInfo}>
            <View style={styles.teamsContainer}>
              {renderTeam(match.team1, true)}
              <View style={styles.divider} />
              {renderTeam(match.team2, false)}
            </View>
            <View style={styles.matchDetails}>
              <Text style={styles.detailText}>Date: {new Date(match.date).toLocaleDateString()}</Text>
              <Text style={styles.detailText}>Heure: {match.time}</Text>
              <Text style={styles.detailText}>Prix: {match.price} {match.currency}</Text>
              {match.team1 && match.team2 && (
                <Text style={styles.scoreText}>
                  Score: {match.team1.score} - {match.team2.score}
                </Text>
              )}
            </View>
          </View>
        </Card.Content>
        <Card.Actions style={styles.cardActions}>
          <Button
            mode="outlined"
            onPress={onPress}
            style={styles.detailsButton}
            labelStyle={styles.detailsButtonLabel}
          >
            Détails
          </Button>
        </Card.Actions>
      </Card>

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
              Voulez-vous rejoindre {selectedTeam === 'team1' ? match.team1?.name : match.team2?.name} ?
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
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#fff',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  matchInfo: {
    marginTop: 8,
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  teamContainer: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
    paddingHorizontal: 4,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  teamSpots: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  playersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    width: '100%',
  },
  avatarContainer: {
    position: 'relative',
  },
  playerAvatar: {
    marginRight: -8,
  },
  captainBadge: {
    position: 'absolute',
    left: -4,
    top: -4,
    backgroundColor: '#000',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  captainText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    position: 'absolute',
    bottom: -16,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  statsText: {
    color: '#fff',
    fontSize: 10,
    textAlign: 'center',
  },
  emptyPlayerSlot: {
    width: 36,
    height: 36,
    marginRight: -8,
  },
  joinButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#4CAF50',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#4CAF50',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: -2,
  },
  disabledButton: {
    borderColor: '#BDBDBD',
  },
  disabledButtonText: {
    color: '#BDBDBD',
  },
  matchDetails: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  cardActions: {
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  detailsButton: {
    borderRadius: 8,
    borderColor: '#4CAF50',
    backgroundColor: '#fff',
  },
  detailsButtonLabel: {
    color: '#4CAF50',
    fontWeight: '500',
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
  badgeContainer: {
    paddingRight: 16,
    paddingTop: 8,
    gap: 8,
  },
  creatorBadge: {
    backgroundColor: '#4CAF50',
    color: 'white',
    fontSize: 12,
    paddingHorizontal: 8,
  },
  participantBadge: {
    backgroundColor: '#2196F3',
    color: 'white',
    fontSize: 12,
    paddingHorizontal: 8,
  },
});

export default MatchCard;