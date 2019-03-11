import React from 'react'
import { shallow } from 'react-native-testing-library'
import MockedProvider from '../../../../utils/test-utils'
import QRIcon from '../QRIcon'

describe('elements/Icons/QRIcon', () => {
  it('should render', () => {
    const { output } = shallow(
      <MockedProvider>
        <QRIcon />
      </MockedProvider>
    )

    expect(output).toMatchSnapshot()
  })
})
