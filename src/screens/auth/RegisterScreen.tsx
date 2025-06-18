import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Text, useTheme, HelperText, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { RootStackParamList } from '../../types/navigation.types';
import ImagePicker from '../../components/ImagePicker';
import { register } from '../../store/slices/authSlice';
import { AppDispatch, RootState } from '../../store';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { validatePassword } from '../../utils/auth';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

const COMMUNES = [
  'Anderlecht', 'Auderghem', 'Berchem-Sainte-Agathe', 'Bruxelles', 'Etterbeek',
  'Evere', 'Forest', 'Ganshoren', 'Ixelles', 'Jette', 'Koekelberg', 'Molenbeek-Saint-Jean',
  'Saint-Gilles', 'Saint-Josse-ten-Noode', 'Schaerbeek', 'Uccle', 'Watermael-Boitsfort',
  'Woluwe-Saint-Lambert', 'Woluwe-Saint-Pierre'
];

const RegisterScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [address, setAddress] = useState('');
  const [commune, setCommune] = useState('');
  const [telephone, setTelephone] = useState('');
  const [profileImage, setprofileImage] = useState<File | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { loading: authLoading, error: authError } = useSelector((state: RootState) => state.auth);
  const theme = useTheme();

  const handleImageSelected = (data: FormData) => {
    //to do test register xith image
    const image = data.getAll('image')[0] as unknown as File;
    setprofileImage(image);
  };

  const handleRegister = async () => {
    const passwordValidation = validatePassword(password);

    if (!passwordValidation.isValid) {
      setError('Le mot de passe ne respecte pas les critères de sécurité');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (!firstName || !lastName || !email || !password || !confirmPassword ) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const result = await dispatch(register({
        firstName,
        lastName,
        email,
        password,
        birthDate: birthDate.toISOString(),
        country: 'Belgique',
        state: 'Bruxelles',
        city: commune,
        address,
        telephone,
        profileImage,
      })).unwrap();

      if (result.success) {
        navigation.navigate('Login');
      } else {
        setError(result.message || 'Une erreur est survenue');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/My-Five-Logo-green-black.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.formContainer}>
            <Text variant="headlineMedium" style={styles.title}>
              Inscription
            </Text>

            <ImagePicker onImageSelected={handleImageSelected} />
         {/* Inputs avec nouveau style */}
            <TextInput
              label="Prénom"
              value={firstName}
              onChangeText={setFirstName}
              mode="outlined"
              autoCapitalize="words"
              style={styles.input}
              activeOutlineColor="#4CAF50"
              left={<TextInput.Icon icon="account" color="#4CAF50" />}
            />

            <TextInput
              label="Nom"
              value={lastName}
              onChangeText={setLastName}
              mode="outlined"
              autoCapitalize="words"
              style={styles.input}
              activeOutlineColor="#4CAF50"
              left={<TextInput.Icon icon="account" color="#4CAF50" />}
            />

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              activeOutlineColor="#4CAF50"
              left={<TextInput.Icon icon="email" color="#4CAF50" />}
            />

            {/* DatePicker avec nouveau style */}
            <TouchableOpacity
              style={[styles.datePickerButton, { borderColor: '#4CAF50' }]}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.datePickerContent}>
                <MaterialCommunityIcons name="calendar" size={20} color="#4CAF50" />
                <Text style={styles.datePickerText}>
                  Date de naissance: {birthDate.toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={birthDate}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}

            {/* Picker avec nouveau style */}
            <View style={[styles.pickerContainer, { borderColor: '#4CAF50' }]}>
              <View style={styles.pickerIcon}>
                <MaterialCommunityIcons name="map-marker" size={20} color="#4CAF50" />
              </View>
              <Picker
                selectedValue={commune}
                onValueChange={(itemValue) => setCommune(itemValue)}
                style={styles.picker}
                dropdownIconColor="#4CAF50"
              >
                <Picker.Item label="Sélectionnez votre commune" value="" />
                {COMMUNES.map((commune) => (
                  <Picker.Item key={commune} label={commune} value={commune} />
                ))}
              </Picker>
            </View>

            <TextInput
              label="Adresse"
              value={address}
              onChangeText={setAddress}
              mode="outlined"
              style={styles.input}
              activeOutlineColor="#4CAF50"
              left={<TextInput.Icon icon="home" color="#4CAF50" />}
            />

            <TextInput
              label="Téléphone"
              value={telephone}
              onChangeText={setTelephone}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              activeOutlineColor="#4CAF50"
              left={<TextInput.Icon icon="phone" color="#4CAF50" />}
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
                  color="#4CAF50"
                />
              }
              style={styles.input}
              activeOutlineColor="#4CAF50"
              left={<TextInput.Icon icon="lock" color="#4CAF50" />}
            />

            <HelperText type="info" visible={true} style={styles.helperText}>
              Le mot de passe doit contenir au moins 6 caractères et un symbole (!@#$%^&(),.?":{'{}'}|&lt;&gt;)
            </HelperText>

            <TextInput
              label="Confirmer le mot de passe"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              secureTextEntry={!showConfirmPassword}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  color="#4CAF50"
                />
              }
              style={styles.input}
              activeOutlineColor="#4CAF50"
              left={<TextInput.Icon icon="lock-check" color="#4CAF50" />}
            />

            {error ? (
              <View style={styles.errorContainer}>
                <MaterialCommunityIcons name="alert-circle" size={20} color="#FF0000" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Button
              mode="contained"
              onPress={handleRegister}
              style={styles.button}
              loading={loading}
              disabled={loading}
              buttonColor="#4CAF50"
            >
              S'inscrire
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate('Login')}
              style={styles.linkButton}
              textColor="#4CAF50"
            >
              Déjà un compte ? Se connecter
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 150,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 10,
    borderRadius: 8,
    paddingVertical: 8,
  },
  linkButton: {
    marginTop: 20,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },

  linkButtonLabel: {
    fontSize: 14,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#FF0000',
    textAlign: 'center',
  },
  helperText: {
    fontSize: 12,
    marginTop: -8,
    marginBottom: 16,
  },
  datePickerButton: {
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 16,
    height: 56,
    justifyContent: 'center',
  },
  datePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  datePickerText: {
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
  },
  pickerIcon: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  picker: {
    flex: 1,
    height: '100%',
  },
   buttonLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});


export default RegisterScreen; 