const phone = require('./helpers/phone')
const { createClientWithServer } = require('./helpers/index')
const operatorPostgres = require('./helpers/operatorPostgres')
const { JWK, JWK_PRIVATE } = require('../../messaging/lib/schemas')

jest.useFakeTimers()

describe('Permissions', () => {
  beforeAll(async () => {
    await operatorPostgres.clearOperatorDb()
  })

  beforeEach(async () => {
    await phone.clearStorage()
    await phone.createAccount({ firstName: 'Foo', lastName: 'Barsson' })
  })

  afterEach(async () => {
    await phone.clearStorage()
  })

  afterAll(async () => {
    await operatorPostgres.clearOperatorDb()
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

  it('correctly sends CONNECTION_RESPONSE with default READ permissions', async (done) => {
    const permissionArea = 'favorite_cats'
    const serviceConfig = {
      defaultPermissions: [{
        area: permissionArea,
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

    // Approve it!
    let approvalResponse = new Map()
    connectionRequest.permissions.forEach(p => {
      approvalResponse.set(p.id, true)
    })
    await phone.approveConnection(connectionRequest, approvalResponse)

    // After state, expect connection in client for the session id
    const connectionEntryInClient = await client.keyValueStore.load(`authentication|>${id}`)
    expect(connectionEntryInClient).toEqual(expect.any(String))

    // These permissions should now be in the Operator DB
    const dbResult = await operatorPostgres.queryOperatorDb('SELECT * FROM permissions WHERE area=$1', [permissionArea])
    expect(dbResult.rowCount).toEqual(1)

    client.server.close(done)
  })

  it('correctly sends CONNECTION_RESPONSE with default WRITE permissions', async (done) => {
    const permissionArea = 'favorite_dogs'
    const serviceConfig = {
      defaultPermissions: [{
        area: permissionArea,
        types: ['WRITE'],
        description: 'The dogs you like the most'
      }]
    }
    let client = await createClientWithServer(serviceConfig)
    await client.connect()

    // Client library provides auth url and session id
    const { url, id } = await client.initializeAuthentication()

    // Scan auth and do ping-pong
    const { connectionRequest } = await phone.handleAuthCode({ code: url })

    // Get user key to put in WRITE_PERMISSION
    const { publicKey } = await phone.getAccountKeys()

    // Change from WRITE_PERMISSION_REQUEST to WRITE_PERMISSION
    const approved = connectionRequest.permissions
    approved[0].jwks = {
      keys: [ publicKey ]
    }

    // Approve it!
    await phone.approveConnection(connectionRequest, { approved })

    // After state, expect connection in client for the session id
    const connectionEntryInClient = await client.keyValueStore.load(`authentication|>${id}`)
    expect(connectionEntryInClient).toEqual(expect.any(String))

    // These permissions should now be in the Operator DB
    const dbResult = await operatorPostgres.queryOperatorDb('SELECT * FROM permissions WHERE area=$1', [permissionArea])
    expect(dbResult.rowCount).toEqual(1)
    // expect(dbResult.rows).toEqual({})

    client.server.close(done)
  })
})
