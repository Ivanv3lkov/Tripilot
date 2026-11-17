import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GluestackUIProvider } from '../components/ui/gluestack-ui-provider';
import { AuthProvider } from './contexts/AuthContext';
import RootNavigator from './navigation/RootNavigator';
import '../global.css';

function App() {
  return (
    <GluestackUIProvider mode="light">
      <SafeAreaProvider>
        <KeyboardProvider>
          <AuthProvider>
            <StatusBar style="auto" />
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </AuthProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GluestackUIProvider>
  );
}

export default App;
