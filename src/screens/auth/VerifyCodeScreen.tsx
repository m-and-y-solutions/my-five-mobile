import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { checkCode } from '../../store/slices/authSlice';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation.types';
import { AppDispatch } from 'store';
import { useDispatch } from 'react-redux';
import { verifyResetCodeThunk } from '../../store/slices/authSlice';

// Adjust the navigation types as needed

type Props = NativeStackScreenProps<RootStackParamList, 'VerifyCode'>;

const VerifyCodeScreen: React.FC<Props> = ({ route, navigation }) => {
  const { email } = route.params;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const handleVerify = async () => {
    setLoading(true);
    setError('');
    try {
      await dispatch(checkCode({ email, code })).unwrap();
      navigation.navigate('Login', { message: 'Votre compte est vérifié, vous pouvez vous connecter.' });
    } catch (err: any) {
      setError(err.message || 'Code incorrect ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vérification du téléphone</Text>
      <Text style={styles.subtitle}>Un code a été envoyé à {email}</Text>
      <TextInput
        label={<Text>Code de vérification <Text style={{color: 'red'}}>*</Text></Text>}
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        style={styles.input}
        maxLength={6}
        mode="outlined"
        activeOutlineColor="#4CAF50"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button mode="contained" onPress={handleVerify} loading={loading} disabled={loading || code.length !== 6} style={styles.button} buttonColor="#4CAF50" contentStyle={{ width: '100%' }}>
        Vérifier
      </Button>
      <Button mode="text" onPress={() => navigation.navigate('Login')} style={{ marginTop: 12 }} textColor="#4CAF50">
        Retour à la connexion
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    color: '#666',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  error: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
  button: {
    marginTop: 12,
  },
});

export default VerifyCodeScreen; 