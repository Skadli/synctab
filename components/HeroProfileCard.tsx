import React from 'react';
import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassView from './GlassView';
import { Typography } from '../constants/Typography';
import { Colors } from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';

import ThemedIcon from './ThemedIcon';
import { AppIcons } from '../constants/Icons';

interface HeroProfileCardProps {
    name: string;
    userId: string;
    avatarUrl?: string;
    avatarIcon?: { ios: string; android: any };
    contributionCount: number;
    onPress: () => void;
}

export default function HeroProfileCard({ name, userId, avatarUrl, avatarIcon, contributionCount, onPress }: HeroProfileCardProps) {
    const { resolvedTheme } = useTheme();
    const themeColors = Colors[resolvedTheme];

    return (
        <Pressable onPress={onPress}>
            <GlassView intensity={40} style={[styles.container, { borderColor: themeColors.glassBorder }]}>
                <View style={styles.content}>
                    <View style={styles.left}>
                        {avatarIcon ? (
                            <View style={[styles.avatar, { borderColor: themeColors.text, justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.cardBackground }]}>
                                <ThemedIcon iosName={avatarIcon.ios} androidName={avatarIcon.android} size={40} color={themeColors.text} />
                            </View>
                        ) : (
                            <Image source={{ uri: avatarUrl }} style={[styles.avatar, { borderColor: themeColors.text }]} />
                        )}
                        <View style={styles.info}>
                            <Text style={[styles.name, { color: themeColors.text }]}>{name}</Text>
                            <Text style={[styles.userId, { color: themeColors.textSecondary }]}>ID: {userId}</Text>
                        </View>
                    </View>
                    <View style={styles.right}>
                        <GlassView intensity={20} style={[styles.capsule, { backgroundColor: resolvedTheme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)' }]}>
                            <Text style={[styles.capsuleText, { color: themeColors.text }]}>今日操作 {contributionCount} 次</Text>
                        </GlassView>
                    </View>
                </View>
            </GlassView>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        marginBottom: 24,
        borderWidth: 1,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
    },
    info: {
        justifyContent: 'center',
    },
    name: {
        fontFamily: Typography.fontFamily,
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    userId: {
        fontFamily: Typography.fontFamily,
        fontSize: 13,
    },
    right: {
        justifyContent: 'center',
    },
    capsule: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    capsuleText: {
        fontFamily: Typography.fontFamily,
        fontSize: 12,
        fontWeight: '600',
    },
});
