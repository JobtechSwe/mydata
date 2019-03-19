import React from 'react'
import { theme, ThemeProvider } from '../theme'

const MockedProvider = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
)

export default MockedProvider
