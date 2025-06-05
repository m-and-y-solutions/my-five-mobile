import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Button, useTheme, ActivityIndicator, Text, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchAllMatches, resetMatches } from '../../store/slices/matchSlice';
import MatchCard from '../../components/MatchCard';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

const HomeScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  
  const dispatch = useDispatch<AppDispatch>();
  const { matches, loading, error } = useSelector((state: RootState) => state.match);

  useEffect(() => {
    fetchUpcomingMatches();
    return () => {
      dispatch(resetMatches());
    };
  }, []);

  const fetchUpcomingMatches = async () => {
    try {
      await dispatch(fetchAllMatches('upcoming'));
    } catch (err: any) {
      console.error('Error in fetchUpcomingMatches:', err);
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
            onPress={fetchUpcomingMatches}
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
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.section}>
          <Text variant="headlineSmall" style={styles.sectionTitle}>
            Matchs à venir
          </Text>
          {matches.length === 0 ? (
            <Text style={styles.emptyText}>Aucun match à venir</Text>
          ) : (
            matches.map((match) => (
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
  sectionTitle: {
    marginBottom: 16,
    color: '#4CAF50',
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
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 8,
  },
});

export default HomeScreen; 