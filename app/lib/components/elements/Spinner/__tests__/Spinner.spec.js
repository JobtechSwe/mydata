import React from 'react'
import { shallow } from 'react-native-testing-library'
import MockedProvider from '../../../../utils/test-utils'
import { Spinner } from '../Spinner'

describe('elements/Spinner', () => {
  it('should render', () => {
    const { output } = shallow(<Spinner />)

    expect(output).toMatchSnapshot()
  })
})
