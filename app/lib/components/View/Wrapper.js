import React from 'react'
import { View, ScrollView } from 'react-native'
import styled from '../../theme'

export const Wrap = styled(View)`
  overflow: hidden;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.quiet};
  height: 100%;
  justify-content: center;
  padding: 48px 32px 0;
`

export const ScrollViewWrap = props => (
  <ScrollView
    contentContainerStyle={{
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
    }}
    {...props}
  />
)
