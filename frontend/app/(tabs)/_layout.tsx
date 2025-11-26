import { NativeTabs, Icon, Label, VectorIcon } from 'expo-router/unstable-native-tabs';
import { Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppIcons } from '../../constants/Icons';

// ...

export default function TabLayout() {
    return (
        <NativeTabs
            style={{
                position: 'absolute',
                borderTopWidth: 0,
                elevation: 0,
            }}
            blurEffect="systemThinMaterial"
        >
            <NativeTabs.Trigger name="home">
                <Label>Home</Label>
                {Platform.select({
                    ios: <Icon sf={{ default: AppIcons.Tabs.Home.default.ios, selected: AppIcons.Tabs.Home.selected.ios }} />,
                    android: <Icon src={{ default: <VectorIcon family={Ionicons} name={AppIcons.Tabs.Home.default.android} />, selected: <VectorIcon family={Ionicons} name={AppIcons.Tabs.Home.selected.android} /> }} />,
                })}
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="user">
                <Label>User</Label>
                {Platform.select({
                    ios: <Icon sf={{ default: AppIcons.Tabs.User.default.ios, selected: AppIcons.Tabs.User.selected.ios }} />,
                    android: <Icon src={{ default: <VectorIcon family={Ionicons} name={AppIcons.Tabs.User.default.android} />, selected: <VectorIcon family={Ionicons} name={AppIcons.Tabs.User.selected.android} /> }} />,
                })}
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="settings">
                <Label>Settings</Label>
                {Platform.select({
                    ios: <Icon sf={{ default: AppIcons.Tabs.Settings.default.ios, selected: AppIcons.Tabs.Settings.selected.ios }} />,
                    android: <Icon src={{ default: <VectorIcon family={Ionicons} name={AppIcons.Tabs.Settings.default.android} />, selected: <VectorIcon family={Ionicons} name={AppIcons.Tabs.Settings.selected.android} /> }} />,
                })}
            </NativeTabs.Trigger>
        </NativeTabs>
    );
}
