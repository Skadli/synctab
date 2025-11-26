import React from 'react';
import { StyleSheet, Pressable, View, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import ThemedIcon from './ThemedIcon';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/Colors';
import { AppIcons } from '../constants/Icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface AddButtonProps {
    onPress: () => void;
}

export default function AddButton({ onPress }: AddButtonProps) {
    const { resolvedTheme } = useTheme();
    const themeColors = Colors[resolvedTheme];

    return (
        <Pressable
            onPress={() => {
                Haptics.selectionAsync();
                onPress();
            }}
            style={[styles.container, { borderColor: themeColors.glassBorder }]}
        >
            <BlurView intensity={10} tint={resolvedTheme === 'dark' ? 'dark' : 'light'} style={styles.blur}>
                <View style={styles.content}>
                    <ThemedIcon iosName={AppIcons.Common.Add.ios} androidName={AppIcons.Common.Add.android} size={40} color={themeColors.textSecondary} />
                </View>
            </BlurView>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        height: CARD_WIDTH,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderStyle: 'dashed',
        marginBottom: 16,
    },
    blur: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
