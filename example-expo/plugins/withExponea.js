/* eslint-disable @typescript-eslint/no-var-requires */
const {
  withPlugins,
  withAppBuildGradle,
  withAndroidManifest,
  withAppDelegate,
  withDangerousMod,
} = require("@expo/config-plugins");
const fs = require('fs-extra');

// Update android/app/build.gradle
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

// Update android/app/src/main/AndroidManifest.xml
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

// Update ios/MyApp/AppDelegate.mm
function withExponeaAppDelegate(config) {
  return withAppDelegate(config, (cfg) => {
    const { modResults } = cfg;
    const { contents } = modResults;
    const lines = contents.split("\n");

    const importIndex = lines.findIndex((line) =>
      /^#import "AppDelegate.h"/.test(line)
    );
    const didFinishLaunchingIndex = lines.findIndex((line) =>
      /return \[super application:application didFinishLaunchingWithOptions:launchOptions\]/.test(
        line
      )
    );
    const continueUserActivityIndex = lines.findIndex((line) =>
      /return \[super application:application continueUserActivity:userActivity restorationHandler:restorationHandler\]/.test(
        line
      )
    );
    const didRegisterForRemoteNotificationsWithDeviceTokenIndex =
      lines.findIndex((line) =>
        /return \[super application:application didRegisterForRemoteNotificationsWithDeviceToken:deviceToken\]/.test(
          line
        )
      );
    const didReceiveRemoteNotificationIndex = lines.findIndex((line) =>
      /return \[super application:application didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler\]/.test(
        line
      )
    );
    const endIndex = lines.findIndex((line) => /@end/.test(line));

    modResults.contents = [
      ...lines.slice(0, importIndex),
      `#import <ExponeaRNAppDelegate.h>
#import <UserNotifications/UserNotifications.h>`,
      ...lines.slice(importIndex, didFinishLaunchingIndex),
      `  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;`,
      ...lines.slice(didFinishLaunchingIndex, continueUserActivityIndex),
      `  [Exponea continueUserActivity: userActivity];`,
      ...lines.slice(
        continueUserActivityIndex,
        didRegisterForRemoteNotificationsWithDeviceTokenIndex
      ),
      `  [Exponea handlePushNotificationToken: deviceToken];`,
      ...lines.slice(
        didRegisterForRemoteNotificationsWithDeviceTokenIndex,
        didReceiveRemoteNotificationIndex
      ),
      `  [Exponea handlePushNotificationOpenedWithUserInfo:userInfo];`,
      ...lines.slice(didReceiveRemoteNotificationIndex, endIndex),
      `- (void)userNotificationCenter:(UNUserNotificationCenter *)center
    didReceiveNotificationResponse:(UNNotificationResponse *)response
    withCompletionHandler:(void (^)(void))completionHandler
{
  [Exponea handlePushNotificationOpenedWithResponse: response];
  completionHandler();
}`,
      ...lines.slice(endIndex),
    ].join("\n");

    return cfg;
  });
}

// Add the file MessageService.kt
function withExponeaAndroidMessageService(config) {
  return withDangerousMod(config, [
    "android",
    (cfg) => {
      const androidProjRoot = cfg.modRequest.platformProjectRoot;
      const packageName = cfg.android.package;
      const pathToDir = packageName.replaceAll(".", "/");
      fs.mkdirSync(`${androidProjRoot}/app/src/main/java/${pathToDir}`, {
        recursive: true,
      });
      fs.writeFileSync(
        `${androidProjRoot}/app/src/main/java/${pathToDir}/MessageService.kt`,
        `package ${packageName};

import android.app.NotificationManager
import com.exponea.ExponeaModule
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class MessageService : FirebaseMessagingService() {
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        ExponeaModule.Companion.handleRemoteMessage(
            getApplicationContext(),
            remoteMessage.getData(),
            getSystemService(NOTIFICATION_SERVICE) as NotificationManager
        )
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        ExponeaModule.Companion.handleNewToken(
            getApplicationContext(),
            token
        )
    }
}

`
      );
      return cfg;
    },
  ]);
}

// Replace AppDelegate.h
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

function withExponea(config) {
  return withPlugins(config, [
    withExponeaBuildGradle,
    withExponeaAndroidManifest,
    withExponeaAppDelegate,
    withExponeaAndroidMessageService,
    withExponeaIosAppDelegateH,
  ]);
}

module.exports = withExponea;
