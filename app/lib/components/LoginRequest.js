import React, { Component } from 'react'
import { View } from 'react-native'
import { Headline, Button, List, Text, withTheme } from 'react-native-paper'
import * as loginService from '../services/login'
import * as storage from '../services/storage'

class LoginRequest extends Component {
  state = {
    view: 'loading',
    loginRequest: null
  }

  async componentDidMount() {
    const loginRequest = await loginService.parse(this.props.loginRequestString)
    this.setState({ loginRequest, view: 'approve'})
  }

  approve = async () => {
    const { id } = await storage.getAccount()
    this.setState({view: 'approving'})
    await loginService.approve({ ...this.state.loginRequest, accountId: id })
    this.props.onApprove()
  }

  reject = () => {

  }

  render() {
    switch(this.state.view) {
      case 'loading':
        return (
          <View><Text>Loading...</Text></View>
        )
      case 'approve':
        return (
          <View>
            <Text style={{ marginBottom: 5 }}>Would you like to log in to:</Text>
            <Headline style={{ marginBottom: 5 }}>{this.state.loginRequest.clientId}</Headline>
            <Button mode="contained" icon="check-circle" style={{ backgroundColor: this.props.theme.colors.accent, marginBottom: 5 }} onPress={this.approve}>Yes</Button>
            <Button mode="contained" icon="block" style={{ backgroundColor: this.props.theme.colors.error, marginBottom: 5 }} onPress={this.reject}>No</Button>
          </View>
        )
      case 'approving':
        return (<Text>Approving...</Text>)
      case 'generating':
        return (<View />)
    }
  }
}

export default withTheme(LoginRequest)
