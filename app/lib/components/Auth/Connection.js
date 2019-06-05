import React from 'react'
import { H1, Paragraph } from '../typography/Typography'
import { PrimaryButton, SecondaryButton } from '../elements/Button/Button'
import { Wrap } from '../view/Wrapper'
import { approveConnection } from '../../services/auth'

const Connection = ({ connectionRequest, onApprove }) => {
  const onApproveConnection = async () => {
    await approveConnection(connectionRequest)
    onApprove()
  }

  const onDenyConnection = () => {
    // TODO: Implement
  }

  return (
    <Wrap>
      <H1>Egendata</H1>
      <Paragraph align="center">
        Do you want to connect to {connectionRequest.displayName}?
      </Paragraph>
      <PrimaryButton onPress={onApproveConnection}>Yes!</PrimaryButton>
      <SecondaryButton onPress={onDenyConnection}>No!</SecondaryButton>
    </Wrap>
  )
}

export default Connection
