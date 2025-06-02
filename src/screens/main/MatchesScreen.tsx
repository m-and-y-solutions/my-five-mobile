import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Button, useTheme, ActivityIndicator, Text, Searchbar } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../navigation/types';
import { Match } from '../../services/matchService';
import axios from 'axios';
import { API_URL } from '../../config/config';
import { MOCK_MATCHES } from '../../constants/mockdata.constantes';
import MatchCard from '../../components/MatchCard';

type MatchesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;
type MatchesScreenRouteProp = RouteProp<RootStackParamList, 'Matches'>;

const MatchesScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  const theme = useTheme();
  const navigation = useNavigation<MatchesScreenNavigationProp>();
  const route = useRoute<MatchesScreenRouteProp>();

  useEffect(() => {
    fetchMatches();
  }, [activeTab]);

  const fetchMatches = async () => {
    try {
      console.log('Fetching matches...');
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
      const storedMatches = await AsyncStorage.getItem('matches');
      if (storedMatches) {
        console.log('Using stored matches data');
        setMatches(JSON.parse(storedMatches));
      }

      // Try to fetch fresh data from backend
      try {
        console.log('Fetching fresh matches data...');
        const response = await axios.get(`${API_URL}/matches`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            status: activeTab,
            isUserMatches: route.params?.isUserMatches,
          },
          timeout: 10000,
        });

        console.log('Matches fetched successfully:', response.data);
        setMatches(response.data);

        // Update localStorage with fresh data
        await AsyncStorage.setItem('matches', JSON.stringify(response.data));
      } catch (err: any) {
        console.error('Error fetching fresh matches:', err);
        if (!storedMatches) {
          // If no stored data and backend fails, use mock data
          console.log('Using mock data instead...');
          setUsingMockData(true);
          const mockMatches = MOCK_MATCHES.filter(match => match.status === activeTab);
          setMatches(mockMatches);
        }
      }
    } catch (err: any) {
      console.error('Error in fetchMatches:', err);
      setError(err.response?.data?.message || 'Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMatches();
    setRefreshing(false);
  };

  const filteredMatches = matches.filter(match =>
    match.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.field.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.field.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    if (error && !matches.length) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            mode="contained"
            onPress={fetchMatches}
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
          <Searchbar
            placeholder="Search matches..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />
          <View style={styles.tabs}>
            <Button
              mode={activeTab === 'upcoming' ? 'contained' : 'outlined'}
              onPress={() => setActiveTab('upcoming')}
              style={styles.tabButton}
            >
              Upcoming
            </Button>
            <Button
              mode={activeTab === 'ongoing' ? 'contained' : 'outlined'}
              onPress={() => setActiveTab('ongoing')}
              style={styles.tabButton}
            >
              Ongoing
            </Button>
            <Button
              mode={activeTab === 'completed' ? 'contained' : 'outlined'}
              onPress={() => setActiveTab('completed')}
              style={styles.tabButton}
            >
              Completed
            </Button>
          </View>
          {filteredMatches.length === 0 ? (
            <Text style={styles.emptyText}>No matches found</Text>
          ) : (
            filteredMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onPress={() => navigation.navigate('MatchDetails', { matchId: match.id })}
              />
            ))
          )}
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
  searchBar: {
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  tabButton: {
    flex: 1,
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

export default MatchesScreen; 