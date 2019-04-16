import React from 'react'
import { shallow } from 'react-native-testing-library'
import ConsentModal from '../ConsentModal'

const scopesMock = [
  {
    area: 'Education',
    description: 'För att du skall kunna hålla reda på dina utbildningar.',
  },
  {
    area: 'Skills',
    description:
      'För att du skall kunna spara ner dina tidigare arbetserfarenheter.',
  },
  {
    area: 'Language',
    description: 'För att du skall kunna spara ner dina språkkunskaper.',
  },
]

const clientMock = {
  displayName: 'ACME',
  description:
    'En tjänst för att du enkelt skall kunna fylla i dina kompetenser på ett och samma ställe.',
}

describe.skip('components/Consent/ConsentModal', () => {
  it('should render without errors', () => {
    const { output } = shallow(
      <ConsentModal visible={true} client={clientMock} scope={scopesMock} />
    )

    expect(output).toMatchSnapshot()
  })
})
