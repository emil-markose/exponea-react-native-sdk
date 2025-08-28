#!/usr/bin/env node
const {execSync} = require("child_process");
const path = require("path");

const projectDir = path.resolve(__dirname, '..');
const androidDir = path.join(projectDir, "android")

function prebuild() {
  console.log("Prebuild...");
  try {
    execSync(
      `CI=1 npx expo prebuild --clean --platform android`,
      {stdio: "inherit"}
    );
  } catch (err) {
    console.error("Failed to prebuild", err.message);
    process.exit(1);
  }
}

function bundleJs() {
  const entryFile = path.join(projectDir, "index.js");
  try {
    console.log("Generating Android bundle...");

    console.log("--entry-file: " + entryFile);
    console.log("--bundle-output: " + androidDir);

    execSync(
      `npx react-native bundle \
      --platform android \
      --dev false \
      --entry-file index.js \
      --bundle-output ${androidDir}/app/src/main/assets/index.android.bundle \
      --assets-dest ${androidDir}/app/src/main/res/`,
      {stdio: "inherit"}
    );

    console.log("Android bundle generated successfully.");
  } catch (err) {
    console.error("Failed to generate Android bundle:", err.message);
    process.exit(1);
  }
}

function assembleBuild() {
  console.log("Building android...");
  try {
    execSync(
      `cd android && ./gradlew assembleDebug`,
      {
        stdio: "inherit"
      }
    );
  } catch (err) {
    console.error("Failed to build android", err.message);
    process.exit(1);
  }
}

function installApk() {
  console.log("Installing apk...");
  try {
    execSync(
      `adb install android/app/build/outputs/apk/debug/app-debug.apk`,
      {
        stdio: "inherit"
      }
    );
  } catch (err) {
    console.error("Failed to install apk", err.message);
    process.exit(1);
  }
}

function main() {
  prebuild();
  bundleJs();
  assembleBuild()
  installApk()
}

main();
