import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    withSequence,
    withDelay,
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const NUM_PARTICLES = 35;

const Particle = ({ color, size, initialX, initialY, duration, delay }: { color: string, size: number, initialX: number, initialY: number, duration: number, delay: number }) => {
    const translateX = useSharedValue(initialX);
    const translateY = useSharedValue(initialY);
    const opacity = useSharedValue(Math.random() * 0.5 + 0.3);
    const scale = useSharedValue(Math.random() * 0.5 + 0.5);

    useEffect(() => {
        // Random movement
        translateX.value = withDelay(delay, withRepeat(
            withSequence(
                withTiming(initialX + Math.random() * 100 - 50, { duration: duration, easing: Easing.inOut(Easing.ease) }),
                withTiming(initialX - Math.random() * 100 + 50, { duration: duration * 1.2, easing: Easing.inOut(Easing.ease) }),
                withTiming(initialX, { duration: duration, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        ));

        translateY.value = withDelay(delay, withRepeat(
            withSequence(
                withTiming(initialY + Math.random() * 100 - 50, { duration: duration * 1.1, easing: Easing.inOut(Easing.ease) }),
                withTiming(initialY - Math.random() * 100 + 50, { duration: duration * 0.9, easing: Easing.inOut(Easing.ease) }),
                withTiming(initialY, { duration: duration * 1.1, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        ));

        // Opacity breathing
        opacity.value = withDelay(delay, withRepeat(
            withSequence(
                withTiming(0.8, { duration: duration * 0.5, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.3, { duration: duration * 0.5, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        ));
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { scale: scale.value },
            ],
            opacity: opacity.value,
        };
    });

    return (
        <Animated.View
            style={[
                styles.particle,
                {
                    backgroundColor: color,
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                },
                animatedStyle,
            ]}
        />
    );
};

export default function MeshGradientBackground({ children }: { children: React.ReactNode }) {
    const { resolvedTheme } = useTheme();
    const theme = Colors[resolvedTheme];

    const particles = useMemo(() => {
        return Array.from({ length: NUM_PARTICLES }).map((_, i) => {
            const size = Math.random() * 6 + 3; // 3-9px
            const initialX = Math.random() * width;
            const initialY = Math.random() * height;
            const duration = Math.random() * 5000 + 5000; // 5-10s
            const delay = Math.random() * 2000;

            // Randomly pick one of the blob colors or a variation
            const colorKeys = ['blob1', 'blob2', 'blob3'] as const;
            const colorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
            const color = theme[colorKey];

            return (
                <Particle
                    key={i}
                    color={color}
                    size={size}
                    initialX={initialX}
                    initialY={initialY}
                    duration={duration}
                    delay={delay}
                />
            );
        });
    }, [theme]);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.backgroundContainer}>
                {particles}
            </View>

            {/* Subtle noise overlay for texture */}
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
    particle: {
        position: 'absolute',
    },
    noiseOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.02)',
        zIndex: 1,
        pointerEvents: 'none',
    },
    content: {
        flex: 1,
        zIndex: 2,
    },
});
