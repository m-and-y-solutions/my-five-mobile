import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, List, useTheme, Avatar, Surface, ActivityIndicator, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import config from 'config/config';

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

const UserStatsScreen = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      console.log('Fetching user stats...');
      setLoading(true);
      setError('');
      setUsingMockData(false);

      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        console.log('No token found');
        setError('Please login to view stats');
        return;
      }

      // Try to get stats from localStorage first
      const storedStats = await AsyncStorage.getItem('userStats');
      if (storedStats) {
        console.log('Using stored stats data');
        setStats(JSON.parse(storedStats));
      }

      // Try to fetch fresh data from backend
      try {
        console.log('Fetching fresh stats data...');
        const response = await axios.get(`${config.apiUrl}/users/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        });

        console.log('Stats fetched successfully:', response.data);
        setStats(response.data);

        // Update localStorage with fresh data
        await AsyncStorage.setItem('userStats', JSON.stringify(response.data));
      } catch (err: any) {
        console.error('Error fetching fresh stats:', err);
        if (!storedStats) {
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
            achievements: [
              {
                id: '1',
                title: 'First Win',
                description: 'Won your first match',
                icon: 'trophy',
                unlockedAt: '2024-03-01',
              },
              {
                id: '2',
                title: 'Goal Scorer',
                description: 'Scored 10 goals',
                icon: 'soccer',
                unlockedAt: '2024-03-15',
              },
            ],
          });
        }
      }
    } catch (err: any) {
      console.error('Error in fetchStats:', err);
      setError(err.response?.data?.message || 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

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
          onPress={fetchStats}
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
      <Surface style={styles.statsCard}>
        <Text variant="headlineSmall" style={[styles.sectionTitle, { color: '#4CAF50' }]}>
          Overall Statistics
        </Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text variant="titleMedium" style={{ color: '#4CAF50' }}>{stats?.totalMatches || 0}</Text>
            <Text variant="bodySmall">Total Matches</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="titleMedium" style={{ color: '#4CAF50' }}>{stats?.wins || 0}</Text>
            <Text variant="bodySmall">Wins</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="titleMedium" style={{ color: '#4CAF50' }}>{stats?.losses || 0}</Text>
            <Text variant="bodySmall">Losses</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="titleMedium" style={{ color: '#4CAF50' }}>{stats?.draws || 0}</Text>
            <Text variant="bodySmall">Draws</Text>
          </View>
        </View>
      </Surface>

      <Surface style={styles.statsCard}>
        <Text variant="headlineSmall" style={[styles.sectionTitle, { color: '#4CAF50' }]}>
          Performance
        </Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text variant="titleMedium" style={{ color: '#4CAF50' }}>{stats?.goalsScored || 0}</Text>
            <Text variant="bodySmall">Goals</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="titleMedium" style={{ color: '#4CAF50' }}>{stats?.assists || 0}</Text>
            <Text variant="bodySmall">Assists</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="titleMedium" style={{ color: '#4CAF50' }}>{stats?.winRate?.toFixed(1) || 0}%</Text>
            <Text variant="bodySmall">Win Rate</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="titleMedium" style={{ color: '#4CAF50' }}>{stats?.ranking || 0}</Text>
            <Text variant="bodySmall">Ranking</Text>
          </View>
        </View>
      </Surface>

      <Surface style={styles.statsCard}>
        <Text variant="headlineSmall" style={[styles.sectionTitle, { color: '#4CAF50' }]}>
          Averages
        </Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text variant="titleMedium" style={{ color: '#4CAF50' }}>{stats?.averageGoalsPerMatch?.toFixed(1) || 0}</Text>
            <Text variant="bodySmall">Goals/Match</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="titleMedium" style={{ color: '#4CAF50' }}>{stats?.averageAssistsPerMatch?.toFixed(1) || 0}</Text>
            <Text variant="bodySmall">Assists/Match</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="titleMedium" style={{ color: '#4CAF50' }}>{stats?.currentStreak || 0}</Text>
            <Text variant="bodySmall">Current Streak</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="titleMedium" style={{ color: '#4CAF50' }}>{stats?.bestStreak || 0}</Text>
            <Text variant="bodySmall">Best Streak</Text>
          </View>
        </View>
      </Surface>

      <Surface style={styles.statsCard}>
        <Text variant="headlineSmall" style={[styles.sectionTitle, { color: '#4CAF50' }]}>
          Achievements
        </Text>
        {stats?.achievements.map((achievement) => (
          <List.Item
            key={achievement.id}
            title={achievement.title}
            description={achievement.description}
            left={props => <List.Icon {...props} icon={achievement.icon} color="#4CAF50" />}
          />
        ))}
      </Surface>
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
  statsCard: {
    margin: 16,
    padding: 16,
    elevation: 4,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
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

export default UserStatsScreen; 