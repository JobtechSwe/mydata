import React from 'react'
import { H1 } from '../../components/typography/Typography'
import { PrimaryButton } from '../../components/elements/Button/Button'
import { Input } from '../../components/elements/Input/Input'

export default class RegisterScreen extends React.Component {
  state = {
    firstName: '',
    lastName: '',
  }

  handleSubmit = () => {
    const { firstName, lastName } = this.state

    if (firstName !== '' && lastName !== '') {
      this.props.onSubmit(this.state)
    }
  }

  render() {
    return (
      <>
        <H1>MyData</H1>
        <Input
          name="firstName"
          onChangeText={firstName => this.setState({ firstName })}
          placeholder="Förnamn"
          style={{ marginTop: 64 }}
          value={this.state.firstName}
        />
        <Input
          name="lastName"
          onChangeText={lastName => this.setState({ lastName })}
          placeholder="Efternamn"
          value={this.state.lastName}
        />
        <PrimaryButton onPress={this.handleSubmit}>Registrera</PrimaryButton>
      </>
    )
  }
}
