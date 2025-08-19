/* eslint-disable @typescript-eslint/no-var-requires */
const {
  withPlugins,
  withExponeaBuildGradle = require("./withExponeaBuildGradle"),
  withExponeaAndroidMessageService = require("./withExponeaAndroidMessageService"),
  withExponeaBridgingHeader = require("./withExponeaBridgingHeader"),
  withExponeaAppDelegate = require("./withExponeaAppDelegate"),
  withExponeaIosAppDelegateH = require("./withExponeaIosAppDelegateH"),
  withExponeaAndroidManifest = require("./withExponeaAndroidManifest"),
  withCustomDebugKeystore = require("./withCustomDebugKeystore"),
  
} = require("@expo/config-plugins");
function withExponea(config) {
  return withPlugins(config, [
    withExponeaBuildGradle,
    withExponeaAndroidManifest,
    withExponeaBridgingHeader,
    withExponeaAppDelegate,
    withExponeaAndroidMessageService,
    withExponeaIosAppDelegateH,
    withCustomDebugKeystore,
  ]);
}

module.exports = withExponea;
