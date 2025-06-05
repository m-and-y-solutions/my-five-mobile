import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Text, TextInput, Button, IconButton, List, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation.types';
import { CITIES } from 'constants/countries.constants';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchFields } from '../../store/slices/fieldSlice';
import { Field } from '../../store/slices/fieldSlice';
import matchService, { CreateMatchData } from '../../services/matchService';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FieldsByCity {
  [key: string]: Field[];
}

type CreateMatchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateMatch'>;

const CreateMatchScreen = () => {
  const navigation = useNavigation<CreateMatchScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { fields, loading: fieldsLoading, error: fieldsError } = useSelector((state: RootState) => state.field);
  const theme = useTheme();
  
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState('10');
  const [level, setLevel] = useState('intermediate');
  const [isPublic, setIsPublic] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [fieldModalVisible, setFieldModalVisible] = useState(false);
  const [fieldsByCity, setFieldsByCity] = useState<FieldsByCity>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    dispatch(fetchFields());
  }, [dispatch]);

  useEffect(() => {
    // Organize fields by city when fields are loaded
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

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleCreateMatch = async () => {
    if (!selectedField) {
      setError('Veuillez sélectionner un terrain');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const matchData: CreateMatchData = {
        title: `${selectedFieldData?.name} - ${date.toLocaleDateString()}`,
        date: date.toISOString().split('T')[0],
        time: date.toLocaleTimeString(),
        fieldId: selectedField,
        maxPlayers: parseInt(maxPlayers),
        type: 'friendly',
        visibility: isPublic ? 'public' : 'private'
      };

      const result = await matchService.createMatch(matchData, token);
      navigation.goBack();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const selectedCityData = CITIES.find(city => city.id === selectedCity);
  const selectedFieldData = selectedCity ? fieldsByCity[selectedCity]?.find(field => field.id === selectedField) : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <View style={styles.content}>
            <View style={styles.form}>
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleLabel}>Visibilité du match</Text>
                <View style={styles.toggleButtons}>
                  <TouchableOpacity
                    style={[styles.toggleButton, isPublic && styles.toggleButtonActive]}
                    onPress={() => setIsPublic(true)}
                  >
                    <Text style={[styles.toggleButtonText, isPublic && styles.toggleButtonTextActive]}>
                      Public
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleButton, !isPublic && styles.toggleButtonActive]}
                    onPress={() => setIsPublic(false)}
                  >
                    <Text style={[styles.toggleButtonText, !isPublic && styles.toggleButtonTextActive]}>
                      Privé
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.inputContainer}>
                <Button
                  mode="outlined"
                  onPress={() => setShowDatePicker(true)}
                  style={styles.dateButton}
                  textColor="#4CAF50"
                >
                  {date.toLocaleDateString()} à {date.toLocaleTimeString()}
                </Button>

                {showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="datetime"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                  />
                )}
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  label="Terrain"
                  value={selectedFieldData ? `${selectedFieldData.name} - ${selectedFieldData.address}` : ''}
                  placeholder={fieldsLoading ? "Chargement des terrains..." : "Sélectionner un terrain"}
                  style={styles.input}
                  mode="outlined"
                  left={<TextInput.Icon icon="map-marker" />}
                  right={<TextInput.Icon icon="chevron-down" />}
                  outlineColor="#6B4EFF"
                  activeOutlineColor="#6B4EFF"
                  editable={false}
                  disabled={!selectedCity || fieldsLoading}
                />
              </View>

              <View style={styles.inputContainer}>
                <TouchableOpacity 
                  onPress={() => selectedCity && setFieldModalVisible(true)}
                  disabled={!selectedCity || fieldsLoading}
                >
                  <TextInput
                    label="Terrain"
                    value={selectedFieldData ? `${selectedFieldData.name} - ${selectedFieldData.address}` : ''}
                    placeholder={fieldsLoading ? "Chargement des terrains..." : "Sélectionner un terrain"}
                    style={styles.input}
                    mode="outlined"
                    left={<TextInput.Icon icon="map-marker" />}
                    right={<TextInput.Icon icon="chevron-down" />}
                    outlineColor="#6B4EFF"
                    activeOutlineColor="#6B4EFF"
                    editable={false}
                    disabled={!selectedCity || fieldsLoading}
                  />
                </TouchableOpacity>
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
                      {fieldsLoading ? (
                        <View style={styles.noFieldsContainer}>
                          <Text style={styles.noFieldsText}>Chargement des terrains...</Text>
                        </View>
                      ) : fieldsError ? (
                        <View style={styles.noFieldsContainer}>
                          <Text style={styles.noFieldsText}>{fieldsError}</Text>
                        </View>
                      ) : selectedCity && fieldsByCity[selectedCity] ? (
                        fieldsByCity[selectedCity].map(field => (
                          <List.Item
                            key={field.id}
                            title={`${field.name} - ${field.address}`}
                            onPress={() => {
                              if (field.isAvailable) {
                                setSelectedField(field.id);
                                setFieldModalVisible(false);
                              }
                            }}
                            style={[
                              styles.listItem,
                              !field.isAvailable && styles.disabledItem
                            ]}
                            left={props => (
                              <List.Icon 
                                {...props} 
                                icon={field.isAvailable ? "check-circle" : "close-circle"}
                                color={field.isAvailable ? "#4CAF50" : "#FF5252"}
                              />
                            )}
                            description={!field.isAvailable ? "Terrain non disponible" : undefined}
                          />
                        ))
                      ) : (
                        <View style={styles.noFieldsContainer}>
                          <Text style={styles.noFieldsText}>Aucun terrain trouvé pour cette commune</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </Modal>
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  label="Nombre de joueurs"
                  value={maxPlayers}
                  onChangeText={setMaxPlayers}
                  keyboardType="numeric"
                  style={styles.input}
                  mode="outlined"
                  left={<TextInput.Icon icon="account-group" />}
                  outlineColor="#6B4EFF"
                  activeOutlineColor="#6B4EFF"
                />
              </View>

              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Niveau requis</Text>
                <Picker
                  selectedValue={level}
                  onValueChange={(value) => setLevel(value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Débutant" value="beginner" />
                  <Picker.Item label="Intermédiaire" value="intermediate" />
                  <Picker.Item label="Avancé" value="advanced" />
                </Picker>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Button
                mode="contained"
                onPress={handleCreateMatch}
                loading={loading}
                disabled={loading}
                style={styles.button}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
              >
                Créer le match
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
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
  keyboardAvoid: {
    flex: 1,
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
    fontSize: 16,
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
    backgroundColor: '#6B4EFF',
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
    backgroundColor: '#6B4EFF',
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
  dateButton: {
    marginBottom: 16,
    borderColor: '#4CAF50',
  },
  pickerContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 4,
    overflow: 'hidden',
  },
  pickerLabel: {
    padding: 8,
    color: '#4CAF50',
  },
  picker: {
    height: 50,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default CreateMatchScreen; 