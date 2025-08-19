// Patch AppDelegate.h

const fs = require('fs-extra');
const { withDangerousMod} = require("@expo/config-plugins");
function withExponeaIosAppDelegateH(config) {
  return withDangerousMod(config, [
    "ios",
    (cfg) => {
      const iosProjRoot = cfg.modRequest.platformProjectRoot;
      const projectName = cfg.name;
      fs.writeFileSync(
        `${iosProjRoot}/${projectName}/AppDelegate.h`,
        `#import <RCTAppDelegate.h>
#import <UIKit/UIKit.h>
#import <Expo/Expo.h>
#import <UserNotifications/UNUserNotificationCenter.h>

@interface AppDelegate : EXAppDelegateWrapper <UNUserNotificationCenterDelegate>

@end
`
      );
      return cfg;
    },
  ]);
}

module.exports = withExponeaIosAppDelegateH;
