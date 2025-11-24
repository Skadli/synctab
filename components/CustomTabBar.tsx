import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import Animated, {
    useAnimatedStyle,
    withSpring,
    useSharedValue,
    withTiming,
    Layout,
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const activeIndex = state.index;
    const { resolvedTheme } = useTheme();
    const themeColors = Colors[resolvedTheme];

    return (
        <View style={styles.container}>
            <BlurView intensity={80} tint={resolvedTheme === 'dark' ? 'dark' : 'light'} style={styles.blurContainer}>
                <View style={styles.tabBar}>
                    {state.routes.map((route, index) => {
                        const { options } = descriptors[route.key];
                        const isFocused = state.index === index;

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });

                            if (!isFocused && !event.defaultPrevented) {
                                navigation.navigate(route.name);
                                Haptics.selectionAsync();
                            }
                        };

                        let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
                        if (route.name === 'home') iconName = isFocused ? 'home' : 'home-outline';
                        if (route.name === 'user') iconName = isFocused ? 'person' : 'person-outline';
                        if (route.name === 'settings') iconName = isFocused ? 'settings' : 'settings-outline';

                        return (
                            <TouchableOpacity
                                key={index}
                                accessibilityRole="button"
                                accessibilityState={isFocused ? { selected: true } : {}}
                                accessibilityLabel={options.tabBarAccessibilityLabel}
                                onPress={onPress}
                                style={styles.tabItem}
                            >
                                {isFocused && (
                                    <Animated.View layout={Layout.springify()} style={[styles.blob, { backgroundColor: themeColors.textSecondary }]} />
                                )}
                                <Ionicons name={iconName} size={24} color={isFocused ? themeColors.background : themeColors.textSecondary} />
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </BlurView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 34,
        left: '12.5%',
        width: '75%',
        height: 64,
        borderRadius: 32,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
    },
    blurContainer: {
        flex: 1,
    },
    tabBar: {
        flexDirection: 'row',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    blob: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 20,
        zIndex: -1,
    },
});
