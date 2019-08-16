import React, { useState } from 'react'
import { H1 } from '../typography/Typography'
import { PrimaryButton } from '../elements/Button/Button'
import { Input } from '../elements/Input/Input'

const Register = ({ onSubmit }) => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const handleSubmit = () => {
    if (firstName !== '' && lastName !== '') {
      onSubmit({ firstName, lastName })
    }
  }

  return (
    <>
      <H1>Egendata</H1>
      <Input
        name="firstName"
        onChangeText={newVal => setFirstName(newVal)}
        placeholder="Förnamn"
        style={{ marginTop: 64 }}
        value={firstName}
      />
      <Input
        name="lastName"
        onChangeText={newVal => setLastName(newVal)}
        placeholder="Efternamn"
        value={lastName}
      />
      <PrimaryButton onPress={handleSubmit}>Registrera</PrimaryButton>
    </>
  )
}

export default Register
