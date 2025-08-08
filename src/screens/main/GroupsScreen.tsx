import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Button, useTheme, ActivityIndicator, Text, Searchbar, FAB, Chip, IconButton } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchGroups, joinGroup, leaveGroup, getGroupJoinRequests, respondToJoinRequest } from '../../store/slices/groupsSlice';
import { Group } from '../../services/groupService';
import { RootStackParamList } from 'types/navigation.types';

type GroupsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'GroupDetails'>;
type GroupsScreenRouteProp = RouteProp<RootStackParamList, 'Groups'>;

const GroupsScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const theme = useTheme();
  const navigation = useNavigation<GroupsScreenNavigationProp>();
  const route = useRoute<GroupsScreenRouteProp>();
  const isUserGroups = route.params?.isUserGroups;

  const dispatch = useDispatch<AppDispatch>();
  const { groups, loading, error, joinRequests, joinRequestsLoading } = useSelector((state: RootState) => state.groups);
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchGroups());
    }, [dispatch])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchGroups());
    setRefreshing(false);
  };

  const filteredGroups = (groups || []).filter((group: Group) => {
    const groupsSearch =
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (group.description || '').toLowerCase().includes(searchQuery.toLowerCase());

    const isCreator = group.creatorId === userId;
    const isMember = group.isMember;

    let groupsFilters = true;
    if (activeFilters.includes('created')) groupsFilters = groupsFilters && isCreator;
    if (activeFilters.includes('member')) groupsFilters = groupsFilters && isMember;

    if (isUserGroups && !isMember) return false;

    return groupsSearch && groupsFilters;
  });

  const [joining, setJoining] = useState<string | null>(null);
  const [leaving, setLeaving] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const handleJoin = async (groupId: string) => {
    setJoining(groupId);
    await dispatch(joinGroup(groupId));
    setJoining(null);
  };

  const handleLeave = async (groupId: string) => {
    setLeaving(groupId);
    await dispatch(leaveGroup(groupId));
    setLeaving(null);
  };

  const handleShowJoinRequests = (groupId: string) => {
    setSelectedGroupId(groupId);
    dispatch(getGroupJoinRequests(groupId));
  };

  if (loading && !refreshing) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#4CAF50" />;
  }
  if (error && (!groups || !groups.length)) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={onRefresh} style={styles.retryButton}>
          Réessayer
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.section}>
          <Searchbar
            placeholder="Rechercher des groupes..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor="#4CAF50"
            inputStyle={styles.searchInput}
            mode="bar"
          />

          <View style={styles.filterContainer}>
            <Chip
              selected={activeFilters.includes('created')}
              onPress={() =>
                setActiveFilters((prev) =>
                  prev.includes('created') ? prev.filter(f => f !== 'created') : [...prev, 'created']
                )
              }
              style={styles.filterChip}
              selectedColor="#4CAF50"
            >
              Créés par vous
            </Chip>
            <Chip
              selected={activeFilters.includes('member')}
              onPress={() =>
                setActiveFilters((prev) =>
                  prev.includes('member') ? prev.filter(f => f !== 'member') : [...prev, 'member']
                )
              }
              style={styles.filterChip}
              selectedColor="#4CAF50"
            >
              Membre
            </Chip>
          </View>

          {filteredGroups.length === 0 ? (
            <Text style={styles.empty}>Aucun groupe trouvé.</Text>
          ) : (
            filteredGroups.map((group) => (
              <View key={group.id} style={[styles.groupContainer, !group.isMember && styles.groupInactive]}>
                <View style={[styles.groupContent, !group.isMember && styles.groupContentInactive]}>
                  <TouchableOpacity
                    style={styles.groupInfo}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (group.isMember) {
                        navigation.navigate('GroupDetails', { groupId: group.id });
                      }
                    }}
                    disabled={!group.isMember}
                  >
                    <Text style={styles.groupName}>{group.name}</Text>
                    {!group.isMember && (
                      <Text style={styles.accessText}>Rejoignez le groupe pour accéder</Text>
                    )}
                    <Text style={styles.groupDescription}>{group.description}</Text>
                    {group.creatorId === userId && (
                      <Text
                        style={styles.joinRequestsLink}
                        onPress={() => navigation.navigate('GroupJoinRequests', { groupId: group.id })}
                      >
                        Voir demandes d'adhésion
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Séparateur vertical */}
                <View style={styles.verticalSeparator} />

                {/* Partie bouton (toujours blanche) */}
                <View style={styles.buttonContainer}>
                  {group.isMember ? (
                    <IconButton
                      icon="exit-to-app"
                      size={28}
                      iconColor="#e53935"
                      onPress={() => handleLeave(group.id)}
                      disabled={leaving === group.id || group.creatorId === userId}
                    />
                  ) : group.joinRequestStatus === 'pending' ? (
                    <Button disabled>En attente</Button>
                  ) : group.joinRequestStatus === 'blocked' ? (
                    <View style={{ alignItems: 'center' }}>
                      <IconButton
                        icon="minus-circle-outline"
                        size={28}
                        iconColor="#bdbdbd"
                        disabled
                      />
                      <Text style={{ color: '#bdbdbd', fontSize: 12 }}>Bloqué</Text>
                    </View>
                  ) : (
                    <IconButton
                      icon="account-plus"
                      size={28}
                      iconColor="#4CAF50"
                      onPress={() => handleJoin(group.id)}
                      disabled={joining === group.id}
                    />
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: '#4CAF50' }]}
        onPress={() => navigation.navigate('CreateGroup')}
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
    paddingHorizontal: 20,
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
    fontSize: 16,
    paddingHorizontal: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  groupContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  groupInactive: {
    backgroundColor: '#f9f9f9',
  },
  groupContent: {
    flex: 1,
    padding: 16,
  },
  groupContentInactive: {
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#222',
  },
  accessText: {
    color: '#bdbdbd',
    fontSize: 13,
    marginBottom: 2,
    marginTop: 2,
  },
  groupDescription: {
    fontSize: 16,
    color: '#666',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#888',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#e53935',
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 32,
    zIndex: 10,
  },
  joinRequestsLink: {
    color: '#4CAF50',
    marginTop: 6,
    marginBottom: 2,
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  verticalSeparator: {
    width: 1,
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  buttonContainer: {
    padding: 16,
    height: '100%',
    backgroundColor: '#fff',
  },
});

export default GroupsScreen;