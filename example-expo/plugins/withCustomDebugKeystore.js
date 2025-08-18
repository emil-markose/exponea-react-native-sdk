const fs = require('fs');
const path = require('path');
const {withDangerousMod} = require('@expo/config-plugins');

const withCustomDebugKeystore = config => {
  return withDangerousMod(config, [
    'android',
    config => {
      const projectRoot = config.modRequest.projectRoot;
      const credentialsPath = path.join(projectRoot, 'credentials.json');
      if (!fs.existsSync(credentialsPath)) {
        console.warn('credentials.json not found. Skipping custom keystore copy.');
        return config;
      }
      const { android } = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      const { keystore } = android;
      if (!keystore?.path) {
        console.error('No keystore.path provided in credentials.json');
        return config;
      }
      const srcKeystore = path.resolve(projectRoot, keystore.path);
      const destKeystore = path.join(projectRoot, 'android/app/debug.keystore');

      if (!fs.existsSync(srcKeystore)) {
        console.error(`Keystore file not found at: ${srcKeystore}`);
        return config;
      }

      // Copy keystore file
      fs.mkdirSync(path.dirname(destKeystore), { recursive: true });
      fs.copyFileSync(srcKeystore, destKeystore);
      console.log(`Custom keystore copied to: ${destKeystore}`);

      return config;
    },
  ]);
};

module.exports = withCustomDebugKeystore;
