import React from 'react'
import { ActivityIndicator, View } from 'react-native'
import { theme } from '../../../theme'

export const Spinner = ({ size = 'large' }) => (
  <View>
    <ActivityIndicator color={theme.colors.primary} size={size} />
  </View>
)
