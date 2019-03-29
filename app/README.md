# mydata-app

An example app for managing consents and viewing data

## Prerequisites

### OS X

- Install Android Studio
- Install Watchman `brew install watchman`
- Install React Native cli `npm install -g react-native-cli`

### Linux and Android

* Install Android Studio https://developer.android.com/studio/install
  * In the project directory create the file `android/local.properties` with the content `sdk.dir = /home/USERNAME/Android/Sdk`
  * Approve the licenses of the SDK packages by running ` /home/USERNAME/Android/Sdk/tools/bin/sdkmanager --licenses`
  * If you get `Could not find tools.jar` then you need to point gradle to the JDK installation.
    * You can find it with `2>/dev/null find / -name tools.jar -path "*jdk*"`
    * If you don't have JDK installed then install it
    * Create the file `~/.gradle/gradle.properties` with the line `org.gradle.java.home = /PATH/TO/JDK`
  * Set up the device which will run the app (API Level 26, Android 8.0) https://facebook.github.io/react-native/docs/getting-started.html#preparing-the-android-device
* (Optionally, if you want it to automatically reload on code change) Install Watchman https://facebook.github.io/watchman/docs/install.html#installing-from-source
* Install React Native cli `npm install -g react-native-cli`

## Config

- Create a `.env` in project root with:

```bash
DROPBOX_KEY=tsw50ay5z1j0k0k
OPERATOR_URL=http://192.168.110.130:3000/api
```

(or whatever adress you are running the operator on)

- Run

```bash
react-native link react-native-config && \
react-native link react-native-rsa-native && \
react-native link react-native-vector-icons && \
react-native link react-native-push-notification && \
react-native link react-native-camera && \
react-native link react-native-qrcode-scanner && \
react-native link react-native-permissions \
react-native link react-native-gesture-handler
```

## Run

For Android:

* Start the device that will run the app from Android Studio. Virtual devices are under Tools->AVD Manager (if you do not see `AVD Manager`, go to `Help` and use `Find action`)

```bash
react-native run-ios
react-native run-android
```

If the app doesn't open automatically go into apps and find MyData

React debug menu available on ios with ⌘d and on android with ⌘m / ctrl+m

## Release Beta - iOS

1. Install the latest Xcode command line tools:

`xcode-select --install`

2. Install fastlane

```
# Using RubyGems
sudo gem install fastlane -NV
```

or

```
# Alternatively using Homebrew
brew cask install fastlane
```

3. Certificates

- Add a file name "Appfile" within `ios/fastlane`. For contents, see LastPass.
- Download and open the matching certificates and provisioning-profiles from the [Apple Developer Potal](developer.apple.com)

4. Release

```
cd ios
fastlane beta
```

## Release Android (Google Play)

1. Download the Google Play JSON-file (it's in LastPass)
  - Place the `release.keystore` in `android/app`
  - Place `gradle.properties` in `android`
2. Open Android Studio
  - Select "Build Variant" "release" under "Build Variants"
  - Under "Build" press "Generate Signed Bundle / APK" then "Android App Bundle"
  - Point to the "Key store path"
  - Use the passwords for these files and "release" for key alias
  - You can select both "debug" and "release" for build-variants here.
3. Log in to Google Play-console and select the "MyData"-app
  - Select an appropriate release-type and upload the exported .apk-file from the previous step.

  

