import React from 'react'
import { TouchableOpacity, View, Text } from 'react-native'
import styled, { theme } from '../../../theme'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

const StyledConsentButton = styled(View)`
  align-items: center;
  background-color: ${({ theme }) => theme.colors.white};
  flex-direction: row;
  justify-content: center;
`

const StyledConsentText = styled(Text)`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.bold};
  font-size: ${({ theme }) => theme.fontSize.regular};
  font-weight: 700;
  padding: 28px 16px;
  text-align: center;
`
export const ConsentButtonWrap = styled(View)`
  align-items: center;
  background-color: ${({ theme }) => theme.colors.white};
  border-top-color: ${({ theme }) => theme.colors.border};
  border-top-width: 1px;
  flex-direction: row;
  height: 96px;
  justify-content: space-evenly;
`

export const AcceptConsentButton = ({ children, ...props }) => (
  <TouchableOpacity {...props}>
    <StyledConsentButton>
      <FontAwesome5
        color={theme.colors.accept}
        name={'check'}
        size={24}
        solid
      />
      <StyledConsentText>{children}</StyledConsentText>
    </StyledConsentButton>
  </TouchableOpacity>
)

export const DenyConsentButton = ({ children, ...props }) => (
  <TouchableOpacity {...props}>
    <StyledConsentButton>
      <FontAwesome5 name={'ban'} size={24} color={theme.colors.deny} solid />
      <StyledConsentText>{children}</StyledConsentText>
    </StyledConsentButton>
  </TouchableOpacity>
)
