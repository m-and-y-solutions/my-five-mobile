import React from 'react';
import { Provider } from "react-redux";
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import Navigation from './src/navigation';
import { store } from './src/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogBox, View, Text } from 'react-native';
import { LightTheme } from './src/theme';

// Ignore specific warnings
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
]);

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Error boundary component
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('App Error:', error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>Something went wrong</Text>
          <Text style={{ color: 'red' }}>{this.state.error?.message}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  React.useEffect(() => {
    console.log('🚀 App.tsx - App initialized');
    const testAsyncStorage = async () => {
      try {
        await AsyncStorage.setItem('test', 'test');
        const value = await AsyncStorage.getItem('test');
        console.log('📦 AsyncStorage test:', value);
      } catch (error) {
        console.error('❌ AsyncStorage error:', error);
      }
    };
    testAsyncStorage();
  }, []);

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <SafeAreaProvider>
          <PaperProvider theme={LightTheme}>
            <NavigationContainer>
              <Navigation />
            </NavigationContainer>
          </PaperProvider>
        </SafeAreaProvider>
      </Provider>
    </ErrorBoundary>
  );
}
