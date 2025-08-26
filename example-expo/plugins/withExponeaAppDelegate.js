const { withAppDelegate } = require("@expo/config-plugins");

function withExponeaAppDelegate(config) {
  return withAppDelegate(config, (cfg) => {
    let { contents } = cfg.modResults;

    // Only modify AppDelegate.swift (not ReactNativeDelegate)
    if (!contents.includes("class AppDelegate")) {
      return cfg;
    }

    // Add UNUserNotificationCenter delegate setup
    if (!contents.includes("UNUserNotificationCenter.current().delegate = self")) {
      contents = contents.replace(
        /(didFinishLaunchingWithOptions[^{]+\{)/,
        `$1
    UNUserNotificationCenter.current().delegate = self
    UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
      if let error = error {
        print("Permission denied: \\(error.localizedDescription)")
      } else {
        print("Permission granted, calling registerForRemoteNotifications")
        DispatchQueue.main.async {
          application.registerForRemoteNotifications()
        }
      }
    }`
      );
    }

    // Insert methods strictly inside AppDelegate
    const appDelegateBlock = /(class AppDelegate[^{]+\{)([\s\S]*?)(\n\})/;

    if (!contents.includes("didRegisterForRemoteNotificationsWithDeviceToken")) {
      contents = contents.replace(appDelegateBlock,
        `$1$2

  public override func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    print("Successfully registered for notifications! \\(deviceToken)")
    Exponea.handlePushNotificationToken(deviceToken)
  }$3`
      );
    }

    if (!contents.includes("didReceiveRemoteNotification")) {
      contents = contents.replace(appDelegateBlock,
        `$1$2

  public override func application(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable : Any],
                   fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
    Exponea.handlePushNotificationOpened(userInfo: userInfo)
    completionHandler(.newData)
  }$3`
      );
    }

    if (!contents.includes("didFailToRegisterForRemoteNotificationsWithError")) {
      contents = contents.replace(appDelegateBlock,
        `$1$2

  public override func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: any Error) {
    print("Failed to register for notifications: \\(error.localizedDescription)")
  }$3`
      );
    }

    // Add UNUserNotificationCenterDelegate extension
    if (!contents.includes("extension AppDelegate: UNUserNotificationCenterDelegate")) {
      contents += `

extension AppDelegate: UNUserNotificationCenterDelegate {
  public func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse,
                              withCompletionHandler completionHandler: @escaping () -> Void) {
    Exponea.handlePushNotificationOpened(with: response)
    completionHandler()
  }
}
`;
    }

    cfg.modResults.contents = contents;
    return cfg;
  });
}

module.exports = withExponeaAppDelegate;
