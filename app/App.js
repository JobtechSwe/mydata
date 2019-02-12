import { createStackNavigator } from 'react-navigation'
import HomeScreen from './screens/HomeScreen'
import AccountScreen from './screens/AccountScreen'
import ManageConsentsRequestScreen from './screens/ManageConsentsRequestScreen'
import React from 'react'
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper'

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors
  },
}

const stackConfig = {
  initialRouteName: 'Home'
}

const App = createStackNavigator({
  Home: { screen: HomeScreen },
  Account: { screen: AccountScreen },
  ManageConsentsRequest: { screen: ManageConsentsRequestScreen }
}, stackConfig)

export default () => (
  <PaperProvider theme={theme}>
    <App/>
  </PaperProvider>
)
