import React from 'react'
import { View } from 'react-native'
import DomainCard from './DomainCard'
import styled from '../theme'

const Wrap = styled(View)`
  width: 100%;
  flex-direction: row;
  flex-wrap: wrap;
`

const ConsentDomainList = ({ consents }) => (
  <Wrap>
    {consents.map(d => (
      <DomainCard key={d.domain} domain={d.domain} logo={d.logo} />
    ))}
  </Wrap>
)

export default ConsentDomainList
