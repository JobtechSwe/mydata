import styled from '../../../theme'

export const BaseButton = styled.View`
  border: 0;
  border-radius: 96px;
  background: ${({ theme }) => theme.colors.white};
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0 18px;
  margin: 0 0 5px 0;
  max-width: 264px;
  width: 100%;
  margin: 0 auto;
`

export const BaseButtonText = styled.Text`
  padding: 18px 12px;
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.bold};
  font-size: ${({ theme }) => theme.fontSize.regular};
  text-align: center;
`

export default BaseButton
