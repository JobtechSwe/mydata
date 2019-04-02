import React from 'react'
import { Alert, Linking } from 'react-native'
import { getAccount, storeAccount } from '../../services/storage'
import { H1 } from '../../components/typography/Typography'
import { Wrap, ScrollViewWrap } from '../../components/View/Wrapper'
import { PrimaryButton } from '../../components/elements/Button/Button'

export default class HomeScreen extends React.Component {
  state = {
    account: {},
  }

  async componentDidMount() {
    await this.readAccountFromStorage()

    if (!this.state.account) {
      const { navigate } = this.props.navigation
      navigate('Account')
    }

    Linking.addEventListener('url', this.handleOpenURL)
  }
  componentWillUnmount() {
    Linking.removeEventListener('url', this.handleOpenURL)
  }

  handleOpenURL = event => {
    this.navigate(event.url)
  }

  navigate = url => {
    const { navigate } = this.props.navigation
    if (/mydata:\/\/callback/.test(url)) {
      navigate('Account')
    }
  }

  editAccount = () => {
    this.props.navigation.navigate('Account')
  }

  manageConsentsRequest = () => {
    this.props.navigation.navigate('ManageConsentsRequest')
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
    this.setState({ account: undefined })
    const { navigate } = this.props.navigation
    navigate('AuthLoading')
  }

  readAccountFromStorage = async () => {
    const account = await getAccount()
    this.setState({
      account,
    })
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
