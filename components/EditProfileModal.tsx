import React, { useState } from 'react';
import { StyleSheet, Text, View, Modal, TextInput, Pressable, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { Typography } from '../constants/Typography';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/Colors';
import GlassView from './GlassView';
import { useSettings } from '../context/SettingsContext';

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
    currentName: string;
    currentAvatar: string;
    onSave: (name: string, avatar: string) => void;
}

const AVATARS = [
    'https://i.pravatar.cc/300?u=jason',
    'https://i.pravatar.cc/300?u=alice',
    'https://i.pravatar.cc/300?u=bob',
    'https://i.pravatar.cc/300?u=charlie',
    'https://i.pravatar.cc/300?u=david',
    'https://i.pravatar.cc/300?u=eve',
    'https://i.pravatar.cc/300?u=frank',
    'https://i.pravatar.cc/300?u=grace',
];

export default function EditProfileModal({ visible, onClose, currentName, currentAvatar, onSave }: EditProfileModalProps) {
    const { t } = useSettings();
    const [name, setName] = useState(currentName);
    const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
    const { resolvedTheme } = useTheme();
    const themeColors = Colors[resolvedTheme];

    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim(), selectedAvatar);
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

                    <View style={styles.avatarContainer}>
                        <Image source={{ uri: selectedAvatar }} style={styles.avatar} />
                    </View>

                    <Text style={[styles.label, { color: themeColors.textSecondary }]}>{t('select_icon')}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.avatarSelector}>
                        {AVATARS.map((avatar) => (
                            <Pressable
                                key={avatar}
                                onPress={() => setSelectedAvatar(avatar)}
                                style={[
                                    styles.avatarOption,
                                    selectedAvatar === avatar && { borderWidth: 2, borderColor: themeColors.text }
                                ]}
                            >
                                <Image source={{ uri: avatar }} style={styles.avatarOptionImage} />
                            </Pressable>
                        ))}
                    </ScrollView>

                    <TextInput
                        style={[styles.input, { color: themeColors.text, borderColor: themeColors.glassBorder, backgroundColor: 'rgba(120,120,120,0.1)' }]}
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
        marginBottom: 24,
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    label: {
        fontFamily: Typography.fontFamily,
        fontSize: 13,
        marginBottom: 8,
        alignSelf: 'flex-start',
        marginLeft: 4,
    },
    avatarSelector: {
        flexDirection: 'row',
        marginBottom: 24,
        maxHeight: 60,
        width: '100%',
    },
    avatarOption: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
        overflow: 'hidden',
    },
    avatarOptionImage: {
        width: '100%',
        height: '100%',
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
