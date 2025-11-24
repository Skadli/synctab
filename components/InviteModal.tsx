import React from 'react';
import { StyleSheet, Text, View, Modal, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../constants/Typography';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/Colors';
import GlassView from './GlassView';

interface InviteModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function InviteModal({ visible, onClose }: InviteModalProps) {
    const { resolvedTheme } = useTheme();
    const themeColors = Colors[resolvedTheme];

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.overlay} onPress={onClose}>
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            </Pressable>

            <View style={styles.centeredView}>
                <GlassView intensity={60} style={[styles.modalContent, { borderColor: themeColors.glassBorder, backgroundColor: themeColors.cardBackground }]}>
                    <Text style={[styles.title, { color: themeColors.text }]}>邀请家人</Text>

                    <View style={[styles.qrContainer, { backgroundColor: '#FFF' }]}>
                        <Ionicons name="qr-code" size={150} color="#000" />
                    </View>

                    <Text style={[styles.code, { color: themeColors.text }]}>邀请码: 8848</Text>
                    <Text style={[styles.desc, { color: themeColors.textSecondary }]}>让家人扫描二维码或输入邀请码加入</Text>

                    <Pressable onPress={onClose} style={[styles.button, { backgroundColor: themeColors.glassBorder }]}>
                        <Text style={[styles.buttonText, { color: themeColors.text }]}>关闭</Text>
                    </Pressable>
                </GlassView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
    },
    centeredView: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        pointerEvents: 'box-none',
    },
    modalContent: {
        width: '100%',
        padding: 32,
        borderRadius: 32,
        alignItems: 'center',
        borderWidth: 1,
    },
    title: {
        fontFamily: Typography.fontFamily,
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    qrContainer: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
    },
    code: {
        fontFamily: Typography.fontFamily,
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        letterSpacing: 2,
    },
    desc: {
        fontFamily: Typography.fontFamily,
        fontSize: 14,
        marginBottom: 32,
        textAlign: 'center',
    },
    button: {
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 16,
    },
    buttonText: {
        fontFamily: Typography.fontFamily,
        fontSize: 16,
        fontWeight: '600',
    },
});
