#!/usr/bin/env node
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs-extra");

const projectDir = path.resolve(__dirname, '..');
const iosDir =  path.join(projectDir, "ios")
const pbxprojPath = path.join(
  iosDir,
  "BloomReachPoC.xcodeproj/project.pbxproj" 
);

function gitClean() {
  console.log("Cleaning entire repo...");
  try {
    execSync(
      `git clean -dfx`,
      {stdio: "inherit"}
    );
  } catch (err) {
    console.error("Cleaning failed", err.message);
    process.exit(1);
  }
}
function sdkBuild() {
  console.log("Building SDK...");
  try {
    execSync(
      ``,
      {stdio: "inherit"}
    );
  } catch (err) {
    console.error("Failed to build SDK", err.message);
    process.exit(1);
  }
}
function prebuild() {
  console.log("Prebuild...");
  try {
    execSync(
      `CI=1 npx expo prebuild --clean`,
      {stdio: "inherit"}
    );
  } catch (err) {
    console.error("Failed to prebuild", err.message);
    process.exit(1);
  }
}

function runBundle() {
  const entryFile =  path.join(projectDir, "index.js");
  try {
    console.log("Generating iOS bundle...");

    console.log("--entry-file: " + entryFile);
    console.log("--bundle-output: " + iosDir);

    execSync(
      `npx react-native bundle \
      --platform ios \
      --dev false \
      --entry-file ${entryFile} \
      --bundle-output ${iosDir}/main.jsbundle \
      --assets-dest ${iosDir}`,
      { stdio: "inherit" }
    );

    console.log("iOS bundle generated successfully.");
  } catch (err) {
    console.error("Failed to generate iOS bundle:", err.message);
    process.exit(1);
  }
}


function main() {
  prebuild();
  runBundle();
}

main();
