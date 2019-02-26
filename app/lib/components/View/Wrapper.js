import { View } from 'react-native'
import styled from '../../theme'

export const Wrap = styled(View)`
  align-items: center;
  background-color: ${({ theme }) => theme.colors.quiet};
  justify-content: center;
`
