import React, { useState } from 'react'
import { Scan, ConsentRequest, Login } from '../../components/Auth'
import { handle } from '../../services/index'

const AuthScreen = props => {
  const [state, setState] = useState({
    view: (props && props.view) || 'scan',
  })

  const onScan = async token => {
    try {
      const { connectionRequest, existingConnection, sessionId } = await handle(
        token
      )
      const view = existingConnection ? 'login' : 'connection'
      setState({ view, connectionRequest, existingConnection, sessionId })
    } catch (error) {
      console.error('Error while initialiasing connectionRequest', error)
    }
  }

  const onCancel = () => {
    setState({ view: 'enter' })
    props.navigation.navigate('Hem')
  }

  const onApprove = () => {
    setState({ view: 'enter' })
    /* TODO: Add me
     * Linking.openURL(redirectUrl)
     */
    props.navigation.navigate('Hem')
  }

  const onError = () => {
    props.navigation.goBack()
  }

  switch (state.view) {
    case 'login':
      return (
        <Login
          existingConnection={state.existingConnection}
          sessionId={state.sessionId}
          onApprove={onApprove}
          onCancel={onCancel}
          onError={onError}
        />
      )
    case 'connection':
      return (
        <ConsentRequest
          connectionRequest={state.connectionRequest}
          onApprove={onApprove}
          onCancel={onCancel}
        />
      )
    case 'scan':
    default:
      return <Scan onCancel={onCancel} onScan={onScan} />
  }
}

export default AuthScreen
