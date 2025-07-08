import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, ActivityIndicator, IconButton, Button, useTheme, List, Badge } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchNotifications, markAsRead, markAllAsRead } from '../../store/slices/notificationSlice';

const NotificationsScreen = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, loading, error } = useSelector((state: RootState) => state.notifications);
  const [refreshing, setRefreshing] = React.useState(false);

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
    <List.Item
      title={item.title}
      description={item.body}
      left={props => (
        <IconButton
          {...props}
          icon={item.read ? 'bell-outline' : 'bell'}
          iconColor={item.read ? '#bdbdbd' : '#4CAF50'}
        />
      )}
      right={props => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {!item.read && <Badge style={styles.badge} size={10} />}
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
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
      )}
      style={[styles.item, item.read && styles.itemRead]}
      onPress={() => handleMarkAsRead(item.id)}
    />
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
});

export default NotificationsScreen; 