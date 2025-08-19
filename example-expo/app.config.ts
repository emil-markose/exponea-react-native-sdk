import {ExpoConfig, ConfigContext} from '@expo/config';

export default ({config}: ConfigContext): ExpoConfig => ({
    ...config,
    name: 'BloomReachPoC',
    slug: 'BloomReachPoC',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'bloomreach',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
        image: './assets/images/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
    },
    ios: {
        supportsTablet: true,
        bundleIdentifier: 'com.productmadness.CoreTech',
        googleServicesFile: './GoogleService-Info.plist',
    },
    android: {
        adaptiveIcon: {
            foregroundImage: './assets/images/adaptive-icon.png',
            backgroundColor: '#ffffff',
        },
        edgeToEdgeEnabled: true,
        package: 'com.productmadness.CoreTech',
        googleServicesFile: './google-services.json',
    },
    web: {
        bundler: 'metro',
        output: 'static',
        favicon: './assets/images/favicon.png',
    },
    plugins: [
        './plugins/withExponea',
        'expo-router',
        [
            'expo-splash-screen',
            {
                image: './assets/images/splash-icon.png',
                imageWidth: 200,
                resizeMode: 'contain',
                backgroundColor: '#ffffff',
            },
        ],
        [
            'expo-build-properties',
            {
                android: {
                    useLegacyPackaging: true,
                },
            },
        ],
    ],
    experiments: {
        typedRoutes: true,
    },
});
