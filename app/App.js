import { createStackNavigator } from 'react-navigation'
import HomeScreen from './screens/HomeScreen'
import AccountScreen from './screens/AccountScreen'
import ManageConsentsRequestScreen from './screens/ManageConsentsRequestScreen'
import ManageLoginRequestScreen from './screens/ManageLoginRequestScreen'
import React from 'react'
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper'

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
  },
}

const stackConfig = {
  initialRouteName: 'Home',
}

const AppStackNavigator = createStackNavigator({
  Home: { screen: HomeScreen },
  Account: { screen: AccountScreen },
  ManageConsentsRequest: { screen: ManageConsentsRequestScreen },
  ManageLoginRequest: { screen: ManageLoginRequestScreen },
}, stackConfig)

const App = () => (
  <PaperProvider theme={theme}>
    <AppStackNavigator/>
  </PaperProvider>
)

export default App
