import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton, Badge } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation.types';
import { RootState } from '../store';

const NotificationBellWithBadge = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const unreadCount = useSelector(
    (state: RootState) => state.notifications.notifications.filter(n => !n.read).length
  );

  return (
    <View>
      <IconButton
        icon="bell"
        size={26}
        iconColor="#4CAF50"
        onPress={() => navigation.navigate('Notifications')}
      />
      {unreadCount > 0 && (
        <Badge style={styles.badge}>{unreadCount}</Badge>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#e53935',
    color: '#fff',
    fontWeight: 'bold',
    zIndex: 10,
  },
});

export default NotificationBellWithBadge;
