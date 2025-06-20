import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Alert, TouchableOpacity } from 'react-native';
import { Button, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import config from 'config/config';

interface ImagePickerProps {
  onImageSelected: (imageData: FormData) => void;
  initialImage?: string;
}

interface ImageFile {
  uri: string;
  type: string;
  name: string;
}

const ImagePickerComponent: React.FC<ImagePickerProps> = ({ onImageSelected, initialImage }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>( null);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'Nous avons besoin de votre permission pour accéder à vos photos.'
        );
      }
    })();
  }, []);


  const handleImagePick = async () => {
    try {
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert(
            'Permission refusée',
            'Nous avons besoin de votre permission pour accéder à vos photos.'
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        
        const formData = new FormData();
        const imageFile: ImageFile = {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'photo.jpg',
        };
        
        formData.append('image', imageFile as any);
        onImageSelected(formData);
      }
    } catch (error) {
      console.error('Erreur lors de la sélection de l\'image:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la sélection de l\'image');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleImagePick} style={styles.imageContainer}>
        {selectedImage ? (
          <Image
            source={{ uri: selectedImage }}
            style={styles.image}
          />
        ) :
        initialImage ? (
          <Image
          source={{ uri: `${config.serverUrl}${initialImage}` }}
          style={styles.image}
          />
        ) : (
          <View style={styles.defaultImageContainer}>
            <MaterialIcons name="person" size={80} color="#ccc" />
            <Text style={styles.defaultImageText}>Ajouter une photo</Text>
          </View>
        )}
        <View style={styles.editIconContainer}>
          <MaterialIcons name="edit" size={24} color="#fff" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imageContainer: {
    position: 'relative',
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  defaultImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultImageText: {
    marginTop: 8,
    color: '#666',
    fontSize: 12,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
});

export default ImagePickerComponent; 