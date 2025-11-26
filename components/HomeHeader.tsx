import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassView from './GlassView';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { useTheme } from '../context/ThemeContext';
import ThemedIcon from './ThemedIcon';
import { AppIcons } from '../constants/Icons';

interface HomeHeaderProps {
    spaceName: string;
    onSpacePress: () => void;
    onHistoryPress: () => void;
    onAddPress: () => void;
}

export default function HomeHeader({ spaceName, onSpacePress, onHistoryPress, onAddPress }: HomeHeaderProps) {
    const insets = useSafeAreaInsets();
    const { resolvedTheme } = useTheme();
    const themeColors = Colors[resolvedTheme];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <GlassView intensity={20} style={styles.glassContainer}>
                <View style={styles.content}>
                    <Pressable onPress={onSpacePress} style={styles.leftContainer}>
                        <Text style={[styles.spaceName, { color: themeColors.text }]}>{spaceName}</Text>
                        <ThemedIcon iosName={AppIcons.Common.ChevronDown.ios} androidName={AppIcons.Common.ChevronDown.android} size={20} color={themeColors.icon} />
                    </Pressable>
                    <View style={styles.rightContainer}>
                        <Pressable onPress={onAddPress} style={styles.iconButton}>
                            <ThemedIcon iosName={AppIcons.Common.Add.ios} androidName={AppIcons.Common.Add.android} size={24} color={themeColors.icon} />
                        </Pressable>
                        <Pressable onPress={onHistoryPress} style={styles.iconButton}>
                            <ThemedIcon iosName={AppIcons.Common.History.ios} androidName={AppIcons.Common.History.android} size={24} color={themeColors.icon} />
                        </Pressable>
                    </View>
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
        overflow: 'hidden',
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
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconButton: {
        padding: 4,
    },
});
