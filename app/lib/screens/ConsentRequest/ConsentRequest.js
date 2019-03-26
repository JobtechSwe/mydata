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
    tabBarVisible: false,
  }

  // Events
  onCode = ({ type, code }) => {
    this.setState({ code, view: type })
  }

  onCancel = () => {
    this.props.navigation.navigate('Hem')
  }

  onApprove = () => {
    this.setState({ view: 'enter' })
    this.props.navigation.navigate('Hem')
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
          <EnterConsentCode onCancel={this.onCancel} onCode={this.onCode} />
        )
    }
  }
}

export default ManageConsentsRequestScreen
