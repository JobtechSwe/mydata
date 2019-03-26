import React, { Component } from 'react'
import { View } from 'react-native'
import { Headline, Button, Text, withTheme } from 'react-native-paper'
import { Wrap } from '../components/View/Wrapper'
import { Spinner } from '../components/elements/Spinner/Spinner'
import * as loginService from '../services/login'

class LoginRequest extends Component {
  state = {
    view: 'loading',
    loginRequest: null,
  }

  async componentDidMount() {
    try {
      const { consent, request } = await loginService.get(this.props.code)
      this.setState({ consent, request, view: 'approve' })
    } catch (error) {
      this.setState({ view: 'error', error })
    }
  }

  approve = async () => {
    this.setState({ view: 'approving' })
    await loginService.approve({ ...this.state.request, ...this.state.consent })
    this.props.onApprove()
  }

  acceptSituation = () => {
    this.props.onError()
  }

  reject = () => {

  }

  render() {
    switch(this.state.view) {
      case 'loading':
        return (
          <Wrap>
            <Spinner />
          </Wrap>
        )
      case 'approve':
        return (
          <Wrap>
            <Text style={{ marginBottom: 5 }}>Would you like to log in to:</Text>
            <Headline style={{ marginBottom: 5 }}>
              {this.state.request.clientId}
            </Headline>
            <Text style={{ marginBottom: 5 }}>
              Description
            </Text>
            <Button mode="contained" icon="check-circle" style={{ backgroundColor: this.props.theme.colors.accent, marginBottom: 5 }} onPress={this.approve}>Yes</Button>
            <Button mode="contained" icon="block" style={{ backgroundColor: this.props.theme.colors.error, marginBottom: 5 }} onPress={this.reject}>No</Button>
          </Wrap>
        )
      case 'approving':
        return (<Text>Approving...</Text>)
      case 'error':
        return (
          <Wrap>
            <Text style={{ marginBottom: 5 }}>Error</Text>
            <Headline style={{ marginBottom: 5 }}>
              {this.state.error.message}
            </Headline>
            <Button mode="contained" icon="check-circle" style={{ backgroundColor: this.props.theme.colors.accent, marginBottom: 5 }} onPress={this.acceptSituation}>"OK"</Button>
          </Wrap>
        )
    }
  }
}

export default withTheme(LoginRequest)
