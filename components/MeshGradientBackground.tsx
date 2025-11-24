import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    withSequence,
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const Blob = ({ color, size, initialX, initialY, duration, delay = 0 }: { color: string, size: number, initialX: number, initialY: number, duration: number, delay?: number }) => {
    const translateX = useSharedValue(initialX);
    const translateY = useSharedValue(initialY);
    const scale = useSharedValue(1);
    const rotate = useSharedValue(0);

    useEffect(() => {
        // Random movement
        translateX.value = withRepeat(
            withSequence(
                withTiming(initialX + Math.random() * 100 - 50, { duration: duration, easing: Easing.inOut(Easing.ease) }),
                withTiming(initialX - Math.random() * 100 + 50, { duration: duration * 1.2, easing: Easing.inOut(Easing.ease) }),
                withTiming(initialX, { duration: duration, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        translateY.value = withRepeat(
            withSequence(
                withTiming(initialY + Math.random() * 100 - 50, { duration: duration * 1.1, easing: Easing.inOut(Easing.ease) }),
                withTiming(initialY - Math.random() * 100 + 50, { duration: duration * 0.9, easing: Easing.inOut(Easing.ease) }),
                withTiming(initialY, { duration: duration * 1.1, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        // Breathing effect
        scale.value = withRepeat(
            withTiming(1.2, { duration: duration * 0.8, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );

        // Slow rotation
        rotate.value = withRepeat(
            withTiming(360, { duration: duration * 2, easing: Easing.linear }),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { scale: scale.value },
                { rotate: `${rotate.value}deg` }
            ],
        };
    });

    // Irregular shape using border radius
    const borderRadius = {
        borderTopLeftRadius: size * (0.4 + Math.random() * 0.4),
        borderTopRightRadius: size * (0.4 + Math.random() * 0.4),
        borderBottomLeftRadius: size * (0.4 + Math.random() * 0.4),
        borderBottomRightRadius: size * (0.4 + Math.random() * 0.4),
    };

    return (
        <Animated.View
            style={[
                styles.blob,
                {
                    backgroundColor: color,
                    width: size,
                    height: size,
                    ...borderRadius,
                },
                animatedStyle,
            ]}
        />
    );
};

export default function MeshGradientBackground({ children }: { children: React.ReactNode }) {
    const { resolvedTheme } = useTheme();
    const theme = Colors[resolvedTheme];

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.backgroundContainer}>
                <Blob color={theme.blob1} size={width * 0.9} initialX={-width * 0.2} initialY={-height * 0.1} duration={8000} />
                <Blob color={theme.blob2} size={width * 1.0} initialX={width * 0.4} initialY={height * 0.3} duration={10000} delay={1000} />
                <Blob color={theme.blob3} size={width * 0.8} initialX={-width * 0.1} initialY={height * 0.6} duration={9000} delay={2000} />
                <Blob color={theme.blob1} size={width * 0.6} initialX={width * 0.5} initialY={height * 0.8} duration={11000} delay={3000} />
            </View>

            {/* Heavy blur to create mesh gradient effect */}
            <BlurView intensity={80} tint={resolvedTheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />

            {/* Subtle noise overlay */}
            <View style={styles.noiseOverlay} />

            <View style={styles.content}>{children}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    blob: {
        position: 'absolute',
        opacity: 0.7,
    },
    noiseOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.03)',
        zIndex: 1,
    },
    content: {
        flex: 1,
        zIndex: 2,
    },
});
