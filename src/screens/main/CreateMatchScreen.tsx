import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Text, TextInput, Button, IconButton, List, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation.types';
import { CITIES, COMMUNES_BY_COUNTRY, COUNTRIES } from 'constants/countries.constants';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchFields } from '../../store/slices/fieldSlice';
import { createMatch, fetchAllMatches } from '../../store/slices/matchSlice';
import { Field } from '../../store/slices/fieldSlice';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { fetchGroups } from '../../store/slices/groupsSlice';

interface FieldsByCity {
  [key: string]: Field[];
}

type CreateMatchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateMatch'>;

const CreateMatchScreen = () => {
  const navigation = useNavigation<CreateMatchScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { fields, loading: fieldsLoading, error: fieldsError } = useSelector((state: RootState) => state.field);
  const user = useSelector((state: RootState) => state.auth.user);
  const myGroups = useSelector((state: RootState) =>
    state.groups.groups.filter((g) => g.creatorId === user.id)
  );

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('10');
  const [team1Name, setTeam1Name] = useState('');
  const [team2Name, setTeam2Name] = useState('');
  const [matchVisibility, setMatchVisibility] = useState<'public' | 'private' | 'group'>('public');
  const [selectedCity, setSelectedCity] = useState<{ id: string, name: string } | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [fieldModalVisible, setFieldModalVisible] = useState(false);
  const [fieldsByCity, setFieldsByCity] = useState<FieldsByCity>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [duration, setDuration] = useState('60');
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [isFieldSelectionEnabled, setIsFieldSelectionEnabled] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const userCountry = useSelector((state: RootState) => state.auth.user?.country || 'Belgique');
  const communesOrCities = userCountry === 'Belgique' ? COMMUNES_BY_COUNTRY.Belgique : COMMUNES_BY_COUNTRY.Tunisie;
  const cityLabel = userCountry === 'Belgique' ? 'Commune' : 'Ville';
  const [showMaxPlayersModal, setShowMaxPlayersModal] = useState(false);

  const isFieldAvailable = (field: Field) => {
    if (!field.isAvailable) return false;
    if (!date || !time) return true;

    const [day, month, year] = date.split('/').map(Number);
    const [hours, minutes] = time.split(':').map(Number);

    const selectedDateTime = new Date(year, month - 1, day, hours, minutes);
    const endDateTime = new Date(selectedDateTime.getTime() + parseInt(duration) * 60000);

    const hasConflictingBooking = field.bookings?.some(booking => {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);

      const isSameDay =
        bookingStart.getFullYear() === selectedDateTime.getFullYear() &&
        bookingStart.getMonth() === selectedDateTime.getMonth() &&
        bookingStart.getDate() === selectedDateTime.getDate();

      if (!isSameDay) return false;

      const bookingStartTime = bookingStart.getHours() * 60 + bookingStart.getMinutes();
      const bookingEndTime = bookingEnd.getHours() * 60 + bookingEnd.getMinutes();
      const selectedStartTime = selectedDateTime.getHours() * 60 + selectedDateTime.getMinutes();
      const selectedEndTime = endDateTime.getHours() * 60 + endDateTime.getMinutes();

      return (
        (selectedStartTime >= bookingStartTime && selectedStartTime < bookingEndTime) ||
        (selectedEndTime > bookingStartTime && selectedEndTime <= bookingEndTime) ||
        (selectedStartTime <= bookingStartTime && selectedEndTime >= bookingEndTime)
      );
    });

    return !hasConflictingBooking;
  };


  useEffect(() => {
    const organizedFields: FieldsByCity = {};
    fields.forEach((field: Field) => {
      const cityId = CITIES.find(city => city.name === field.city)?.id;
      if (cityId) {
        if (!organizedFields[cityId]) {
          organizedFields[cityId] = [];
        }
        organizedFields[cityId].push(field);
      }
    });
    setFieldsByCity(organizedFields);
  }, [fields]);

  useEffect(() => {
    if (selectedField && !isFieldAvailable(fields.find(f => f.id === selectedField)!)) {
      setSelectedField(null);
    }
  }, [date, time, duration]);

  const validateTime = (selectedDate: Date) => {
    const newErrors: { [key: string]: string } = {};
    const dayOfWeek = selectedDate.getDay();
    const hours = selectedDate.getHours();

    console.log('=== Validation Time ===');
    console.log('Original Date:', selectedDate.toString());
    console.log('hours', hours);
    console.log('dayOfWeek', dayOfWeek);

    let isValidTime = false;
    if (dayOfWeek === 0) { // Dimanche
      isValidTime = (hours >= 10 && hours < 24) || (hours >= 0 && hours < 2);
    } else if (dayOfWeek === 3 || dayOfWeek === 6) { // Mercredi et Samedi
      isValidTime = (hours >= 13 && hours < 24) || (hours >= 0 && hours < 2);
    } else { // Lundi, Mardi, Jeudi, Vendredi
      isValidTime = (hours >= 16 && hours < 24) || (hours >= 0 && hours < 2);
    }

    if (!isValidTime) {
      newErrors.time = `L'heure n'est pas dans les horaires d'ouverture : 
      Lundi – Mardi – Jeudi – Vendredi : De 16H à 02H
      Mercredi – Samedi : De 13H à 02H
      Dimanche : de 10H à 02H`;
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleDateChange = (selectedDate: Date) => {
    const timeZone = 'Europe/Brussels';
    const zonedDate = toZonedTime(selectedDate, timeZone);

    if (!validateTime(zonedDate)) {
      // Si la validation échoue, on ne change pas la date
      setShowDatePicker(false);
      return;
    }

    setShowDatePicker(false);
    setSelectedDate(zonedDate);
    setDate(format(zonedDate, 'yyyy-MM-dd'));
    setTime(format(zonedDate, 'HH:mm'));
    setErrors(prev => ({ ...prev, date: '', time: '' }));
  };


  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateObj = new Date(selectedDate);
    selectedDateObj.setHours(0, 0, 0, 0);

    if (!date) {
      newErrors.date = 'La date est requise';
    } else if (selectedDateObj < today) {
      newErrors.date = 'La date ne peut pas être dans le passé';
    }

    if (!time) {
      newErrors.time = "L'heure est requise";
    } else {
      validateTime(selectedDate);
    }

    if (!selectedCity) {
      newErrors.city = 'La commune est requise';
    }

    if (!selectedField) {
      newErrors.field = 'Le terrain est requis';
    }

    if (matchVisibility === 'group' && (!selectedGroupIds || selectedGroupIds.length === 0)) {
      newErrors.group = 'Veuillez sélectionner au moins un groupe';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (validateForm()) {
      try {
        const selectedFieldData = fields.find(f => f.id === selectedField);
        const timeZone = 'Europe/Brussels';
        const zonedDate = toZonedTime(selectedDate, timeZone);

        await dispatch(createMatch({
          title: title || `${selectedFieldData?.name} - ${format(zonedDate, 'dd/MM/yyyy')}`,
          date: zonedDate,
          time,
          maxPlayers: parseInt(maxPlayers),
          type: 'friendly',
          visibility: matchVisibility,
          price: selectedFieldData?.price,
          currency: selectedFieldData?.currency,
          fieldId: selectedField!,
          location: selectedFieldData?.address || '',
          team1Name: team1Name || undefined,
          team2Name: team2Name || undefined,
          duration: parseInt(duration),
          groupIds: matchVisibility === 'group' ? selectedGroupIds : undefined,
          country: userCountry,
          city: selectedCity?.name,
        }));
        if (matchVisibility === 'group') {
          dispatch(fetchGroups());
        }
        await dispatch(fetchAllMatches({}));
        navigation.goBack();
      } catch (error: any) {
        console.error('Error creating match:', error);
      }
    }
  };

  const selectedFieldData = selectedCity ? fieldsByCity[selectedCity.id]?.find(field => field.id === selectedField) : null;

  const checkRequiredFields = () => {
    const hasRequiredFields = Boolean(date && time && duration && selectedCity);
    setIsFieldSelectionEnabled(hasRequiredFields);
    return hasRequiredFields;
  };

  useEffect(() => {
    checkRequiredFields();
  }, [date, time, duration, selectedCity]);

  const handleFieldSelection = async () => {
    if (!isFieldSelectionEnabled) return;

    try {
      const [day, month, year] = date.split('/');
      const formattedDate = `${year}-${month}-${day}`;

      await dispatch(fetchFields({
        cityId: selectedCity?.name || undefined,
        date: selectedDate,
        duration: parseInt(duration),
        maxPlayers: parseInt(maxPlayers)
      }));
      setFieldModalVisible(true);
    } catch (error) {
      console.error('Error fetching available fields:', error);
    }
  };

  useEffect(() => {
    if (matchVisibility === 'group' && (!myGroups || myGroups.length === 0)) {
      dispatch(fetchGroups());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchVisibility]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.form}>


              <View style={styles.toggleContainer}>
                <Text style={styles.toggleLabel}>Visibilité du match</Text>
                <View style={styles.toggleButtons}>
                  <TouchableOpacity
                    style={[styles.toggleButton, matchVisibility === 'public' && styles.toggleButtonActive]}
                    onPress={() => setMatchVisibility('public')}
                  >
                    <Text style={[styles.toggleButtonText, matchVisibility === 'public' && styles.toggleButtonTextActive]}>
                      Public
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleButton, matchVisibility === 'private' && styles.toggleButtonActive]}
                    onPress={() => setMatchVisibility('private')}
                  >
                    <Text style={[styles.toggleButtonText, matchVisibility === 'private' && styles.toggleButtonTextActive]}>
                      Privé
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleButton, matchVisibility === 'group' && styles.toggleButtonActive]}
                    onPress={() => setMatchVisibility('group')}
                  >
                    <Text style={[styles.toggleButtonText, matchVisibility === 'group' && styles.toggleButtonTextActive]}>
                      Groupes
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {matchVisibility === 'group' && (
                myGroups.length > 0 ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
                    {myGroups.map(group => (
                      <Chip
                        key={group.id}
                        selected={selectedGroupIds.includes(group.id)}
                        onPress={() => {
                          setSelectedGroupIds(prev =>
                            prev.includes(group.id)
                              ? prev.filter(id => id !== group.id)
                              : [...prev, group.id]
                          );
                        }}
                        style={{ margin: 4 }}
                      >
                        {group.name}
                      </Chip>
                    ))}
                    {errors.group && (
                      <Text style={styles.errorText}>{errors.group}</Text>
                    )}
                  </View>
                ) : (
                  <Text style={{ color: '#888', marginBottom: 16 }}>Aucun groupe créé.</Text>
                )
              )}

              <View style={styles.inputContainer}>
                <TextInput
                  label="Titre du match"
                  value={title}
                  onChangeText={setTitle}
                  style={styles.input}
                  mode="outlined"
                  left={<TextInput.Icon icon="format-title" />}
                  outlineColor='#4CAF50'
                  activeOutlineColor='#4CAF50'
                />
              </View>

              <View style={styles.inputContainer}>
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                  <TextInput
                    label="Date"
                    value={date}
                    placeholder="JJ/MM/AAAA"
                    style={styles.input}
                    mode="outlined"
                    left={<TextInput.Icon icon="calendar" />}
                    outlineColor={errors.date ? '#FF5252' : '#4CAF50'}
                    activeOutlineColor={errors.date ? '#FF5252' : '#4CAF50'}
                    error={!!errors.date}
                    editable={false}
                  />
                </TouchableOpacity>
                {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
                {showDatePicker && (
                  <DateTimePickerModal
                    mode="datetime"
                    onConfirm={handleDateChange}
                    onCancel={() => setShowDatePicker(false)}
                    locale="fr-FR"
                    is24Hour={true}
                    isVisible={showDatePicker}
                    timeZoneName="Europe/Brussels"
                  />
                )}
                {errors.time && (
                  <Text style={styles.errorText}>{errors.time}</Text>
                )}
                {selectedDate && (
                  <Text>
                    Match prévu le {selectedDate.toLocaleString('fr-FR', { timeZone: 'Europe/Brussels' })}
                  </Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <TouchableOpacity
                  onPress={() => setShowDurationModal(true)}
                  style={styles.touchableInput}
                >
                  <TextInput
                    label="Durée du match"
                    value={`${duration} minutes`}
                    style={styles.input}
                    mode="outlined"
                    left={<TextInput.Icon icon="clock" />}
                    right={<TextInput.Icon icon="chevron-down" />}
                    outlineColor='#4CAF50'
                    activeOutlineColor='#4CAF50'
                    editable={false}
                  />
                </TouchableOpacity>
                <Modal
                  visible={showDurationModal}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setShowDurationModal(false)}
                >
                  <TouchableOpacity
                    style={styles.modalContainer}
                    activeOpacity={1}
                    onPress={() => setShowDurationModal(false)}
                  >
                    <View style={styles.modalContent}>
                      <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Sélectionner la durée</Text>
                        <IconButton
                          icon="close"
                          size={24}
                          onPress={() => setShowDurationModal(false)}
                        />
                      </View>
                      <ScrollView style={styles.modalScrollView}>
                        <List.Item
                          title="60 minutes"
                          onPress={() => {
                            setDuration('60');
                            setShowDurationModal(false);
                          }}
                          style={styles.listItem}
                          left={props => (
                            <List.Icon
                              {...props}
                              icon={duration === '60' ? "check-circle" : "circle-outline"}
                              color="#4CAF50"
                            />
                          )}
                        />
                        <List.Item
                          title="90 minutes"
                          onPress={() => {
                            setDuration('90');
                            setShowDurationModal(false);
                          }}
                          style={styles.listItem}
                          left={props => (
                            <List.Icon
                              {...props}
                              icon={duration === '90' ? "check-circle" : "circle-outline"}
                              color="#4CAF50"
                            />
                          )}
                        />
                      </ScrollView>
                    </View>
                  </TouchableOpacity>
                </Modal>
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  label="Nom de l'équipe 1 (optionnel)"
                  value={team1Name}
                  onChangeText={setTeam1Name}
                  style={styles.input}
                  mode="outlined"
                  left={<TextInput.Icon icon="account-group" />}
                  outlineColor='#4CAF50'
                  activeOutlineColor='#4CAF50'
                />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  label="Nom de l'équipe 2 (optionnel)"
                  value={team2Name}
                  onChangeText={setTeam2Name}
                  style={styles.input}
                  mode="outlined"
                  left={<TextInput.Icon icon="account-group" />}
                  outlineColor='#4CAF50'
                  activeOutlineColor='#4CAF50'
                />
              </View>

              <View style={styles.inputContainer}>
                {user?.country === 'Tunisie' ? (
                  <TouchableOpacity onPress={() => setShowMaxPlayersModal(true)}>
                    <TextInput
                      label="Nombre de joueurs"
                      value={maxPlayers}
                      style={styles.input}
                      mode="outlined"
                      left={<TextInput.Icon icon="account-group" />}
                      outlineColor="#4CAF50"
                      activeOutlineColor="#4CAF50"
                      editable={false}
                      right={<TextInput.Icon icon="chevron-down" />}
                    />
                  </TouchableOpacity>
                ) : (
                  <TextInput
                    label="Nombre de joueurs"
                    value="10"
                    style={styles.input}
                    mode="outlined"
                    left={<TextInput.Icon icon="account-group" />}
                    outlineColor="#BDBDBD"
                    activeOutlineColor="#BDBDBD"
                    disabled
                  />
                )}
                {/* Modal pour Tunisie */}
                <Modal
                  visible={showMaxPlayersModal}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setShowMaxPlayersModal(false)}
                >
                  <TouchableOpacity
                    style={styles.modalContainer}
                    activeOpacity={1}
                    onPress={() => setShowMaxPlayersModal(false)}
                  >
                    <View style={styles.modalContent}>
                      <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Sélectionner le nombre de joueurs</Text>
                        <IconButton
                          icon="close"
                          size={24}
                          onPress={() => setShowMaxPlayersModal(false)}
                        />
                      </View>
                      <ScrollView style={styles.modalScrollView}>
                        {["10", "12", "14"].map(option => (
                          <List.Item
                            key={option}
                            title={`${option} joueurs`}
                            onPress={() => {
                              setMaxPlayers(option);
                              setShowMaxPlayersModal(false);
                            }}
                            style={styles.listItem}
                            left={props => (
                              <List.Icon
                                {...props}
                                icon={maxPlayers === option ? "check-circle" : "circle-outline"}
                                color="#4CAF50"
                              />
                            )}
                          />
                        ))}
                      </ScrollView>
                    </View>
                  </TouchableOpacity>
                </Modal>
              </View>

              <View style={styles.inputContainer}>
                <TouchableOpacity
                  onPress={() => setCityModalVisible(true)}
                  style={styles.touchableInput}
                >
                  <TextInput
                    label={cityLabel}
                    value={selectedCity?.name || ''}
                    placeholder={`Sélectionner une ${cityLabel}`}
                    style={styles.input}
                    mode="outlined"
                    left={<TextInput.Icon icon="city" />}
                    right={<TextInput.Icon icon="chevron-down" />}
                    outlineColor={errors.city ? '#FF5252' : '#4CAF50'}
                    activeOutlineColor={errors.city ? '#FF5252' : '#4CAF50'}
                    error={!!errors.city}
                    editable={false}
                  />
                </TouchableOpacity>
                {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
                <Modal visible={cityModalVisible} animationType="slide" transparent>
                  <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center' }}>
                    <View style={{ backgroundColor: '#fff', margin: 32, borderRadius: 12, padding: 16, maxHeight: '70%' }}>
                      <ScrollView>
                        {communesOrCities.map((city, idx) => (
                          <TouchableOpacity key={city} onPress={() => { setSelectedCity({ id: String(idx), name: city }); setCityModalVisible(false); }} style={{ padding: 12 }}>
                            <Text>{city}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                      <Button onPress={() => setCityModalVisible(false)} style={{ marginTop: 8 }}>Fermer</Button>
                    </View>
                  </View>
                </Modal>
              </View>

              <View style={styles.inputContainer}>
                <TouchableOpacity
                  onPress={handleFieldSelection}
                  disabled={!isFieldSelectionEnabled}
                >
                  <TextInput
                    label="Terrain"
                    value={selectedFieldData ? `${selectedFieldData.name}` : ''}
                    placeholder={!isFieldSelectionEnabled ? "Veuillez remplir les champs précédents" : (fieldsLoading ? "Chargement des terrains..." : "Sélectionner un terrain")}
                    style={styles.input}
                    mode="outlined"
                    left={<TextInput.Icon icon="map-marker" />}
                    right={<TextInput.Icon icon="chevron-down" />}
                    outlineColor={errors.field ? '#FF5252' : '#4CAF50'}
                    activeOutlineColor={errors.field ? '#FF5252' : '#4CAF50'}
                    error={!!errors.field}
                    editable={false}
                    disabled={!isFieldSelectionEnabled || fieldsLoading}
                  />
                </TouchableOpacity>
                {errors.field && <Text style={styles.errorText}>{errors.field}</Text>}
                <Modal
                  visible={fieldModalVisible}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setFieldModalVisible(false)}
                >
                  <TouchableOpacity
                    style={styles.modalContainer}
                    activeOpacity={1}
                    onPress={() => setFieldModalVisible(false)}
                  >
                    <View style={styles.modalContent}>
                      <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Sélectionner un terrain</Text>
                        <IconButton
                          icon="close"
                          size={24}
                          onPress={() => setFieldModalVisible(false)}
                        />
                      </View>
                      <ScrollView style={styles.modalScrollView}>
                        {fieldsLoading ? (
                          <View style={styles.noFieldsContainer}>
                            <Text style={styles.noFieldsText}>Chargement des terrains...</Text>
                          </View>
                        ) : fieldsError ? (
                          <View style={styles.noFieldsContainer}>
                            <Text style={styles.noFieldsText}>{fieldsError}</Text>
                          </View>
                        ) : fields.length > 0 ? (
                          fields.map(field => (
                            <List.Item
                              key={field.id}
                              title={`${field.name} - ${field.address}`}
                              onPress={() => {
                                setSelectedField(field.id);
                                setFieldModalVisible(false);
                              }}
                              style={styles.listItem}
                              left={props => (
                                <List.Icon
                                  {...props}
                                  icon="check-circle"
                                  color="#4CAF50"
                                />
                              )}
                            />
                          ))
                        ) : (
                          <View style={styles.noFieldsContainer}>
                            <Text style={styles.noFieldsText}>Aucun terrain disponible pour ces critères</Text>
                          </View>
                        )}
                      </ScrollView>
                    </View>
                  </TouchableOpacity>
                </Modal>
              </View>

              <Button
                mode="contained"
                onPress={handleCreate}
                style={styles.button}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
              >
                Créer le match
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  content: {
    padding: 16,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    fontSize: 16, // police minimum 16
    paddingHorizontal: 12, // padding horizontal pour éviter le texte collé aux bords
    marginBottom: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '80%',
  },
  modalScrollView: {
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  listItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  toggleContainer: {
    marginVertical: 8,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  toggleButtons: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#4CAF50',
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  toggleButtonTextActive: {
    color: '#FFF',
  },
  button: {
    marginTop: 24,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  buttonContent: {
    height: 40,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  touchableInput: {
    width: '100%',
  },
  noFieldsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noFieldsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  disabledItem: {
    opacity: 0.6,
  },
  errorText: {
    color: '#FF5252',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default CreateMatchScreen;