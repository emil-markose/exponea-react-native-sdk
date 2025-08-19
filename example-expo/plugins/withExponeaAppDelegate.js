const { withAppDelegate } = require("@expo/config-plugins");

function withExponeaAppDelegate(config) {
  return withAppDelegate(config, (cfg) => {
    let { contents } = cfg.modResults;

    // 1. Add UNUserNotificationCenter delegate setup
    if (
      contents.includes("didFinishLaunchingWithOptions") &&
      !contents.includes("UNUserNotificationCenter.current().delegate = self")
    ) {
      contents = contents.replace(
        /didFinishLaunchingWithOptions[^}]*\{/,
        (match) =>
          `${match}\n    UNUserNotificationCenter.current().delegate = self`
      );
    }

    // 2. Ensure didRegisterForRemoteNotificationsWithDeviceToken exists
    if (!contents.includes("didRegisterForRemoteNotificationsWithDeviceToken")) {
      const insertionPoint = contents.lastIndexOf("}");
      const method = `
  func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    Exponea.handlePushNotificationToken(deviceToken)
  }
`;
      contents =
        contents.slice(0, insertionPoint) + method + contents.slice(insertionPoint);
    }

    // 3. Ensure didReceiveRemoteNotification exists
    if (!contents.includes("didReceiveRemoteNotification")) {
      const insertionPoint = contents.lastIndexOf("}");
      const method = `
  func application(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable : Any],
                   fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
    Exponea.handlePushNotificationOpened(userInfo: userInfo)
    completionHandler(.newData)
  }
`;
      contents =
        contents.slice(0, insertionPoint) + method + contents.slice(insertionPoint);
    }

    // 4. Ensure userNotificationCenter delegate is added
    if (!contents.includes("didReceiveNotificationResponse")) {
      const lastBraceIndex = contents.lastIndexOf("}");
      const before = contents.slice(0, lastBraceIndex + 1);
      const after = contents.slice(lastBraceIndex + 1);

      const extensionBlock = `

extension AppDelegate: UNUserNotificationCenterDelegate {
  public func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse,
                              withCompletionHandler completionHandler: @escaping () -> Void) {
    Exponea.handlePushNotificationOpened(with: response)
    completionHandler()
  }
}
`;
      contents = before + extensionBlock + after;
    }

    cfg.modResults.contents = contents;
    return cfg;
  });
}

module.exports = withExponeaAppDelegate;
