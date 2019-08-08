import React from 'react'
import { fireEvent, render, shallow } from 'react-native-testing-library'
import MockedProvider from '../../../../utils/test-utils'
import { PrimaryButton } from '../Button'

describe('elements/Button', () => {
  it('should render', () => {
    const { output } = shallow(<PrimaryButton>PrimaryButton</PrimaryButton>)

    expect(output).toMatchSnapshot()
  })

  it('should call onClick-handler', () => {
    const handleClick = jest.fn()

    const { getByText } = render(
      <MockedProvider>
        <PrimaryButton onPress={handleClick}>PrimaryButton</PrimaryButton>
      </MockedProvider>
    )

    fireEvent.press(getByText(/primarybutton/i))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
