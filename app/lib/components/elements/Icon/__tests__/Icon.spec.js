import React from 'react'
import { shallow } from 'react-native-testing-library'
import MockedProvider from '../../../../utils/test-utils'
import { NavbarIcon } from '../Icon'

describe('elements/Icons', () => {
  let iconComponent

  beforeEach(() => {
    /*eslint-disable */
    iconComponent = name => {
      return (
        <MockedProvider>
          <NavbarIcon name={name} />
        </MockedProvider>
      )
    }
  })

  it('should return appropriate icon based on name = "konto"', () => {
    const { output } = shallow(iconComponent('konto'))

    expect(output).toMatchSnapshot()
  })

  it('should return appropriate icon based on name = "qr-kod"', () => {
    const { output } = shallow(iconComponent('qr-kod'))

    expect(output).toMatchSnapshot()
  })

  it('should return appropriate icon based on name = "hem"', () => {
    const { output } = shallow(iconComponent('hem'))

    expect(output).toMatchSnapshot()
  })
})
