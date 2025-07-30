import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { Text, ActivityIndicator, IconButton, Button, useTheme, List, Badge, Avatar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchNotifications, markAsRead, markAllAsRead } from '../../store/slices/notificationSlice';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation.types';
import config from 'config/config';

const NotificationsScreen = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, loading, error } = useSelector((state: RootState) => state.notifications);
  const [refreshing, setRefreshing] = React.useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchNotifications());
    setRefreshing(false);
  };

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id));
    // TODO: Optionnel: call API to mark as read
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
    // TODO: Optionnel: call API to mark all as read
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => {
        if (!item.read) handleMarkAsRead(item.id);
        navigation.navigate('MatchDetails', { matchId: item.matchId });
      }}
      style={[styles.item, item.read && styles.itemRead, { padding: 12 }]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: item.creatorId })}>
          {/* <Image
            source={item.user.creatorAvatar ? { uri: item.creatorAvatar.startsWith('http') ? item.creatorAvatar : `${process.env.EXPO_PUBLIC_SERVER_URL || ''}${item.creatorAvatar}` } : require('../../../assets/default-avatar.png')}
            style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10, backgroundColor: '#eee' }}
          /> */}
          <Avatar.Image
          size={40}
          source={
              item.match.creator.profileImage
                ? { uri: config.serverUrl + item.match.creator.profileImage }
                : require('../../../assets/default-avatar.png')
            }
            style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10, backgroundColor: '#eee' }}
          />
        </TouchableOpacity>
        <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: item.match.creator.id })}>
            <Text style={{ fontWeight: 'bold', color: '#4CAF50' }}>{`${item.match.creator.firstName} ${item.match.creator.lastName}` || 'Utilisateur'}</Text>
          </TouchableOpacity>
          <Text> a créé un match  </Text>
          <TouchableOpacity onPress={() => navigation.navigate('MatchDetails', { matchId: item.matchId })}>
            <Text style={{ fontWeight: 'bold', color: '#1976D2' }}>{`${item.match.title}` || 'Match'}</Text>
          </TouchableOpacity>
          <Text> dans le groupe </Text>
          <TouchableOpacity onPress={() => navigation.navigate('GroupDetails', { groupId: item.groupId })}>
            <Text style={{ fontWeight: 'bold', color: '#FF9800' }}>{`${item.group.name}` || 'Groupe'}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
          {!item.read && <Badge style={styles.badge} size={10} />}
          {!item.read && (
            <IconButton
              icon="check-circle-outline"
              iconColor="#4CAF50"
              size={22}
              onPress={() => handleMarkAsRead(item.id)}
              style={{ marginLeft: 0 }}
            />
          )}
        </View>
      </View>
      <Text style={[styles.date, { marginLeft: 50, marginTop: 2 }]}>{item.createdAt ? (new Date(item.createdAt).toLocaleDateString() + ' ' + new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) : ''}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <Button
          mode="text"
          onPress={handleMarkAllAsRead}
          disabled={notifications.every(n => n.read)}
          labelStyle={{ color: '#4CAF50', fontWeight: 'bold' }}
        >
          Tout marquer comme lu
        </Button>
      </View>
      {loading && !refreshing ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#4CAF50" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : notifications.length === 0 ? (
        <Text style={styles.empty}>Aucune notification pour le moment.</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  item: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 8,
    elevation: 1,
    paddingLeft: 0,
  },
  itemRead: {
    opacity: 0.6,
  },
  badge: {
    backgroundColor: '#4CAF50',
    marginRight: 8,
    alignSelf: 'center',
  },
  date: {
    color: '#888',
    fontSize: 12,
    marginRight: 8,
  },
  error: {
    color: '#e53935',
    textAlign: 'center',
    marginTop: 32,
  },
  empty: {
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },
  notificationBody: {
    fontSize: 16,
    color: '#666',
    paddingHorizontal: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});

export default NotificationsScreen; 