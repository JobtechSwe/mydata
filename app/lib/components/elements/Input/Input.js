import React from 'react'
import styled, { theme } from '../../../theme'

const StyledInput = styled.TextInput`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 5px;
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.regular};
  font-size: ${({ theme }) => theme.fontSize.regular};
  margin-bottom: 32px;
  padding: 18px 24px;
  width: 264px;
`

export const Input = props => (
  <StyledInput {...props} placeholderTextColor={theme.colors.inactive} />
)
