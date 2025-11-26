export const Translations = {
    zh: {
        // Tabs
        tab_home: '首页',
        tab_user: '用户',
        tab_settings: '设置',

        // Home
        space_name: '我的家',
        switch_on: '已完成',
        switch_off: '等待锁门',
        add_device_title: '新建开关',
        add_device_placeholder: '输入设备名称 (如: 卧室灯)',
        add_device_cancel: '取消',
        add_device_confirm: '添加',
        switch_space: '切换空间',
        history_title: '历史记录',

        // User
        my_space: '我的空间',
        family_members: '家庭成员',
        invite_family: '邀请家人',
        invite_code: '邀请码',
        invite_desc: '让家人扫描二维码或输入邀请码加入',
        close: '关闭',
        edit_profile: '编辑资料',
        save: '保存',
        enter_nickname: '输入昵称',

        // Settings
        settings_title: '设置',
        appearance_language: '外观与语言',
        account_management: '账户管理',
        haptics: '震动反馈',
        notifications: '推送通知',
        logout: '退出登录',
        theme_light: '浅色',
        theme_dark: '深色',
        theme_auto: '自动',

        // Devices
        device_living_room_light: '客厅顶灯',
        device_bedroom_ac: '卧室空调',
        device_air_purifier: '空气净化器',
        device_entryway_light: '玄关灯',
        device_water_heater: '热水器',

        // Customization
        select_icon: '选择图标',
        select_color: '选择颜色',
        preview: '预览',
        waiting: '等待中',
        last_time: '上次',
    },
    en: {
        // Tabs
        tab_home: 'Home',
        tab_user: 'User',
        tab_settings: 'Settings',

        // Home
        space_name: 'My Home',
        switch_on: 'ON',
        switch_off: 'OFF',
        add_device_title: 'New Switch',
        add_device_placeholder: 'Device Name (e.g. Bedroom Light)',
        add_device_cancel: 'Cancel',
        add_device_confirm: 'Add',
        switch_space: 'Switch Space',
        history_title: 'History',

        // User
        my_space: 'My Space',
        family_members: 'Family Members',
        invite_family: 'Invite Family',
        invite_code: 'Invite Code',
        invite_desc: 'Scan QR code or enter code to join',
        close: 'Close',
        edit_profile: 'Edit Profile',
        save: 'Save',
        enter_nickname: 'Enter Nickname',

        // Settings
        settings_title: 'Settings',
        appearance_language: 'Appearance & Language',
        account_management: 'Account',
        haptics: 'Haptics',
        notifications: 'Notifications',
        logout: 'Log Out',
        theme_light: 'Light',
        theme_dark: 'Dark',
        theme_auto: 'Auto',

        // Devices
        device_living_room_light: 'Living Room Light',
        device_bedroom_ac: 'Bedroom AC',
        device_air_purifier: 'Air Purifier',
        device_entryway_light: 'Entryway Light',
        device_water_heater: 'Water Heater',

        // Customization
        select_icon: 'Select Icon',
        select_color: 'Select Color',
        preview: 'Preview',
        waiting: 'Waiting',
        last_time: 'Last',
    },
};

export type TranslationKey = keyof typeof Translations.zh;
