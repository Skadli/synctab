import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import GlassView from './GlassView';
import { Typography } from '../constants/Typography';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/Colors';
import { useSettings } from '../context/SettingsContext';
import ThemedIcon from './ThemedIcon';
import { AppIcons } from '../constants/Icons';

type Language = 'zh' | 'en';

export default function LanguageToggle() {
    const { language, setLanguage } = useSettings();
    const { resolvedTheme } = useTheme();
    const themeColors = Colors[resolvedTheme];

    const handlePress = (newLang: Language) => {
        Haptics.selectionAsync();
        setLanguage(newLang);
    };

    return (
        <GlassView intensity={20} style={styles.container}>
            <View style={styles.content}>
                <Pressable onPress={() => handlePress('zh')} style={[styles.option, language === 'zh' && { backgroundColor: themeColors.activeBackground }]}>
                    <ThemedIcon iosName={AppIcons.Settings.Language.Chinese.ios} androidName={AppIcons.Settings.Language.Chinese.android} size={18} color={language === 'zh' ? themeColors.text : themeColors.textSecondary} />
                    <Text style={[styles.text, { color: themeColors.textSecondary }, language === 'zh' && { color: themeColors.text }]}>中文</Text>
                </Pressable>
                <Pressable onPress={() => handlePress('en')} style={[styles.option, language === 'en' && { backgroundColor: themeColors.activeBackground }]}>
                    <ThemedIcon iosName={AppIcons.Settings.Language.English.ios} androidName={AppIcons.Settings.Language.English.android} size={18} color={language === 'en' ? themeColors.text : themeColors.textSecondary} />
                    <Text style={[styles.text, { color: themeColors.textSecondary }, language === 'en' && { color: themeColors.text }]}>English</Text>
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
        padding: 4,
    },
    option: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        gap: 8,
        borderRadius: 12,
    },
    text: {
        fontFamily: Typography.fontFamily,
        fontSize: 14,
        fontWeight: '600',
    },
});
