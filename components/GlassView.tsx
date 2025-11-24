import React from 'react';
import { StyleSheet, ViewStyle, StyleProp, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface GlassViewProps {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    intensity?: number;
    tint?: 'light' | 'dark' | 'default';
}

export default function GlassView({ children, style, intensity = 40, tint = 'default' }: GlassViewProps) {
    const { resolvedTheme } = useTheme();
    const theme = Colors[resolvedTheme];

    return (
        <View style={[styles.container, { borderColor: theme.glassBorder, backgroundColor: theme.glassBackground }, style]}>
            <BlurView intensity={intensity} tint={resolvedTheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
            <View style={styles.content}>{children}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        borderWidth: 1,
        borderRadius: 20,
    },
    content: {
        // zIndex: 1, // Ensure content is above blur
    },
});
