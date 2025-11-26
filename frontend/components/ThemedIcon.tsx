import React from 'react';
import { Platform } from 'react-native';
import { SymbolView, SymbolViewProps } from 'expo-symbols';
import { Ionicons } from '@expo/vector-icons';

interface ThemedIconProps {
    iosName: string;
    androidName: keyof typeof Ionicons.glyphMap;
    size?: number;
    color?: string;
    style?: any;
}

export default function ThemedIcon({ iosName, androidName, size = 24, color = 'black', style }: ThemedIconProps) {
    if (Platform.OS === 'ios') {
        return (
            <SymbolView
                name={iosName as SymbolViewProps['name']}
                size={size}
                tintColor={color}
                style={style}
            />
        );
    }

    return <Ionicons name={androidName} size={size} color={color} style={style} />;
}
