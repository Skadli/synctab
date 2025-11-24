import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassView from './GlassView';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';

type ThemeMode = 'light' | 'dark' | 'auto';

export default function AppearanceSwitcher() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const { t } = useSettings();
    const themeColors = Colors[resolvedTheme];

    const handlePress = (newMode: ThemeMode) => {
        Haptics.selectionAsync();
        setTheme(newMode);
    };

    const getIconColor = (mode: ThemeMode) => {
        if (theme === mode) {
            return themeColors.text;
        }
        return themeColors.textSecondary;
    };

    const getTextStyle = (mode: ThemeMode) => {
        return [
            styles.text,
            { color: theme === mode ? themeColors.text : themeColors.textSecondary }
        ];
    };

    return (
        <GlassView intensity={20} style={styles.container}>
            <View style={styles.content}>
                <Pressable onPress={() => handlePress('light')} style={[styles.option, theme === 'light' && { backgroundColor: themeColors.activeBackground }]}>
                    <Ionicons name="sunny" size={20} color={getIconColor('light')} />
                    <Text style={getTextStyle('light')}>{t('theme_light')}</Text>
                </Pressable>
                <Pressable onPress={() => handlePress('dark')} style={[styles.option, theme === 'dark' && { backgroundColor: themeColors.activeBackground }]}>
                    <Ionicons name="moon" size={20} color={getIconColor('dark')} />
                    <Text style={getTextStyle('dark')}>{t('theme_dark')}</Text>
                </Pressable>
                <Pressable onPress={() => handlePress('auto')} style={[styles.option, theme === 'auto' && { backgroundColor: themeColors.activeBackground }]}>
                    <Ionicons name="contrast" size={20} color={getIconColor('auto')} />
                    <Text style={getTextStyle('auto')}>{t('theme_auto')}</Text>
                </Pressable>
            </View>
        </GlassView>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        marginBottom: 24,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 4,
    },
    option: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
        borderRadius: 12,
    },
    text: {
        fontFamily: Typography.fontFamily,
        fontSize: 14,
        fontWeight: '600',
    },
});
