import React, { useState } from 'react'
import { Scan, Connection, Login } from '../../components/Auth'
import { handle } from '../../services/index'

const AuthScreen = (props) => {
  const [state, setState] = useState({
    view: (props && props.view) || 'scan',
    authenticationRequest: undefined,
  })

  const onScan = async token => {
    try {
      const { connectionRequest } = await handle(token)
      const view = connectionRequest ? 'connection' : 'login'
      setState({ view, connectionRequest })
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
    case 'connection':
      return (
        <Connection
          connectionRequest={state.connectionRequest}
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
