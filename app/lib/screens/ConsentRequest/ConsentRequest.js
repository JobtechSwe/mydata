import React from 'react'
import EnterConsentCode from '../../components/EnterConsentCode'
import ConsentRequest from '../../components/ConsentRequest'
import LoginRequest from '../../components/LoginRequest'

class ManageConsentsRequestScreen extends React.Component {
  state = {
    view: 'enter',
    code: '',
  }

  static navigationOptions = {
    tabBarVisible: true,
  }

  // Events
  onCode = ({ type, code }) => {
    this.setState({ code, view: type })
  }
  onApprove = () => {
    this.props.navigation.goBack()
  }
  onError = () => {
    this.props.navigation.goBack()
  }

  render() {
    switch (this.state.view) {
      case 'login':
        return (
          <LoginRequest
            code={this.state.code}
            onApprove={this.onApprove}
            onError={this.onError}
          />
        )
      case 'register':
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
