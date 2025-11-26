import React, { useState } from 'react';
import { StyleSheet, Text, View, Modal, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { Typography } from '../constants/Typography';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/Colors';
import GlassView from './GlassView';
import { useSettings } from '../context/SettingsContext';
import ThemedIcon from './ThemedIcon';
import { AppIcons } from '../constants/Icons';

interface AddDeviceModalProps {
    visible: boolean;
    onClose: () => void;
    onAdd: (name: string, icon: string, color: string) => void;
}

// Map icons to presets where possible, or keep as strings if they are custom
const ICONS = [
    { id: 'light', ios: AppIcons.Devices.Light.ios, android: AppIcons.Devices.Light.android },
    { id: 'ac', ios: AppIcons.Devices.AC.ios, android: AppIcons.Devices.AC.android },
    { id: 'purifier', ios: AppIcons.Devices.AirPurifier.ios, android: AppIcons.Devices.AirPurifier.android },
    { id: 'water', ios: AppIcons.Devices.WaterHeater.ios, android: AppIcons.Devices.WaterHeater.android },
    { id: 'tv', ios: 'tv', android: 'tv-outline' },
    { id: 'game', ios: 'gamecontroller', android: 'game-controller-outline' },
    { id: 'lock', ios: 'lock', android: 'lock-closed-outline' },
    { id: 'wifi', ios: 'wifi', android: 'wifi-outline' },
    { id: 'bed', ios: 'bed.double', android: 'bed-outline' },
    { id: 'desktop', ios: 'desktopcomputer', android: 'desktop-outline' },
];

export default function AddDeviceModal({ visible, onClose, onAdd }: AddDeviceModalProps) {
    const { t } = useSettings();
    const { resolvedTheme } = useTheme();
    const themeColors = Colors[resolvedTheme];

    const [name, setName] = useState('');
    const [selectedIconIdx, setSelectedIconIdx] = useState(0);
    const [selectedColor, setSelectedColor] = useState(Colors.palette[0]);

    const handleAdd = () => {
        if (name.trim()) {
            // For now passing the android name as the "icon" string for backward compatibility if needed,
            // but ideally we should pass the full preset or IDs.
            // The home screen logic handles the icon mapping.
            const iconObj = ICONS[selectedIconIdx];
            onAdd(name.trim(), iconObj.android, selectedColor);
            setName('');
            setSelectedIconIdx(0);
            setSelectedColor(Colors.palette[0]);
            onClose();
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
                    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                </Pressable>

                <GlassView intensity={60} style={[styles.modalContent, { borderColor: themeColors.glassBorder, backgroundColor: themeColors.cardBackground }]}>
                    <Text style={[styles.title, { color: themeColors.text }]}>{t('add_device_title')}</Text>

                    <TextInput
                        style={[styles.input, { color: themeColors.text, borderColor: themeColors.glassBorder, backgroundColor: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
                        placeholder={t('add_device_placeholder')}
                        placeholderTextColor={themeColors.textSecondary}
                        value={name}
                        onChangeText={setName}
                    />

                    <Text style={[styles.label, { color: themeColors.textSecondary }]}>{t('select_icon')}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorContainer}>
                        {ICONS.map((icon, index) => (
                            <Pressable
                                key={icon.id}
                                onPress={() => setSelectedIconIdx(index)}
                                style={[
                                    styles.iconOption,
                                    selectedIconIdx === index && { backgroundColor: themeColors.activeBackground, borderColor: themeColors.text }
                                ]}
                            >
                                <ThemedIcon
                                    iosName={icon.ios}
                                    androidName={icon.android as any}
                                    size={24}
                                    color={selectedIconIdx === index ? themeColors.text : themeColors.textSecondary}
                                />
                            </Pressable>
                        ))}
                    </ScrollView>

                    <Text style={[styles.label, { color: themeColors.textSecondary }]}>{t('select_color')}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorContainer}>
                        {Colors.palette.map((color) => (
                            <Pressable
                                key={color}
                                onPress={() => setSelectedColor(color)}
                                style={[
                                    styles.colorOption,
                                    { backgroundColor: color },
                                    selectedColor === color && { borderWidth: 2, borderColor: themeColors.text, transform: [{ scale: 1.1 }] }
                                ]}
                            />
                        ))}
                    </ScrollView>

                    <View style={styles.actions}>
                        <Pressable onPress={onClose} style={styles.button}>
                            <Text style={[styles.buttonText, { color: themeColors.textSecondary }]}>{t('add_device_cancel')}</Text>
                        </Pressable>
                        <Pressable onPress={handleAdd} style={[styles.button, styles.addButton, { backgroundColor: selectedColor }]}>
                            <Text style={[styles.buttonText, { color: '#FFF' }]}>{t('add_device_confirm')}</Text>
                        </Pressable>
                    </View>
                </GlassView>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: '100%',
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        overflow: 'hidden',
    },
    title: {
        fontFamily: Typography.fontFamily,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    input: {
        fontFamily: Typography.fontFamily,
        fontSize: 16,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 24,
    },
    label: {
        fontFamily: Typography.fontFamily,
        fontSize: 13,
        marginBottom: 12,
        marginLeft: 4,
    },
    selectorContainer: {
        flexDirection: 'row',
        marginBottom: 24,
        maxHeight: 60,
    },
    iconOption: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    colorOption: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 12,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
        marginTop: 8,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 16,
    },
    addButton: {
        // backgroundColor set dynamically
    },
    buttonText: {
        fontFamily: Typography.fontFamily,
        fontSize: 16,
        fontWeight: '600',
    },
});
