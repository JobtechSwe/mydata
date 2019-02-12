
const domain = 'localhost:4000'
const area = 'cv'

const defaultRequest = {
  scope: [
    {
      domain,
      area,
      description: 'A list of your work experiences, educations, language proficiencies and so on that you have entered in the service.',
      permissions: [ 'write' ],
      purpose: 'In order to create a CV using our website.',
      lawfulBasis: 'CONSENT'
    }
  ]
}

const addExpiry = now => obj => durationInSeconds => Object.assign({}, obj, { expiry: Math.round(now() / 1000 + durationInSeconds) })

module.exports = {
  createDefaultRequest: addExpiry(Date.now)(defaultRequest),
  area,
  domain,
  addExpiry // Exposed for testing purposes
}

// Kept here for future reference

/* Lawful bases:
'CONSENT',
'CONTRACT',
'LEGAL_OBLIGATION',
'VITAL_INTERESTS',
'PUBLIC_TASK',
'LEGITIMATE_INTERESTS'
*/
