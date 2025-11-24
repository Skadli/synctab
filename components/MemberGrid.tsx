import React from 'react';
import { StyleSheet, Text, View, Image, Dimensions } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withRepeat,
    withTiming,
    useSharedValue,
    withSequence,
} from 'react-native-reanimated';
import GlassView from './GlassView';
import { Typography } from '../constants/Typography';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 32 - 32) / 3; // 3 columns, padding 16*2, gap 16

interface Member {
    id: string;
    name: string;
    avatarUrl: string;
    isOnline: boolean;
}

interface MemberGridProps {
    members: Member[];
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

const MemberBubble = ({ member, index }: { member: Member, index: number }) => {
    const { resolvedTheme } = useTheme();
    const themeColors = Colors[resolvedTheme];
    const opacity = useSharedValue(0.4);

    // Use preset avatar if the URL matches a pattern or if we want to enforce presets
    // For now, let's just use the index to pick a preset if the URL seems generic or if we want to show off the presets
    const avatarSource = { uri: AVATARS[index % AVATARS.length] };

    React.useEffect(() => {
        if (member.isOnline) {
            opacity.value = withRepeat(
                withSequence(withTiming(1, { duration: 1000 }), withTiming(0.4, { duration: 1000 })),
                -1,
                true
            );
        }
    }, [member.isOnline]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <View style={styles.itemContainer}>
            <View style={styles.avatarContainer}>
                <Image source={avatarSource} style={[styles.avatar, { borderColor: themeColors.text }, !member.isOnline && { opacity: 0.5, borderColor: themeColors.textSecondary }]} />
                {member.isOnline && (
                    <Animated.View style={[styles.onlineDot, animatedStyle, { borderColor: themeColors.cardBackground }]} />
                )}
            </View>
            <Text style={[styles.name, { color: themeColors.text }]} numberOfLines={1}>{member.name}</Text>
        </View>
    );
};

export default function MemberGrid({ members }: MemberGridProps) {
    return (
        <View style={styles.grid}>
            {members.map((member, index) => (
                <MemberBubble key={member.id} member={member} index={index} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    itemContainer: {
        width: ITEM_WIDTH,
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 8,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
    },
    onlineDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#00E676', // Bright Green
        borderWidth: 2,
    },
    name: {
        fontFamily: Typography.fontFamily,
        fontSize: 14,
        textAlign: 'center',
    },
});
