import React, { Component } from 'react'
import { Wrap } from '../components/View/Wrapper'
import { Paragraph } from '../components/typography/Typography'
import { PrimaryButton } from '../components/elements/Button/Button'
import { withTheme } from 'react-native-paper'
import { validate } from '../utils/uuid-validate'
import ScanQRConsentCode from './ScanQRConsentCode'

class EnterConsentCode extends Component {
  state = {
    view: 'scan',
    validated: false,
  }

  scan = () => {
    this.setState({ view: 'scan' })
  }

  onScanQRCode = code => {
    if (validate(code)) {
      this.props.onCode(code)
    } else {
      this.setState({ view: 'error', code })
    }
  }

  render() {
    switch (this.state.view) {
      case 'error':
        return (
          <Wrap>
            <Paragraph>
              Unrecognized code:{'\n'}
              {this.state.code}{'\n'}
              Try again!{'\n'}
            </Paragraph>
            <PrimaryButton onPress={this.scan}>Scan</PrimaryButton>
          </Wrap>
        )
      case 'scan':
      default:
        return (
          <Wrap>
            <ScanQRConsentCode onRead={this.onScanQRCode} />
          </Wrap>
        )
    }
  }
}

export default withTheme(EnterConsentCode)
