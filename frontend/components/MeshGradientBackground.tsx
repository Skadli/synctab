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
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const NUM_PARTICLES = 35;

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const Particle = ({ colors, size, initialX, initialY, duration, delay }: { colors: readonly [string, string], size: number, initialX: number, initialY: number, duration: number, delay: number }) => {
    const translateX = useSharedValue(initialX);
    const translateY = useSharedValue(initialY);
    const opacity = useSharedValue(Math.random() * 0.5 + 0.3);
    const scale = useSharedValue(Math.random() * 0.5 + 0.5);
    const rotation = useSharedValue(Math.random() * 360);

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

        // Continuous rotation
        rotation.value = withRepeat(
            withTiming(rotation.value + 360, { duration: duration * 2, easing: Easing.linear }),
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
                { rotate: `${rotation.value}deg` },
            ],
            opacity: opacity.value,
        };
    });

    return (
        <AnimatedLinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
                styles.particle,
                {
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
            const size = Math.random() * 10 + 5; // Increased size for gradient visibility
            const initialX = Math.random() * width;
            const initialY = Math.random() * height;
            const duration = Math.random() * 5000 + 5000; // 5-10s
            const delay = Math.random() * 2000;

            // Generate gradient pairs based on theme colors
            const colorKeys = ['blob1', 'blob2', 'blob3'] as const;
            const color1 = theme[colorKeys[Math.floor(Math.random() * colorKeys.length)]];
            const color2 = theme[colorKeys[Math.floor(Math.random() * colorKeys.length)]];

            return (
                <Particle
                    key={i}
                    colors={[color1, color2]}
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
