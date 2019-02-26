import React from 'react'
import { createBottomTabNavigator } from 'react-navigation'
import Home from './screens/Home/Home'
import Account from './screens/Account/Account'
import ConsentRequest from './screens/ConsentRequest/ConsentRequest'
import { ThemeProvider, theme as myDataTheme } from './theme'
import { NavbarIcon, QRIcon } from './components/elements/Icon/Icon'

const getTabBarIcon = (navigation, active) => {
  const { routeName } = navigation.state

  return <NavbarIcon name={routeName.toLowerCase()} active={active} />
}

const AppContainer = createBottomTabNavigator(
  {
    Home: { screen: Home },
    'QR-code': { 
      screen: ConsentRequest,
      navigationOptions: () => ({
        tabBarIcon: <QRIcon />,     
      }), 
    },
    Account: { screen: Account },
  },
  {
    navigationOptions: ({ navigation }) => ({
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

const App = () => (
  <ThemeProvider theme={myDataTheme}>
    <AppContainer />
  </ThemeProvider>
)

export default App
