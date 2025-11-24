import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Translations, TranslationKey } from '../constants/Translations';

type Language = 'zh' | 'en';

interface SettingsContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey) => string;
    hapticsEnabled: boolean;
    setHapticsEnabled: (enabled: boolean) => void;
    triggerHaptic: (type: 'selection' | 'impact' | 'notification', style?: Haptics.ImpactFeedbackStyle | Haptics.NotificationFeedbackType) => void;
    notificationsEnabled: boolean;
    setNotificationsEnabled: (enabled: boolean) => void;
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
}

const SettingsContext = createContext<SettingsContextType>({
    language: 'zh',
    setLanguage: () => { },
    t: (key) => Translations.zh[key],
    hapticsEnabled: true,
    setHapticsEnabled: () => { },
    triggerHaptic: () => { },
    notificationsEnabled: true,
    setNotificationsEnabled: () => { },
    isAuthenticated: false,
    login: () => { },
    logout: () => { },
});

export const useSettings = () => useContext(SettingsContext);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('zh');
    const [hapticsEnabled, setHapticsEnabledState] = useState(true);
    const [notificationsEnabled, setNotificationsEnabledState] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const [lang, haptics, notifs, auth] = await Promise.all([
                AsyncStorage.getItem('language'),
                AsyncStorage.getItem('hapticsEnabled'),
                AsyncStorage.getItem('notificationsEnabled'),
                AsyncStorage.getItem('isAuthenticated'),
            ]);

            if (lang) setLanguageState(lang as Language);
            if (haptics !== null) setHapticsEnabledState(JSON.parse(haptics));
            if (notifs !== null) setNotificationsEnabledState(JSON.parse(notifs));
            if (auth !== null) setIsAuthenticated(JSON.parse(auth));
        } catch (e) {
            console.error('Failed to load settings', e);
        } finally {
            setIsLoading(false);
        }
    };

    const setLanguage = async (lang: Language) => {
        setLanguageState(lang);
        await AsyncStorage.setItem('language', lang);
    };

    const t = (key: TranslationKey) => {
        return Translations[language][key] || key;
    };

    const setHapticsEnabled = async (enabled: boolean) => {
        setHapticsEnabledState(enabled);
        await AsyncStorage.setItem('hapticsEnabled', JSON.stringify(enabled));
        if (enabled) Haptics.selectionAsync();
    };

    const triggerHaptic = (type: 'selection' | 'impact' | 'notification', style?: Haptics.ImpactFeedbackStyle | Haptics.NotificationFeedbackType) => {
        if (!hapticsEnabled) return;

        switch (type) {
            case 'selection':
                Haptics.selectionAsync();
                break;
            case 'impact':
                Haptics.impactAsync(style as Haptics.ImpactFeedbackStyle || Haptics.ImpactFeedbackStyle.Medium);
                break;
            case 'notification':
                Haptics.notificationAsync(style as Haptics.NotificationFeedbackType || Haptics.NotificationFeedbackType.Success);
                break;
        }
    };

    const setNotificationsEnabled = async (enabled: boolean) => {
        setNotificationsEnabledState(enabled);
        await AsyncStorage.setItem('notificationsEnabled', JSON.stringify(enabled));
        if (hapticsEnabled) Haptics.selectionAsync();
    };

    const login = async () => {
        setIsAuthenticated(true);
        await AsyncStorage.setItem('isAuthenticated', 'true');
    };

    const logout = async () => {
        setIsAuthenticated(false);
        await AsyncStorage.setItem('isAuthenticated', 'false');
    };

    return (
        <SettingsContext.Provider
            value={{
                language,
                setLanguage,
                t,
                hapticsEnabled,
                setHapticsEnabled,
                triggerHaptic,
                notificationsEnabled,
                setNotificationsEnabled,
                isAuthenticated,
                login,
                logout,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}
