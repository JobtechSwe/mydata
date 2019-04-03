import React from 'react'
import { TouchableOpacity, View, Text } from 'react-native'
import styled, { theme } from '../../../theme'
import { Icon } from '../Icon/Icon'

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
      <Icon name="check" fill={theme.colors.accept} width={24} />
      <StyledConsentText>{children}</StyledConsentText>
    </StyledConsentButton>
  </TouchableOpacity>
)

export const DenyConsentButton = ({ children, ...props }) => (
  <TouchableOpacity {...props}>
    <StyledConsentButton>
      <Icon name="ban" fill={theme.colors.deny} width={24} />
      <StyledConsentText>{children}</StyledConsentText>
    </StyledConsentButton>
  </TouchableOpacity>
)
