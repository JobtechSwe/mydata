import React from 'react'
import { Alert, Button, Linking } from 'react-native'
import JSONTree from 'react-native-json-tree'
import styled from 'styled-components'
import { getAccount, storeAccount } from '../../services/storage'
import { Input } from '../../components/elements/Input/Input'
import { PrimaryButton } from '../../components/elements/Button/Button'
import { H1, Paragraph } from '../../components/typography/Typography'
import { Wrap, ScrollViewWrap } from '../../components/View/Wrapper'

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
    navigate('Account')
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
          <Input placeholder="Förnamn" />
          <Input placeholder="Efternam" />
          <PrimaryButton>Registrera</PrimaryButton>
          <Paragraph>
            Du kommer nu att kunna vara i full kontroll över din data och över
            vilka som använder den
          </Paragraph>
          <Button title="Clear Account" onPress={this.clearAccount}>
            Clear account
          </Button>

          <JSONTree data={this.state.account || {}} />
        </ScrollViewWrap>
      </Wrap>
    )
  }
}
