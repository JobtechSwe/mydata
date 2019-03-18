import React from 'react'
import { shallow } from 'react-native-testing-library'
import { Spinner } from '../Spinner'

jest.useFakeTimers() // this is needed to make jest exit after test

describe('elements/Spinner', () => {
  it('should render', () => {
    const { output } = shallow(<Spinner />)

    expect(output).toMatchSnapshot()
  })
})
