import React from 'react'
import { TouchableOpacity } from 'react-native'
import styled from '../../../theme'
import { BaseButton, BaseButtonText } from './BaseButton'

export const StyledPrimaryButton = styled(BaseButton)`
  background: ${({ theme }) => theme.colors.primary};
`

export const PrimaryButtonText = styled(BaseButtonText)`
  color: ${({ theme }) => theme.colors.white};
`

export const PrimaryButton = ({
  children,
  ...props
}) =>
  (
    <TouchableOpacity {...props}>
      <StyledPrimaryButton style={{
        shadowColor: '#B1ACEC',
        shadowRadius: 14,
        shadowOpacity: 0.4,
        shadowOffset: {
          width: 0,
          height: 8
        },
        marginBottom: 32
      }}>
        <PrimaryButtonText>
          {children}
        </PrimaryButtonText>
      </StyledPrimaryButton>
    </TouchableOpacity>
  )

export const SecondaryButton = ({
  children,
  ...props
}) =>
  (
    <TouchableOpacity {...props}>
      <BaseButton style={{
        shadowColor: '#B1ACEC',
        shadowRadius: 14,
        shadowOpacity: 0.2,
        shadowOffset: {
          width: 0,
          height: 8
        },
        marginBottom: 32
      }}>
        <BaseButtonText>
          {children}
        </BaseButtonText>
      </BaseButton>
    </TouchableOpacity>
  )
