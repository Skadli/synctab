import React from 'react';
import { StyleSheet, Text, View, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import MeshGradientBackground from '../components/MeshGradientBackground';
import GlassView from '../components/GlassView';
import { Typography } from '../constants/Typography';
import { useSettings } from '../context/SettingsContext';
import * as Haptics from 'expo-haptics';

export default function LoginScreen() {
    const router = useRouter();
    const { login } = useSettings();

    const handleLogin = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        login();
        router.replace('/(tabs)/home');
    };

    return (
        <MeshGradientBackground>
            <View style={styles.container}>
                <GlassView intensity={40} style={styles.card}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>SyncTab</Text>
                        <Text style={styles.subtitle}>安心开关</Text>
                    </View>

                    <Pressable onPress={handleLogin} style={styles.button}>
                        <GlassView intensity={60} style={styles.buttonContent}>
                            <Text style={styles.buttonText}>进入我的家</Text>
                        </GlassView>
                    </Pressable>
                </GlassView>
            </View>
        </MeshGradientBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    card: {
        borderRadius: 32,
        padding: 40,
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 60,
    },
    logoText: {
        fontFamily: Typography.fontFamily,
        fontSize: 48,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: Typography.fontFamily,
        fontSize: 18,
        color: 'rgba(255,255,255,0.8)',
        letterSpacing: 4,
    },
    button: {
        width: '100%',
        height: 56,
        borderRadius: 28,
        overflow: 'hidden',
    },
    buttonContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    buttonText: {
        fontFamily: Typography.fontFamily,
        fontSize: 18,
        fontWeight: '600',
        color: '#FFF',
    },
});
