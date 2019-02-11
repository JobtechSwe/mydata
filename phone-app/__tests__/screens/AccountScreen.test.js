import React from 'react'
import { shallow } from 'enzyme'
import EventEmitter from 'eventemitter3'

import AccountScreen from '../../screens/AccountScreen'
import Account from '../../components/account'
import KeyPair from '../../components/keypair'
import PDS from '../../components/pds'

xdescribe('AccountScreen', () => {
  let navigation
  beforeEach(() => {
    navigation = new EventEmitter()
  })
  it('works', () => {
    const screen = shallow(<AccountScreen {...{navigation}} />)
    navigation.emit('willFocus')
    screen.update()
    console.log(screen.html())
    expect(screen.find(Account).exists()).toBe(true)
  })
})