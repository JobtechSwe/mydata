import React from 'react'
import EnterConsentCode from '../../components/EnterConsentCode'
import ConsentRequest from '../../components/ConsentRequest'

class ManageConsentsRequestScreen extends React.Component {
  state = {
    view: 'enter',
    code: '',
  }

  static navigationOptions = {
    tabBarVisible: true,
  }

  // Events
  onCode = code => {
    this.setState({ code, view: 'getRequest' })
  }
  onApprove = () => {
    this.props.navigation.goBack()
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
            onCode={this.onCode}
          />
        )
    }
  }
}

export default ManageConsentsRequestScreen
