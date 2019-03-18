import React from 'react'
import Screen from './Screen'
import EnterLoginCode from '../components/EnterLoginCode'
import LoginRequest from '../components/LoginRequest'
import { View } from 'react-native'
import { withTheme } from 'react-native-paper'

class ManageLoginsRequestScreen extends Screen {
  state = {
    view: 'enter',
    code: ''
  }

  // Events
  onCodeChange = (code) => {
    this.setState({code})
  }
  onApprove = () => {
    this.props.navigation.goBack()
  }

  // Actions
  processLoginRequest = () => {
    this.setState({view: 'getRequest'})
  }

  render() {
    switch (this.state.view) {
      case 'getRequest':
        return (<LoginRequest loginRequestString={this.state.code} onApprove={this.onApprove} />)
      case 'enter':
      default:
        return (<EnterLoginCode onCodeChange={this.onCodeChange} onEnterPress={this.processLoginRequest} />)
    }
  }
}

export default withTheme(ManageLoginsRequestScreen)
