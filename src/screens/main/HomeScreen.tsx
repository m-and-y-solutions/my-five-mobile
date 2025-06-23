import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  FlatList,
} from "react-native";
import {
  Button,
  useTheme,
  ActivityIndicator,
  Text,
  FAB,
} from "react-native-paper";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { fetchAllMatches, resetMatches } from "../../store/slices/matchSlice";
import MatchCard from "../../components/MatchCard";
import { LightTheme as theme } from "../../theme";
import { RootStackParamList } from "types/navigation.types";

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Main"
>;

const HomeScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const dispatch = useDispatch<AppDispatch>();
  const { matches, loading, error } = useSelector(
    (state: RootState) => state.match
  );

  useFocusEffect(
    React.useCallback(() => {
      fetchUpcomingMatches();
      return () => {
        dispatch(resetMatches());
      };
    }, [])
  );

  const fetchUpcomingMatches = async () => {
    try {
      if (!matches) {
        await dispatch(fetchAllMatches({}));
      }
    } catch (err: any) {
      console.error("Error in fetchUpcomingMatches:", err);
    }
  };

  const upcomingMatches = matches.filter(((match) => {
    match.status === "upcoming"
  }))

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUpcomingMatches();
    setRefreshing(false);
  };

  const handleJoinSuccess = () => {
    // Rafraîchir la liste des matchs
    fetchUpcomingMatches();
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
      <>
        <View style={styles.titleContainer}>
          <Button
            icon="calendar-month"
            mode="text"
            labelStyle={{ color: "#000", fontSize: 24, marginRight: 8 }}
            contentStyle={{ flexDirection: "row" }}
            style={{ backgroundColor: "transparent", elevation: 0 }}
            disabled
          >
            <Text style={[styles.sectionTitle, { color: "#000" }]}>Matchs à venir </Text>
          </Button>
        </View>
        <FlatList
          data={upcomingMatches}
          renderItem={({ item }) => (
            <MatchCard
              match={item}
              onPress={() =>
                navigation.navigate("MatchDetails", { matchId: item.id })
              }
              onJoinSuccess={handleJoinSuccess}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#4CAF50"]}
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucun match à venir</Text>
          }
        />
      </>
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {renderContent()}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate("CreateMatch")}
        color="#fff"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  titleContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    color: theme.colors.primary,
  },
  emptyText: {
    textAlign: "center",
    color: theme.colors.onSurface,
    marginVertical: 16,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  retryButton: {
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 8,
  },
  listContent: {
    padding: 16,
  },
});

export default HomeScreen;
