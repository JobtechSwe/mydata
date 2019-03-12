import React from 'react'
import styled from '../../theme'
import { Text } from 'react-native'

export const H1 = styled(Text)`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.contrast};
  font-size: ${({ theme }) => theme.fontSize.large};
  font-weight: 500;
  margin-bottom: 32px;
`

export const H3 = styled(Text)`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.regular};
  font-size: ${({ theme }) => theme.fontSize.regular};
  font-weight: 700;
  margin-bottom: 8px;
`

export const StyledParagraph = styled(Text)`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.regular};
  font-size: ${({ small, theme }) =>
    small ? theme.fontSize.small : theme.fontSize.regular};
  line-height: 22;
  text-align: ${({ align }) => align.toString()};
`

export const Paragraph = ({ align = 'left', small = false, ...props }) => (
  <StyledParagraph align={align} small={small} {...props} />
)
