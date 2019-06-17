import Finished from '../../components/wizard/Finished'
import KeyPair from '../../components/KeyPair'
import PDS from '../../components/wizard/PDS'
import React from 'react'
import Register from '../../components/Account/Register'
import { Alert } from 'react-native'
import { Wrap, ScrollViewWrap } from '../../components/View/Wrapper'
import { save } from '../../services/account'
import { storeAccount } from '../../services/storage'

export default class AccountScreen extends React.Component {
  state = {
    account: {},
    status: 'register',
  }

  saveAccount = async account => {
    try {
      if (account.keys && account.pds) {
        account = await save(account)
      }

      await storeAccount(account)

      this.setState({ account })

      switch (this.state.status) {
        case 'register':
          this.setState({ status: 'generateKeys' })
          break
        case 'generateKeys':
          this.setState({ status: 'choosePds' })
          break
        case 'choosePds':
          this.setState({ status: 'finished' })
          break
        default:
          this.setState({ status: 'register' })
          break
      }
    } catch (err) {
      Alert.alert('Error', `${err.message}\n${err.stack}`, [{ text: '"OK"' }])
    }
  }

  onGenerateKeys = keys => {
    this.saveAccount({ ...this.state.account, keys })
  }

  onConnectPDS = pds => {
    this.saveAccount({ ...this.state.account, pds })
  }

  currentComponent = () => {
    switch (this.state.status) {
      case 'register':
        return <Register onSubmit={account => this.saveAccount(account)} />
      case 'generateKeys':
        return <KeyPair onGenerate={this.onGenerateKeys} />
      case 'choosePds':
        return (
          <PDS pds={this.state.account.pds} onConnect={this.onConnectPDS} />
        )
      case 'finished':
        return (
          <Finished
            onFinished={() => this.props.navigation.navigate('AuthLoading')}
          />
        )
    }
  }

  render() {
    return (
      <Wrap>
        <ScrollViewWrap>{this.currentComponent()}</ScrollViewWrap>
      </Wrap>
    )
  }
}
