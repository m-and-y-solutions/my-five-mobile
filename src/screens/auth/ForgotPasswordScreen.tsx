import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword } from '../../store/slices/authSlice';
import { RootState } from '../../store';

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
      setLocalSuccess('Un email de réinitialisation a été envoyé si ce compte existe.');
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
        <Text variant="headlineMedium" style={styles.title}>Mot de passe oublié</Text>
        <TextInput
          label="Email"
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
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#4CAF50',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
  },
  linkButton: {
    marginTop: 16,
  },
});

export default ForgotPasswordScreen; 