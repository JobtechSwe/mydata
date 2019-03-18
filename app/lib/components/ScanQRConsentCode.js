import React, { Component } from 'react'
import { AppRegistry, Dimensions, Clipboard, Alert } from 'react-native'
import QRCodeScanner from 'react-native-qrcode-scanner'
import { Mask, Svg, Rect } from 'react-native-svg'
import DeviceInfo from 'react-native-device-info'

export default class ScanQRConsentCode extends Component {
  state = {
    code: '',
  }

  async pasteQR () {
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
          height: '100%',
        }}
        cameraProps={{ captureAudio: false }}
        showMarker={true}
        customMarker={
          <>
            <Svg width="100%" height="100%"
              onTouchEnd={() => this.pasteQR()}>
              <Mask id="qrMask">
                <Rect x="0" y="0" width="100%" height="100%" fill="white" />

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
            </Svg>
          </>
        }
      />
    )
  }
}

AppRegistry.registerComponent('default', () => ScanQRConsentCode)
