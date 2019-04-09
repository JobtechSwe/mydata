import React, { Component } from 'react'
import { Dimensions, Clipboard, Alert, Linking } from 'react-native'
import { theme } from '../theme'
import QRCodeScanner from 'react-native-qrcode-scanner'
import { Mask, Svg, Rect, Circle, Path } from 'react-native-svg'
import DeviceInfo from 'react-native-device-info'

export default class ScanQRConsentCode extends Component {
  state = {
    code: '',
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

  render() {
    const { width, height } = Dimensions.get('window')

    return (
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

            <Circle
              y={height - 106}
              x={width / 2 - 48}
              cx="48"
              cy="48"
              r="48"
              fill={theme.colors.white}
              onPress={() => this.props.onCancel()}
            />

            <Path
              y={height - 86}
              x={width / 2 - 28}
              stroke={theme.colors.primary}
              strokeWidth="5"
              strokeLinecap="round"
              d="M 15,15 L 45,45 M 45,15 L 15,45"
            />
          </Svg>
        }
      />
    )
  }
}
