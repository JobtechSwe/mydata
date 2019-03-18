import React, { Component } from 'react'
import { Wrap } from '../components/View/Wrapper'
import { Input } from '../components/elements/Input/Input'
import { PrimaryButton } from '../components/elements/Button/Button'
import { Button, TextInput, withTheme } from 'react-native-paper'
import { validate } from '../utils/uuid-validate'
import ScanQRConsentCode from './ScanQRConsentCode'

class EnterConsentCode extends Component {
  state = {
    view: 'scan',
    code: '',
    validated: false,
  }

  scan = () => {
    this.setState({ view: 'scan' })
  }

  cancelScan = () => {
    this.setState({ view: 'enter' })
  }

  onChange = code => {
    this.setState({ code, validated: validate(code) })
    this.props.onCodeChange(code)
  }
  onScanQRCode = code => {
    this.setState({ view: 'enter', code, validated: validate(code) })
    this.props.onCodeChange(code)
  }
  enter = () => {
    this.props.onEnterPress()
  }

  render() {
    switch (this.state.view) {
      case 'scan':
        return (
          <Wrap>
            <ScanQRConsentCode onRead={this.onScanQRCode} />
            {/*
            <Button
              mode="contained"
              style={{
                marginBottom: 5,
                backgroundColor: this.props.theme.colors.accent,
              }}
              onPress={this.cancelScan}
            >
              Cancel
            </Button>
            */}
          </Wrap>
        )
      case 'enter':
      default:
        return (
          <Wrap>
            <Input
              autoFocus={true}
              label="code"
              onChangeText={this.onChange}
              value={this.state.code}
              placeholder="Enter the code here"
            />
            <PrimaryButton
              mode="contained"
              label="enter"
              onPress={this.enter}
              disabled={!this.state.validated}
              style={{ marginBottom: 5 }}
            >
              Enter
            </PrimaryButton>
            <PrimaryButton onPress={this.scan}>Scan</PrimaryButton>
          </Wrap>
        )
    }
  }
}

export default withTheme(EnterConsentCode)
