import React from 'react'
import {
  createAppContainer,
  createStackNavigator,
  createSwitchNavigator,
  createBottomTabNavigator,
} from 'react-navigation'
import Home from './screens/Home/Home'
import Wizard from './screens/Account/Account'
import ConsentRequest from './screens/ConsentRequest/ConsentRequest'
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
      screen: ConsentRequest,
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
      }),
    },
    Konto: { screen: Wizard },
  },
  {
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, _tintColor }) =>
        getTabBarIcon(navigation, focused),
    }),
    tabBarOptions: {
      showIcon: true,
      showLabel: true,
      tabStyle: { marginTop: 12, height: '100%' },
      labelStyle: { fontFamily: 'Karla-Bold', fontSize: 12, marginTop: 4 },
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
/*
class App extends React.Component {
  state = {
    loggedIn: false,
  }

  async componentDidMount() {
    let result = await getAccount()

    result === undefined
      ? this.setState({ loggedIn: false })
      : this.setState({ loggedIn: true })
  }

  render() {
    return (
      <ThemeProvider theme={myDataTheme}>
        {this.state.loggedIn ? <AppContainer /> : <Wizard />}
      </ThemeProvider>
    )
  }
}
*/

export default App
