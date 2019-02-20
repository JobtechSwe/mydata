import React from 'react'
import { render } from 'react-native-testing-library'

import Account from '../AccountScreen'
import Account from '../../components/account'
import KeyPair from '../../components/keypair'
import PDS from '../../components/pds'

xdescribe('AccountScreen', () => {
  it.only('renders', () => {
    const { getByText } = <AccountScreen />


    expect(getByText(/hello/i)).toMatchSnapshot()
  })
})
