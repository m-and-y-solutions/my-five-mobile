import { DefaultTheme } from 'react-native-paper';

export const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4CAF50',
    accent: '#FFC107',
    background: '#f5f5f5',
    surface: '#ffffff',
    text: '#000000',
    onSurface: '#333333',
    placeholder: '#666666',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    // Add more custom colors as needed
  },
  // You can also customize fonts, roundness, etc.
}; 