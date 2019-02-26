import React from 'react'
import EnterConsentCode from '../../components/EnterConsentCode'
import ConsentRequest from '../../components/ConsentRequest'

class ManageConsentsRequestScreen extends React.Component {
  state = {
    view: 'enter',
    code: '',
  }

  // Events
  onCodeChange = code => {
    this.setState({ code })
  }
  onApprove = () => {
    this.props.navigation.goBack()
  }

  // Actions
  getConsentRequest = () => {
    this.setState({ view: 'getRequest' })
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
          <EnterConsentCode
            onCodeChange={this.onCodeChange}
            onEnterPress={this.getConsentRequest}
          />
        )
    }
  }
}

export default ManageConsentsRequestScreen
