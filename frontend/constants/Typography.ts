import { Platform } from 'react-native';

export const Typography = {
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto', default: 'System' }),
    weights: {
        regular: '400',
        bold: '700',
        heavy: '900',
    },
    sizes: {
        title: 34,
        heading: 22,
        body: 17,
        caption: 13,
    },
};
