import React from 'react'
import { Platform } from 'react-native'
import {
  createAppContainer,
  createStackNavigator,
  createSwitchNavigator,
  createBottomTabNavigator,
} from 'react-navigation'
import Home from './screens/Home/Home'
import Settings from './screens/Settings/Settings'
import Wizard from './screens/Account/Account'
import Auth from './screens/Auth/Auth'
import AuthLoading from './screens/AuthLoading/AuthLoading'
import { ThemeProvider, theme as myDataTheme } from './theme'
import { NavbarIcon } from './components/elements/Icon/Icon'
import QRIcon from './components/elements/Icon/QRIcon'

const getTabBarIcon = (navigation, active) => {
  const { routeName } = navigation.state

  return <NavbarIcon name={routeName.toLowerCase()} active={active} />
}

const AppStack = createBottomTabNavigator(
  {
    Hem: { screen: Home },
    'QR-kod': {
      screen: Auth,
      navigationOptions: () => ({
        tabBarIcon: <QRIcon />,
        tabBarOptions: {
          showIcon: true,
          showLabel: true,
          tabStyle: { marginTop: 12, height: '100%' },
          labelStyle: { fontFamily: 'Karla-Bold', fontSize: 12, marginTop: 4 },
          inactiveTintColor: myDataTheme.colors.lightGrey,
          activeTintColor: myDataTheme.colors.lightGrey,
        },
        tabBarVisible: false,
      }),
    },
    Konto: { screen: Settings },
  },
  {
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, _tintColor }) =>
        getTabBarIcon(navigation, focused),
    }),
    tabBarOptions: {
      showIcon: true,
      showLabel: true,
      style: { height: 56 },
      tabStyle: { marginTop: Platform.OS === 'ios' ? 12 : 0, height: '100%' },
      labelStyle: { fontFamily: 'Karla-Bold', fontSize: 12, marginTop: 0 },
      inactiveTintColor: myDataTheme.colors.lightGrey,
      activeTintColor: myDataTheme.colors.primary,
    },
  }
)
const RegisterStack = createStackNavigator({
  Register: { screen: Wizard, navigationOptions: () => ({ header: null }) },
})

const AppSwitchContainer = createAppContainer(
  createSwitchNavigator(
    {
      AuthLoading,
      App: AppStack,
      Register: RegisterStack,
    },
    {
      initialRouteName: 'AuthLoading',
    }
  )
)

const App = props => {
  return (
    <ThemeProvider theme={myDataTheme}>
      <AppSwitchContainer {...props} />
    </ThemeProvider>
  )
}

export default App
