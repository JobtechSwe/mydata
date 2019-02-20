import React from 'react'
import { Alert, Button, Text, View, Linking, Platform, ScrollView } from 'react-native'
import JSONTree from 'react-native-json-tree'
import Screen from '../Screen'
import styled from 'styled-components'
import { getAccount, storeAccount } from '../../services/storage'

const WelcomeText = styled(Text)`
  font-size: 20px;
  text-align: center;
  margin: 10px;
`

const InstructionText = styled(Text)`
  text-align: center;
  color: #333;
  margin-bottom: 6px;
`

const ConsentText = styled(Text)`
  text-align: center;
  color: #333;
  margin-bottom: 6px;
`

const StyledView = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #F5FCFF;
`

export default class HomeScreen extends Screen {
  state = {
    account: {}
  }

  componentDidMount() {
    Linking.addEventListener('url', this.handleOpenURL);
  }
  componentWillUnmount() {
    Linking.removeEventListener('url', this.handleOpenURL)
  }

  handleOpenURL = (event) => {
    this.navigate(event.url);
  }

  navigate = (url) => {
    const { navigate } = this.props.navigation;
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
      { text: 'OK', onPress: () => this.doClearAccount() }
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
      account
    })
  }

  render() {
    const { navigate } = this.props.navigation;
    return (
      <StyledView>
        <WelcomeText>Hello {this.state.account?.firstName} {this.state.account?.lastName}!</WelcomeText>
        <Button title="Edit Account" onPress={this.editAccount}>Edit account</Button>
        <Button title="Manage Consents Request" onPress={this.manageConsentsRequest}>Manage Consents Request</Button>
        <Button title="Clear Account" onPress={this.clearAccount}>Clear account</Button>
        <ScrollView>
          <JSONTree data={this.state.account || {}} />
        </ScrollView>
      </StyledView>
    );
  }
}
