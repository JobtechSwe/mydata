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

export const StyledParagraph = styled(Text)`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.regular};
  font-size: ${({ theme }) => theme.fontSize.regular};
  line-height: 22;
`

export const Paragraph = ({ align = 'left', style, ...props }) => (
  <StyledParagraph {...props} style={{ ...style, textAlign: align }} />
)
