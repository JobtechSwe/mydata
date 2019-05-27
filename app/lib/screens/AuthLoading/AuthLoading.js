import React from 'react'
import { StatusBar } from 'react-native'
import { Wrap } from '../../components/View/Wrapper'
import { Spinner } from '../../components/elements/Spinner/Spinner'
import { getAccount } from '../../services/account'

class AuthLoading extends React.Component {
  constructor(props) {
    super(props)
    this._bootstrapAsync()
  }

  _bootstrapAsync = async () => {
    const user = await getAccount()

    this.props.navigation.navigate(user ? 'App' : 'Register')
  }

  render() {
    return (
      <Wrap>
        <Spinner />
        <StatusBar barStyle="default" />
      </Wrap>
    )
  }
}

export default AuthLoading
