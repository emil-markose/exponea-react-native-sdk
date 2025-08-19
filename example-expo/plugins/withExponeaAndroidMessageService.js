// patch file MessageService.kt

const fs = require('fs-extra');
const { withDangerousMod} = require("@expo/config-plugins");
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

module.exports = withExponeaAndroidMessageService;
