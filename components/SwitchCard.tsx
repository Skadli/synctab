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
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

interface SwitchCardProps {
    name: string;
    isOn: boolean;
    isDeleteMode?: boolean;
    onToggle: () => void;
    onLongPress?: () => void;
    onDelete?: () => void;
    icon?: string;
    color?: string;
}

export default function SwitchCard({ name, isOn, isDeleteMode, onToggle, onLongPress, onDelete, icon, color }: SwitchCardProps) {
    const { resolvedTheme } = useTheme();
    const { t, triggerHaptic } = useSettings();
    const themeColors = Colors[resolvedTheme];
    const scale = useSharedValue(1);
    const progress = useSharedValue(isOn ? 1 : 0);
    const rotation = useSharedValue(0);

    useEffect(() => {
        progress.value = withTiming(isOn ? 1 : 0, { duration: 300 });
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
        const activeColor = color || 'rgba(0, 255, 127, 0.6)';
        const backgroundColor = interpolateColor(
            progress.value,
            [0, 1],
            [themeColors.cardBackground, activeColor]
        );

        return {
            transform: [
                { scale: scale.value },
                { rotate: `${rotation.value}deg` }
            ],
            backgroundColor,
        };
    });

    const handlePressIn = () => {
        scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    const handlePress = () => {
        if (isDeleteMode) return; // Disable toggle in delete mode
        triggerHaptic('impact', Haptics.ImpactFeedbackStyle.Heavy);
        onToggle();
    };

    const textColor = isOn ? '#FFF' : themeColors.text;
    const subTextColor = isOn ? 'rgba(255,255,255,0.7)' : themeColors.textSecondary;
    const iconColor = isOn ? '#FFF' : themeColors.icon;
    const iconName = (icon || 'power') as any;

    return (
        <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            onLongPress={onLongPress}
            style={styles.container}
        >
            <Animated.View style={[styles.card, { borderColor: themeColors.glassBorder }, animatedStyle]}>
                <BlurView intensity={isOn ? 0 : 20} tint={resolvedTheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name={isOn ? iconName : (icon ? iconName : 'power-outline')}
                            size={32}
                            color={iconColor}
                        />
                    </View>
                    <View>
                        <Text style={[styles.name, { color: textColor }]}>{name}</Text>
                        <Text style={[styles.status, { color: subTextColor }]}>{isOn ? t('switch_on') : t('switch_off')}</Text>
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
        justifyContent: 'space-between',
    },
    iconContainer: {
        alignSelf: 'flex-start',
    },
    name: {
        fontFamily: Typography.fontFamily,
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 4,
    },
    status: {
        fontFamily: Typography.fontFamily,
        fontSize: 13,
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
