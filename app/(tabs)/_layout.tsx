import { Tabs } from 'expo-router';
import { View } from 'react-native';
import CustomTabBar from '../../components/CustomTabBar';

export default function TabLayout() {
    return (
        <Tabs
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{ headerShown: false, tabBarStyle: { position: 'absolute' } }}
        >
            <Tabs.Screen name="home" />
            <Tabs.Screen name="user" />
            <Tabs.Screen name="settings" />
        </Tabs>
    );
}
