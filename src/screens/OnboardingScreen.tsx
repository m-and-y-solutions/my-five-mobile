import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, FlatList } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setOnboardingSeen } from '../store/slices/authSlice';

const { width: screenWidth } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: 'Matchs',
    description: 'Créez vos propres matchs ou rejoignez ceux des autres joueurs. Organisez des rencontres sportives et partagez votre passion !',
    image: require('../../assets/my-five-icon-green.png'),
  },
  {
    id: 2,
    title: 'Communauté',
    description: 'Rejoignez des groupes, suivez d\'autres joueurs et échangez avec eux. Construisez votre réseau sportif !',
    image: require('../../assets/my-five-splash-green.png'),
  },
  {
    id: 3,
    title: 'Performance',
    description: 'Suivez votre score, votre classement et vos activités. Progressez et devenez le meilleur !',
    image: require('../../assets/my-five-splash-green.png'),
  },
];

type OnboardingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

const OnboardingScreen = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const dispatch = useDispatch();

  const renderSlide = ({ item }: { item: typeof slides[0] }) => {
    return (
      <View style={styles.slide}>
        <Image source={item.image} style={styles.image} />
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };

  const handleNext = () => {
    if (activeSlide < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: activeSlide + 1,
        animated: true,
      });
    } else {
      handleFinish();
    }
  };
  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem('onboardingSeen', 'true');
      dispatch(setOnboardingSeen(true));
    } catch (error) {
      console.error('Error saving onboarding state:', error);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
          setActiveSlide(index);
        }}
        keyExtractor={(item) => item.id.toString()}
      />
      
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === activeSlide && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleNext}
      >
        <Text style={styles.buttonText}>
          {activeSlide === slides.length - 1 ? 'Commencer' : 'Suivant'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 40,
  },
  slide: {
    width: screenWidth,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  description: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0D8FF', // tu peux aussi remplacer ce mauve clair par un vert clair si tu veux
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#4CAF50', // vert à la place de #6B4EFF
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#4CAF50', // vert à la place de #6B4EFF
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: '#4CAF50', // vert à la place de #6B4EFF
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default OnboardingScreen;