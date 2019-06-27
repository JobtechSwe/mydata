import React, { Component } from 'react'
import {
  Alert,
  Clipboard,
  Dimensions,
  Linking,
  StatusBar,
  View,
} from 'react-native'
import { theme } from '../../theme'
import Modal from 'react-native-modal'
import QRCodeScanner from 'react-native-qrcode-scanner'
import { Mask, Svg, Rect, Path } from 'react-native-svg'
import { H3, Paragraph } from '../typography/Typography'
import { PrimaryButton } from '../elements/Button/Button'
import DeviceInfo from 'react-native-device-info'

export default class ScanQRCode extends Component {
  state = {
    code: '',
    helpVisible: false,
  }

  componentDidMount() {
    Linking.addEventListener('url', this.handleOpenURL)
  }

  componentWillUnmount() {
    Linking.removeEventListener('url', this.handleOpenURL)
  }

  handleOpenURL = event => {
    this.props.onRead(event.url)
  }

  async pasteQR() {
    if (DeviceInfo.isEmulator()) {
      const qr = await Clipboard.getString()
      Alert.alert('Paste code', qr, [
        { text: 'Cancel' },
        { text: 'OK', onPress: () => this.props.onRead(qr) },
      ])
    }
  }

  helpModalToggle = () => {
    this.setState({ helpVisible: !this.state.helpVisible })
  }

  render() {
    const { width, height } = Dimensions.get('window')

    return (
      <>
        <StatusBar barStyle="light-content" />
        <QRCodeScanner
          onRead={event => this.props.onRead(event.data)}
          cameraStyle={{
            height,
          }}
          cameraProps={{ captureAudio: false }}
          showMarker={true}
          customMarker={
            <Svg
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
              onTouchEnd={() => this.pasteQR()}
            >
              <Mask id="qrMask">
                <Rect x="0" y="0" width={width} height={height} fill="white" />

                <Rect
                  y={height / 2 - width / 1.4}
                  x={(width - width / 1.4) / 2}
                  width={width / 1.4}
                  height={width / 1.4}
                  rx="56"
                  ry="56"
                  fill="black"
                />
              </Mask>

              <Rect
                x="0"
                y="0"
                fill="rgba(0, 0, 0, .4)"
                width="100%"
                height="100%"
                mask="url(#qrMask)"
              />

              <Rect
                y={height - 108}
                x="32"
                fill="rgba(0, 0, 0, 0.0)"
                width="48"
                height="48"
                onPress={() => this.props.onCancel()}
              />

              <Path
                fill-rule="evenodd"
                clip-rule="evenodd"
                y={height - 96}
                x="48"
                d="M13.0363 0.863168C12.4505 0.277381 11.5008 0.277382 10.915 0.863168L1.01551 10.7627C0.700733 11.0774 0.555104 11.4973 0.578625 11.9093C0.598624 12.2645 0.744273 12.6138 1.01558 12.8851L10.9151 22.7846C11.5009 23.3704 12.4506 23.3704 13.0364 22.7846C13.6222 22.1988 13.6222 21.2491 13.0364 20.6633L4.19695 11.8239L13.0363 2.98449C13.6221 2.3987 13.6221 1.44895 13.0363 0.863168Z"
                fill={theme.colors.white}
              />

              <Rect
                y={height - 108}
                x={width - 80}
                fill="rgba(0, 0, 0, 0.0)"
                width="48"
                height="48"
                onPress={() => this.helpModalToggle()}
              />

              <Path
                y={height - 96}
                x={width - 64}
                d="M7.61187 17.9589C7.41919 17.9589 7.25863 17.8947 7.13018 17.7662C7.00173 17.6378 6.9375 17.4772 6.9375 17.2846V16C6.98032 14.8654 7.26933 13.8913 7.80455 13.0778C8.33976 12.2642 9.12118 11.333 10.1488 10.2839C10.9837 9.4276 11.5939 8.72112 11.9792 8.1645C12.3646 7.60787 12.5573 6.99773 12.5573 6.33406C12.5573 5.34927 12.1398 4.56785 11.3049 3.98982C10.4913 3.41179 9.53864 3.12277 8.44681 3.12277C5.89918 3.12277 4.40058 4.40729 3.951 6.97632C3.84396 7.44731 3.56565 7.6828 3.11607 7.6828H1.57465C1.36056 7.6828 1.18929 7.61858 1.06084 7.49013C0.93239 7.36168 0.868164 7.19041 0.868164 6.97632C0.910981 5.79885 1.24281 4.71771 1.86366 3.73292C2.50592 2.72672 3.40508 1.92389 4.56115 1.32445C5.71721 0.725013 7.04454 0.425293 8.54314 0.425293C10.1274 0.425293 11.4547 0.703605 12.5251 1.26023C13.617 1.79544 14.4198 2.50193 14.9336 3.37968C15.4474 4.23602 15.7043 5.15659 15.7043 6.14139C15.7043 7.23322 15.4581 8.1752 14.9657 8.96732C14.4733 9.75944 13.7347 10.68 12.7499 11.729C11.9364 12.5854 11.3263 13.3133 10.9195 13.9127C10.5127 14.4907 10.2772 15.1437 10.213 15.8716C10.1702 16.471 10.1488 16.9206 10.1488 17.2203C10.0417 17.7127 9.77414 17.9589 9.34597 17.9589H7.61187ZM7.35497 23.2254C7.14088 23.2254 6.95891 23.1612 6.80905 23.0328C6.6806 22.8829 6.61637 22.7009 6.61637 22.4868V20.528C6.61637 20.3139 6.6806 20.1426 6.80905 20.0142C6.95891 19.8643 7.14088 19.7894 7.35497 19.7894H9.4423C9.65639 19.7894 9.83836 19.8643 9.98822 20.0142C10.1381 20.1426 10.213 20.3139 10.213 20.528V22.4868C10.213 22.7009 10.1381 22.8829 9.98822 23.0328C9.83836 23.1612 9.65639 23.2254 9.4423 23.2254H7.35497Z"
                fill={theme.colors.white}
              />
            </Svg>
          }
        />
        <Modal
          style={{ justifyContent: 'center', alignItems: 'center' }}
          hasBackdrop={false}
          isVisible={this.state.helpVisible}
        >
          <View
            style={{
              borderRadius: 12,
              backgroundColor: theme.colors.white,
              padding: 24,
              width: width - 64,
            }}
          >
            <H3>Hjälp - QR-kod</H3>
            <Paragraph style={{ marginBottom: 24 }}>
              En QR-kod är en form av streckkod som används för att tolka data.
              Rikta kameran mot QR-koden för att logga in eller registrera dig
              med Egendata.
            </Paragraph>
            <PrimaryButton onPress={() => this.helpModalToggle()}>
              Ok, jag förstår!
            </PrimaryButton>
          </View>
        </Modal>
      </>
    )
  }
}
