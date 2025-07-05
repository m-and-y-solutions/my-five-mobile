import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, ActivityIndicator, Menu, List, IconButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { getGroupJoinRequests, respondToJoinRequest } from '../../store/slices/groupsSlice';
import { RootState, AppDispatch } from '../../store';
import { useRoute } from '@react-navigation/native';

const GroupJoinRequestsScreen = () => {
  const route = useRoute<any>();
  const { groupId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { joinRequests, joinRequestsLoading } = useSelector((state: RootState) => state.groups);
  const [visibleMenuId, setVisibleMenuId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getGroupJoinRequests(groupId));
  }, [dispatch, groupId]);

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>Demandes d'adhésion</Text> */}
      {joinRequestsLoading ? (
        <ActivityIndicator />
      ) : joinRequests.length === 0 ? (
        <Text style={styles.empty}>Aucune demande en attente.</Text>
      ) : (
        <ScrollView>
          {joinRequests.map((req) => (
            <View key={req.id} style={styles.requestItem}>
              <Text style={styles.userText}>
                {req.user.firstName} {req.user.lastName} ({req.user.email})
              </Text>
              <Menu
                visible={visibleMenuId === req.id}
                onDismiss={() => setVisibleMenuId(null)}
                anchor={
                  <IconButton
                    icon="dots-vertical"
                    size={24}
                    onPress={() => setVisibleMenuId(req.id)}
                  />
                }
              >
                <Menu.Item
                  onPress={() => {
                    dispatch(respondToJoinRequest({ requestId: req.id, action: 'accept' }));
                    setVisibleMenuId(null);
                  }}
                  title="Accepter"
                  leadingIcon="check"
                />
                <Menu.Item
                  onPress={() => {
                    dispatch(respondToJoinRequest({ requestId: req.id, action: 'reject' }));
                    setVisibleMenuId(null);
                  }}
                  title="Refuser"
                  leadingIcon="close"
                />
                <Menu.Item
                  onPress={() => {
                    dispatch(respondToJoinRequest({ requestId: req.id, action: 'block' }));
                    setVisibleMenuId(null);
                  }}
                  title="Bloquer"
                  leadingIcon="minus-circle-outline"
                />
              </Menu>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  empty: { textAlign: 'center', marginTop: 40, color: '#888' },
  requestItem: { marginBottom: 18, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  userText: { fontSize: 16, marginBottom: 0, flex: 1 },
  actions: { flexDirection: 'row', gap: 8 },
  accept: { marginRight: 8, backgroundColor: '#4CAF50' },
  reject: { borderColor: '#e53935' },
  block: {
    marginLeft: 8,
    borderColor: '#b71c1c',
    backgroundColor: '#b71c1c',
  },
});

export default GroupJoinRequestsScreen;
