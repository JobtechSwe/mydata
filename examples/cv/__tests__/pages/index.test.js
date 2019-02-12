import { mount } from 'enzyme'
import React from 'react'

import Index from '../../pages/index.js'

describe('Index', () => {
  it('renders a login button', () => {
    const app = mount(<Index />)

    expect(app.find('button').text()).toEqual('Log in with Mydata')
  })
})

/* describe('With Snapshot Testing', () => {
  it('App shows "Hello world!"', () => {
    const component = renderer.create(<App />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
}) */
