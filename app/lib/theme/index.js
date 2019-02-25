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

const typography = {
  contrast: 'Rubik-Medium',
  regular: 'Karla-Regular',
  bold: 'Karla-Bold'
}

const theme = {
  colors,
  fontSize,
  typography
}

export {
  theme,
  styled as default,
  ThemeProvider
}
