const phone = require('./helpers/phone')
const { createClientWithServer } = require('./helpers/index')
const { clearOperatorDb } = require('./helpers/operatorPostgres')
const { JWK, JWK_PRIVATE } = require('../../messaging/lib/schemas')

jest.useFakeTimers()

describe('Permissions', () => {
  beforeEach(async () => {
    await phone.clearStorage()
    await phone.createAccount({ firstName: 'Foo', lastName: 'Barsson' })
  })

  afterEach(async () => {
    await phone.clearStorage()
  })

  afterAll(async () => {
    await clearOperatorDb()
  })

  it('correctly stores default READ permissions', async (done) => {
    const serviceConfig = {
      defaultPermissions: [{
        area: 'favorite_cats',
        types: ['READ'],
        purpose: 'To recommend you cats that you\'ll like'
      }]
    }
    let client = await createClientWithServer(serviceConfig)
    await client.connect()

    // Client library provides auth url and session id
    const { url } = await client.initializeAuthentication()

    // Scan auth and do ping-pong
    const { connectionRequest } = await phone.handleAuthCode({ code: url })

    // Check that the service has stored the key
    const permissionKey = await client.keyProvider.getKey(connectionRequest.permissions[0].jwk.kid)
    await JWK.validate(permissionKey.publicKey)
    await JWK_PRIVATE.validate(permissionKey.privateKey)

    // Approve it!
    await phone.approveConnection(connectionRequest)

    client.server.close(done)
  })

  it.skip('correctly sends CONNECTION_REPONSE with default READ permissions', async (done) => {
    const serviceConfig = {
      defaultPermissions: [{
        area: 'favorite_cats',
        types: ['READ'],
        purpose: 'To recommend you cats that you\'ll like'
      }]
    }
    let client = await createClientWithServer(serviceConfig)
    await client.connect()

    // Client library provides auth url and session id
    const { url, id } = await client.initializeAuthentication()

    // Scan auth and do ping-pong
    const { connectionRequest } = await phone.handleAuthCode({ code: url })

    /*
    // Check that the service has stored the key
    const permissionKey = await client.keyProvider.getKey(connectionRequest.permissions[0].jwk.kid)
    await JWK.validate(permissionKey.publicKey)
    await JWK_PRIVATE.validate(permissionKey.privateKey)
     */

    const userPermissionResult = {
      approved: connectionRequest.permission
    }
    // Approve it!
    await phone.approveConnection(connectionRequest, 42)

    // After state, expect connection in client for the session id
    const connectionEntryInClient = await client.keyValueStore.load(`authentication|>${id}`)
    expect(connectionEntryInClient).toEqual(expect.any(String))

    client.server.close(done)
  })
})
