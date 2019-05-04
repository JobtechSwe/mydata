import React, { useState } from 'react'
import { EnterAuthCode } from '../../components/Consent'
import { handleJwt, hasConnection, createConnectionInfoRequest } from '../../services/auth'
import axios from 'axios'

const AuthRequestScreen = () => {
  const [state, setState] = useState({
    view: 'enter',
    code: '',
  })

  const [authReq, setAuthReq] = useState()

  const onCode = async (jwt) => {
      try {
        const verifiedAuthReq = await handleJwt(jwt)
        console.log('verifiedAuthReq', verifiedAuthReq)

        if (await hasConnection(verifiedAuthReq)) {
          console.log(`Has connection for ${verifiedAuthReq.iss}!`)
          // Send LOGIN to operator
        } else {
          console.log(`No existing connection for ${verifiedAuthReq.iss}`)
          // Send CONNECTION_INFO_REQUEST to client
          const connectionInfoRequest = createConnectionInfoRequest(verifiedAuthReq)

          await axios.get(verifiedAuthReq.events, { headers: { jwt: connectionInfoRequest } })

          // If ok, then store connection and send CONNECTION to operator

          // If not, do nothing..?
      }
    }
       catch (error) {
        console.error('foo', error)
      }
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
