import React from 'react'
import { ActivityIndicator, Animated, Easing, View } from 'react-native'
import styled, { theme } from '../../../theme'

export const DefaultSpinner = ({ size = 'large' }) => (
  <View>
    <ActivityIndicator color={theme.colors.primary} size={size} />
  </View>
)

export const StyledSpinner = styled(Animated.View)`
  border-radius: 96px;
  border-width: 3px;
  border-color: ${({ theme }) => theme.colors.primary};
  border-style: solid;
  border-left-width: 0;
  border-bottom-width: 0;
  width: 64px;
  height: 64px;
`

export class Spinner extends React.Component {
  state = {
    spinValue: new Animated.Value(0),
  }

  render() {
    // First set up animation
    Animated.loop(
      Animated.timing(this.state.spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
      })
    ).start()

    // Second interpolate beginning and end values (in this case 0 and 1)
    const spin = this.state.spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    })

    return <StyledSpinner style={{ transform: [{ rotate: spin }] }} />
  }
}
