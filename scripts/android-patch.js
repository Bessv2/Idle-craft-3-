// Applies our settings to the generated android/ project (which is not committed):
// portrait lock, vibration permission, version numbers and the shared debug signing key.
const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.join(__dirname, '..');
const manifestPath = path.join(root, 'android/app/src/main/AndroidManifest.xml');
let manifest = fs.readFileSync(manifestPath, 'utf8');
if (!manifest.includes('android:screenOrientation')) {
  manifest = manifest.replace('android:name=".MainActivity"', 'android:name=".MainActivity"\n            android:screenOrientation="portrait"');
}
if (!manifest.includes('android.permission.VIBRATE')) {
  manifest = manifest.replace('</manifest>', '    <uses-permission android:name="android.permission.VIBRATE" />\n</manifest>');
}
fs.writeFileSync(manifestPath, manifest);

// Each CI build gets a higher version number so it installs over the previous one.
const build = parseInt(process.env.BUILD_NUMBER || '1', 10);
const gradlePath = path.join(root, 'android/app/build.gradle');
let gradle = fs.readFileSync(gradlePath, 'utf8');
gradle = gradle.replace(/versionCode \d+/, `versionCode ${build}`).replace(/versionName "[^"]*"/, `versionName "1.0.${build}"`);
fs.writeFileSync(gradlePath, gradle);

// Debug builds are signed with ~/.android/debug.keystore. Using the keystore from the repo
// everywhere means every build has the same signature, so updates keep your save.
const keyDir = path.join(os.homedir(), '.android');
fs.mkdirSync(keyDir, { recursive: true });
fs.copyFileSync(path.join(root, 'android-debug.keystore'), path.join(keyDir, 'debug.keystore'));
console.log(`Android project patched (build ${build}).`);
