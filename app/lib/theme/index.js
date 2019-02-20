import styled, { ThemeProvider } from 'styled-components/native'

const colors = {
  inactive: '#D8D5F6',
  primary: '#241C7D',
  quiet: '#F9F9FB',
  shadow: '#B1ACEC',
  white: '#FFFFFF'
}

const fontSize = {
  regular: '18px',
  large: '48px'
}

const theme = {
  colors,
  fontSize
}

export {
  theme,
  styled as default,
  ThemeProvider
}
