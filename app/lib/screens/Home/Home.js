import React from 'react'
import { Alert, Button, Text, View, Linking, ScrollView } from 'react-native'
import JSONTree from 'react-native-json-tree'
import Screen from '../Screen'
import styled from 'styled-components'
import { getAccount, storeAccount } from '../../services/storage'
import { Input } from '../../components/elements/Input/Input';
import { PrimaryButton } from '../../components/elements/Button/Button';
import { H1, Paragraph } from '../../components/typography/Typography';
import { Wrap } from '../../components/View/Wrapper'

const WelcomeText = styled(Text)`
  font-size: 20px;
  text-align: center;
  margin: 10px;
`

const ConsentText = styled(Text)`
  text-align: center;
  color: #333;
  margin-bottom: 6px;
`

export default class HomeScreen extends Screen {
  state = {
    account: {},
  }

  componentDidMount() {
    Linking.addEventListener('url', this.handleOpenURL)
  }
  componentWillUnmount() {
    Linking.removeEventListener('url', this.handleOpenURL)
  }

  handleOpenURL = (event) => {
    this.navigate(event.url)
  }

  navigate = (url) => {
    const { navigate } = this.props.navigation
    if (/mydata:\/\/callback/.test(url)) {
      navigate('Account')
    }
  }

  async componentWillFocus() {
    await this.readAccountFromStorage()

    if (!this.state.account) {
      const { navigate } = this.props.navigation
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
    Alert.alert('Clear account', 'Are you sure you want to clear your account? This is a REALLY bad idea!', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      { text: 'OK', onPress: () => this.doClearAccount() },
    ])
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
        <H1>MyData</H1>
        <Input placeholder="Förnamn" />
        <Input placeholder="Efternam" />
        <PrimaryButton>Registrera</PrimaryButton>
        <Paragraph>Du kommer nu att kunna vara i full kontroll över din data och över vilka som använder den</Paragraph>
        <WelcomeText>Hello {this.state.account?.firstName} {this.state.account?.lastName}!</WelcomeText>
        <Button title="Edit Account" onPress={this.editAccount}>Edit account</Button>
        <Button title="Manage Consents Request" onPress={this.manageConsentsRequest}>Manage Consents Request</Button>
        <Button title="Clear Account" onPress={this.clearAccount}>Clear account</Button>
        <ScrollView>
          <JSONTree data={this.state.account || {}} />
        </ScrollView>
      </Wrap>
    );
  }
}
