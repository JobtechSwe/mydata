import React from 'react'
import { EnterConsentCode, ConsentRequest } from '../../components/Consent'
import LoginRequest from '../../components/LoginRequest'
import { parse } from '../../utils/qrcode'

class ManageConsentsRequestScreen extends React.Component {
  state = {
    view: 'enter',
    code: '',
  }

  static navigationOptions = {
    tabBarVisible: false,
  }

  componentDidMount() {
    const { params } = this.props.navigation.state

    if (params && params.myDataUrl) {
      const { code, type } = parse(params.myDataUrl)
      this.onCode({ code, type })
    }
  }

  // Events
  onCode = ({ type, code }) => {
    this.setState({ code, view: type })
  }

  onCancel = () => {
    this.setState({ view: 'enter' })
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
            onCancel={this.onCancel}
            onError={this.onError}
          />
        )
      case 'register':
        return (
          <ConsentRequest
            consentRequestId={this.state.code}
            onApprove={this.onApprove}
            onCancel={this.onCancel}
          />
        )
      case 'enter':
      default:
        return (
          <EnterConsentCode
            onCancel={this.onCancel}
            onCode={this.onCode}
          />
        )
    }
  }
}

export default ManageConsentsRequestScreen
