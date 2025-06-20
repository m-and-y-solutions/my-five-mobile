import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme, ActivityIndicator } from 'react-native-paper';
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
  const [birthDate, setBirthDate] = useState(currentUser?.birthDate || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [profileImage, setProfileImage] = useState<File | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleImageSelected = (data: FormData) => {
    const image = data.getAll('image')[0] as unknown as File;
    setProfileImage(image);
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !birthDate.trim() || !address.trim()) {
      Alert.alert('Champs requis', 'Tous les champs sont obligatoires.');
      return;
    }
    setSubmitting(true);
    const data: any = {
      firstName,
      lastName,
      email,
      birthDate,
      address,
    };
    if (profileImage) data.profileImage = profileImage;
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

  return (
    <ScrollView style={styles(theme).container} contentContainerStyle={{ padding: 16 }}>
      <Text variant="titleLarge" style={styles(theme).title}>Modifier le profil</Text>
      <ImagePickerComponent onImageSelected={handleImageSelected} initialImage={currentUser?.profileImage ? currentUser.profileImage : '../../assets/default-avatar.png'} />
      <TextInput
        label="Prénom"
        value={firstName}
        onChangeText={setFirstName}
        style={styles(theme).input}
      />
      <TextInput
        label="Nom"
        value={lastName}
        onChangeText={setLastName}
        style={styles(theme).input}
      />
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={[styles(theme).input, styles(theme).disabledInput]}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={false}
      />
      <TextInput
        label="Date de naissance"
        value={birthDate ? birthDate.split('T')[0] : ''}
        onFocus={() => setShowDatePicker(true)}
        style={styles(theme).input}
        placeholder="YYYY-MM-DD"
        editable={false}
      />
      {showDatePicker && (
        <DateTimePicker
          value={birthDate ? new Date(birthDate) : new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setBirthDate(selectedDate.toISOString().split('T')[0]);
            }
          }}
          maximumDate={new Date()}
        />
      )}
      <TextInput
        label="Adresse"
        value={address}
        onChangeText={setAddress}
        style={styles(theme).input}
      />
      {error && <Text style={styles(theme).errorText}>{error}</Text>}
      <Button
        mode="contained"
        onPress={handleSave}
        loading={submitting || loading}
        disabled={submitting || loading}
        style={styles(theme).saveButton}
      >
        Enregistrer
      </Button>
    </ScrollView>
  );
};

const styles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
    backgroundColor: theme.colors.surface,
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: 8,
    textAlign: 'center',
  },
  saveButton: {
    marginTop: 16,
    borderRadius: 8,
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#888',
  },
});

export default EditProfileScreen; 