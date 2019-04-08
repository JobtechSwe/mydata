import React from 'react'
import { View, Image } from 'react-native'
import { Paragraph } from './typography/Typography'
import styled from '../theme'

const Card = styled(View)`
  align-items: center;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  width: 146px;
  height: 148px;
  justify-content: center;
`

const Logo = styled(Image)`
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
`

const DomainCard = ({ logo, domain }) => {
  return (
    <Card>
      <Logo source={{ uri: logo }} />
      <Paragraph align="center">{domain}</Paragraph>
    </Card>
  )
}

export default DomainCard
