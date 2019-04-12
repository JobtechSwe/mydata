import React, { Component } from 'react'
import { Wrap } from '../components/View/Wrapper'
import { Paragraph } from '../components/typography/Typography'
import { PrimaryButton } from '../components/elements/Button/Button'
import { parse } from '../utils/qrcode'
import ScanQRConsentCode from './ScanQRConsentCode'

class EnterConsentCode extends Component {
  state = {
    view: 'scan',
    validated: false,
  }

  scan = () => {
    this.setState({ view: 'scan' })
  }

  onScanQRCode = qr => {
    try {
      const { code, type } = parse(qr)
      this.props.onCode({ code, type })
    } catch (error) {
      this.setState({ view: 'error', code: qr, error })
    }
  }

  render() {
    switch (this.state.view) {
      case 'error':
        return (
          <Wrap>
            <Paragraph>
              Unrecognized code:{'\n'}
              {this.state.code}
              {'\n'}
              Try again!{'\n'}
            </Paragraph>
            <PrimaryButton onPress={this.scan}>Scan</PrimaryButton>
          </Wrap>
        )
      case 'scan':
      default:
        return (
          <Wrap>
            <ScanQRConsentCode
              onCancel={this.props.onCancel}
              onRead={this.onScanQRCode}
            />
          </Wrap>
        )
    }
  }
}

export default EnterConsentCode
