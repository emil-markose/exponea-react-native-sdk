const { withPlugins, withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

function addAndroidBridge(config) {
  return withDangerousMod(config, [
    "android",
    (config) => {
      const packageDir = path.join(
        config.modRequest.platformProjectRoot,
        "app/src/main/java/com/productmadness/CoreTech"
      );
      fs.mkdirSync(packageDir, { recursive: true });

      // Bridge for Push token
      const pushTokenModuleKotlin = `
package com.productmadness.CoreTech

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.firebase.messaging.FirebaseMessaging

class PushTokenModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "PushTokenModule"

    @ReactMethod
    fun getPushToken(promise: Promise) {
        FirebaseMessaging.getInstance().token
            .addOnCompleteListener { task ->
                if (!task.isSuccessful) {
                    promise.reject("TOKEN_ERROR", "Failed to get token", task.exception)
                    return@addOnCompleteListener
                }
                promise.resolve(task.result)
            }
    }
}
      `;
      fs.writeFileSync(path.join(packageDir, "PushTokenModule.kt"), pushTokenModuleKotlin);

      // Register modules
      const pushTokenPackage =
`package com.productmadness.CoreTech

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class PushTokenPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> =
        listOf(PushTokenModule(reactContext))

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> =
        emptyList()
}
      `;
      fs.writeFileSync(path.join(packageDir, "PushTokenPackage.kt"), pushTokenPackage);

      // Add PushTokenPackage in MainApplication
      const mainApplicationPath = path.join(
        packageDir,
        "MainApplication.kt"
      );

      if (fs.existsSync(mainApplicationPath)) {
        console.log(`Patching MainApplication.kt`);
        let mainAppContent = fs.readFileSync(mainApplicationPath, "utf8");

        // Add import if missing
        if (!mainAppContent.includes("PushTokenPackage")) {
          console.log(`Adding PushTokenPackage import`);
          mainAppContent = mainAppContent.replace(
            /(import .*MainApplication)/,
            `$1\nimport com.productmadness.CoreTech.PushTokenPackage`
          );
        }

        // Patch getPackages to add our push token module
        const packageListLine = /val packages = PackageList\(this\)\.packages/;
        if (packageListLine.test(mainAppContent)) {
          mainAppContent = mainAppContent.replace(
            packageListLine,
            "val packages = PackageList(this).packages.toMutableList()\n            packages.add(PushTokenPackage())"
          );
          console.log(`Registered PushTokenPackage module in MainApplication.kt`);
        } else {
          console.warn("Could not find 'PackageList(this).packages' line in MainApplication.kt");
        }

        fs.writeFileSync(mainApplicationPath, mainAppContent, "utf8");
      } else {
        console.warn(`MainApplication.kt not found at ${mainApplicationPath}`);
      }

      return config;
    },
  ]);
}

function addIosBridge(config) {
  return withDangerousMod(config, [
    "ios",
    (config) => {
      const iosSrcDir = path.join(config.modRequest.platformProjectRoot, config.name);
      fs.mkdirSync(iosSrcDir, { recursive: true });

      // Create bridge PushTokenModule.swift
      const pushTokenModuleSwift =
`import Foundation
import React

@objc(PushTokenModule)
class PushTokenModule: NSObject {
    private var resolve: RCTPromiseResolveBlock?
    private var reject: RCTPromiseRejectBlock?
    private var deviceTokenString: String?

    override init() {
        super.init()
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(receiveDeviceTokenNotification(_:)),
            name: .didReceiveDeviceToken,
            object: nil
        )
    }

    @objc
    func getPushToken(_ resolve: @escaping RCTPromiseResolveBlock,
                      rejecter reject: @escaping RCTPromiseRejectBlock) {
        self.resolve = resolve
        self.reject = reject

        if let token = deviceTokenString {
            resolve(token)
        }
    }

    @objc private func receiveDeviceTokenNotification(_ notification: Notification) {
        guard let token = notification.object as? String else { return }
        deviceTokenString = token
        resolve?(token)
    }
}

extension Notification.Name {
    static let didReceiveDeviceToken = Notification.Name("didReceiveDeviceToken")
}
      `;
      fs.writeFileSync(path.join(iosSrcDir, "PushTokenModule.swift"), pushTokenModuleSwift);
      
      // Obj-C bridge for push token module
      const objcBridge =
`#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(PushTokenModule, NSObject)
RCT_EXTERN_METHOD(getPushToken:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
@end
      `;
      fs.writeFileSync(path.join(iosSrcDir, "PushTokenModule.m"), objcBridge);

      return config;
    },
  ]);
}

module.exports = (config) => {
  return withPlugins(config, [addAndroidBridge, addIosBridge]);
};
