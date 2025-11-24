import React from 'react';
import { StyleSheet, Text, View, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Typography } from '../constants/Typography';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 32 - 32) / 3;

interface InviteCardProps {
    onPress: () => void;
}

import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/Colors';

export default function InviteCard({ onPress }: InviteCardProps) {
    const { resolvedTheme } = useTheme();
    const themeColors = Colors[resolvedTheme];

    return (
        <Pressable onPress={onPress} style={styles.container}>
            <BlurView intensity={10} style={[styles.circle, { borderColor: themeColors.glassBorder }]}>
                <Ionicons name="qr-code-outline" size={28} color={themeColors.icon} />
            </BlurView>
            <Text style={[styles.text, { color: themeColors.textSecondary }]}>邀请</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        width: ITEM_WIDTH,
        alignItems: 'center',
        marginBottom: 16,
    },
    circle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        marginBottom: 8,
    },
    text: {
        fontFamily: Typography.fontFamily,
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
    },
});
