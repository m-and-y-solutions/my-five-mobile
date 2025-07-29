import React, { useState, useRef, RefObject } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, useTheme, HelperText } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { updateUser } from '../../store/slices/userSlice';
import ImagePickerComponent from '../../components/ImagePicker';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getMe, updateProfil } from 'store/slices/authSlice';

const EditProfileScreen = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { loading, error } = useSelector((state: RootState) => state.user);

  const [firstName, setFirstName] = useState(currentUser?.firstName || '');
  const [lastName, setLastName] = useState(currentUser?.lastName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [birthDate, setBirthDate] = useState(currentUser?.birthDate ? new Date(currentUser.birthDate) : new Date());
  const [address, setAddress] = useState(currentUser?.address || '');
  const [profileImage, setProfileImage] = useState<File | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRefs: Record<string, RefObject<any>> = {
    firstName: useRef<any>(null),
    lastName: useRef<any>(null),
    address: useRef<any>(null),
    birthDate: useRef<any>(null),
    newPassword: useRef<any>(null),
    confirmNewPassword: useRef<any>(null),
  };

  const handleImageSelected = (data: FormData) => {
    const image = data.getAll('image')[0] as unknown as File;
    setProfileImage(image);
  };

  const validateFields = () => {
    const errors: {[key: string]: string} = {};
    if (!firstName) errors.firstName = 'Le prénom est requis';
    if (!lastName) errors.lastName = 'Le nom est requis';
    if (!birthDate) errors.birthDate = 'La date de naissance est requise';
    // if (!address) errors.address = "L'adresse est requise";
    if ((newPassword || confirmNewPassword) && newPassword !== confirmNewPassword) errors.confirmNewPassword = 'Les nouveaux mots de passe ne correspondent pas';
    setFieldErrors(errors);
    return errors;
  };

  const scrollToFirstError = (errors: {[key: string]: string}) => {
    const fieldsOrder = [
      'firstName', 'lastName', 'birthDate', 'address', 'newPassword', 'confirmNewPassword'
    ];
    for (const field of fieldsOrder) {
      if (errors[field] && inputRefs[field]?.current) {
        inputRefs[field].current.focus && inputRefs[field].current.focus();
        inputRefs[field].current.measure && inputRefs[field].current.measure((fx: any, fy: any, width: any, height: any, px: any, py: any) => {
          scrollViewRef.current?.scrollTo({ y: py - 40, animated: true });
        });
        break;
      }
    }
  };

  const handleSave = async () => {
    const errors = validateFields();
    if (Object.keys(errors).length > 0) {
      scrollToFirstError(errors);
      return;
    }
    setSubmitting(true);
    const data: any = {
      firstName,
      lastName,
      email,
      birthDate: birthDate.toISOString().split('T')[0],
      address,
    };
    if (profileImage) data.profileImage = profileImage;
    if (newPassword) data.newPassword = newPassword;
    try {
      await dispatch(updateProfil({ id: currentUser.id, data })).unwrap();
      Alert.alert('Succès', 'Profil mis à jour !');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Erreur', e?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSubmitting(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} ref={scrollViewRef} keyboardShouldPersistTaps="handled">
      <View style={styles.contentContainer}>
        <Text variant="headlineMedium" style={styles.title}>Modifier le profil</Text>
        <ImagePickerComponent onImageSelected={handleImageSelected} initialImage={currentUser?.profileImage ? currentUser.profileImage : '../../assets/default-avatar.png'} />
        <TextInput
          label={<Text>Prénom <Text style={{color: 'red'}}>*</Text></Text>}
          value={firstName}
          onChangeText={setFirstName}
          mode="outlined"
          style={styles.input}
          activeOutlineColor="#4CAF50"
          ref={inputRefs.firstName}
          error={!!fieldErrors.firstName}
        />
        {fieldErrors.firstName && <HelperText type="error" visible={true}>{fieldErrors.firstName}</HelperText>}
        <TextInput
          label={<Text>Nom <Text style={{color: 'red'}}>*</Text></Text>}
          value={lastName}
          onChangeText={setLastName}
          mode="outlined"
          style={styles.input}
          activeOutlineColor="#4CAF50"
          ref={inputRefs.lastName}
          error={!!fieldErrors.lastName}
        />
        {fieldErrors.lastName && <HelperText type="error" visible={true}>{fieldErrors.lastName}</HelperText>}
        <TextInput
          label={<Text>Email</Text>}
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          style={[styles.input, styles.disabledInput]}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={false}
        />
        <TouchableOpacity
          style={[styles.datePickerButton, { borderColor: '#4CAF50' }]}
          onPress={() => setShowDatePicker(true)}
          ref={inputRefs.birthDate}
        >
          <Text style={styles.datePickerText}>
            Date de naissance <Text style={{color: 'red'}}>*</Text>: {birthDate.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
        {fieldErrors.birthDate && <HelperText type="error" visible={true}>{fieldErrors.birthDate}</HelperText>}
        {showDatePicker && (
          <DateTimePicker
            value={birthDate}
            mode="date"
            display="default"
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}
        <TextInput
          label={<Text>Adresse</Text>}
          value={address}
          onChangeText={setAddress}
          mode="outlined"
          style={styles.input}
          activeOutlineColor="#4CAF50"
          ref={inputRefs.address}
          error={!!fieldErrors.address}
        />
        {/* {fieldErrors.address && <HelperText type="error" visible={true}>{fieldErrors.address}</HelperText>} */}
        <TextInput
          label="Nouveau mot de passe (optionnel)"
          value={newPassword}
          onChangeText={setNewPassword}
          mode="outlined"
          style={styles.input}
          activeOutlineColor="#4CAF50"
          ref={inputRefs.newPassword}
          secureTextEntry
        />
        <TextInput
          label="Confirmer le nouveau mot de passe"
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
          mode="outlined"
          style={styles.input}
          activeOutlineColor="#4CAF50"
          ref={inputRefs.confirmNewPassword}
          secureTextEntry
          error={!!fieldErrors.confirmNewPassword}
        />
        {fieldErrors.confirmNewPassword && <HelperText type="error" visible={true}>{fieldErrors.confirmNewPassword}</HelperText>}
        {error && <Text style={styles.errorText}>{error}</Text>}
        <Button
          mode="contained"
          onPress={handleSave}
          loading={submitting || loading}
          disabled={submitting || loading}
          style={styles.saveButton}
          buttonColor="#4CAF50"
        >
          Enregistrer
        </Button>
      </View>
    </ScrollView>
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
  title: {
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  saveButton: {
    marginTop: 10,
    borderRadius: 8,
    paddingVertical: 8,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#888',
  },
  datePickerButton: {
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 16,
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  datePickerText: {
    fontSize: 16,
  },
});

export default EditProfileScreen; 