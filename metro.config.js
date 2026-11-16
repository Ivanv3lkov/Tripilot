const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');

const config = withNativewind(getDefaultConfig(__dirname), { inlineRem: 16 });

// react-native-css replaces `react-native` with a wrapper that does not export
// AssetRegistry, which expo-asset needs. Give expo-asset the real module.
const nativewindResolveRequest = config.resolver.resolveRequest;
const expoAssetDir = `${path.sep}node_modules${path.sep}expo-asset${path.sep}`;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === 'react-native' &&
    context.originModulePath.includes(expoAssetDir)
  ) {
    return context.resolveRequest(context, moduleName, platform);
  }
  return nativewindResolveRequest(context, moduleName, platform);
};

module.exports = config;
