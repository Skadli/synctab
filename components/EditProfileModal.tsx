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

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
    currentName: string;
    currentIcon?: { ios: string; android: any };
    onSave: (name: string, icon: { ios: string; android: any }) => void;
}

const AVATAR_ICONS = [
    { id: 'user', ios: 'person.crop.circle', android: 'person-circle-outline' },
    { id: 'smile', ios: 'face.smiling', android: 'happy-outline' },
    { id: 'star', ios: 'star.circle', android: 'star-outline' },
    { id: 'heart', ios: 'heart.circle', android: 'heart-outline' },
    { id: 'bolt', ios: 'bolt.circle', android: 'flash-outline' },
    { id: 'leaf', ios: 'leaf.circle', android: 'leaf-outline' },
];

export default function EditProfileModal({ visible, onClose, currentName, currentIcon, onSave }: EditProfileModalProps) {
    const { t } = useSettings();
    const [name, setName] = useState(currentName);
    const [selectedIconIdx, setSelectedIconIdx] = useState(0);
    const { resolvedTheme } = useTheme();
    const themeColors = Colors[resolvedTheme];

    // Initialize selected icon based on currentIcon if possible, otherwise default to 0
    React.useEffect(() => {
        if (currentIcon) {
            const idx = AVATAR_ICONS.findIndex(icon => icon.ios === currentIcon.ios);
            if (idx !== -1) setSelectedIconIdx(idx);
        }
    }, [currentIcon]);

    const handleSave = () => {
        if (name.trim()) {
            const iconObj = AVATAR_ICONS[selectedIconIdx];
            onSave(name.trim(), { ios: iconObj.ios, android: iconObj.android });
            onClose();
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                <Pressable style={styles.overlay} onPress={onClose}>
                    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                </Pressable>

                <GlassView intensity={60} style={[styles.modalContent, { borderColor: themeColors.glassBorder, backgroundColor: themeColors.cardBackground }]}>
                    <Text style={[styles.title, { color: themeColors.text }]}>{t('edit_profile')}</Text>

                    <View style={[styles.avatarContainer, { borderColor: themeColors.text, backgroundColor: themeColors.cardBackground }]}>
                        <ThemedIcon
                            iosName={AVATAR_ICONS[selectedIconIdx].ios}
                            androidName={AVATAR_ICONS[selectedIconIdx].android as any}
                            size={60}
                            color={themeColors.text}
                        />
                    </View>

                    <Text style={[styles.label, { color: themeColors.textSecondary }]}>{t('select_icon')}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.avatarSelector}>
                        {AVATAR_ICONS.map((icon, index) => (
                            <Pressable
                                key={icon.id}
                                onPress={() => setSelectedIconIdx(index)}
                                style={[
                                    styles.avatarOption,
                                    selectedIconIdx === index && { backgroundColor: themeColors.activeBackground, borderColor: themeColors.text }
                                ]}
                            >
                                <ThemedIcon
                                    iosName={icon.ios}
                                    androidName={icon.android as any}
                                    size={30}
                                    color={selectedIconIdx === index ? themeColors.text : themeColors.textSecondary}
                                />
                            </Pressable>
                        ))}
                    </ScrollView>

                    <TextInput
                        style={[styles.input, { color: themeColors.text, borderColor: themeColors.glassBorder, backgroundColor: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
                        placeholder={t('enter_nickname')}
                        placeholderTextColor={themeColors.textSecondary}
                        value={name}
                        onChangeText={setName}
                    />

                    <View style={styles.actions}>
                        <Pressable onPress={onClose} style={styles.button}>
                            <Text style={[styles.buttonText, { color: themeColors.textSecondary }]}>{t('close')}</Text>
                        </Pressable>
                        <Pressable onPress={handleSave} style={[styles.button, styles.saveButton]}>
                            <Text style={[styles.buttonText, { color: '#FFF' }]}>{t('save')}</Text>
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
        padding: 24,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContent: {
        width: '100%',
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        alignItems: 'center',
    },
    title: {
        fontFamily: Typography.fontFamily,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 2,
    },
    label: {
        fontFamily: Typography.fontFamily,
        fontSize: 13,
        marginBottom: 12,
        alignSelf: 'flex-start',
        marginLeft: 4,
    },
    avatarSelector: {
        flexDirection: 'row',
        marginBottom: 24,
        maxHeight: 70,
        width: '100%',
    },
    avatarOption: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    input: {
        fontFamily: Typography.fontFamily,
        fontSize: 16,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 24,
        width: '100%',
        textAlign: 'center',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 16,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 16,
    },
    saveButton: {
        backgroundColor: '#007AFF',
    },
    buttonText: {
        fontFamily: Typography.fontFamily,
        fontSize: 16,
        fontWeight: '600',
    },
});
