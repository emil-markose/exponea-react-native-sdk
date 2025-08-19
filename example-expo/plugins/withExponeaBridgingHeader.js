// Patch Bridging-Header
const fs = require("fs-extra");
const path = require("path");
const { withDangerousMod } = require("@expo/config-plugins");

function withExponeaBridgingHeader(config) {
  return withDangerousMod(config, [
    "ios",
    (cfg) => {
      const iosPath = cfg.modRequest.platformProjectRoot;
      const projectName = cfg.name || cfg.ios?.bundleIdentifier || "App";
      const bridgingHeader = path.join(
        iosPath,
        projectName,
        `${projectName}-Bridging-Header.h`
      );

      let contents = "";
      if (fs.existsSync(bridgingHeader)) {
        contents = fs.readFileSync(bridgingHeader, "utf8");
      }

      if (!contents.includes("ExponeaRNAppDelegate.h")) {
        contents += `\n#import <ExponeaRNAppDelegate.h>\n#import <UserNotifications/UserNotifications.h>\n`;
        fs.writeFileSync(bridgingHeader, contents, "utf8");
      }

      return cfg;
    },
  ]);
}

module.exports = withExponeaBridgingHeader;
