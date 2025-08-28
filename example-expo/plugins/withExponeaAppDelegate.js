const { withAppDelegate } = require("@expo/config-plugins");

function withExponeaAppDelegate(config) {
  return withAppDelegate(config, (cfg) => {
    let { contents } = cfg.modResults;

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
        if (granted) {
          print("Permission granted, calling registerForRemoteNotifications")
          DispatchQueue.main.async {
            application.registerForRemoteNotifications()
          }
        } else {
          print("Permission denied. Notification was not registered")
        }
      }
    }`
      );
    }

    // Patch AppDelegate to add the required methods for notification
    const appDelegateBlock = /(class AppDelegate[^{]+\{)([\s\S]*?)(\n\})/;

    if (!contents.includes("didRegisterForRemoteNotificationsWithDeviceToken")) {
      contents = contents.replace(appDelegateBlock,
        `$1$2

  public override func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    print("Successfully registered for notifications! \\(deviceToken)")
    Exponea.handlePushNotificationToken(deviceToken)
    
    let tokenString = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
    NotificationCenter.default.post(name: .didReceiveDeviceToken, object: tokenString)
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
    
    let tokenString = ""
    NotificationCenter.default.post(name: .didReceiveDeviceToken, object: tokenString)
  }$3`
      );
    }

    // Add UNUserNotificationCenterDelegate extension
    if (!contents.includes("extension AppDelegate: UNUserNotificationCenterDelegate")) {
      contents += `

extension AppDelegate: UNUserNotificationCenterDelegate {
  public func userNotificationCenter(_ center: UNUserNotificationCenter,
                                     didReceive response: UNNotificationResponse,
                                     withCompletionHandler completionHandler: @escaping () -> Void) {
    Exponea.handlePushNotificationOpened(with: response)
    completionHandler()
  }

  // This ensures notifications also show when the app is in the foreground
  public func userNotificationCenter(_ center: UNUserNotificationCenter,
                                     willPresent notification: UNNotification,
                                     withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
    if #available(iOS 14.0, *) {
      completionHandler([.banner])
    } else {
      completionHandler([.alert])
    }
  }
}
`;
    }

    cfg.modResults.contents = contents;
    return cfg;
  });
}

module.exports = withExponeaAppDelegate;
