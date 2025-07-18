import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { addNotification } from 'store/slices/notificationSlice';
import config from 'config/config';
import { RootState } from 'store';

const NotificationListener = () => {
  const dispatch = useDispatch();
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  useEffect(() => {
    if (!userId) return;
    const socket = io(config.serverUrl);
    socket.emit('register', userId);
    console.log('[Socket] Listener attached for user', userId);
    socket.on('notification', (notif) => {
      console.log('[Socket] Notification received:', notif);
      dispatch(addNotification(notif));
    });
    return () => {
      socket.off('notification');
      socket.disconnect();
      console.log('[Socket] Listener detached and socket disconnected for user', userId);
    };
  }, [userId, dispatch]);

  return null; // Ce composant n'affiche rien
};

export default NotificationListener;
