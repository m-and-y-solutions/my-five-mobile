import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import api from '../services/api';

const PushNotificationTest = () => {
  const [loading, setLoading] = useState(false);

  const testPushNotification = async () => {
    setLoading(true);
    try {
      const response = await api.post('/users/test-push');
      Alert.alert('Success', 'Test notification sent! Check your device.');
      console.log('[Test] Response:', response.data);
    } catch (error: any) {
      console.error('[Test] Error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to send test notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Push Notification Test</Text>
      <TouchableOpacity 
        style={styles.button} 
        onPress={testPushNotification}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Sending...' : 'Send Test Notification'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    margin: 10,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PushNotificationTest; 