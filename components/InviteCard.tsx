import React from 'react';
import { StyleSheet, Text, View, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Typography } from '../constants/Typography';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/Colors';
import GlassView from './GlassView';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // Match SwitchCard width

interface InviteCardProps {
    onPress: () => void;
}

export default function InviteCard({ onPress }: InviteCardProps) {
    const { resolvedTheme } = useTheme();
    const themeColors = Colors[resolvedTheme];

    return (
        <Pressable onPress={onPress} style={styles.container}>
            <GlassView intensity={20} style={[styles.card, { borderColor: themeColors.glassBorder }]}>
                <View style={[styles.iconContainer, { backgroundColor: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                    <Ionicons name="person-add-outline" size={32} color={themeColors.text} />
                </View>
                <View style={styles.content}>
                    <Text style={[styles.title, { color: themeColors.text }]}>Invite Family</Text>
                    <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>Join your space</Text>
                </View>
                <View style={[styles.button, { backgroundColor: themeColors.text }]}>
                    <Text style={[styles.buttonText, { color: themeColors.cardBackground }]}>Invite</Text>
                </View>
            </GlassView>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        height: CARD_WIDTH, // Square aspect ratio
        marginBottom: 16,
    },
    card: {
        flex: 1,
        borderRadius: 24,
        padding: 16,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    content: {
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontFamily: Typography.fontFamily,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
        textAlign: 'center',
    },
    subtitle: {
        fontFamily: Typography.fontFamily,
        fontSize: 12,
        textAlign: 'center',
    },
    button: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    buttonText: {
        fontFamily: Typography.fontFamily,
        fontSize: 12,
        fontWeight: '600',
    },
});
