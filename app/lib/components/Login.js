import React, { Component } from 'react'
import { Wrap } from '../components/View/Wrapper'
import { Spinner } from '../components/elements/Spinner/Spinner'
import { Headline, Button, List, Text, withTheme } from 'react-native-paper'
import * as loginService from '../services/login'

class Login extends Component {
  state = {
    view: 'loading',
    code: null,
  }

  async componentDidMount() {
    const loginRequest = await loginService.parse(this.props.code)
    this.setState({ loginRequest, view: 'approve' })
  }

  render() {
    switch (this.state.view) {
      case 'loading':
        return (
          <Wrap>
            <Spinner />
          </Wrap>
        )
      case 'approve':
        return (
          <Wrap>
            <Text style={{ marginBottom: 5 }}>This app:</Text>
            <Headline style={{ marginBottom: 5 }}>
              {this.state.consentRequest.client.display_name}
            </Headline>
            <Text style={{ marginBottom: 5 }}>
              {this.state.consentRequest.client.description}
            </Text>
            <Text style={{ marginBottom: 5 }}>Wants these permissions</Text>
            <List.Section style={{ marginBottom: 5 }}>
              {this.state.consentRequest.data.scope.map(scope => (
                <List.Item
                  title={scope.area}
                  description={scope.description}
                  key={scope.area}
                />
              ))}
            </List.Section>
            <Button
              mode="contained"
              icon="check-circle"
              style={{
                backgroundColor: this.props.theme.colors.accent,
                marginBottom: 5,
              }}
              onPress={this.approve}
            >
              I Approve!
            </Button>
            <Button
              mode="contained"
              icon="block"
              style={{
                backgroundColor: this.props.theme.colors.error,
                marginBottom: 5,
              }}
              onPress={this.reject}
            >
              Nope!
            </Button>
          </Wrap>
        )
    }
  }
}

export default withTheme(Login)
