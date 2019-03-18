import styled from '../../../theme'

export const BaseButton = styled.View`
  border: 0;
  border-radius: 96px;
  background: ${({ theme }) => theme.colors.white};
`

export const BaseButtonText = styled.Text`
  align-items: center;
  padding: 18px 88px;
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.bold};
  font-size: ${({ theme }) => theme.fontSize.regular};
  font-weight: 700;
  height: 56px;
  text-align: center;
  min-width: 264px;
  width: 100%;
`

export default BaseButton
