import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '../constants/Typography';
import GlassView from './GlassView';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/Colors';

interface HomeHeaderProps {
    spaceName: string;
    onSpacePress: () => void;
    onHistoryPress: () => void;
}

export default function HomeHeader({ spaceName, onSpacePress, onHistoryPress }: HomeHeaderProps) {
    const insets = useSafeAreaInsets();
    const { resolvedTheme } = useTheme();
    const themeColors = Colors[resolvedTheme];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <GlassView intensity={20} style={styles.glassContainer}>
                <View style={styles.content}>
                    <Pressable onPress={onSpacePress} style={styles.leftContainer}>
                        <Text style={[styles.spaceName, { color: themeColors.text }]}>{spaceName}</Text>
                        <Ionicons name="chevron-down" size={20} color={themeColors.icon} />
                    </Pressable>
                    <Pressable onPress={onHistoryPress} style={styles.rightContainer}>
                        <Ionicons name="time-outline" size={24} color={themeColors.icon} />
                    </Pressable>
                </View>
            </GlassView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    glassContainer: {
        borderRadius: 24,
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    spaceName: {
        fontFamily: Typography.fontFamily,
        fontSize: 17,
        fontWeight: '600',
    },
    rightContainer: {
        padding: 4,
    },
});
