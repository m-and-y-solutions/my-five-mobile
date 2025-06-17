import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Modal,
  ViewStyle,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import {
  Text,
  Button,
  useTheme,
  ActivityIndicator,
  Avatar,
  IconButton,
  TextInput,
  Divider,
  Chip,
  Menu,
} from "react-native-paper";
import { useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/types";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import {
  fetchMatchById,
  joinMatch,
  leaveMatch,
  updateCaptain,
  updatePlayerStats,
  updateMatchScore,
  updateMatchStatus,
} from "../../store/slices/matchSlice";
import config from "../../config/config";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Portal } from "react-native-paper";

const { width } = Dimensions.get("window");

type MatchDetailsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "MatchDetails" | "Profile"
>;
type MatchDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  "MatchDetails"
>;

const MatchDetailsScreen = () => {
  const route = useRoute<MatchDetailsScreenRouteProp>();
  const navigation = useNavigation<MatchDetailsScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedMatch, error } = useSelector(
    (state: RootState) => state.match
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<"team1" | "team2" | null>(
    null
  );
  const [scoreModalVisible, setScoreModalVisible] = useState(false);
  const [statsModalVisible, setStatsModalVisible] = useState(false);
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [selectedPlayerStats, setSelectedPlayerStats] = useState<{
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
  }>({
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
  });
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedPlayerTeam, setSelectedPlayerTeam] = useState<
    "team1" | "team2" | null
  >(null);
  const [selectedPlayerName, setSelectedPlayerName] = useState("");
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    fetchMatchDetails();
  }, [route.params.matchId]);

  const fetchMatchDetails = async () => {
    try {
      await dispatch(fetchMatchById(route.params.matchId));
    } catch (err: any) {
      console.error("Error in fetchMatchDetails:", err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMatchDetails();
    setRefreshing(false);
  };

  const handleJoinPress = (team: "team1" | "team2") => {
    setSelectedTeam(team);
    setJoinModalVisible(true);
  };

  const handleConfirmJoin = async () => {
    if (!selectedMatch || !selectedTeam) return;
    try {
      await dispatch(
        joinMatch({ matchId: selectedMatch.id, team: selectedTeam })
      );
      setJoinModalVisible(false);
      setSelectedTeam(null);
      await fetchMatchDetails();
    } catch (err: any) {
      console.error("Error in handleJoinMatch:", err);
    }
  };

 

  const handleDeleteUser = () => {
    console.log({ selectematchid: selectedMatch?.id }, { selectedPlayerId });

    if (!selectedMatch || !selectedPlayerId) {
      return;
    }
    // Log ids
    console.log(
      "Connected user id:",
      user?.id,
      "Selected user id:",
      selectedPlayerId
    );
    setDeleteModalVisible(true);
  };

  const handleConfirmDeleteUser = async () => {
    setDeleteModalVisible(false);
    if (!selectedMatch || !selectedPlayerId) return;

    try {
      await dispatch(
        leaveMatch({ matchId: selectedMatch.id, userId: selectedPlayerId })
      );
      // await fetchMatchDetails();
    } catch (err: any) {
      console.error("Error in handleDeleteUser:", err);
    }
  };

  const isParticipant =
    selectedMatch?.team1?.players.some((p) => p.player.id === user?.id) ||
    selectedMatch?.team2?.players.some((p) => p.player.id === user?.id) ||
    false;

  const isCreator = user?.id === selectedMatch?.creator.id;
  const totalPlayers =
    (selectedMatch?.team1?.players.length || 0) +
    (selectedMatch?.team2?.players.length || 0);

  const handleToggleCaptain = async (
    playerId: string,
    team: "team1" | "team2"
  ) => {
    try {
      await dispatch(
        updateCaptain({ matchId: selectedMatch!.id, playerId, team })
      );
      await fetchMatchDetails();
    } catch (err: any) {
      console.error("Error in handleToggleCaptain:", err);
    }
  };

  const handleEditStats = (
    playerId: string,
    team: "team1" | "team2",
    firstName: string,
    lastName: string
  ) => {
    const teamData =
      team === "team1" ? selectedMatch?.team1 : selectedMatch?.team2;
    const player = teamData?.players.find((p) => p.player.id === playerId);

    setSelectedPlayerId(playerId);
    setSelectedPlayerTeam(team);
    setSelectedPlayerName(`${firstName} ${lastName}`);
    setSelectedPlayerStats(
      player?.stats || { goals: 0, assists: 0, yellowCards: 0, redCards: 0 }
    );
    setStatsModalVisible(true);
  };

  const handleUpdateStats = async () => {
    if (!selectedPlayerId || !selectedPlayerTeam) return;
    try {
      await dispatch(
        updatePlayerStats({
          matchId: selectedMatch!.id,
          playerId: selectedPlayerId,
          team: selectedPlayerTeam,
          stats: selectedPlayerStats,
        })
      );
      setStatsModalVisible(false);
      await fetchMatchDetails();
    } catch (err: any) {
      console.error("Error in handleUpdateStats:", err);
    }
  };

  const handleUpdateScore = async () => {
    try {
      await dispatch(
        updateMatchScore({
          matchId: selectedMatch!.id,
          team1Score,
          team2Score,
        })
      );
      setScoreModalVisible(false);
      await fetchMatchDetails();
    } catch (err: any) {
      console.error("Error in handleUpdateScore:", err);
    }
  };

  const handlePlayerPress = (userId: string) => {
    navigation.navigate("Profile", { userId });
  };

  const handleStatsPress = (
    playerId: string,
    team: "team1" | "team2",
    firstName: string,
    lastName: string
  ) => {
    if (isCreator) {
      handleEditStats(playerId, team, firstName, lastName);
    } else {
      setAlertMessage(
        "Seul le créateur du match peut modifier les statistiques"
      );
      setAlertModalVisible(true);
    }
  };

  const handleScorePress = () => {
    if (!selectedMatch) return;

    if (isCreator) {
      setTeam1Score(selectedMatch.team1?.score || 0);
      setTeam2Score(selectedMatch.team2?.score || 0);
      setScoreModalVisible(true);
    } else {
      setAlertMessage("Seul le créateur du match peut modifier le score");
      setAlertModalVisible(true);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      if (!selectedMatch) return;
      await dispatch(
        updateMatchStatus({ matchId: selectedMatch.id, status: newStatus })
      );
      // await dispatch(fetchMatchById(selectedMatch.id));
      setStatusMenuVisible(false);
    } catch (error) {
      console.error("Error updating match status:", error);
      Alert.alert("Erreur", "Impossible de mettre à jour le statut du match");
    }
  };

  const getStatusOptions = () => {
    switch (selectedMatch?.status) {
      case "upcoming":
        return [
          { label: "En cours", value: "ongoing" },
          { label: "Terminé", value: "completed" },
          { label: "Annulé", value: "cancelled" },

        ];
      case "ongoing":
        return [
          { label: "Terminé", value: "completed" },
          { label: "Annulé", value: "cancelled" },
        ];
      case "completed":
      case "cancelled":
        return [];
      default:
        return [];
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "#4CAF50";
      case "in_progress":
        return "#FFA000";
      case "completed":
        return "#F44336";
      default:
        return "#757575";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "upcoming":
        return "À venir";
      case "in_progress":
        return "En cours";
      case "completed":
        return "Terminé";
      default:
        return status;
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!selectedMatch) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons
          name="alert-circle"
          size={48}
          color={theme.colors.error}
        />
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error || "Match non trouvé"}
        </Text>
        <Button
          mode="contained"
          onPress={fetchMatchDetails}
          style={styles.retryButton}
          contentStyle={styles.buttonContent}
        >
          Réessayer
        </Button>
      </View>
    );
  }

  const statusColors = {
    upcoming: "#4CAF50",
    ongoing: "#FFA000",
    completed: "#2196F3",
    cancelled: "#F44336",
  };

  const statusText = {
    upcoming: "À venir",
    ongoing: "En cours",
    completed: "Terminé",
    cancelled: "Annulé",
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
        />
      }
    >
      {/* Header Section */}
      <View style={[styles.header, { backgroundColor: "#4CAF5020" }]}>
        <View style={styles.headerContent}>
          <Text
            variant="headlineSmall"
            style={[styles.headerTitle, { color: "#000000" }]}
          >
            {selectedMatch.field.name}
          </Text>
          <View style={styles.visibilityContainer}>
            <Chip
              mode="outlined"
              style={[
                styles.visibilityChip,
                {
                  borderColor:
                    selectedMatch?.visibility === "public"
                      ? "#4CAF50"
                      : "#FFA000",
                },
              ]}
              textStyle={{
                color:
                  selectedMatch?.visibility === "public"
                    ? "#4CAF50"
                    : "#FFA000",
              }}
            >
              {selectedMatch?.visibility === "public" ? "Publique" : "Privé"}
            </Chip>
            <IconButton
              icon="share-variant"
              size={20}
              iconColor="#4CAF50"
              onPress={() => {
                // Handle share functionality
              }}
            />
          </View>
          <View style={styles.headerActions}>
            {isCreator && selectedMatch?.status !== "completed" && (
              <Menu
                visible={statusMenuVisible}
                onDismiss={() => setStatusMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setStatusMenuVisible(true)}
                    style={[
                      styles.statusButton,
                      {
                        backgroundColor: "#FFFFFF",
                        borderColor: "#4CAF50",
                      },
                    ]}
                    textColor="#4CAF50"
                    icon="chevron-down"
                  >
                    {getStatusLabel(selectedMatch?.status || "")}
                  </Button>
                }
              >
                {getStatusOptions().map((option) => (
                  <Menu.Item
                    key={option.value}
                    onPress={() => handleStatusChange(option.value)}
                    title={option.label}
                  />
                ))}
              </Menu>
            )}
            <View style={styles.statusContainer}>
              <Text
                variant="bodySmall"
                style={[styles.statusLabel, { color: theme.colors.onSurface }]}
              >
                Statut actuel:
              </Text>
              <Chip
                style={[
                  styles.statusChip,
                  {
                    backgroundColor: getStatusColor(
                      selectedMatch?.status || ""
                    ),
                  },
                ]}
                textStyle={{ color: "#FFFFFF" }}
              >
                {getStatusLabel(selectedMatch?.status || "")}
              </Chip>
            </View>
          </View>
          <View style={styles.matchInfoRow}>
            <MaterialCommunityIcons
              name="calendar"
              size={16}
              color={theme.colors.onSurface}
            />
            <Text
              variant="bodyMedium"
              style={[styles.subtitle, { color: theme.colors.onSurface }]}
            >
              {new Date(selectedMatch.date).toLocaleDateString()} à{" "}
              {selectedMatch.time}
            </Text>
          </View>
          <View style={styles.matchInfoRow}>
            <MaterialCommunityIcons
              name="account-group"
              size={16}
              color={theme.colors.onSurface}
            />
            <Text
              variant="bodyMedium"
              style={[styles.subtitle, { color: theme.colors.onSurface }]}
            >
              {totalPlayers}/{selectedMatch.maxPlayers} joueurs
            </Text>
          </View>
        </View>
      </View>

      {/* Join Section */}
      {user && !isParticipant && selectedMatch.status === "upcoming" && (
        <View
          style={[
            styles.joinSection,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text
            variant="titleLarge"
            style={[styles.joinTitle, { color: "#000000" }]}
          >
            Rejoindre une équipe
          </Text>
          <View style={styles.joinButtons}>
            <Button
              mode="contained"
              onPress={() => handleJoinPress("team1")}
              style={[styles.joinButton, { backgroundColor: "#4CAF50" }]}
              contentStyle={styles.buttonContent}
              disabled={totalPlayers >= selectedMatch.maxPlayers}
              icon={({ size, color }) => (
                <MaterialCommunityIcons
                  name="account-group"
                  size={size}
                  color="#FFFFFF"
                />
              )}
            >
              {selectedMatch.team1?.name || "Équipe 1"}
            </Button>
            <Button
              mode="contained"
              onPress={() => handleJoinPress("team2")}
              style={[styles.joinButton, { backgroundColor: "#4CAF50" }]}
              contentStyle={styles.buttonContent}
              disabled={totalPlayers >= selectedMatch.maxPlayers}
              icon={({ size, color }) => (
                <MaterialCommunityIcons
                  name="account-group"
                  size={size}
                  color="#FFFFFF"
                />
              )}
            >
              {selectedMatch.team2?.name || "Équipe 2"}
            </Button>
          </View>
        </View>
      )}

      {/* Score Section */}
      {(selectedMatch.status === "ongoing" ||
        selectedMatch.status === "completed") && (
        <View
          style={[
            styles.scoreSection,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <View style={styles.scoreContainer}>
            <View style={styles.teamScore}>
              <Text
                variant="titleMedium"
                style={[styles.teamName, { color: "#000000" }]}
                numberOfLines={1}
              >
                {selectedMatch.team1?.name || "Équipe 1"}
              </Text>
              {isCreator ? (
                <TouchableOpacity
                  onPress={handleScorePress}
                  style={styles.scoreTouchable}
                >
                  <Text
                    variant="displayMedium"
                    style={[styles.scoreText, { color: "#000000" }]}
                  >
                    {selectedMatch.team1?.score || 0}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text
                  variant="displayMedium"
                  style={[styles.scoreText, { color: "#000000" }]}
                >
                  {selectedMatch.team1?.score || 0}
                </Text>
              )}
            </View>

            <View style={styles.scoreSeparatorContainer}>
              <Text
                variant="displayMedium"
                style={[styles.scoreSeparator, { color: "#000000" }]}
              >
                -
              </Text>
            </View>

            <View style={styles.teamScore}>
              <Text
                variant="titleMedium"
                style={[styles.teamName, { color: "#000000" }]}
                numberOfLines={1}
              >
                {selectedMatch.team2?.name || "Équipe 2"}
              </Text>
              {isCreator ? (
                <TouchableOpacity
                  onPress={handleScorePress}
                  style={styles.scoreTouchable}
                >
                  <Text
                    variant="displayMedium"
                    style={[styles.scoreText, { color: "#000000" }]}
                  >
                    {selectedMatch.team2?.score || 0}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text
                  variant="displayMedium"
                  style={[styles.scoreText, { color: "#000000" }]}
                >
                  {selectedMatch.team2?.score || 0}
                </Text>
              )}
            </View>
          </View>

          {isCreator && (
            <Text style={[styles.editHint, { color: "#4CAF50" }]}>
              Appuyez sur un score pour le modifier
            </Text>
          )}
        </View>
      )}

      {/* Teams Section */}
      <View style={styles.section}>
        <Text
          variant="titleLarge"
          style={[styles.sectionTitle, { color: "#000000" }]}
        >
          Équipes
        </Text>

        <View style={styles.teamsContainer}>
          {/* Team 1 */}
          <View
            style={[styles.teamCard, { backgroundColor: theme.colors.surface }]}
          >
            <View style={styles.teamHeader}>
              <View style={styles.teamTitleContainer}>
                <MaterialCommunityIcons
                  name="account-group"
                  size={20}
                  color="#4CAF50"
                />
                <Text
                  variant="titleMedium"
                  style={[styles.teamTitle, { color: "#000000" }]}
                >
                  {selectedMatch.team1?.name || "Équipe 1"}
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.participantsList}>
              {selectedMatch.team1?.players.length ? (
                selectedMatch.team1?.players.map((teamPlayer) => (
                  <View
                    key={teamPlayer.player.id}
                    style={styles.participantItem}
                  >
                    <View style={styles.participantTouchable}>
                      <TouchableOpacity
                        onPress={() => handlePlayerPress(teamPlayer.player.id)}
                      >
                        <Avatar.Image
                          size={48}
                          source={
                            teamPlayer.player.profileImage
                              ? {
                                  uri:
                                    config.serverUrl +
                                    teamPlayer.player.profileImage,
                                }
                              : require("../../../assets/default-avatar.png")
                          }
                        />
                      </TouchableOpacity>
                      <View style={styles.participantInfo}>
                        <Text
                          style={[
                            styles.participantName,
                            { color: theme.colors.onSurface },
                          ]}
                        >
                          {teamPlayer.player.firstName}{" "}
                          {teamPlayer.player.lastName}
                        </Text>
                        <View style={styles.participantMeta}>
                          {teamPlayer.isCaptain && (
                            <View style={styles.captainBadge}>
                              <MaterialCommunityIcons
                                name="crown"
                                size={14}
                                color="#FFD700"
                              />
                              <Text style={styles.captainText}>Capitaine</Text>
                            </View>
                          )}
                          {(selectedMatch.status === "ongoing" ||
                            selectedMatch.status === "completed") &&
                            teamPlayer.stats && (
                              <TouchableOpacity
                                onPress={() =>
                                  handleStatsPress(
                                    teamPlayer.player.id,
                                    "team1",
                                    teamPlayer.player.firstName,
                                    teamPlayer.player.lastName
                                  )
                                }
                              >
                                <View style={styles.statsBadge}>
                                  <MaterialCommunityIcons
                                    name="soccer"
                                    size={14}
                                    color="#FFF"
                                  />
                                  <Text style={styles.statsText}>
                                    {teamPlayer.stats.goals}G{" "}
                                    {teamPlayer.stats.assists}A
                                    {teamPlayer.stats.yellowCards > 0 &&
                                      ` 🟨${teamPlayer.stats.yellowCards}`}
                                    {teamPlayer.stats.redCards > 0 &&
                                      ` 🟥${teamPlayer.stats.redCards}`}
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            )}
                        </View>
                      </View>
                    </View>

                    {(isCreator ||
                      (isParticipant && teamPlayer.player.id === user?.id)) && (
                      <View style={styles.playerActions}>
                        {isCreator && (
                          <IconButton
                            icon={
                              teamPlayer.isCaptain ? "crown" : "crown-outline"
                            }
                            size={20}
                            onPress={() =>
                              handleToggleCaptain(teamPlayer.player.id, "team1")
                            }
                            iconColor={
                              teamPlayer.isCaptain
                                ? "#FFD700"
                                : theme.colors.onSurface
                            }
                          />
                        )}
                      </View>
                    )}
                    {/* Ajout du bouton croix rouge pour le créateur */}
                    {isCreator &&
                      selectedMatch.status === "upcoming" &&
                      teamPlayer.player.id !== user?.id && (
                        <IconButton
                          icon={
                            teamPlayer.player.id === user?.id
                              ? "exit-to-app"
                              : "close"
                          }
                          size={20}
                          iconColor={theme.colors.error}
                          onPress={() => {
                            setSelectedPlayerId(teamPlayer.player.id);
                            setSelectedPlayerTeam("team1");
                            handleDeleteUser();
                          }}
                          style={{ marginLeft: 8 }}
                        />
                      )}
                    {teamPlayer.player.id === user?.id && (
                      <IconButton
                        icon="exit-to-app"
                        size={20}
                        iconColor={theme.colors.error}
                        onPress={() => {
                          setSelectedPlayerId(teamPlayer.player.id);
                          setSelectedPlayerTeam("team1");
                          handleDeleteUser();
                        }}
                        style={{ marginLeft: 8 }}
                        disabled={isCreator}
                      />
                    )}
                  </View>
                ))
              ) : (
                <View style={styles.emptyTeam}>
                  <MaterialCommunityIcons
                    name="account-group-outline"
                    size={24}
                    color="#4CAF50"
                  />
                  <Text
                    style={[
                      styles.emptyTeamText,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    Pas de joueurs pour le moment
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Team 2 */}
          <View
            style={[styles.teamCard, { backgroundColor: theme.colors.surface }]}
          >
            <View style={styles.teamHeader}>
              <View style={styles.teamTitleContainer}>
                <MaterialCommunityIcons
                  name="account-group"
                  size={20}
                  color="#4CAF50"
                />
                <Text
                  variant="titleMedium"
                  style={[styles.teamTitle, { color: "#000000" }]}
                >
                  {selectedMatch.team2?.name || "Équipe 2"}
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.participantsList}>
              {selectedMatch.team2?.players.length ? (
                selectedMatch.team2?.players.map((teamPlayer) => (
                  <View
                    key={teamPlayer.player.id}
                    style={styles.participantItem}
                  >
                    <View style={styles.participantTouchable}>
                      <TouchableOpacity
                        onPress={() => handlePlayerPress(teamPlayer.player.id)}
                      >
                        <Avatar.Image
                          size={48}
                          source={
                            teamPlayer.player.profileImage
                              ? {
                                  uri:
                                    config.serverUrl +
                                    teamPlayer.player.profileImage,
                                }
                              : require("../../../assets/default-avatar.png")
                          }
                        />
                      </TouchableOpacity>
                      <View style={styles.participantInfo}>
                        <Text
                          style={[
                            styles.participantName,
                            { color: theme.colors.onSurface },
                          ]}
                        >
                          {teamPlayer.player.firstName}{" "}
                          {teamPlayer.player.lastName}
                        </Text>

                        <View style={styles.participantMeta}>
                          {teamPlayer.isCaptain && (
                            <View style={styles.captainBadge}>
                              <MaterialCommunityIcons
                                name="crown"
                                size={14}
                                color="#FFD700"
                              />
                              <Text style={styles.captainText}>Capitaine</Text>
                            </View>
                          )}

                          {(selectedMatch.status === "ongoing" ||
                            selectedMatch.status === "completed") &&
                            teamPlayer.stats && (
                              <TouchableOpacity
                                onPress={() =>
                                  handleStatsPress(
                                    teamPlayer.player.id,
                                    "team2",
                                    teamPlayer.player.firstName,
                                    teamPlayer.player.lastName
                                  )
                                }
                              >
                                <View style={styles.statsBadge}>
                                  <MaterialCommunityIcons
                                    name="soccer"
                                    size={14}
                                    color="#FFF"
                                  />
                                  <Text style={styles.statsText}>
                                    {teamPlayer.stats.goals}G{" "}
                                    {teamPlayer.stats.assists}A
                                    {teamPlayer.stats.yellowCards > 0 &&
                                      ` 🟨${teamPlayer.stats.yellowCards}`}
                                    {teamPlayer.stats.redCards > 0 &&
                                      ` 🟥${teamPlayer.stats.redCards}`}
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            )}
                        </View>
                      </View>
                    </View>

                    {(isCreator ||
                      (isParticipant && teamPlayer.player.id === user?.id)) && (
                      <View style={styles.playerActions}>
                        {isCreator && (
                          <IconButton
                            icon={
                              teamPlayer.isCaptain ? "crown" : "crown-outline"
                            }
                            size={20}
                            onPress={() =>
                              handleToggleCaptain(teamPlayer.player.id, "team2")
                            }
                            iconColor={
                              teamPlayer.isCaptain
                                ? "#FFD700"
                                : theme.colors.onSurface
                            }
                          />
                        )}
                      </View>
                    )}
                    {/* Ajout du bouton croix rouge pour le créateur */}
                    {isCreator &&
                      selectedMatch.status === "upcoming" &&
                      teamPlayer.player.id !== user?.id && (
                        <IconButton
                          icon="close"
                          size={20}
                          iconColor={theme.colors.error}
                          onPress={() => {
                            setSelectedPlayerId(teamPlayer.player.id);
                            setSelectedPlayerTeam("team1");
                            handleDeleteUser();
                          }}
                          style={{ marginLeft: 8 }}
                        />
                      )}
                    {teamPlayer.player.id === user?.id && (
                      <IconButton
                        icon="exit-to-app"
                        size={20}
                        iconColor={theme.colors.error}
                        onPress={() => {
                          setSelectedPlayerId(teamPlayer.player.id);
                          setSelectedPlayerTeam("team1");
                          handleDeleteUser();
                        }}
                        style={{ marginLeft: 8 }}
                      />
                    )}
                  </View>
                ))
              ) : (
                <View style={styles.emptyTeam}>
                  <MaterialCommunityIcons
                    name="account-group-outline"
                    size={24}
                    color="#4CAF50"
                  />
                  <Text
                    style={[
                      styles.emptyTeamText,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    Pas de joueurs pour le moment
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Match Info Section */}
      <View
        style={[styles.infoSection, { backgroundColor: theme.colors.surface }]}
      >
        <Text
          variant="titleLarge"
          style={[styles.sectionTitle, { color: "#000000" }]}
        >
          Informations
        </Text>

        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="account" size={20} color="#4CAF50" />
          <Text style={[styles.infoText, { color: theme.colors.onSurface }]}>
            Créé par : {selectedMatch.creator.firstName}{" "}
            {selectedMatch.creator.lastName}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="map-marker" size={20} color="#4CAF50" />
          <Text style={[styles.infoText, { color: theme.colors.onSurface }]}>
            Lieu : {selectedMatch.field.address}
          </Text>
        </View>
      </View>

      {/* Join Modal */}
      <Modal
        visible={joinModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setJoinModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: "#FFFFFF" }]}>
            <MaterialCommunityIcons
              name="account-group"
              size={48}
              color="#4CAF50"
              style={styles.modalIcon}
            />
            <Text
              variant="titleLarge"
              style={[styles.modalTitle, { color: "#000000" }]}
            >
              Rejoindre le match
            </Text>
            <Text
              variant="bodyMedium"
              style={[styles.modalText, { color: "#000000" }]}
            >
              Voulez-vous rejoindre{" "}
              {selectedTeam === "team1"
                ? selectedMatch.team1?.name || "Équipe 1"
                : selectedMatch.team2?.name || "Équipe 2"}{" "}
              ?
            </Text>

            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setJoinModalVisible(false)}
                style={[styles.modalButton, { borderColor: "#4CAF50" }]}
                textColor="#4CAF50"
                contentStyle={styles.buttonContent}
              >
                Annuler
              </Button>
              <Button
                mode="contained"
                onPress={handleConfirmJoin}
                style={[styles.modalButton, { backgroundColor: "#4CAF50" }]}
                contentStyle={styles.buttonContent}
              >
                Confirmer
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Score Modal */}
      <Modal
        visible={scoreModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setScoreModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: "#FFFFFF" }]}>
            <MaterialCommunityIcons
              name="scoreboard"
              size={48}
              color="#4CAF50"
              style={styles.modalIcon}
            />
            <Text
              variant="titleLarge"
              style={[styles.modalTitle, { color: "#000000" }]}
            >
              Modifier le score
            </Text>

            <View style={styles.scoreInputContainer}>
              <View style={styles.scoreInputWrapper}>
                <TextInput
                  label={selectedMatch.team1?.name || "Équipe 1"}
                  value={String(team1Score)}
                  onChangeText={(text) => setTeam1Score(parseInt(text) || 0)}
                  keyboardType="numeric"
                  mode="outlined"
                  style={styles.scoreInput}
                  theme={{ colors: { primary: "#4CAF50" } }}
                />
              </View>

              <Text
                variant="displayMedium"
                style={[styles.scoreSeparator, { color: "#000000" }]}
              >
                -
              </Text>

              <View style={styles.scoreInputWrapper}>
                <TextInput
                  label={selectedMatch.team2?.name || "Équipe 2"}
                  value={String(team2Score)}
                  onChangeText={(text) => setTeam2Score(parseInt(text) || 0)}
                  keyboardType="numeric"
                  mode="outlined"
                  style={styles.scoreInput}
                  theme={{ colors: { primary: "#4CAF50" } }}
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setScoreModalVisible(false)}
                style={[styles.modalButton, { borderColor: "#4CAF50" }]}
                textColor="#4CAF50"
                contentStyle={styles.buttonContent}
              >
                Annuler
              </Button>
              <Button
                mode="contained"
                onPress={handleUpdateScore}
                style={[styles.modalButton, { backgroundColor: "#4CAF50" }]}
                contentStyle={styles.buttonContent}
              >
                Enregistrer
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Stats Modal */}
      <Modal
        visible={statsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setStatsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: "#FFFFFF" }]}>
            <MaterialCommunityIcons
              name="chart-box"
              size={48}
              color="#4CAF50"
              style={styles.modalIcon}
            />
            <Text
              variant="titleLarge"
              style={[styles.modalTitle, { color: "#000000" }]}
            >
              Statistiques de {selectedPlayerName}
            </Text>

            <View style={styles.statsInputContainer}>
              <TextInput
                label="Buts marqués"
                value={String(selectedPlayerStats.goals)}
                onChangeText={(text) =>
                  setSelectedPlayerStats((prev) => ({
                    ...prev,
                    goals: parseInt(text) || 0,
                  }))
                }
                keyboardType="numeric"
                mode="outlined"
                left={<TextInput.Icon icon="soccer" color="#4CAF50" />}
                style={styles.statsInput}
                theme={{ colors: { primary: "#4CAF50" } }}
              />

              <TextInput
                label="Passes décisives"
                value={String(selectedPlayerStats.assists)}
                onChangeText={(text) =>
                  setSelectedPlayerStats((prev) => ({
                    ...prev,
                    assists: parseInt(text) || 0,
                  }))
                }
                keyboardType="numeric"
                mode="outlined"
                left={<TextInput.Icon icon="handshake" color="#4CAF50" />}
                style={styles.statsInput}
                theme={{ colors: { primary: "#4CAF50" } }}
              />

              <TextInput
                label="Cartons jaunes"
                value={String(selectedPlayerStats.yellowCards)}
                onChangeText={(text) =>
                  setSelectedPlayerStats((prev) => ({
                    ...prev,
                    yellowCards: parseInt(text) || 0,
                  }))
                }
                keyboardType="numeric"
                mode="outlined"
                left={<TextInput.Icon icon="card" color="#FFD700" />}
                style={styles.statsInput}
                theme={{ colors: { primary: "#4CAF50" } }}
              />

              <TextInput
                label="Cartons rouges"
                value={String(selectedPlayerStats.redCards)}
                onChangeText={(text) =>
                  setSelectedPlayerStats((prev) => ({
                    ...prev,
                    redCards: parseInt(text) || 0,
                  }))
                }
                keyboardType="numeric"
                mode="outlined"
                left={<TextInput.Icon icon="card" color="#FF0000" />}
                style={styles.statsInput}
                theme={{ colors: { primary: "#4CAF50" } }}
              />
            </View>

            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setStatsModalVisible(false)}
                style={[styles.modalButton, { borderColor: "#4CAF50" }]}
                textColor="#4CAF50"
                contentStyle={styles.buttonContent}
              >
                Annuler
              </Button>
              <Button
                mode="contained"
                onPress={handleUpdateStats}
                style={[styles.modalButton, { backgroundColor: "#4CAF50" }]}
                contentStyle={styles.buttonContent}
              >
                Enregistrer
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Alert Modal */}
      <Modal
        visible={alertModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAlertModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setAlertModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.modalCard, { backgroundColor: "#FFFFFF" }]}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={48}
                color="#4CAF50"
                style={styles.modalIcon}
              />
              <Text
                variant="titleLarge"
                style={[styles.modalTitle, { color: "#000000" }]}
              >
                Accès restreint
              </Text>
              <Text
                variant="bodyMedium"
                style={[styles.modalText, { color: "#000000" }]}
              >
                {alertMessage}
              </Text>
              <View style={styles.modalButtons}>
                <Button
                  mode="contained"
                  onPress={() => setAlertModalVisible(false)}
                  style={[styles.modalButton, { backgroundColor: "#4CAF50" }]}
                  contentStyle={styles.buttonContent}
                >
                  OK
                </Button>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Delete User Modal */}
      <Portal>
        {/* <Modal
          visible={deleteModalVisible}
          onDismiss={() => setDeleteModalVisible(false)}
          transparent
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: "white",
                  padding: 24,
                  margin: 24,
                  borderRadius: 12,
                },
              ]}
            >
              <Text
                style={{ marginBottom: 16, fontWeight: "bold", fontSize: 16 }}
              >
                {selectedPlayerId === user.id ? "Quitter le match" : "Supprimer ce participant du match" } 
                ?
              </Text>
              <View
                style={{ flexDirection: "row", justifyContent: "flex-end" }}
              >
                <Button
                  onPress={() => setDeleteModalVisible(false)}
                  style={{ marginRight: 8 }}
                >
                  Annuler
                </Button>
                <Button
                  mode="contained"
                  buttonColor="#4CAF50"
                  onPress={handleConfirmDeleteUser}
                >
                {selectedPlayerId === user.id ? "Quitter" : "Supprimer" } 
                </Button>
              </View>
            </View>
          </View>
        </Modal> */}

        {/* Join Modal */}
        <Modal
          visible={deleteModalVisible}
          onDismiss={() => setDeleteModalVisible(false)}
          transparent
          animationType="fade"
          onRequestClose={() => setJoinModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: "#FFFFFF" }]}>
              <MaterialCommunityIcons
                name="account-group"
                size={48}
                color="#4CAF50"
                style={styles.modalIcon}
              />
              <Text
                variant="titleLarge"
                style={[styles.modalTitle, { color: "#000000" }]}
              >
                {selectedPlayerId === user.id
                  ? "Quitter le match"
                  : "Supprimer Participant "}
              </Text>
              <Text
                variant="bodyMedium"
                style={[styles.modalText, { color: "#000000" }]}
              >
                {selectedPlayerId === user.id
                  ? "Voulez-vous vraiment quitter ce match ?"
                  : "Voulez-vous vraiment supprimer ce participant du match ?"}
                ?
              </Text>

              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setDeleteModalVisible(false)}
                  style={[styles.modalButton, { borderColor: "#4CAF50" }]}
                  textColor="#4CAF50"
                  contentStyle={styles.buttonContent}
                >
                  Annuler
                </Button>
                <Button
                  mode="contained"
                  onPress={handleConfirmDeleteUser}
                  style={[styles.modalButton, { backgroundColor: "#4CAF50" }]}
                  contentStyle={styles.buttonContent}
                >
                  Confirmer
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    padding: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 2,
    marginBottom: 16,
  },
  headerContent: {
    marginBottom: 16,
  },
  headerTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  visibilityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  visibilityChip: {
    backgroundColor: "transparent",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusButton: {
    borderRadius: 8,
  },
  statusChip: {
    borderRadius: 8,
  },
  matchInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  subtitle: {
    marginLeft: 8,
  },
  joinSection: {
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  joinTitle: {
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  joinButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  joinButton: {
    flex: 1,
    borderRadius: 8,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 16,
  },
  teamsContainer: {
    gap: 16,
  },
  teamCard: {
    borderRadius: 12,
    padding: 16,
    elevation: 1,
  },
  teamHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  teamTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  teamTitle: {
    fontWeight: "bold",
  },
  divider: {
    marginVertical: 8,
    height: 1,
  },
  participantsList: {
    marginTop: 8,
  },
  participantItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    padding: 8,
    borderRadius: 8,
  },
  participantTouchable: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  participantInfo: {
    marginLeft: 12,
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: "500",
  },
  participantMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  captainBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  captainText: {
    fontSize: 12,
    color: "#FFD700",
  },
  statsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statsText: {
    fontSize: 12,
    color: "#FFF",
  },
  playerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  leaveButton: {
    borderRadius: 8,
  },
  scoreSection: {
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  scoreContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  teamScore: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  teamName: {
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    fontSize: 16,
  },
  scoreText: {
    fontWeight: "bold",
    fontSize: 48,
  },
  scoreTouchable: {
    padding: 8,
    borderRadius: 8,
  },
  scoreSeparatorContainer: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreSeparator: {
    fontWeight: "bold",
    fontSize: 48,
  },
  editHint: {
    textAlign: "center",
    fontSize: 14,
    marginTop: 8,
  },
  infoSection: {
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 1,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  infoText: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    borderRadius: 8,
  },
  buttonContent: {
    height: 44,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  modalText: {
    textAlign: "center",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  scoreInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginVertical: 16,
  },
  scoreInputWrapper: {
    flex: 1,
  },
  scoreInput: {
    textAlign: "center",
  },
  statsInputContainer: {
    width: "100%",
    marginVertical: 16,
    gap: 16,
  },
  statsInput: {
    width: "100%",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  statusLabel: {
    fontSize: 12,
  },
  emptyTeam: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 8,
  },
  emptyTeamText: {
    fontSize: 14,
    textAlign: "center",
  },
});

export default MatchDetailsScreen;
