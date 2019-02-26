import React from 'react'
import { View } from 'react-native'
import { createStackNavigator } from 'react-navigation'
import Home from './screens/Home/Home'
import Account from './screens/Account/Account'
import ConsentRequest from './screens/ConsentRequest/ConsentRequest'
import { ThemeProvider, theme as myDataTheme } from './theme'
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
  Home: { screen: Home },
  Account: { screen: Account },
  ConsentRequest: { screen: ConsentRequest },
}, stackConfig)

const App = () => (
    <PaperProvider theme={theme}>
      <ThemeProvider theme={myDataTheme}>
        <AppStackNavigator/>
      </ThemeProvider>
    </PaperProvider>
)

export default App
