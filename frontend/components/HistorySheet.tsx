import React from 'react';
import { StyleSheet, Text, View, Modal, Pressable, FlatList, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { Typography } from '../constants/Typography';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/Colors';
import GlassView from './GlassView';

interface HistorySheetProps {
    visible: boolean;
    onClose: () => void;
}

const HISTORY_DATA = [
    { id: '1', user: '张三', action: '打开了 客厅顶灯', time: '10:23' },
    { id: '2', user: '李四', action: '关闭了 卧室空调', time: '09:45' },
    { id: '3', user: '王五', action: '打开了 热水器', time: '08:30' },
    { id: '4', user: '张三', action: '关闭了 玄关灯', time: '昨天 23:15' },
];

export default function HistorySheet({ visible, onClose }: HistorySheetProps) {
    const { resolvedTheme } = useTheme();
    const themeColors = Colors[resolvedTheme];

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable style={styles.overlay} onPress={onClose}>
                <BlurView intensity={10} style={StyleSheet.absoluteFill} />
            </Pressable>

            <GlassView intensity={80} style={[styles.sheet, { backgroundColor: themeColors.cardBackground }]}>
                <View style={styles.handle} />
                <Text style={[styles.title, { color: themeColors.text }]}>历史记录</Text>

                <FlatList
                    data={HISTORY_DATA}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={[styles.item, { borderBottomColor: themeColors.glassBorder }]}>
                            <View style={[styles.avatar, { backgroundColor: themeColors.glassBorder }]} />
                            <View style={styles.info}>
                                <Text style={[styles.action, { color: themeColors.text }]}>
                                    <Text style={{ fontWeight: 'bold' }}>{item.user}</Text> {item.action}
                                </Text>
                                <Text style={[styles.time, { color: themeColors.textSecondary }]}>{item.time}</Text>
                            </View>
                        </View>
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
        height: '60%',
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
        marginBottom: 24,
        textAlign: 'center',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    info: {
        flex: 1,
    },
    action: {
        fontFamily: Typography.fontFamily,
        fontSize: 15,
        marginBottom: 4,
    },
    time: {
        fontFamily: Typography.fontFamily,
        fontSize: 12,
    },
});
