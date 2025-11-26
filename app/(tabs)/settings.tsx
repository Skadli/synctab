import React from 'react';
import { StyleSheet, Text, View, ScrollView, Switch, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import MeshGradientBackground from '../../components/MeshGradientBackground';
import AppearanceSwitcher from '../../components/AppearanceSwitcher';
import LanguageToggle from '../../components/LanguageToggle';
import GlassView from '../../components/GlassView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '../../constants/Typography';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../constants/Colors';
import { useSettings } from '../../context/SettingsContext';
import ThemedIcon from '../../components/ThemedIcon';
import { AppIcons } from '../../constants/Icons';

// 设置页主屏幕，实现 PRD 中的「外观与语言」「账号与通知」及退出登录逻辑
export default function SettingsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { resolvedTheme } = useTheme();
    const themeColors = Colors[resolvedTheme];
    const {
        t,
        hapticsEnabled,
        setHapticsEnabled,
        notificationsEnabled,
        setNotificationsEnabled,
        logout,
    } = useSettings();

    const handleLogout = () => {
        logout();
        router.replace('/login');
    };

    return (
        <MeshGradientBackground>
            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16, paddingBottom: 100 }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: themeColors.headerText }]}>{t('settings_title')}</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>{t('appearance_language')}</Text>
                        <AppearanceSwitcher />
                        <LanguageToggle />
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>{t('account_management')}</Text>
                        <GlassView intensity={30} style={styles.listContainer}>
                            <View style={styles.listItem}>
                                <View style={styles.itemLeft}>
                                    <ThemedIcon iosName={AppIcons.Settings.Haptics.ios} androidName={AppIcons.Settings.Haptics.android} size={22} color={themeColors.icon} />
                                    <Text style={[styles.itemText, { color: themeColors.text }]}>{t('haptics')}</Text>
                                </View>
                                <Switch
                                    value={hapticsEnabled}
                                    onValueChange={setHapticsEnabled}
                                />
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.listItem}>
                                <View style={styles.itemLeft}>
                                    <ThemedIcon iosName={AppIcons.Settings.Notifications.ios} androidName={AppIcons.Settings.Notifications.android} size={22} color={themeColors.icon} />
                                    <Text style={[styles.itemText, { color: themeColors.text }]}>{t('notifications')}</Text>
                                </View>
                                <Switch
                                    value={notificationsEnabled}
                                    onValueChange={setNotificationsEnabled}
                                />
                            </View>
                        </GlassView>

                        <Pressable style={styles.logoutButton} onPress={handleLogout}>
                            <View style={styles.logoutContainer}>
                                <Text style={styles.logoutText}>{t('logout')}</Text>
                            </View>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </MeshGradientBackground>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
    headerTitle: {
        fontFamily: Typography.fontFamily,
        fontSize: 34,
        fontWeight: 'bold',
    },
    content: {
        paddingHorizontal: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontFamily: Typography.fontFamily,
        fontSize: 13,
        marginBottom: 8,
        marginLeft: 8,
        textTransform: 'uppercase',
    },
    listContainer: {
        borderRadius: 16,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    itemText: {
        fontFamily: Typography.fontFamily,
        fontSize: 17,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginLeft: 52,
    },
    logoutButton: {
        marginTop: 24,
    },
    logoutContainer: {
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        backgroundColor: 'rgba(255, 59, 48, 0.2)',
    },
    logoutText: {
        fontFamily: Typography.fontFamily,
        fontSize: 17,
        fontWeight: '600',
        color: '#FF3B30',
    },
});
