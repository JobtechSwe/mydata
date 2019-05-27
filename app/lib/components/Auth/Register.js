import React, { useEffect, useState } from 'react'
import { H1, Paragraph } from '../typography/Typography'
import { PrimaryButton, SecondaryButton } from '../elements/Button/Button'
import { Wrap } from '../View/Wrapper'
import { initRegistration, approveConnection } from '../../services/auth'

const Register = ({ authenticationRequest, onApprove }) => {
  const [connectionRequest, setConnectionRequest] = useState({})
  useEffect(() => {
    initRegistration(authenticationRequest)
      .then(payload => {
        setConnectionRequest(payload)
      }).catch(err => {
        console.error(err)
      })
  }, [])

  const onApproveConnection = async () => {
    await approveConnection(connectionRequest)
    onApprove()
  }

  const onDenyConnection = () => {
    // TODO: Implement
  }

  return (
    <Wrap>
      <H1>MyData</H1>
      <Paragraph align="center">
        Do you want to connect to {connectionRequest.displayName}?
      </Paragraph>
      <PrimaryButton onPress={onApproveConnection}>Yes!</PrimaryButton>
      <SecondaryButton onPress={onDenyConnection}>No!</SecondaryButton>
    </Wrap>
  )
}

export default Register

// export default class RegisterScreen extends React.Component {
//   state = {
//     firstName: '',
//     lastName: '',
//   }

//   handleSubmit = () => {
//     const { firstName, lastName } = this.state

//     if (firstName !== '' && lastName !== '') {
//       this.props.onSubmit(this.state)
//     }
//   }

//   render() {
//     return (
//       <>
//         <H1>MyData</H1>
//         <Input
//           name="firstName"
//           onChangeText={firstName => this.setState({ firstName })}
//           placeholder="Förnamn"
//           style={{ marginTop: 64 }}
//           value={this.state.firstName}
//         />
//         <Input
//           name="lastName"
//           onChangeText={lastName => this.setState({ lastName })}
//           placeholder="Efternamn"
//           value={this.state.lastName}
//         />
//         <PrimaryButton onPress={this.handleSubmit}>Registrera</PrimaryButton>
//       </>
//     )
//   }
// }
