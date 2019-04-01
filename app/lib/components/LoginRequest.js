import React, { Component } from 'react'
import { Wrap } from '../components/View/Wrapper'
import { H1, Paragraph } from '../components/typography/Typography'
import { PrimaryButton } from '../components/elements/Button/Button'
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

  reject = () => {}

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
            <Paragraph style={{ marginBottom: 5 }}>
              Would you like to log in to:
            </Paragraph>
            <H1 style={{ marginBottom: 5 }}>{this.state.request.clientId}</H1>
            <Paragraph style={{ marginBottom: 5 }}>Description</Paragraph>

            <PrimaryButton
              style={{
                marginBottom: 5,
              }}
              onPress={this.approve}
              icon={{
                name: 'check',
              }}
            >
              Yes
            </PrimaryButton>
            <PrimaryButton
              style={{
                marginBottom: 5,
              }}
              onPress={this.reject}
              icon={{
                name: 'ban',
              }}
            >
              No
            </PrimaryButton>
          </Wrap>
        )
      case 'approving':
        return <Paragraph>Approving...</Paragraph>
      case 'error':
        return (
          <Wrap>
            <Paragraph style={{ marginBottom: 5 }}>Error</Paragraph>
            <H1 style={{ marginBottom: 5 }}>{this.state.error.message}</H1>
            <PrimaryButton
              style={{
                marginBottom: 5,
              }}
              onPress={this.acceptSituation}
              icon={{
                name: 'ban',
              }}
            >
              OK
            </PrimaryButton>
          </Wrap>
        )
    }
  }
}

export default LoginRequest
