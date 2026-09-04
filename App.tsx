import { Epilogue_600SemiBold, Epilogue_700Bold, useFonts as useEpilogueFonts } from '@expo-google-fonts/epilogue';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts as useInterFonts,
} from '@expo-google-fonts/inter';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/lib/auth';
import { RootNavigator } from '@/navigation/RootNavigator';
import { ThemeModeProvider, useTheme } from '@/theme/theme';

function AppShell() {
  const { colors, scheme } = useTheme();
  // Both faces ship with the app, so there is no system fallback (Design.md §3).
  const [epilogueLoaded] = useEpilogueFonts({ Epilogue_600SemiBold, Epilogue_700Bold });
  const [interLoaded] = useInterFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  const fontsLoaded = epilogueLoaded && interLoaded;

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      {fontsLoaded ? (
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.canvas }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeModeProvider>
        <AppShell />
      </ThemeModeProvider>
    </SafeAreaProvider>
  );
}
