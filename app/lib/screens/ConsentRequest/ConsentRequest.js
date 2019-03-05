import React from 'react'
import { Dimensions } from 'react-native'
import EnterConsentCode from '../../components/EnterConsentCode'
import ConsentRequest from '../../components/ConsentRequest'
import QRCodeScanner from 'react-native-qrcode-scanner'
import { Mask, Svg, Rect } from 'react-native-svg'
import { NavigationActions } from 'react-navigation'

class ManageConsentsRequestScreen extends React.Component {
  state = {
    view: 'enter',
    code: '',
  }

  static navigationOptions = {
    tabBarVisible: true,
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
