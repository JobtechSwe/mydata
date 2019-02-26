import React from 'react'
import { Image, View } from 'react-native'
import { createAppContainer, createBottomTabNavigator } from 'react-navigation'
import Home from './screens/Home/Home'
import Account from './screens/Account/Account'
import ConsentRequest from './screens/ConsentRequest/ConsentRequest'
import { ThemeProvider, theme as myDataTheme } from './theme'
import { NavbarIcon } from './components/elements/Icon/Icon'

const getTabBarIcon = (navigation, active) => {
  const { routeName } = navigation.state

  return <NavbarIcon name={routeName.toLowerCase()} active={active} />
}

const AppContainer = createBottomTabNavigator(
  {
    Home: { screen: Home },
    ConsentRequest: { screen: ConsentRequest },
    Account: { screen: Account },
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, _tintColor }) =>
        getTabBarIcon(navigation, focused),
    }),
    tabBarOptions: {
      showIcon: true,
      showLabel: false,
    },
  }
)

const App = () => (
  <ThemeProvider theme={myDataTheme}>
    <AppContainer />
  </ThemeProvider>
)

export default App
