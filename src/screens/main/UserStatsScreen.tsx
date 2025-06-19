import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Text, useTheme, Surface, ActivityIndicator, Button, Chip } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import config from '../../config/config';
import { LineChart } from 'react-native-chart-kit';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchUserStats } from 'store/slices/userSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'store';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

interface UserStats {
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  goalsScored: number;
  assists: number;
  winRate: number;
  averageGoalsPerMatch: number;
  averageAssistsPerMatch: number;
  currentStreak: number;
  bestStreak: number;
  favoritePosition: string | null;
  totalPlayTime: number;
  achievements: Achievement[];
}

const { width } = Dimensions.get('window');
const UserStatsScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');

      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        setError('Veuillez vous connecter pour voir vos statistiques');
        return;
      }

      const response = await dispatch(fetchUserStats());
      

      if (fetchUserStats.fulfilled.match(response)) {
      // Calculer les pourcentages et moyennes côté frontend
      const stats = response.payload;
      const totalMatches = stats.totalMatches || 0;
      
      // Calculer le taux de victoire
      const winRate = totalMatches > 0 ? (stats.wins / totalMatches) * 100 : 0;
      
      // Calculer les moyennes de buts et passes par match
      const averageGoalsPerMatch = totalMatches > 0 ? stats.goalsScored / totalMatches : 0;
      const averageAssistsPerMatch = totalMatches > 0 ? stats.assists / totalMatches : 0;

      setStats({
        ...stats,
        winRate,
        averageGoalsPerMatch,
        averageAssistsPerMatch,
        achievements: stats.achievements?.map((achievement: Achievement) => {
          // Traduire les titres des réalisations
          let translatedTitle = achievement.title;
          let translatedDescription = achievement.description;

          switch (achievement.title) {
            case 'Goal Scorer':
              translatedTitle = 'Buteur';
              translatedDescription = stats.goalsScored === 0 
                ? 'Marquer votre premier but'
                : `Vous avez marqué ${stats.goalsScored} but${stats.goalsScored > 1 ? 's' : ''}`;
              break;
            case 'Team Player':
              translatedTitle = 'Joueur d\'équipe';
              translatedDescription = stats.assists === 0
                ? 'Donner votre première passe décisive'
                : `Vous avez donné ${stats.assists} passe${stats.assists > 1 ? 's' : ''} décisive${stats.assists > 1 ? 's' : ''}`;
              break;
            case 'Match Maker':
              translatedTitle = 'Créateur de match';
              translatedDescription = stats.totalMatches === 0
                ? 'Créer votre premier match'
                : `Vous avez participé à ${stats.totalMatches} match${stats.totalMatches > 1 ? 's' : ''}`;
              break;
            case 'Victory Seeker':
              translatedTitle = 'Chercheur de victoire';
              translatedDescription = stats.wins === 0
                ? 'Remporter votre premier match'
                : `Vous avez remporté ${stats.wins} victoire${stats.wins > 1 ? 's' : ''}`;
              break;
            case 'Consistent Player':
              translatedTitle = 'Joueur régulier';
              translatedDescription = stats.totalMatches < 5
                ? 'Jouer 5 matchs'
                : `Vous avez joué ${stats.totalMatches} match${stats.totalMatches > 1 ? 's' : ''}`;
              break;
            case 'Streak Master':
              translatedTitle = 'Maître des séries';
              translatedDescription = stats.currentStreak < 3
                ? 'Remporter 3 matchs consécutifs'
                : `Votre série actuelle est de ${stats.currentStreak} victoire${stats.currentStreak > 1 ? 's' : ''}`;
              break;
            default:
              break;
          }

          return {
            ...achievement,
            title: translatedTitle,
            description: translatedDescription
          };
        }) || []
      });
    }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des statistiques');
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
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error && !stats) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons name="alert-circle" size={48} color={theme.colors.error} />
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
        <Button
          mode="contained"
          onPress={fetchStats}
          style={styles.retryButton}
          contentStyle={styles.buttonContent}
          icon="reload"
        >
          Réessayer
        </Button>
      </View>
    );
  }

  const chartConfig = {
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(${theme.colors.onSurface}, ${opacity})`,
    propsForDots: {
      r: "5",
      strokeWidth: "2",
      stroke: "#4CAF50",
    },
  };

  // Créer des données pour le graphique de performance basées sur les victoires/défaites/nuls
  const performanceData = {
    labels: ['V', 'D', 'N'],
    datasets: [
      {
        data: [stats?.wins || 0, stats?.losses || 0, stats?.draws || 0],
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh} 
          colors={["#4CAF50"]}
        />
      }
    >
      {/* Header Section */}
      <View style={[styles.header, { backgroundColor: "#4CAF5020" }]}>
        <View style={styles.headerContent}>
          <Text variant="headlineSmall" style={[styles.headerTitle, { color: "#000000" }]}>
            Statistiques du joueur
          </Text>
        </View>
      </View>

      {/* Performance Overview */}
      <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="chart-line" size={24} color="#4CAF50" />
          <Text variant="titleLarge" style={[styles.cardTitle, { color: "#000000" }]}>
            Vue d'ensemble
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text variant="headlineMedium" style={[styles.statValue, { color: "#4CAF50" }]}>
              {stats?.totalMatches || 0}
            </Text>
            <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurface }]}>
              Matchs joués
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text variant="headlineMedium" style={[styles.statValue, { color: "#4CAF50" }]}>
              {stats?.wins || 0}
            </Text>
            <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurface }]}>
              Victoires
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text variant="headlineMedium" style={[styles.statValue, { color: "#4CAF50" }]}>
              {stats?.losses || 0}
            </Text>
            <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurface }]}>
              Défaites
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text variant="headlineMedium" style={[styles.statValue, { color: "#4CAF50" }]}>
              {stats?.draws || 0}
            </Text>
            <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurface }]}>
              Nuls
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text variant="headlineMedium" style={[styles.statValue, { color: "#4CAF50" }]}>
              {stats?.winRate?.toFixed(1) || 0}%
            </Text>
            <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurface }]}>
              Taux de victoire
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text variant="headlineMedium" style={[styles.statValue, { color: "#4CAF50" }]}>
              {stats?.totalMatches || 0}h
            </Text>
            <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurface }]}>
              Temps de jeu
            </Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Text variant="bodyMedium" style={[styles.chartTitle, { color: theme.colors.onSurface }]}>
            Distribution des résultats
          </Text>
          <LineChart
            data={performanceData}
            width={width - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
      </Surface>

      {/* Goals & Assists */}
      <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="soccer" size={24} color="#4CAF50" />
          <Text variant="titleLarge" style={[styles.cardTitle, { color: "#000000" }]}>
            Buts & Passes décisives
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text variant="headlineMedium" style={[styles.statValue, { color: "#4CAF50" }]}>
              {stats?.goalsScored || 0}
            </Text>
            <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurface }]}>
              Buts marqués
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text variant="headlineMedium" style={[styles.statValue, { color: "#4CAF50" }]}>
              {stats?.assists || 0}
            </Text>
            <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurface }]}>
              Passes décisives
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text variant="headlineMedium" style={[styles.statValue, { color: "#4CAF50" }]}>
              {stats?.averageGoalsPerMatch?.toFixed(1) || 0}
            </Text>
            <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurface }]}>
              Buts/Match
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text variant="headlineMedium" style={[styles.statValue, { color: "#4CAF50" }]}>
              {stats?.averageAssistsPerMatch?.toFixed(1) || 0}
            </Text>
            <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurface }]}>
              Passes décisives/Match
            </Text>
          </View>
        </View>
      </Surface>

      {/* Streaks & Position */}
      {/* <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="run-fast" size={24} color="#4CAF50" />
          <Text variant="titleLarge" style={[styles.cardTitle, { color: "#000000" }]}>
            Série & Position
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text variant="headlineMedium" style={[styles.statValue, { color: "#4CAF50" }]}>
              {stats?.currentStreak || 0}
            </Text>
            <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurface }]}>
              Série actuelle
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text variant="headlineMedium" style={[styles.statValue, { color: "#4CAF50" }]}>
              {stats?.bestStreak || 0}
            </Text>
            <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurface }]}>
              Meilleure série
            </Text>
          </View>
        </View>

        {stats?.favoritePosition && (
          <View style={styles.favoritePosition}>
            <Text variant="bodyMedium" style={[styles.positionLabel, { color: theme.colors.onSurface }]}>
              Position préférée:
            </Text>
            <Chip 
              icon={() => (
                <MaterialCommunityIcons 
                  name="soccer" 
                  size={16} 
                  color="#4CAF50" 
                />
              )}
              style={[styles.positionChip, { backgroundColor: "#4CAF5020" }]}
              textStyle={{ color: "#4CAF50" }}
            >
              {stats.favoritePosition.toLowerCase() === 'forward' ? 'Attaquant' : stats.favoritePosition}
            </Chip>
          </View>
        )}
      </Surface> */}

      {/* Achievements */}
      <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="trophy" size={24} color="#4CAF50" />
          <Text variant="titleLarge" style={[styles.cardTitle, { color: "#000000" }]}>
            Réalisations
          </Text>
        </View>

        {stats?.achievements?.length ? (
          stats.achievements.map((achievement) => {
            // Déterminer l'icône en fonction du titre
            let iconName = "trophy";
            if (achievement.title.includes("But")) {
              iconName = "soccer";
            } else if (achievement.title.includes("Passe")) {
              iconName = "handshake";
            } else if (achievement.title.includes("Victoire")) {
              iconName = "trophy";
            } else if (achievement.title.includes("Match")) {
              iconName = "medal";
            } else if (achievement.title.includes("Série")) {
              iconName = "star";
            }

            return (
              <View 
                key={achievement.id} 
                style={styles.achievementItem}
              >
                <View style={[styles.achievementIcon, { backgroundColor: "#4CAF5020" }]}>
                  <MaterialCommunityIcons 
                    name={iconName}
                    size={24} 
                    color="#4CAF50" 
                  />
                </View>
                <View style={styles.achievementContent}>
                  <Text variant="titleMedium" style={[styles.achievementTitle, { color: theme.colors.onSurface }]}>
                    {achievement.title}
                  </Text>
                  <Text variant="bodyMedium" style={[styles.achievementDesc, { color: theme.colors.onSurfaceVariant }]}>
                    {achievement.description}
                  </Text>
                  <Text variant="bodySmall" style={[styles.achievementDate, { color: theme.colors.outline }]}>
                    Débloqué le: {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyAchievements}>
            <MaterialCommunityIcons name="trophy-outline" size={48} color="#4CAF50" />
            <Text variant="bodyMedium" style={[styles.emptyText, { color: theme.colors.outline }]}>
              Aucune réalisation pour le moment. Continuez à jouer !
            </Text>
          </View>
        )}
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    padding: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  chartContainer: {
    marginTop: 16,
  },
  chartTitle: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  chart: {
    borderRadius: 8,
  },
  favoritePosition: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  positionLabel: {
    fontWeight: '500',
  },
  positionChip: {
    height: 32,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  achievementDesc: {
    marginBottom: 4,
  },
  achievementDate: {
    fontStyle: 'italic',
  },
  emptyAchievements: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  emptyText: {
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    borderRadius: 8,
  },
  buttonContent: {
    height: 44,
  },
});

export default UserStatsScreen;