import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import MeshGradientBackground from '../../components/MeshGradientBackground';
import HomeHeader from '../../components/HomeHeader';
import SwitchCard from '../../components/SwitchCard';
import AddButton from '../../components/AddButton';
import AddDeviceModal from '../../components/AddDeviceModal';
import SpaceSheet from '../../components/SpaceSheet';
import HistorySheet from '../../components/HistorySheet';
import SortableGrid from '../../components/SortableGrid';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../../context/SettingsContext';
import { TranslationKey } from '../../constants/Translations';

import { AppIcons } from '../../constants/Icons';

interface SwitchDevice {
    id: string;
    name: string;
    nameKey?: string;
    isOn: boolean;
    androidIcon: any;
    iosIcon: any;
    color: string;
    icon?: string; // Legacy support
    lastActor?: string;
    lastActionTime?: string;
    streak?: number;
    recentActors?: string[];
    progress?: number;
}

const INITIAL_SWITCHES: SwitchDevice[] = [
    { id: '1', name: 'Feed Cat', nameKey: 'feed_cat', isOn: false, androidIcon: AppIcons.Devices.Cat.android, iosIcon: AppIcons.Devices.Cat.ios, color: '#FF9500', lastActionTime: '4h ago', streak: 12, recentActors: ['Alice', 'Bob', 'Me'], progress: 0.8 },
    { id: '2', name: 'Take Meds', nameKey: 'take_meds', isOn: true, androidIcon: AppIcons.Devices.Pill.android, iosIcon: AppIcons.Devices.Pill.ios, color: '#34C759', lastActor: 'Alice', lastActionTime: '10:25', streak: 58, recentActors: ['Alice'], progress: 1.0 },
    { id: '3', name: 'Lock Door', nameKey: 'lock_door', isOn: true, androidIcon: AppIcons.Devices.Lock.android, iosIcon: AppIcons.Devices.Lock.ios, color: '#32ADE6', lastActor: 'Jason', lastActionTime: '2h ago', recentActors: ['Jason', 'Alice'], progress: 0 },
    { id: '4', name: 'Turn Off AC', nameKey: 'turn_off_ac', isOn: false, androidIcon: AppIcons.Devices.AC.android, iosIcon: AppIcons.Devices.AC.ios, color: '#5AC8FA', lastActionTime: '1d ago', recentActors: ['Bob'], progress: 0 },
    { id: '5', name: 'Check Fire', nameKey: 'check_fire', isOn: false, androidIcon: AppIcons.Devices.Fire.android, iosIcon: AppIcons.Devices.Fire.ios, color: '#FF3B30', lastActionTime: '2d ago', streak: 3, recentActors: ['Me'], progress: 0.2 },
];

export default function HomeScreen() {
    const insets = useSafeAreaInsets();
    const { t, language } = useSettings();
    const [switches, setSwitches] = useState<SwitchDevice[]>(INITIAL_SWITCHES);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSpaceSheet, setShowSpaceSheet] = useState(false);
    const [showHistorySheet, setShowHistorySheet] = useState(false);
    const [currentSpace, setCurrentSpace] = useState(t('space_name'));

    // Update space name when language changes if it matches the default
    React.useEffect(() => {
        if (currentSpace === '我的家' || currentSpace === 'My Home') {
            setCurrentSpace(t('space_name'));
        }
    }, [language]);

    const toggleSwitch = (id: string) => {
        const now = new Date();
        const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        setSwitches((prev) =>
            prev.map((s) => {
                if (s.id === id) {
                    const newState = !s.isOn;
                    return {
                        ...s,
                        isOn: newState,
                        lastActor: newState ? 'Me' : undefined,
                        lastActionTime: newState ? timeString : 'Just now',
                        streak: newState ? (s.streak || 0) + 1 : s.streak,
                        progress: newState ? 1.0 : 0
                    };
                }
                return s;
            })
        );
    };

    const handleAddDevice = (name: string, icon?: string, color?: string) => {
        // Simple mapping for new devices if icon is provided
        // In a real app, we'd ask for specific icons or map them better
        const newDevice: SwitchDevice = {
            id: Date.now().toString(),
            name,
            isOn: false,
            icon, // Keep legacy for fallback
            androidIcon: (icon || 'power-outline') as any,
            iosIcon: 'power', // Default for new devices
            color: color || '#34C759',
            lastActionTime: 'New',
            progress: 0,
        };
        setSwitches([...switches, newDevice]);
    };

    const handleDeleteDevice = (id: string) => {
        setSwitches((prev) => prev.filter((s) => s.id !== id));
        if (switches.length <= 1) setIsDeleteMode(false);
    };

    return (
        <MeshGradientBackground>
            <Pressable style={{ flex: 1 }} onPress={() => setIsDeleteMode(false)}>
                <HomeHeader
                    spaceName={currentSpace}
                    onSpacePress={() => setShowSpaceSheet(true)}
                    onHistoryPress={() => setShowHistorySheet(true)}
                    onAddPress={() => setShowAddModal(true)}
                />
                <ScrollView
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingTop: insets.top + 80, paddingBottom: 100 },
                    ]}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.grid}>
                        <SortableGrid
                            data={switches}
                            editing={isDeleteMode}
                            onDragEnd={setSwitches}
                            renderItem={(s) => (
                                <SwitchCard
                                    key={s.id}
                                    name={s.nameKey ? t(s.nameKey as any) : s.name}
                                    isOn={s.isOn}
                                    androidIcon={s.androidIcon}
                                    iosIcon={s.iosIcon}
                                    color={s.color}
                                    lastActor={s.lastActor}
                                    lastActionTime={s.lastActionTime}
                                    streak={s.streak}
                                    recentActors={s.recentActors}
                                    progress={s.progress}
                                    isDeleteMode={isDeleteMode}
                                    onToggle={() => toggleSwitch(s.id)}
                                    onLongPress={() => setIsDeleteMode(true)}
                                    onDelete={() => handleDeleteDevice(s.id)}
                                />
                            )}
                        />
                    </View>
                </ScrollView>
            </Pressable>

            <AddDeviceModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={handleAddDevice}
            />

            <SpaceSheet
                visible={showSpaceSheet}
                onClose={() => setShowSpaceSheet(false)}
                currentSpace={currentSpace}
                onSelectSpace={setCurrentSpace}
            />

            <HistorySheet
                visible={showHistorySheet}
                onClose={() => setShowHistorySheet(false)}
            />
        </MeshGradientBackground>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingHorizontal: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
});
