import { Text } from 'react-native'
import styled from '../../theme'

export const H1 = styled(Text)`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.contrast};
  font-size: ${({ theme }) => theme.fontSize.large};
  font-weight: 500;
  margin-bottom: 32px;
`

export const Paragraph = styled(Text)`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.regular};
  font-size: ${({ theme }) => theme.fontSize.regular};
  line-height: 22;
`
