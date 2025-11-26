import React from 'react';
import { StyleSheet, Text, View, Modal, Pressable, FlatList } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../constants/Typography';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/Colors';
import GlassView from './GlassView';

interface SpaceSheetProps {
    visible: boolean;
    onClose: () => void;
    currentSpace: string;
    onSelectSpace: (space: string) => void;
}

const SPACES = ['我的家', '办公室', '父母家', '度假屋'];

export default function SpaceSheet({ visible, onClose, currentSpace, onSelectSpace }: SpaceSheetProps) {
    const { resolvedTheme } = useTheme();
    const themeColors = Colors[resolvedTheme];

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable style={styles.overlay} onPress={onClose}>
                <BlurView intensity={10} style={StyleSheet.absoluteFill} />
            </Pressable>

            <GlassView intensity={80} style={[styles.sheet, { backgroundColor: themeColors.cardBackground }]}>
                <View style={styles.handle} />
                <Text style={[styles.title, { color: themeColors.text }]}>切换空间</Text>

                <FlatList
                    data={SPACES}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <Pressable
                            style={[styles.item, item === currentSpace && { backgroundColor: themeColors.glassBorder }]}
                            onPress={() => {
                                onSelectSpace(item);
                                onClose();
                            }}
                        >
                            <Ionicons
                                name={item === currentSpace ? "home" : "home-outline"}
                                size={24}
                                color={item === currentSpace ? themeColors.text : themeColors.textSecondary}
                            />
                            <Text style={[styles.itemText, { color: themeColors.text }]}>{item}</Text>
                            {item === currentSpace && (
                                <Ionicons name="checkmark" size={24} color="#007AFF" />
                            )}
                        </Pressable>
                    )}
                />
            </GlassView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
    },
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 40,
        maxHeight: '50%',
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: 'rgba(120,120,120,0.3)',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    title: {
        fontFamily: Typography.fontFamily,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 8,
        gap: 12,
    },
    itemText: {
        fontFamily: Typography.fontFamily,
        fontSize: 17,
        flex: 1,
    },
});
