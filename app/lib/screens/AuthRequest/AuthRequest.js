import React, { useState } from 'react'
import { EnterAuthCode } from '../../components/Consent'
import { handleJwt } from '../../services/auth'

const AuthRequestScreen = () => {
  const [state, setState] = useState({
    view: 'enter',
    code: '',
  })

  const [authReq, setAuthReq] = useState()

  const onCode = async (jwt) => {
    try {
      try {
        const verifiedAuthReq = await handleJwt(jwt)
        console.log('verifiedAuthReq', verifiedAuthReq)
        setAuthReq(verifiedAuthReq)
      } catch (error) {
        console.error(error)
      }
    } catch (error) {
      console.error('could not get key for jwt', jwt, error)
    }

    /*
      3. Now, check in asyncStorage if we already got a connection for that clientId and if the hash of the permissions is the same
      4a: If already got a connection, then do LOGIN
      4b: If not, then do REGISTRATION_INITIALIZATION
     */
  }

  return <EnterAuthCode onCancel={() => ({})} onCode={onCode}/>
}

// class ManageConsentsRequestScreen extends React.Component {
//   state = {
//     view: 'enter',
//     code: '',
//   }

//   static navigationOptions = {
//     tabBarVisible: false,
//   }

//   componentDidMount() {
//     const { params } = this.props.navigation.state

//     if (params && params.myDataUrl) {
//       const { code, type } = parse(params.myDataUrl)
//       this.onCode({ code, type })
//     }
//   }

//   // Events
//   onCode = ({ type, code }) => {
//     this.setState({ code, view: type })
//   }

//   onCancel = () => {
//     this.setState({ view: 'enter' })
//     this.props.navigation.navigate('Hem')
//   }

//   onApprove = () => {
//     this.setState({ view: 'enter' })
//     this.props.navigation.navigate('Hem')
//   }
//   onError = () => {
//     this.props.navigation.goBack()
//   }

//   render() {
//     switch (this.state.view) {
//       case 'login':
//         return (
//           <LoginRequest
//             code={this.state.code}
//             onApprove={this.onApprove}
//             onCancel={this.onCancel}
//             onError={this.onError}
//           />
//         )
//       case 'register':
//         return (
//           <ConsentRequest
//             consentRequestId={this.state.code}
//             onApprove={this.onApprove}
//             onCancel={this.onCancel}
//           />
//         )
//       case 'enter':
//       default:
//         return (
//           <EnterAuthCode
//             onCancel={this.onCancel}
//             onCode={this.onCode}
//           />
//         )
//     }
//   }
// }

export default AuthRequestScreen
