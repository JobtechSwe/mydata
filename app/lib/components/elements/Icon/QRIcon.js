import React from 'react'
import { Image, View } from 'react-native'
import styled from '../../../theme'

const StyledQRIcon = styled(View)`
  align-items: center;
  width: 96px;
  height: 96px;
  justify-content: center;
  border-radius: 96px;
  background-color: ${({ theme }) => theme.colors.primary};
`

const StyledQRImage = styled(Image)`
  width: 28px;
  height: 28px;
`

export default QRIcon = () => (
  <StyledQRIcon>
    <StyledQRImage source={require('./img/qr_inactive.png')} />
  </StyledQRIcon>
)
