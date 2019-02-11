import React from 'react'
import App, { Container } from 'next/app'
import Head from 'next/head'
import Router from 'next/router'
// import { init as initApm } from 'elastic-apm-js-base'
import { globalStyle, createGlobalStyle } from '@smooth-ui/core-sc'
import Navbar from '../components/Navbar'
import { StoreProvider } from '../services/StoreContext'
import { getAccessToken } from '../services/storage'

const GlobalStyle = createGlobalStyle`${globalStyle()}`

export default class MyDataCV extends App {
  async componentDidMount () {
    /* const apm = initApm({

      // Set required service name (allowed characters: a-z, A-Z, 0-9, -, _, and space)
      serviceName: 'mydata-cv',

      // Set custom APM Server URL (default: http://localhost:8200)
      serverUrl: 'http://localhost:8200',

      // Set service version (required for sourcemap feature)
      serviceVersion: ''
    })
    apm.setInitialPageLoadName(window.location.href)
    */

    const token = getAccessToken()
    if (token) {
      console.log('found token in storage')
      if (Router.pathname === '/') {
        Router.push({
          pathname: '/profile'
        })
      }
    } else {
      console.log('found no token in storage')
      if (Router.pathname === '/profile') {
        Router.push({
          pathname: '/'
        })
      }
    }
  }

  render () {
    const { Component, pageProps } = this.props

    return (
      <React.Fragment>
        <GlobalStyle />
        <Head>
          <title>CV</title>
        </Head>
        <Container>
          <StoreProvider>
            <Navbar />
            <Component {...pageProps} />
          </StoreProvider>
        </Container>
      </React.Fragment>
    )
  }
}
