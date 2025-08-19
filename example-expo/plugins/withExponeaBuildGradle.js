// Patch android/app/build.gradle

const {withAppBuildGradle} = require("@expo/config-plugins");

function withExponeaBuildGradle(config) {
  return withAppBuildGradle(config, async (cfg) => {
    const { modResults } = cfg;
    const { contents } = modResults;
    const lines = contents.split("\n");
    const configIndex = lines.findIndex((line) => /defaultConfig {/.test(line));
    const dependenciesIndex = lines.findIndex((line) =>
      /dependencies {/.test(line)
    );

    modResults.contents = [
      ...lines.slice(0, configIndex + 1),
      "        multiDexEnabled true",
      ...lines.slice(configIndex + 1, dependenciesIndex + 1),
      `    implementation("com.google.firebase:firebase-messaging:24.0.0")`,
      ...lines.slice(dependenciesIndex + 1),
    ].join("\n");

    return cfg;
  });
}

module.exports = withExponeaBuildGradle;
