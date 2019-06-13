const sqlStatements = require('../lib/sqlStatements')

describe('sqlStatements', () => {
  describe('#permissionsInserts', () => {
    let connectionResponse, connection, accountKey, myCvEducationKey, readKeys
    beforeEach(() => {
      accountKey = {
        kid: 'egendata://jwks/abcd'
      }
      myCvEducationKey = {
        kid: 'https://mycv.work/jwks/abcd'
      }
      readKeys = {
        [myCvEducationKey.kid]: myCvEducationKey
      }
      connectionResponse = {
        iss: 'egendata://account/9b517596-6348-4025-9324-9beefe2e4ac6'
      }
      connection = {
        sub: '8953eb68-6eb0-4577-8b7d-a2599de962d4',
        permissions: {
          approved: [
            {
              id: '1fc622ab-ebdf-4f8d-a0dd-1afbfb492a5a',
              domain: 'https://mycv.work',
              area: 'education',
              type: 'READ',
              purpose: 'stuff',
              lawfulBasis: 'CONSENT',
              kid: myCvEducationKey.kid
            },
            {
              id: '052bb693-de11-442c-a5b1-3fa9a36bc851',
              domain: 'https://mycv.work',
              area: 'education',
              type: 'WRITE',
              description: 'some data yo!',
              lawfulBasis: 'CONSENT',
              jwks: {
                keys: [accountKey, myCvEducationKey]
              }
            },
            {
              id: '300b8097-53ba-49ee-8798-fc28170ea89c',
              domain: 'https://mycv.work',
              area: 'education',
              type: 'PUBLISH',
              purpose: 'lägg ut!',
              lawfulBasis: 'CONSENT'
            }
          ]
        }
      }
    })
    it('adds inserts for account_keys', () => {
      const statements = sqlStatements
        .permissionsInserts(connectionResponse, connection, readKeys)

      expect(statements[0]).toEqual([
        expect.stringMatching(/INSERT INTO account_keys/m),
        [
          accountKey.kid,
          connectionResponse.iss,
          'https://mycv.work',
          'education',
          accountKey
        ]
      ])
    })
    it('adds inserts for permissions', () => {
      const statements = sqlStatements
        .permissionsInserts(connectionResponse, connection, readKeys)
        .slice(1)

      expect(statements).toHaveLength(3)
      expect(statements).toEqual([
        [
          expect.stringMatching(/INSERT INTO permissions/m),
          [
            '1fc622ab-ebdf-4f8d-a0dd-1afbfb492a5a', // permission id
            '8953eb68-6eb0-4577-8b7d-a2599de962d4', // connection id
            'https://mycv.work', // domain
            'education', // area
            'READ', // type
            null, // description
            'stuff', // purpose
            'CONSENT', // lawful basis
            myCvEducationKey, // read key
            'now()' // approved at
          ]
        ], [
          expect.stringMatching(/INSERT INTO permissions/m),
          [
            '052bb693-de11-442c-a5b1-3fa9a36bc851', // permission id
            '8953eb68-6eb0-4577-8b7d-a2599de962d4', // connection id
            'https://mycv.work', // domain
            'education', // area
            'WRITE', // type
            'some data yo!', // description
            null, // purpose
            'CONSENT', // lawful basis
            null, // read key
            'now()' // approved at
          ]
        ], [
          expect.stringMatching(/INSERT INTO permissions/m),
          [
            '300b8097-53ba-49ee-8798-fc28170ea89c', // permission id
            '8953eb68-6eb0-4577-8b7d-a2599de962d4', // connection id
            'https://mycv.work', // domain
            'education', // area
            'PUBLISH', // type
            null, // description
            'lägg ut!', // purpose
            'CONSENT', // lawful basis
            null, // read key
            'now()' // approved at
          ]
        ]
      ])
    })
  })
})
