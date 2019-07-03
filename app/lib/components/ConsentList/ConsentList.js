import React from 'react'
import { View } from 'react-native'
import ConsentCard from './ConsentCard'
import styled from '../../theme'

const Wrap = styled(View)`
  width: 100%;
  flex-direction: row;
  flex-wrap: wrap;
`

const ConsentList = ({ consents }) => (
  <Wrap>
    {consents.map(c => (
      <ConsentCard
        key={c.consentId}
        clientDisplayName={c.clientDisplayName}
        clientLogo={c.clientLogo}
      />
    ))}
  </Wrap>
)

export default ConsentList
