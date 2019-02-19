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
  getLoginRequest = () => {
    this.setState({view: 'getRequest'})
  }

  render() {
    switch (this.state.view) {
      case 'getRequest':
        return (<LoginRequest RequestId={this.state.code} onApprove={this.onApprove} />)
      case 'enter':
      default:
        return (<EnterLoginCode onCodeChange={this.onCodeChange} onEnterPress={this.getLoginRequest} />)
    }
  }
}

export default withTheme(ManageLoginsRequestScreen)
