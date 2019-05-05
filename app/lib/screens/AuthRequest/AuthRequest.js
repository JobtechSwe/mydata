import React, { useState } from 'react'
import { EnterAuthCode, LoginRequest, ConsentRequest } from '../../components/Consent'
import { verifyAndParseAuthRequest, getConnectionInfo, hasConnection } from '../../services/auth'

const AuthRequestScreen = ({ props }) => {
  const [state, setState] = useState({
    view: 'enter',
    authenticationRequest: undefined,
  })

  const onCode = async (jwt) => {
    try {
      const verifiedAuthReq = await verifyAndParseAuthRequest(jwt)
      if (await hasConnection(verifiedAuthReq)) {
        setState({ view: 'login', name: verifiedAuthReq.name })
      } else {
        const connectionInfo = await getConnectionInfo(verifiedAuthReq)
        setState({
          view: 'register',
          connectionInfo,
        })
      }
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
        <LoginRequest
          code={state.code}
          onApprove={onApprove}
          onCancel={onCancel}
          onError={onError}
        />
      )
    case 'register':
      return (
        <ConsentRequest
          consentRequestId={state.code}
          onApprove={onApprove}
          onCancel={onCancel}
        />
      )
    case 'enter':
    default:
      return (
        <EnterAuthCode
          onCancel={onCancel}
          onCode={onCode}
        />
      )
  }
}

export default AuthRequestScreen
