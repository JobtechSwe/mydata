import React from 'react'
import { View, Image } from 'react-native'
import { Paragraph } from './typography/Typography'
import styled from '../theme'

const CardWrap = styled(View)`
  width: 50%;
  padding: 6px;
  flex-grow: 0;
  flex-shrink: 0;
`

const Card = styled(View)`
  align-items: center;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
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
    <CardWrap>
      <Card>
        <Logo source={{ uri: logo }} />
        <Paragraph small align="center">
          {domain}
        </Paragraph>
      </Card>
    </CardWrap>
  )
}

export default DomainCard
