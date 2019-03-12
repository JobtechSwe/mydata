import React, { Component } from 'react'
import { View } from 'react-native'
import { Wrap } from '../components/View/Wrapper'
import { Spinner } from '../components/elements/Spinner/Spinner'
import { H3, Paragraph, Separator } from '../components/typography/Typography'
import { PrimaryButton } from '../components/elements/Button/Button'
import * as consentsService from '../services/consents'

class ConsentRequest extends Component {
  state = {
    view: 'loading',
    consentRequest: null,
  }

  async componentDidMount() {
    const consentRequest = await consentsService.get(
      this.props.consentRequestId
    )
    this.setState({ consentRequest, view: 'approve' })
  }

  approve = async () => {
    this.setState({ view: 'approving' })
    await consentsService.approve(this.state.consentRequest)
    this.props.onApprove()
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
            <H3>{this.state.consentRequest.client.display_name}</H3>
            <Paragraph align="left">
              {this.state.consentRequest.client.description}
            </Paragraph>
            <Separator />
            <Paragraph>Wants these permissions</Paragraph>
            <View>
              {this.state.consentRequest.data.scope.map(scope => (
                <View key={scope.area} style={{ marginBottom: 32 }}>
                  <H3>{scope.area}</H3>
                  <Paragraph small>{scope.description}</Paragraph>
                </View>
              ))}
            </View>
            <PrimaryButton onPress={this.approve}>Godkänn</PrimaryButton>
            <PrimaryButton onPress={this.reject}>Neka</PrimaryButton>
          </Wrap>
        )
      case 'approving':
        return (
          <Wrap>
            <Spinner />
            <Paragraph style={{ marginTop: 24 }}>Godkänner...</Paragraph>
          </Wrap>
        )
      case 'generating':
        return (
          <Wrap>
            <Spinner />
            <Paragraph style={{ marginTop: 24 }}>Genererar...</Paragraph>
          </Wrap>
        )
    }
  }
}

export default ConsentRequest
