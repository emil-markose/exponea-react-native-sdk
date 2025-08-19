// Patch android/app/src/main/AndroidManifest.xml
const {withAndroidManifest} = require("@expo/config-plugins");

function withExponeaAndroidManifest(config) {
  return withAndroidManifest(config, async (cfg) => {
    if (!cfg.modResults.manifest.application[0].service)
      cfg.modResults.manifest.application[0].service = [];
    cfg.modResults.manifest.application[0].service.push({
      $: {
        "android:name": ".MessageService",
        "android:exported": "false",
      },
      "intent-filter": [
        {
          action: {
            $: {
              "android:name": "com.google.firebase.MESSAGING_EVENT",
            },
          },
        },
      ],
    });
    return cfg;
  });
}

module.exports = withExponeaAndroidManifest;
