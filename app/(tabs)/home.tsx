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

interface SwitchDevice {
    id: string;
    name: string;
    nameKey?: TranslationKey;
    isOn: boolean;
    icon?: string;
    color?: string;
}

const INITIAL_SWITCHES: SwitchDevice[] = [
    { id: '1', name: '客厅顶灯', nameKey: 'device_living_room_light', isOn: false, icon: 'bulb-outline', color: '#FFCC00' },
    { id: '2', name: '卧室空调', nameKey: 'device_bedroom_ac', isOn: true, icon: 'snow-outline', color: '#5AC8FA' },
    { id: '3', name: '空气净化器', nameKey: 'device_air_purifier', isOn: false, icon: 'leaf-outline', color: '#4CD964' },
    { id: '4', name: '玄关灯', nameKey: 'device_entryway_light', isOn: false, icon: 'bulb-outline', color: '#FF9500' },
    { id: '5', name: '热水器', nameKey: 'device_water_heater', isOn: true, icon: 'water-outline', color: '#FF3B30' },
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
        setSwitches((prev) =>
            prev.map((s) => (s.id === id ? { ...s, isOn: !s.isOn } : s))
        );
    };

    const handleAddDevice = (name: string, icon?: string, color?: string) => {
        const newDevice: SwitchDevice = {
            id: Date.now().toString(),
            name,
            isOn: false,
            icon,
            color,
        };
        setSwitches([...switches, newDevice]);
    };

    const handleDeleteDevice = (id: string) => {
        setSwitches((prev) => prev.filter((s) => s.id !== id));
        if (switches.length <= 1) setIsDeleteMode(false); // Exit delete mode if empty
    };

    return (
        <MeshGradientBackground>
            <Pressable style={{ flex: 1 }} onPress={() => setIsDeleteMode(false)}>
                <HomeHeader
                    spaceName={currentSpace}
                    onSpacePress={() => setShowSpaceSheet(true)}
                    onHistoryPress={() => setShowHistorySheet(true)}
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
                                    name={s.nameKey ? t(s.nameKey) : s.name}
                                    isOn={s.isOn}
                                    icon={s.icon}
                                    color={s.color}
                                    isDeleteMode={isDeleteMode}
                                    onToggle={() => toggleSwitch(s.id)}
                                    onLongPress={() => setIsDeleteMode(true)}
                                    onDelete={() => handleDeleteDevice(s.id)}
                                />
                            )}
                        />
                        <AddButton onPress={() => setShowAddModal(true)} />
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
