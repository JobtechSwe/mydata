const defaultRequest = {
  scope: [
    {
      domain: process.env.CLIENT_ID,
      area: 'baseData',
      description: 'Personal information.',
      permissions: ['read', 'write'],
      purpose: 'In order to create a CV using our website.',
      lawfulBasis: 'CONSENT'
    },
    {
      domain: process.env.CLIENT_ID,
      area: 'experience',
      description: 'A list of your work experiences.',
      permissions: ['read', 'write'],
      purpose: 'In order to create a CV using our website.',
      lawfulBasis: 'CONSENT'
    },
    {
      domain: process.env.CLIENT_ID,
      area: 'education',
      description: 'A list of your educations.',
      permissions: ['read', 'write'],
      purpose: 'In order to create a CV using our website.',
      lawfulBasis: 'CONSENT'
    },
    {
      domain: process.env.CLIENT_ID,
      area: 'languages',
      description: 'A list of your language proficiencies.',
      permissions: ['read', 'write'],
      purpose: 'In order to create a CV using our website.',
      lawfulBasis: 'CONSENT'
    }
  ]
}

const addExpiry = now => obj => durationInSeconds => Object.assign({}, obj, { expiry: Math.round(now() / 1000 + durationInSeconds) })

module.exports = {
  createDefaultRequest: addExpiry(Date.now)(defaultRequest),
  domain: process.env.CLIENT_ID,
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
