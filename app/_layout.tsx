import { Stack } from 'expo-router';
import { ThemeProvider } from '../context/ThemeContext';
import { SettingsProvider } from '../context/SettingsContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SettingsProvider>
                <ThemeProvider>
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="index" />
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen name="login" options={{ animation: 'fade' }} />
                    </Stack>
                </ThemeProvider>
            </SettingsProvider>
        </GestureHandlerRootView>
    );
}
