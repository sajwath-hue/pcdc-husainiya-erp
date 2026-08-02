const { withProjectBuildGradle } = require('@expo/config-plugins');

// React Native 0.86's default NDK (27.1.12297006) has a libc++ linking
// regression that breaks autolinked native modules with codegen (e.g.
// react-native-safe-area-context) with "undefined symbol: ios_base::getloc"
// and similar errors. Pin to the last known-good NDK until RN ships a fix.
const NDK_VERSION = '26.1.10909125';

module.exports = function withAndroidNdkVersion(config) {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      const marker = `ext {\n  ndkVersion = "${NDK_VERSION}"\n}\n\n`;
      if (!config.modResults.contents.includes(marker)) {
        config.modResults.contents = config.modResults.contents.replace(
          'apply plugin: "expo-root-project"',
          `${marker}apply plugin: "expo-root-project"`
        );
      }
    }
    return config;
  });
};
