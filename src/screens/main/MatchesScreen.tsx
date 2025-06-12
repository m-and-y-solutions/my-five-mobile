import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Button, useTheme, ActivityIndicator, Text, Searchbar, FAB, Chip, Icon } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../navigation/types';
import { Match } from '../../services/matchService';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchAllMatches, fetchUserMatches, resetMatches } from '../../store/slices/matchSlice';
import MatchCard from '../../components/MatchCard';
import config from 'config/config';
import { MOCK_MATCHES } from '../../constants/mockdata.constantes';

type MatchesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;
type MatchesScreenRouteProp = RouteProp<RootStackParamList, 'Matches'>;

const MatchesScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const theme = useTheme();
  const navigation = useNavigation<MatchesScreenNavigationProp>();
  const route = useRoute<MatchesScreenRouteProp>();
  
  const dispatch = useDispatch<AppDispatch>();
  const { matches, loading, error } = useSelector((state: RootState) => state.match);
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  useFocusEffect(
    React.useCallback(() => {
      fetchMatches();
      return () => {
        dispatch(resetMatches());
      };
    }, [activeTab])
  );

  const fetchMatches = async () => {
    try {
      if (route.params?.isUserMatches) {
        await dispatch(fetchUserMatches(activeTab));
      } else {
        await dispatch(fetchAllMatches(activeTab));
      }
    } catch (err: any) {
      console.error('Error in fetchMatches:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMatches();
    setRefreshing(false);
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const filteredMatches = matches.filter((match: Match) => {
    const matchesSearch = match.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         match.field.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         match.field.city.toLowerCase().includes(searchQuery.toLowerCase());

    const isCreator = match.creator.id === userId;
    const isParticipant = match.team1?.players.some(p => p.player.id === userId) || 
                         match.team2?.players.some(p => p.player.id === userId);

    const matchesFilters = activeFilters.length === 0 || 
      (activeFilters.includes('created') && isCreator) ||
      (activeFilters.includes('participating') && isParticipant);

    return matchesSearch && matchesFilters;
  });

  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
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
        <View style={styles.section}>
          <Searchbar
            placeholder="Rechercher des matchs..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor="#4CAF50"
            inputStyle={styles.searchInput}
            mode="bar"
          />
       
          <View style={styles.tabs}>
            <Button
              mode={activeTab === 'upcoming' ? 'contained' : 'outlined'}
              onPress={() => setActiveTab('upcoming')}
              style={[
                styles.tabButton,
                activeTab === 'upcoming' ? styles.tabButtonActive : styles.tabButtonInactive
              ]}
              buttonColor="#4CAF50"
              textColor={activeTab === 'upcoming' ? '#fff' : '#4CAF50'}
            >
              À venir
            </Button>
            <Button
              mode={activeTab === 'ongoing' ? 'contained' : 'outlined'}
              onPress={() => setActiveTab('ongoing')}
              style={[
                styles.tabButton,
                activeTab === 'ongoing' ? styles.tabButtonActive : styles.tabButtonInactive
              ]}
              buttonColor="#4CAF50"
              textColor={activeTab === 'ongoing' ? '#fff' : '#4CAF50'}
            >
              En cours
            </Button>
            <Button
              mode={activeTab === 'completed' ? 'contained' : 'outlined'}
              onPress={() => setActiveTab('completed')}
              style={[
                styles.tabButton,
                activeTab === 'completed' ? styles.tabButtonActive : styles.tabButtonInactive
              ]}
              buttonColor="#4CAF50"
              textColor={activeTab === 'completed' ? '#fff' : '#4CAF50'}
            >
              Terminés
            </Button>
            
          </View>
          <View style={styles.filterTitleContainer}>
            <Icon source="filter" size={20} color="#4CAF50" />
            <Text style={styles.filterTitle}>Filtres</Text>
          </View>

          <View style={styles.filterContainer}>
            <Chip
              selected={activeFilters.includes('created')}
              onPress={() => toggleFilter('created')}
              style={styles.filterChip}
              selectedColor="#4CAF50"
            >
              Créés par vous
            </Chip>
            <Chip
              selected={activeFilters.includes('participating')}
              onPress={() => toggleFilter('participating')}
              style={styles.filterChip}
              selectedColor="#4CAF50"
            >
              Vos participations
            </Chip>
          </View>
          {filteredMatches.length === 0 ? (
            <Text style={styles.emptyText}>Aucun match trouvé</Text>
          ) : (
            filteredMatches.map((match: Match) => (
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
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: '#4CAF50' }]}
        onPress={() => navigation.navigate('CreateMatch')}
        color="#fff"
      />
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
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  searchInput: {
    color: '#333',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  tabButtonActive: {
    backgroundColor: '#4CAF50',
  },
  tabButtonInactive: {
    backgroundColor: '#fff',
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#fff',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  filterTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
    gap: 8,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default MatchesScreen; 