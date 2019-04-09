import React from 'react'
import { Linking, Alert } from 'react-native'
import { H1 } from '../../components/typography/Typography'
import { Wrap, ScrollViewWrap } from '../../components/View/Wrapper'
import { PrimaryButton } from '../../components/elements/Button/Button'
import { storeAccount } from '../../services/storage'

export default class HomeScreen extends React.Component {
  componentDidMount() {
    Linking.addEventListener('url', this.handleOpenURL)
  }

  componentWillUnmount() {
    Linking.removeEventListener('url', this.handleOpenURL)
  }

  handleOpenURL = event => {
    const { navigate } = this.props.navigation

    navigate('QR-kod', { myDataUrl: event.url })
  }

  clearAccount = async () => {
    Alert.alert(
      'Clear account',
      'Are you sure you want to clear your account? This is a REALLY bad idea!',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        { text: 'OK', onPress: () => this.doClearAccount() },
      ]
    )
  }

  doClearAccount = async () => {
    await storeAccount()

    const { navigate } = this.props.navigation
    navigate('AuthLoading')
  }

  render() {
    return (
      <Wrap>
        <ScrollViewWrap>
          <H1>MyData</H1>
          <PrimaryButton icon={{ name: 'ban' }} onPress={this.clearAccount}>
            Clear account
          </PrimaryButton>
        </ScrollViewWrap>
      </Wrap>
    )
  }
}
