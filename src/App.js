import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GluestackUIProvider } from '../components/ui/gluestack-ui-provider';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './i18n/LanguageContext';
import RootNavigator from './navigation/RootNavigator';
import '../global.css';

function App() {
  return (
    <GluestackUIProvider mode="light">
      <SafeAreaProvider>
        <KeyboardProvider>
          <LanguageProvider>
            <AuthProvider>
              <StatusBar style="dark" />
              <NavigationContainer>
                <RootNavigator />
              </NavigationContainer>
            </AuthProvider>
          </LanguageProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GluestackUIProvider>
  );
}

export default App;
