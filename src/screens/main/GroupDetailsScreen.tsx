import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Button, ActivityIndicator, IconButton, List } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { removeMember, deleteGroup, leaveGroup, fetchGroups } from '../../store/slices/groupsSlice';
import { Group } from '../../services/groupService';
import { RootStackParamList } from 'types/navigation.types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { User } from 'types/user.types';
import { deleteMatch } from 'store/slices/matchSlice';

// Tabs fallback (simple custom tabs)
const TabButton = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={[styles.tabBtn, active && styles.tabBtnActive]}>
    <Text style={[styles.tabBtnText, active && styles.tabBtnTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const GroupDetailsScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch<AppDispatch>();
  const { groups } = useSelector((state: RootState) => state.groups);
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const groupId = route.params?.groupId as string;
  const group: Group | undefined = groups.find(g => g.id === groupId);
  const [tab, setTab] = useState<'matches' | 'members'>('matches');
  const [actionLoading, setActionLoading] = useState(false);


  if (!group) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }
console.log('----------')
  const isCreator = group.creatorId === userId;

  const handleRemoveMember = async (memberId: string) => {
    Alert.alert('Supprimer le membre', 'Êtes-vous sûr de vouloir supprimer ce membre ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          setActionLoading(true);
          await dispatch(removeMember({ groupId: group.id, userId: memberId }));
          setActionLoading(false);
        }
      }
    ]);
  };

  const handleDeleteGroup = async () => {
    Alert.alert('Supprimer le groupe', 'Cette action supprimera tous les membres et matchs du groupe. Continuer ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          setActionLoading(true);
          await dispatch(deleteGroup(group.id));
          setActionLoading(false);
          navigation.goBack();
        }
      }
    ]);
  };

  const handleLeaveGroup = async () => {
    Alert.alert('Quitter le groupe', 'Êtes-vous sûr de vouloir quitter ce groupe ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Quitter', style: 'destructive', onPress: async () => {
          setActionLoading(true);
          await dispatch(leaveGroup(group.id));
          setActionLoading(false);
          navigation.goBack();
        }
      }
    ]);
  };

  const handleDeleteMatch = async (matchId: string) => {
    Alert.alert('Supprimer le match', 'Êtes-vous sûr de vouloir supprimer ce match ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          setActionLoading(true);
          await dispatch(deleteMatch(matchId));
          await dispatch(fetchGroups())
          setActionLoading(false);        
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabsRow}>
        <TabButton label="Matchs" active={tab === 'matches'} onPress={() => setTab('matches')} />
        <TabButton label="Membres" active={tab === 'members'} onPress={() => setTab('members')} />
      </View>
      {tab === 'matches' ? (
        <ScrollView style={styles.tabContent}>
          {(group.matches?.length ?? 0) === 0 ? (
            <Text style={styles.empty}>Aucun match pour ce groupe.</Text>
          ) : (
            group.matches?.map((match) => (
              <List.Item
                key={match.id}
                title={match.title}
                description={match.date}
                left={props => <List.Icon {...props} icon="soccer" />}
                onPress={() => navigation.navigate('MatchDetails', { matchId: match.id })}
                right={props =>
                  match.creatorId === userId ? (
                    <IconButton
                      icon="delete"
                      iconColor="#e53935"
                      onPress={() => handleDeleteMatch(match.id)}
                      style={{ marginRight: -8 }}
                    />
                  ) : null
                }
              />
            ))
          )}
        </ScrollView>
      ) : (
        <ScrollView style={styles.tabContent}>
          <View style={styles.actionTopRight}>
            {isCreator ? (
              <Button
                mode="contained"
                onPress={handleDeleteGroup}
                style={styles.deleteButton}
                loading={actionLoading}
                buttonColor="#e53935"
              >
                Supprimer le groupe
              </Button>
            ) : (
              <Button
                mode="contained"
                onPress={handleLeaveGroup}
                style={styles.leaveButton}
                loading={actionLoading}
                buttonColor="#e53935"
              >
                Quitter le groupe
              </Button>
            )}
          </View>
          <View style={{ height: 56 }} />
          {(group.members?.length ?? 0) === 0 ? (
            <Text style={styles.empty}>Aucun membre.</Text>
          ) : (
            (group.members as User[]).map((member) => (
              <List.Item
                key={member.id}
                title={`${member.firstName} ${member.lastName} `|| member.email}
                description={member.id === group.creatorId ? 'Créateur' : ''}
                left={props => <List.Icon {...props} icon="account" />}
                right={props =>
                  isCreator && member.id !== userId ? (
                    <IconButton
                      icon="close"
                      iconColor="#e53935"
                      onPress={() => handleRemoveMember(member.id)}
                      disabled={actionLoading}
                      style={{ marginRight: -8 }}
                    />
                  ) : null
                }
                onPress={() => navigation.navigate('Profile', { userId: member.id })}
              />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabsRow: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: '#4CAF50',
  },
  tabBtnText: {
    fontSize: 16,
    color: '#888',
    fontWeight: 'bold',
  },
  tabBtnTextActive: {
    color: '#4CAF50',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#888',
  },
  actions: {
    marginTop: 32,
    alignItems: 'center',
  },
  deleteButton: {
    borderRadius: 8,
    marginBottom: 8,
  },
  leaveButton: {
    borderRadius: 8,
  },
  actionTopRight: {
    position: 'absolute',
    top: 8,
    right: 16,
    zIndex: 20,
  },
});

export default GroupDetailsScreen; 