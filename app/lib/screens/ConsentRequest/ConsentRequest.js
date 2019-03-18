import React from 'react'
import EnterConsentCode from '../../components/EnterConsentCode'
import ConsentRequest from '../../components/ConsentRequest'

class ManageConsentsRequestScreen extends React.Component {
  state = {
    view: 'enter',
    code: '',
  }

  static navigationOptions = {
    tabBarVisible: false,
  }

  // Events
  onCode = code => {
    this.setState({ code, view: 'getRequest' })
  }

  onCancel = () => {
    this.props.navigation.navigate('Hem')
  }

  onApprove = () => {
    this.setState({ view: 'enter' })
    this.props.navigation.navigate('Hem')
  }

  render() {
    switch (this.state.view) {
      case 'getRequest':
        return (
          <ConsentRequest
            consentRequestId={this.state.code}
            onApprove={this.onApprove}
          />
        )
      case 'enter':
      default:
        return (
          <EnterConsentCode onCancel={this.onCancel} onCode={this.onCode} />
        )
    }
  }
}

export default ManageConsentsRequestScreen
