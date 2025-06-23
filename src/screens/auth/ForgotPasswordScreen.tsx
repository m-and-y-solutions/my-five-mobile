import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword } from '../../store/slices/authSlice';
import { RootState } from '../../store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation.types';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const loading = useSelector((state: RootState) => state.auth.loading);
  const error = useSelector((state: RootState) => state.auth.error);

  const handleForgotPassword = async () => {
    setLocalError('');
    setLocalSuccess('');
    if (!email) {
      setLocalError('Veuillez saisir votre email');
      return;
    }
    const result = await dispatch<any>(forgotPassword(email));
    if (result.meta.requestStatus === 'fulfilled') {
      (navigation as any).navigate('VerifyCodeReset', { email });
    } else {
      setLocalError(result.payload || "Erreur lors de l'envoi du mail");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Mot de passe oublié</Text>
        <TextInput
          label={<Text>Email <Text style={{color: 'red'}}>*</Text></Text>}
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          activeOutlineColor="#4CAF50"
          error={!!localError || !!error}
        />
        {localError ? <HelperText type="error" visible={true}>{localError}</HelperText> : null}
        {error && !localError ? <HelperText type="error" visible={true}>{error}</HelperText> : null}
        {localSuccess ? <HelperText type="info" visible={true}>{localSuccess}</HelperText> : null}
        <Button
          mode="contained"
          onPress={handleForgotPassword}
          loading={loading}
          disabled={loading}
          style={styles.button}
          buttonColor="#4CAF50"
          contentStyle={{ width: '100%' }}
        >
          Envoyer
        </Button>
        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          style={styles.linkButton}
          textColor="#4CAF50"
        >
          Retour
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  formContainer: {
    paddingHorizontal: 20,
    justifyContent: 'center',
    flex: 1,
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#4CAF50',
    fontSize: 22,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
    width: '100%',
  },
  linkButton: {
    marginTop: 16,
  },
});

export default ForgotPasswordScreen; 