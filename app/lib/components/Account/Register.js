import React, { useState } from 'react'
import { H1 } from '../typography/Typography'
import { PrimaryButton } from '../elements/Button/Button'
import { Input } from '../elements/Input/Input'

const Register = ({ onSubmit }) => {
  const [ firstName, setFirstName ] = useState('')
  const [ lastName, setLastName ] = useState('')

  const handleSubmit = () => {
    if (firstName !== '' && lastName !== '') {
      onSubmit({ firstName, lastName })
    }
  }

  return (
    <>
    <H1>MyData</H1>
    <Input
      name="firstName"
      onChangeText={firstName => setFirstName(firstName)}
      placeholder="Förnamn"
      style={{ marginTop: 64 }}
      value={firstName}
    />
    <Input
      name="lastName"
      onChangeText={lastName => setLastName(lastName)}
      placeholder="Efternamn"
      value={lastName}
    />
    <PrimaryButton onPress={handleSubmit}>Registrera</PrimaryButton>
  </>)
}

export default Register
