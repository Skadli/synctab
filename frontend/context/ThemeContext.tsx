import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
    theme: ThemeMode;
    setTheme: (theme: ThemeMode) => void;
    resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'auto',
    setTheme: () => { },
    resolvedTheme: 'light',
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemColorScheme = useSystemColorScheme();
    const [theme, setThemeState] = useState<ThemeMode>('auto');
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Load saved theme preference
        AsyncStorage.getItem('user-theme').then((savedTheme) => {
            if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
                setThemeState(savedTheme as ThemeMode);
            }
            setIsReady(true);
        }).catch(() => {
            // Ignore error if storage fails
            setIsReady(true);
        });
    }, []);

    const setTheme = (newTheme: ThemeMode) => {
        setThemeState(newTheme);
        AsyncStorage.setItem('user-theme', newTheme).catch(() => { });
    };

    const resolvedTheme = theme === 'auto' ? (systemColorScheme ?? 'light') : theme;

    if (!isReady) {
        return null; // Or a splash screen
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
