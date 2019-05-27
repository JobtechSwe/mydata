import React, { useState } from 'react'
import { Scan, Register, Login } from '../../components/Auth'
import { handle } from '../../services/index'

const AuthScreen = (props) => {
  const [state, setState] = useState({
    view: (props && props.view) || 'scan',
    authenticationRequest: undefined,
  })

  const onScan = async token => {
    try {
      const { payload, hasConnection } = await handle(token)
      const view = hasConnection ? 'login' : 'register'
      setState({ view, authenticationRequest: payload })
    }
    catch (error) {
      console.error('foo', error)
    }
  }

  const onCancel = () => {
    setState({ view: 'enter' })
    props.navigation.navigate('Hem')
  }

  const onApprove = () => {
    setState({ view: 'enter' })
    props.navigation.navigate('Hem')
  }
  const onError = () => {
    props.navigation.goBack()
  }

  switch (state.view) {
    case 'login':
      return (
        <Login
          code={state.code}
          onApprove={onApprove}
          onCancel={onCancel}
          onError={onError}
        />
      )
    case 'register':
      return (
        <Register
          authenticationRequest={state.authenticationRequest}
          onApprove={onApprove}
          onCancel={onCancel}
        />
      )
    case 'scan':
    default:
      return (
        <Scan
          onCancel={onCancel}
          onScan={onScan}
        />
      )
  }
}

export default AuthScreen
