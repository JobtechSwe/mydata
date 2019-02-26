import React, { Component } from 'react'
import { View } from 'react-native'
import { Headline, Button, List, Text, withTheme } from 'react-native-paper'
import * as consentsService from '../services/consents'

class ConsentRequest extends Component {
  state = {
    view: 'loading',
    consentRequest: null,
  }

  async componentDidMount() {
    const consentRequest = await consentsService.get(this.props.consentRequestId)
    this.setState({ consentRequest, view: 'approve' })
  }

  approve = async () => {
    this.setState({ view: 'approving' })
    await consentsService.approve(this.state.consentRequest)
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
            <Text style={{ marginBottom: 5 }}>This app:</Text>
            <Headline style={{ marginBottom: 5 }}>{this.state.consentRequest.client.display_name}</Headline>
            <Text style={{ marginBottom: 5 }}>{this.state.consentRequest.client.description}</Text>
            <Text style={{ marginBottom: 5 }}>Wants these permissions</Text>
            <List.Section style={{ marginBottom: 5 }}>
              {this.state.consentRequest.data.scope.map(scope => <List.Item title={scope.area} description={scope.description} key={scope.area} />)}
            </List.Section>
            <Button mode="contained" icon="check-circle" style={{ backgroundColor: this.props.theme.colors.accent, marginBottom: 5 }} onPress={this.approve}>I Approve!</Button>
            <Button mode="contained" icon="block" style={{ backgroundColor: this.props.theme.colors.error, marginBottom: 5 }} onPress={this.reject}>Nope!</Button>
          </View>
        )
      case 'approving':
        return (<Text>Approving...</Text>)
      case 'generating':
        return (<View />)
    }
  }
}

export default withTheme(ConsentRequest)
