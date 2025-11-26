import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import MeshGradientBackground from '../../components/MeshGradientBackground';
import HeroProfileCard from '../../components/HeroProfileCard';
import MemberGrid from '../../components/MemberGrid';
import InviteCard from '../../components/InviteCard';
import InviteModal from '../../components/InviteModal';
import EditProfileModal from '../../components/EditProfileModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '../../constants/Typography';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../constants/Colors';
import { useSettings } from '../../context/SettingsContext';

import { AppIcons } from '../../constants/Icons';

const INITIAL_USER = {
    name: 'Jason',
    userId: '882910',
    avatarIcon: AppIcons.Common.User,
    contributionCount: 12,
};

const MOCK_MEMBERS = [
    { id: '1', name: 'Alice', avatarUrl: 'https://i.pravatar.cc/300?u=alice', isOnline: true, statusText: 'Home • 3 actions' },
    { id: '2', name: 'Bob', avatarUrl: 'https://i.pravatar.cc/300?u=bob', isOnline: false, statusText: 'Work • Last seen 2h ago' },
    { id: '3', name: 'Charlie', avatarUrl: 'https://i.pravatar.cc/300?u=charlie', isOnline: true, statusText: 'Home • Active' },
];

export default function UserScreen() {
    const insets = useSafeAreaInsets();
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [user, setUser] = useState(INITIAL_USER);
    const { t } = useSettings();
    const { resolvedTheme } = useTheme();
    const themeColors = Colors[resolvedTheme];

    const handleUpdateProfile = (newName: string, newAvatarIcon: { ios: string; android: any }) => {
        setUser(prev => ({ ...prev, name: newName, avatarIcon: newAvatarIcon as any }));
    };

    return (
        <MeshGradientBackground>
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <Text style={[styles.headerTitle, { color: themeColors.headerText }]}>{t('my_space')}</Text>
            </View>
            <ScrollView
                contentContainerStyle={[styles.content, { paddingBottom: 100 }]}
                showsVerticalScrollIndicator={false}
            >
                <HeroProfileCard
                    name={user.name}
                    userId={user.userId}
                    avatarIcon={user.avatarIcon}
                    contributionCount={user.contributionCount}
                    onPress={() => setShowEditProfile(true)}
                />
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>Current Status</Text>
                    <View style={styles.gridContainer}>
                        <MemberGrid members={MOCK_MEMBERS} />
                        <InviteCard onPress={() => setShowInviteModal(true)} />
                    </View>
                </View>
            </ScrollView>

            <InviteModal
                visible={showInviteModal}
                onClose={() => setShowInviteModal(false)}
            />

            <EditProfileModal
                visible={showEditProfile}
                onClose={() => setShowEditProfile(false)}
                currentName={user.name}
                currentIcon={user.avatarIcon}
                onSave={handleUpdateProfile}
            />
        </MeshGradientBackground>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
    headerTitle: {
        fontFamily: Typography.fontFamily,
        fontSize: 34,
        fontWeight: 'bold',
    },
    content: {
        paddingHorizontal: 16,
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontFamily: Typography.fontFamily,
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        marginLeft: 8,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
});
