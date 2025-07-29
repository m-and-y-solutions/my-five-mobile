import React, { useState } from 'react';
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import { AppDispatch, RootState } from '../../store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation.types';
import { useRoute } from '@react-navigation/native';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: { navigation: LoginScreenNavigationProp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const theme = useTheme();
  const route = useRoute();
  const message = (route.params as { message?: string })?.message;

  const handleLogin = async () => {
    try {
      await dispatch(login({ email, password }));
    } catch (err: any) {
      console.error('Login error:', err);
    }
  };

  return (
    <View style={styles.container}>
      {message ? (
        <Text style={{ color: '#4CAF50', textAlign: 'center', marginBottom: 16 }}>{message}</Text>
      ) : null}
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/My-Five-Logo-green-black.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.formContainer}>
            <Text variant="headlineMedium" style={styles.title}>
              Connexion
            </Text>

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              activeOutlineColor="#4CAF50"
            />

          <TextInput
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            style={styles.input}
            activeOutlineColor="#4CAF50"
          />

          <Button
            mode="text"
            onPress={() => navigation.navigate('ForgotPassword')}
            style={{ marginBottom: 8 }}
            textColor="#4CAF50"
          >
            Mot de passe oublié ?
          </Button>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.button}
              buttonColor="#4CAF50"
            >
              Se connecter
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate('Register')}
              style={styles.linkButton}
              textColor="#4CAF50"
            >
              Pas encore de compte ? S'inscrire
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 150,
    height: 150,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#4CAF50',
    fontSize: 22, // titre bien visible
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
    fontSize: 16, // police minimum 16
    paddingHorizontal: 12, // padding horizontal pour éviter le texte collé aux bords
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
  },
  linkButton: {
    marginTop: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default LoginScreen; 