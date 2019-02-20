import React, { Component } from 'react'
import {
  AppRegistry
} from 'react-native'
import QRCodeScanner from 'react-native-qrcode-scanner'

export default class ScanQRConsentCode extends Component {
  state = {
    code: ''
  }

  render() {
    return (
      <QRCodeScanner
        onRead={(event) => this.props.onRead(event.data)}
        showMarker={true}
      />
    )
  }
}

AppRegistry.registerComponent('default', () => ScanQRConsentCode)
