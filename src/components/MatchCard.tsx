import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Avatar, Button, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Match } from '../services/matchService';

type MatchCardProps = {
  match: Match;
  onPress?: () => void;
};

type MatchCardNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MatchCard = ({ match, onPress }: MatchCardProps) => {
  const navigation = useNavigation<MatchCardNavigationProp>();
  const theme = useTheme();

  const handlePlayerPress = (userId: string) => {
    navigation.navigate('UserStats');
  };

  const renderTeam = (players: any[], isTeam1: boolean) => {
    const maxPlayers = match.maxPlayers / 2;
    const spots = maxPlayers - players.length;
    const displayPlayers = [...players];

    return (
      <View style={styles.teamContainer}>
        <View style={styles.teamHeader}>
          <Text style={styles.teamName}>{isTeam1 ? 'Team 1' : 'Team 2'}</Text>
          <Text style={styles.teamSpots}>{spots} spot{spots !== 1 ? 's' : ''} left</Text>
        </View>
        <View style={styles.playersContainer}>
          {Array.from({ length: maxPlayers }).map((_, index) => {
            const player = displayPlayers[index];
            if (player) {
              return (
                <TouchableOpacity
                  key={player.id}
                  onPress={() => handlePlayerPress(player.id)}
                  style={styles.playerAvatar}
                >
                  <Avatar.Image
                    size={36}
                    source={{ uri: player.profileImage }}
                  />
                </TouchableOpacity>
              );
            } else {
              return (
                <View key={`empty-${index}`} style={styles.emptyPlayerSlot}>
                  {match.status === 'upcoming' ? (
                    <TouchableOpacity
                      onPress={() => navigation.navigate('MatchDetails', { matchId: match.id })}
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
      </View>
    );
  };

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Title
        title={match.title}
        subtitle={`${match.field.name}, ${match.field.city}`}
        titleStyle={styles.cardTitle}
        subtitleStyle={styles.cardSubtitle}
      />
      <Card.Content>
        <View style={styles.matchInfo}>
          <View style={styles.teamsContainer}>
            {renderTeam(match.participants.slice(0, match.maxPlayers / 2), true)}
            <View style={styles.divider} />
            {renderTeam(match.participants.slice(match.maxPlayers / 2), false)}
          </View>
          <View style={styles.matchDetails}>
            <Text style={styles.detailText}>Date: {new Date(match.date).toLocaleDateString()}</Text>
            <Text style={styles.detailText}>Time: {match.time}</Text>
            <Text style={styles.detailText}>Price: {match.price} {match.currency}</Text>
          </View>
        </View>
      </Card.Content>
      <Card.Actions style={styles.cardActions}>
        <Button
          mode="contained"
          onPress={onPress}
          style={styles.detailsButton}
          labelStyle={styles.detailsButtonLabel}
        >
          View Details
        </Button>
      </Card.Actions>
    </Card>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
    paddingHorizontal: 4,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  teamSpots: {
    fontSize: 12,
    color: '#666',
  },
  playersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    width: '100%',
  },
  playerAvatar: {
    marginRight: -8, // Pour faire chevaucher les avatars
  },
  emptyPlayerSlot: {
    width: 36,
    height: 36,
    marginRight: -8, // Pour faire chevaucher les slots vides
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
  cardActions: {
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  detailsButton: {
    borderRadius: 8,
    backgroundColor: '#4CAF50',
  },
  detailsButtonLabel: {
    color: '#fff',
    fontWeight: '500',
  },
});

export default MatchCard;