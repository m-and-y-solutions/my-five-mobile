import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Avatar, Button, useTheme, IconButton } from 'react-native-paper';
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
    const maxPlayers = match.maxPlayers / 2; // Divide max players by 2 for each team
    const spots = maxPlayers - players.length;
    const displayPlayers = [...players];

    return (
      <View style={styles.teamContainer}>
        <View style={styles.teamHeader}>
          <Text style={styles.teamName}>{isTeam1 ? 'Team 1' : 'Team 2'}</Text>
          <Text style={styles.teamSpots}>{spots} spots left</Text>
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
                    size={40}
                    source={{ uri: player.profileImage }}
                  />
                </TouchableOpacity>
              );
            } else {
              return (
                <View key={`empty-${index}`} style={styles.playerAvatar}>
                  {match.status === 'upcoming' ? (
                    <IconButton
                      icon="plus-circle"
                      size={40}
                      iconColor="#4CAF50"
                      onPress={() => navigation.navigate('MatchDetails', { matchId: match.id })}
                      style={styles.joinButtonInner}
                    />
                  ) : (
                    <IconButton
                      icon="plus-circle"
                      size={40}
                      iconColor="#9E9E9E"
                      disabled
                      style={styles.joinButtonInner}
                    />
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
      />
      <Card.Content>
        <View style={styles.matchInfo}>
          <View style={styles.teamsContainer}>
            {renderTeam(match.participants.slice(0, match.maxPlayers / 2), true)}
            <View style={styles.divider} />
            {renderTeam(match.participants.slice(match.maxPlayers / 2), false)}
          </View>
          <View style={styles.matchDetails}>
            <Text>Date: {new Date(match.date).toLocaleDateString()}</Text>
            <Text>Time: {match.time}</Text>
            <Text>Price: {match.price} {match.currency}</Text>
          </View>
        </View>
      </Card.Content>
      <Card.Actions>
        <Button
          mode="contained"
          onPress={onPress}
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
  },
  matchInfo: {
    marginTop: 8,
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  teamSpots: {
    fontSize: 12,
    color: '#666',
  },
  playersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 4,
    width: '100%',
  },
  playerAvatar: {
    margin: 2,
    width: '20%',
  },
  matchDetails: {
    marginTop: 16,
  },
  joinButton: {
    margin: 4,
  },
  joinButtonInner: {
    margin: 0,
    padding: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default MatchCard; 