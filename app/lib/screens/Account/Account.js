import React from 'react'
import { Wrap, ScrollViewWrap } from '../../components/View/Wrapper'
import { storeAccount } from '../../services/storage'
import Register from '../../components/Register/Register'
import KeyPair from '../../components/KeyPair'
import PDS from '../../components/PDS/PDS'
import Finished from '../../components/Finished/Finished'
import { save } from '../../services/account'

export default class AccountScreen extends React.Component {
  state = {
    account: {},
    status: 'register',
  }

  saveAccount = async account => {
    /*
     * TODO(@all): Find out why it doesn't get passed this step after Dropbox
     *
    if (account.keys && account.pds) {
      console.log('THIS', this)
      account = await save(account)
    }
    */

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
  }

  onGenerateKeys = keys => {
    this.saveAccount({ ...this.state.account, keys })
  }

  onDropboxConnect = pds => {
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
          <PDS pds={this.state.account.pds} onConnect={this.onDropboxConnect} />
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
