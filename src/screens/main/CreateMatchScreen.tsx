import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Modal } from 'react-native';
import { Text, TextInput, Button, IconButton, List } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation.types';
import { CITIES } from 'constants/countries.constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../../config/config';

interface Field {
  id: string;
  name: string;
  address: string;
  city: string;
  isAvailable: boolean;
}

interface FieldsByCity {
  [key: string]: Field[];
}

type CreateMatchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateMatch'>;

const CreateMatchScreen = () => {
  const navigation = useNavigation<CreateMatchScreenNavigationProp>();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('10');
  const [isPublic, setIsPublic] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [fieldModalVisible, setFieldModalVisible] = useState(false);
  const [fields, setFields] = useState<FieldsByCity>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      setLoading(true);
      setError('');

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${API_URL}/fields`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Organize fields by city
      const fieldsByCity: FieldsByCity = {};
      response.data.forEach((field: Field) => {
        const cityId = CITIES.find(city => city.name === field.city)?.id;
        if (cityId) {
          if (!fieldsByCity[cityId]) {
            fieldsByCity[cityId] = [];
          }
          fieldsByCity[cityId].push(field);
        }
      });

      setFields(fieldsByCity);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    console.log('Creating match:', { date, time, maxPlayers, isPublic, selectedCity, selectedField });
    navigation.goBack();
  };

  const selectedCityData = CITIES.find(city => city.id === selectedCity);
  const selectedFieldData = selectedCity ? fields[selectedCity]?.find(field => field.id === selectedField) : null;

  return (
    <SafeAreaView style={styles.container}>
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
              <TextInput
                label="Date"
                value={date}
                onChangeText={setDate}
                placeholder="JJ/MM/AAAA"
                style={styles.input}
                mode="outlined"
                left={<TextInput.Icon icon="calendar" />}
                outlineColor="#6B4EFF"
                activeOutlineColor="#6B4EFF"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                label="Heure"
                value={time}
                onChangeText={setTime}
                placeholder="HH:MM"
                style={styles.input}
                mode="outlined"
                left={<TextInput.Icon icon="clock-outline" />}
                outlineColor="#6B4EFF"
                activeOutlineColor="#6B4EFF"
              />
            </View>

            <View style={styles.inputContainer}>
              <TouchableOpacity 
                onPress={() => setCityModalVisible(true)}
                style={styles.touchableInput}
              >
                <TextInput
                  label="Commune"
                  value={selectedCityData?.name || ''}
                  placeholder="Sélectionner une commune"
                  style={styles.input}
                  mode="outlined"
                  left={<TextInput.Icon icon="city" />}
                  right={<TextInput.Icon icon="chevron-down" />}
                  outlineColor="#6B4EFF"
                  activeOutlineColor="#6B4EFF"
                  editable={false}
                />
              </TouchableOpacity>
              <Modal
                visible={cityModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setCityModalVisible(false)}
              >
                <TouchableOpacity 
                  style={styles.modalContainer}
                  activeOpacity={1}
                  onPress={() => setCityModalVisible(false)}
                >
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Sélectionner une commune</Text>
                      <IconButton
                        icon="close"
                        size={24}
                        onPress={() => setCityModalVisible(false)}
                      />
                    </View>
                    {CITIES.map(city => (
                      <List.Item
                        key={city.id}
                        title={city.name}
                        onPress={() => {
                          setSelectedCity(city.id);
                          setSelectedField(null);
                          setCityModalVisible(false);
                        }}
                        style={styles.listItem}
                      />
                    ))}
                  </View>
                </TouchableOpacity>
              </Modal>
            </View>

            <View style={styles.inputContainer}>
              <TouchableOpacity 
                onPress={() => selectedCity && setFieldModalVisible(true)}
                disabled={!selectedCity}
              >
                <TextInput
                  label="Terrain"
                  value={selectedFieldData ? `${selectedFieldData.name} - ${selectedFieldData.address}` : ''}
                  placeholder="Sélectionner un terrain"
                  style={styles.input}
                  mode="outlined"
                  left={<TextInput.Icon icon="map-marker" />}
                  right={<TextInput.Icon icon="chevron-down" />}
                  outlineColor="#6B4EFF"
                  activeOutlineColor="#6B4EFF"
                  editable={false}
                  disabled={!selectedCity}
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
                    {selectedCity && fields[selectedCity] ? (
                      fields[selectedCity].map(field => (
                        <List.Item
                          key={field.id}
                          title={`${field.name} - ${field.address}`}
                          onPress={() => {
                            if (field.isAvailable) {
                              setSelectedField(field.id);
                              setFieldModalVisible(false);
                            }
                          }}
                          disabled={!field.isAvailable}
                          style={[
                            styles.listItem,
                            !field.isAvailable && styles.listItemDisabled
                          ]}
                          left={props => (
                            <List.Icon 
                              {...props} 
                              icon={field.isAvailable ? 'check-circle' : 'close-circle'} 
                              color={field.isAvailable ? '#4CAF50' : '#F44336'}
                            />
                          )}
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
  listItemDisabled: {
    opacity: 0.7,
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
});

export default CreateMatchScreen; 