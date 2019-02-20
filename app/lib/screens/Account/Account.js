import React from 'react'
import { Text, View } from 'react-native'
import styled from 'styled-components'

import Screen from '../Screen'
import { getAccount, storeAccount } from '../../services/storage'
import Account from '../../components/Account'
import KeyPair from '../../components/KeyPair'
import PDS from '../../components/PDS'
import { save } from '../../services/account'

const InstructionText = styled(Text)`
  text-align: center;
  color: #333;
  margin-bottom: 6px;
`

const StyledView = styled(View)`
  background-color: #F5FCFF;
  flex: 1;
  justify-content: center;
  padding: 25px;
`

export default class AccountScreen extends Screen {
  text = {
    firstName: 'First name',
    lastName: 'Last name',
    create: 'Create',
    update: 'Update'
  }

  state = {
    account: {},
    action: 'create'
  }

  async componentWillFocus() {
    const account = await getAccount()
    this.setState({
      ...this.state,
      account,
      action: account ? 'update' : 'create'
    })
  }

  saveAccount = async (account) => {
    if (account.keys && account.pds) {
      account = await save(account)
    }
    await storeAccount(account)
    this.setState({account})

    switch(this.state.action) {
      case 'create':
        this.setState({ action: 'create2' })
        break
      case 'create2':
        if (account.pds && account.keys) {
          this.props.navigation.navigate('Home')
        }
        break
      default:
        this.setState({ action: 'update' })
        break
    }
  }

  onGenerateKeys = (keys) => {
    this.saveAccount({ ...this.state.account, keys})
  }

  onDropboxConnect = (pds) => {
    this.saveAccount({ ...this.state.account, pds })
  }

  currentComponent = () => {
    switch (this.state.action) {
      case 'create':
        return (
          <Account
            account={this.state.account}
            firstName={this.text.firstName}
            lastName={this.text.lastName}
            button={this.text.create}
            onSubmit={(account) => this.saveAccount(account)}
          />
        )
      case 'create2':
        return (
          <View>
            <KeyPair onGenerate={this.onGenerateKeys} />
            <PDS pds={this.state.account.pds} onConnect={this.onDropboxConnect} />
          </View>
        )
      case 'update':
        return (
          <View>
            <Account
              account={this.state.account}
              firstName={this.text.firstName}
              lastName={this.text.lastName}
              button={this.text.update}
              onSubmit={(account) => this.saveAccount(account)}
            />
            <KeyPair keys={this.state.account.keys} />
            <PDS pds={this.state.account.pds} onConnect={this.onDropboxConnect} />
          </View>
        )
    }
  }

  render() {
    return (
      <StyledView>
        <InstructionText>Account</InstructionText>
        {this.currentComponent()}
      </StyledView>
    )
  }
}
