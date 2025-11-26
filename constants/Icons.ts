import { Ionicons } from '@expo/vector-icons';
import { SymbolViewProps } from 'expo-symbols';

export interface IconPreset {
    ios: SymbolViewProps['name'];
    android: keyof typeof Ionicons.glyphMap;
}

export const AppIcons = {
    Tabs: {
        Home: {
            default: { ios: 'house', android: 'home-outline' } as IconPreset,
            selected: { ios: 'house.fill', android: 'home' } as IconPreset,
        },
        User: {
            default: { ios: 'person', android: 'person-outline' } as IconPreset,
            selected: { ios: 'person.fill', android: 'person' } as IconPreset,
        },
        Settings: {
            default: { ios: 'gear', android: 'settings-outline' } as IconPreset,
            selected: { ios: 'gear', android: 'settings' } as IconPreset,
        },
    },
    Common: {
        Add: { ios: 'plus', android: 'add' } as IconPreset,
        ChevronDown: { ios: 'chevron.down', android: 'chevron-down' } as IconPreset,
        History: { ios: 'clock', android: 'time-outline' } as IconPreset,
        Close: { ios: 'xmark', android: 'close' } as IconPreset,
        Power: { ios: 'power', android: 'power-outline' } as IconPreset,
        User: { ios: 'person.crop.circle', android: 'person-circle-outline' } as IconPreset,
    },
    Devices: {
        Light: { ios: 'lightbulb', android: 'bulb-outline' } as IconPreset,
        AC: { ios: 'snowflake', android: 'snow-outline' } as IconPreset,
        AirPurifier: { ios: 'wind', android: 'leaf-outline' } as IconPreset,
        WaterHeater: { ios: 'drop', android: 'water-outline' } as IconPreset,
        Cat: { ios: 'paw', android: 'paw-outline' } as IconPreset,
        Pill: { ios: 'pills', android: 'medkit-outline' } as IconPreset,
        Lock: { ios: 'lock', android: 'lock-closed-outline' } as IconPreset,
        Fire: { ios: 'flame', android: 'flame-outline' } as IconPreset,
    },
    Settings: {
        Appearance: {
            Light: { ios: 'sun.max', android: 'sunny' } as IconPreset,
            Dark: { ios: 'moon', android: 'moon' } as IconPreset,
            Auto: { ios: 'circle.righthalf.filled', android: 'contrast' } as IconPreset,
        },
        Language: {
            Chinese: { ios: 'character.book.closed', android: 'language' } as IconPreset,
            English: { ios: 'textformat.alt', android: 'text' } as IconPreset,
        },
        Haptics: { ios: 'iphone.radiowaves.left.and.right', android: 'phone-portrait-outline' } as IconPreset,
        Notifications: { ios: 'bell', android: 'notifications-outline' } as IconPreset,
    },
};
