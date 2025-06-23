import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation.types';
import { useDispatch, useSelector } from 'react-redux';
import { resetPasswordWithCodeThunk } from '../../store/slices/authSlice';
import { RootState } from '../../store';
import { validatePassword } from '../../utils/auth';


type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

const ResetPasswordScreen: React.FC<Props> = ({ route, navigation }) => {
  const { email, code } = route.params;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const dispatch = useDispatch();
  const loading = useSelector((state: RootState) => state.auth.loading);
  const error = useSelector((state: RootState) => state.auth.error);

  const handleReset = async () => {
    setLocalError('');
    if (!password || !confirmPassword) {
      setLocalError('Veuillez remplir les deux champs');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Les mots de passe ne correspondent pas');
      return;
    }
    const { isValid } = validatePassword(password);
    if (!isValid) {
      setLocalError('Le mot de passe doit contenir au moins 6 caractères et un symbole.');
      return;
    }
    try {
      const result = await dispatch<any>(resetPasswordWithCodeThunk({ email, code, newPassword: password }));
      if (result.meta.requestStatus === 'fulfilled') {
        navigation.reset({
          index: 0,
          routes: [
            { name: 'Login', params: { message: 'Mot de passe réinitialisé, vous pouvez vous connecter.' } },
          ],
        });
      } else {
        setLocalError(result.payload || "Erreur lors de la réinitialisation");
      }
    } catch (e) {
      setLocalError('Erreur lors de la réinitialisation');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nouveau mot de passe</Text>
      <TextInput
        label="Nouveau mot de passe"
        value={password}
        onChangeText={setPassword}
        mode="outlined"
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        label="Confirmer le mot de passe"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        mode="outlined"
        secureTextEntry
        style={styles.input}
      />
      {localError ? <HelperText type="error" visible={true}>{localError}</HelperText> : null}
      {error && !localError ? <HelperText type="error" visible={true}>{error}</HelperText> : null}
      <Button
        mode="contained"
        onPress={handleReset}
        loading={loading}
        disabled={loading}
        style={styles.button}
        buttonColor="#4CAF50"
      >
        Réinitialiser
      </Button>
      <Button
        mode="text"
        onPress={() => navigation.reset({
          index: 0,
          routes: [
            { name: 'Login' },
          ],
        })}
        style={styles.linkButton}
        textColor="#4CAF50"
      >
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
    marginBottom: 24,
    color: '#4CAF50',
  },
  input: {
    width: '100%',
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

export default ResetPasswordScreen; 