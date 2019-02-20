import React from 'react'
import styled, { theme } from '../../../theme'

const StyledInput = styled.TextInput`
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSize.regular};
  border-radius: 5px;
  padding: 18px 24px;
  width: 264px;
`

export const Input = props => (
  <StyledInput {...props} placeholderTextColor={theme.colors.inactive} />
)
