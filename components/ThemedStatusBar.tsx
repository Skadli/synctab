import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';

export default function ThemedStatusBar() {
    const { resolvedTheme } = useTheme();

    return (
        <StatusBar
            style={resolvedTheme === 'dark' ? 'light' : 'dark'}
            backgroundColor="transparent"
            translucent
        />
    );
}
