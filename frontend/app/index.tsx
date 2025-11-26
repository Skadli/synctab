import { Redirect } from 'expo-router';
import { useSettings } from '../context/SettingsContext';

export default function Index() {
    const { isAuthenticated } = useSettings();
    return <Redirect href={isAuthenticated ? "/(tabs)/home" : "/login"} />;
}
