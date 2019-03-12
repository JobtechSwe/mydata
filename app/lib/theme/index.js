import styled, { ThemeProvider } from 'styled-components/native'

const colors = {
  inactive: '#D8D5F6',
  primary: '#241C7D',
  quiet: '#F9F9FB',
  shadow: '#B1ACEC',
  white: '#FFFFFF',
  lightGrey: '#EAEAF1',
  border: '#EBEAFA',
  accept: '#0AC238',
  deny: '#F20D0D',
}

const fontSize = {
  small: '14px',
  regular: '18px',
  large: '48px',
}

const typography = {
  contrast: 'Rubik-Medium',
  regular: 'Karla-Regular',
  bold: 'Karla-Bold',
}

const theme = {
  colors,
  fontSize,
  typography,
}

export { theme, styled as default, ThemeProvider }
