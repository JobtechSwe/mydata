import React, { Component } from 'react'
import { Wrap } from '../View/Wrapper'
import { Paragraph } from '../typography/Typography'
import { PrimaryButton } from '../elements/Button/Button'
import { parse } from '../../utils/code'
import ScanQRCode from './ScanQRCode'

class Scan extends Component {
  state = {
    view: 'scan',
    validated: false,
  }

  scan = () => {
    this.setState({ view: 'scan' })
  }

  onScanQRCode = qr => {
    try {
      const jwt = parse(qr)
      this.props.onScan(jwt)
    } catch (error) {
      console.error('could not parse jwt', error)
      this.setState({ view: 'error', error })
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
            <ScanQRCode
              onCancel={this.props.onCancel}
              onRead={this.onScanQRCode}
            />
          </Wrap>
        )
    }
  }
}

export default Scan
