import React from 'react';
import { StyleSheet, Text, View, Image, Dimensions } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withRepeat,
    withTiming,
    useSharedValue,
    withSequence,
} from 'react-native-reanimated';
import { Typography } from '../constants/Typography';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/Colors';
import GlassView from './GlassView';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // Match SwitchCard width

interface Member {
    id: string;
    name: string;
    avatarUrl: string;
    isOnline: boolean;
    statusText?: string;
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

const MemberCard = ({ member, index }: { member: Member, index: number }) => {
    const { resolvedTheme } = useTheme();
    const themeColors = Colors[resolvedTheme];
    const opacity = useSharedValue(0.4);

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
        <GlassView intensity={20} style={[styles.card, { borderColor: themeColors.glassBorder }]}>
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Image source={avatarSource} style={[styles.avatar, { borderColor: themeColors.text }]} />
                    {member.isOnline && (
                        <Animated.View style={[styles.onlineDot, animatedStyle, { borderColor: themeColors.cardBackground }]} />
                    )}
                </View>
                <View style={styles.info}>
                    <Text style={[styles.name, { color: themeColors.text }]} numberOfLines={1}>{member.name}</Text>
                    <Text style={[styles.status, { color: member.isOnline ? '#34C759' : themeColors.textSecondary }]} numberOfLines={1}>
                        {member.statusText || (member.isOnline ? 'Active now' : 'Away')}
                    </Text>
                </View>
            </View>
        </GlassView>
    );
};

export default function MemberGrid({ members }: MemberGridProps) {
    return (
        <View style={styles.grid}>
            {members.map((member, index) => (
                <View key={member.id} style={styles.itemContainer}>
                    <MemberCard member={member} index={index} />
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    itemContainer: {
        width: CARD_WIDTH,
        marginBottom: 16,
    },
    card: {
        borderRadius: 24,
        padding: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
    },
    onlineDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#34C759',
        borderWidth: 2,
    },
    info: {
        flex: 1,
    },
    name: {
        fontFamily: Typography.fontFamily,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    status: {
        fontFamily: Typography.fontFamily,
        fontSize: 12,
        fontWeight: '500',
    },
});
