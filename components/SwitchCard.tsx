import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Dimensions } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    interpolateColor,
    withTiming,
    withRepeat,
    withSequence,
    Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import ThemedIcon from './ThemedIcon';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { AppIcons } from '../constants/Icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

interface SwitchCardProps {
    name: string;
    isOn: boolean;
    isDeleteMode?: boolean;
    onToggle: () => void;
    onLongPress?: () => void;
    onDelete?: () => void;
    androidIcon?: keyof typeof Ionicons.glyphMap;
    iosIcon?: string;
    color?: string;
    lastActor?: string;
    lastActionTime?: string;
    streak?: number;
    recentActors?: string[]; // Array of names or avatar URLs
    progress?: number; // 0 to 1
}

const CircularProgress = ({ progress, size, color, strokeWidth = 3 }: { progress: number, size: number, color: string, strokeWidth?: number }) => {
    const radius = (size - strokeWidth) / 2;
    // const circumference = radius * 2 * Math.PI; // Unused
    // const alpha = interpolateColor(progress, [0, 1], ['rgba(255,255,255,0.1)', color]); // Unused

    return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: strokeWidth,
                borderColor: 'rgba(255,255,255,0.1)',
                position: 'absolute',
            }} />
            {progress > 0 && (
                <View style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: strokeWidth,
                    borderColor: color,
                    opacity: progress,
                }} />
            )}
        </View>
    );
};

export default function SwitchCard({
    name,
    isOn,
    isDeleteMode,
    onToggle,
    onLongPress,
    onDelete,
    androidIcon,
    iosIcon,
    color,
    lastActor,
    lastActionTime,
    streak,
    recentActors = [],
    progress = 0
}: SwitchCardProps) {
    const { resolvedTheme } = useTheme();
    const { t, triggerHaptic } = useSettings();
    const themeColors = Colors[resolvedTheme];
    const scale = useSharedValue(1);
    const progressValue = useSharedValue(isOn ? 1 : 0);
    const rotation = useSharedValue(0);

    useEffect(() => {
        progressValue.value = withTiming(isOn ? 1 : 0, { duration: 300 });
    }, [isOn]);

    useEffect(() => {
        if (isDeleteMode) {
            rotation.value = withRepeat(
                withSequence(
                    withTiming(-2, { duration: 100, easing: Easing.linear }),
                    withTiming(2, { duration: 100, easing: Easing.linear })
                ),
                -1,
                true
            );
        } else {
            rotation.value = withTiming(0);
        }
    }, [isDeleteMode]);

    const animatedStyle = useAnimatedStyle(() => {
        const activeColor = color || '#34C759';
        const inactiveColor = resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';

        const backgroundColor = interpolateColor(
            progressValue.value,
            [0, 1],
            [inactiveColor, activeColor]
        );

        return {
            transform: [
                { scale: scale.value },
                { rotate: `${rotation.value}deg` }
            ],
            backgroundColor,
            borderColor: interpolateColor(
                progressValue.value,
                [0, 1],
                [themeColors.glassBorder, 'transparent']
            ),
        };
    });

    const handlePressIn = () => {
        scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    const handlePress = () => {
        if (isDeleteMode) return;
        triggerHaptic('impact', Haptics.ImpactFeedbackStyle.Heavy);
        onToggle();
    };

    const textColor = isOn ? '#FFF' : themeColors.text;
    const subTextColor = isOn ? 'rgba(255,255,255,0.8)' : themeColors.textSecondary;
    const iconColor = isOn ? '#FFF' : themeColors.icon;

    const effectiveAndroidIcon = (androidIcon || AppIcons.Common.Power.android) as keyof typeof Ionicons.glyphMap;
    const effectiveIosIcon = iosIcon || AppIcons.Common.Power.ios;

    // Mock avatars for recent actors
    const renderRecentActors = () => {
        return (
            <View style={styles.recentActorsContainer}>
                {recentActors.slice(0, 3).map((actor, index) => (
                    <View key={index} style={[styles.miniAvatar, {
                        backgroundColor: isOn ? 'rgba(255,255,255,0.3)' : themeColors.glassBorder,
                        marginLeft: index > 0 ? -8 : 0,
                        zIndex: 3 - index
                    }]}>
                        <Text style={[styles.miniAvatarText, { color: textColor }]}>{actor.charAt(0)}</Text>
                    </View>
                ))}
            </View>
        );
    };

    return (
        <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            onLongPress={onLongPress}
            style={styles.container}
        >
            <Animated.View style={[styles.card, animatedStyle]}>
                <BlurView intensity={isOn ? 0 : 20} tint={resolvedTheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />

                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={styles.iconWrapper}>
                            {/* Ring around icon */}
                            <CircularProgress
                                progress={progress}
                                size={52}
                                color={isOn ? 'rgba(255,255,255,0.5)' : (color || themeColors.primary)}
                            />
                            <View style={styles.iconContainer}>
                                <ThemedIcon
                                    iosName={effectiveIosIcon}
                                    androidName={effectiveAndroidIcon}
                                    size={32} // Increased size
                                    color={iconColor}
                                />
                            </View>
                        </View>

                        {streak && streak > 0 && (
                            <View style={[styles.streakBadge, { backgroundColor: isOn ? 'rgba(255,255,255,0.2)' : 'rgba(255,149,0,0.1)' }]}>
                                <Text style={styles.streakEmoji}>🔥</Text>
                                <Text style={[styles.streakText, { color: textColor }]}>{streak}</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.nameContainer}>
                        <Text style={[styles.name, { color: textColor }]} numberOfLines={2}>{name}</Text>
                    </View>

                    <View style={styles.footer}>
                        <View style={styles.statusContainer}>
                            {isOn && lastActor && (
                                <View style={styles.avatarContainer}>
                                    <ThemedIcon iosName="person.circle.fill" androidName="person-circle" size={16} color={subTextColor} />
                                </View>
                            )}
                            <Text style={[styles.status, { color: subTextColor }]} numberOfLines={1}>
                                {isOn ? `${lastActor} • ${lastActionTime}` : (lastActionTime ? `${lastActionTime}` : t('waiting'))}
                            </Text>
                        </View>
                        {renderRecentActors()}
                    </View>
                </View>

                {isDeleteMode && (
                    <Pressable style={styles.deleteButton} onPress={onDelete}>
                        <Ionicons name="close" size={16} color="#FFF" />
                    </Pressable>
                )}
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        height: CARD_WIDTH,
        marginBottom: 16,
    },
    card: {
        flex: 1,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    iconWrapper: {
        width: 52,
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: -6, // Offset for the ring padding
        marginTop: -6,
    },
    iconContainer: {
        position: 'absolute',
    },
    nameContainer: {
        flex: 1,
        justifyContent: 'center',
        marginBottom: 4,
    },
    name: {
        fontFamily: Typography.fontFamily,
        fontSize: 20, // Increased size
        fontWeight: '700', // Bolder
        lineHeight: 24,
    },
    avatarContainer: {
        marginRight: 4,
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        gap: 2,
    },
    streakEmoji: {
        fontSize: 10,
    },
    streakText: {
        fontFamily: Typography.fontFamily,
        fontSize: 10,
        fontWeight: '700',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    recentActorsContainer: {
        flexDirection: 'row',
    },
    miniAvatar: {
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    miniAvatarText: {
        fontSize: 8,
        fontWeight: 'bold',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    status: {
        fontFamily: Typography.fontFamily,
        fontSize: 11,
        fontWeight: '500',
        maxWidth: 80,
    },
    deleteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
});
