const scopeWithoutClientId = [
  {
    area: 'firstName',
    description: 'Your first name.',
    purpose: 'To provide you with base data that you can use in other services in the MyData ecosystem.',
    lawfulBasis: 'CONSENT',
    permissions: ['WRITE']
  },
  {
    area: 'lastName',
    description: 'Your last name.',
    purpose: 'To provide you with base data that you can use in other services in the MyData ecosystem.',
    lawfulBasis: 'CONSENT',
    permissions: ['WRITE']
  },
  {
    area: 'city',
    description: 'The city where you are registrated.',
    purpose: 'To provide you with base data that you can use in other services in the MyData ecosystem.',
    lawfulBasis: 'CONSENT',
    permissions: ['WRITE']
  },
  {
    area: 'country',
    description: 'The country where you are registrated.',
    purpose: 'To provide you with base data that you can use in other services in the MyData ecosystem.',
    lawfulBasis: 'CONSENT',
    permissions: ['WRITE']
  },
  {
    area: 'zipCode',
    description: 'The zipCode where you are registrated.',
    purpose: 'To provide you with base data that you can use in other services in the MyData ecosystem.',
    lawfulBasis: 'CONSENT',
    permissions: ['WRITE']
  },
  {
    area: 'streetAddress',
    description: 'The streetAddress where you are registrated.',
    purpose: 'To provide you with base data that you can use in other services in the MyData ecosystem.',
    lawfulBasis: 'CONSENT',
    permissions: ['WRITE']
  }
]

const generateScope = clientId => scopeWithoutClientId.map(x => Object.assign({}, x, { domain: clientId }))

module.exports = {
  generateScope
}
