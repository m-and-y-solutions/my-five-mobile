import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Button, useTheme, ActivityIndicator, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../navigation/types';
import { Match } from '../../services/matchService';
import axios from 'axios';
import { MOCK_MATCHES } from '../../constants/mockdata.constantes';
import MatchCard from '../../components/MatchCard';
import config from 'config/config';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

const HomeScreen = () => {
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  const theme = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();

  useEffect(() => {
    fetchUpcomingMatches();
  }, []);

  const fetchUpcomingMatches = async () => {
    try {
      console.log('Fetching upcoming matches...');
      setLoading(true);
      setError('');
      setUsingMockData(false);

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        setError('Please login to view matches');
        return;
      }

      // Try to get matches from localStorage first
      const storedMatches = await AsyncStorage.getItem('upcomingMatches');
      if (storedMatches) {
        console.log('Using stored matches data');
        setUpcomingMatches(JSON.parse(storedMatches));
      }

      // Try to fetch fresh data from backend
      try {
        console.log('Fetching fresh matches data...');
        const response = await axios.get(`${config.apiUrl}/matches`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            status: 'upcoming',
          },
          timeout: 10000,
        });

        console.log('Matches fetched successfully:', response.data.length);
        setUpcomingMatches(response.data);

        // Update localStorage with fresh data
        await AsyncStorage.setItem('upcomingMatches', JSON.stringify(response.data));
      } catch (err: any) {
        console.error('Error fetching fresh matches:', err);
        if (!storedMatches) {
          // If no stored data and backend fails, use mock data
          console.log('Using mock data instead...');
          setUsingMockData(true);
          const mockUpcomingMatches = MOCK_MATCHES.filter(match => match.status === 'upcoming');
          setUpcomingMatches(mockUpcomingMatches);
        }
      }
    } catch (err: any) {
      console.error('Error in fetchUpcomingMatches:', err);
      setError(err.response?.data?.message || 'Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUpcomingMatches();
    setRefreshing(false);
  };

  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    if (error && !upcomingMatches.length) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            mode="contained"
            onPress={fetchUpcomingMatches}
            style={styles.retryButton}
          >
            Retry
          </Button>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.content}
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
        <View style={styles.section}>
          <Text variant="headlineSmall" style={styles.sectionTitle}>
            Upcoming Matches
          </Text>
          {upcomingMatches.length === 0 ? (
            <Text style={styles.emptyText}>No upcoming matches available</Text>
          ) : (
            upcomingMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onPress={() => navigation.navigate('MatchDetails', { matchId: match.id })}
              />
            ))
          )}
        </View>

        <View style={styles.section}>
          <Button
            mode="contained"
            icon="plus"
            onPress={() => navigation.navigate('CreateMatch')}
            style={styles.createButton}
          >
            Create New Match
          </Button>
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButton: {
    marginTop: 8,
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

export default HomeScreen; 