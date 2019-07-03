const phone = require('./helpers/phone')
const { createClientWithServer } = require('./helpers/index')
const postgres = require('./helpers/operatorPostgres')
const { JWK, JWK_PRIVATE } = require('../../messaging/lib/schemas')

jest.useFakeTimers()

describe('Permissions', () => {
  beforeAll(async () => {
    await phone.clearStorage()
    await postgres.createOperatorDb()
  })
  beforeEach(async () => {
    await phone.createAccount({ firstName: 'Foo', lastName: 'Barsson' })
  })
  afterEach(async () => {
    await phone.clearStorage()
    await postgres.createOperatorDb()
  })

  it('correctly stores default READ permissions', async (done) => {
    const serviceConfig = {
      defaultPermissions: [{
        area: 'favorite_cats',
        types: ['READ'],
        purpose: 'To recommend you cats that you\'ll like'
      }]
    }
    const client = await createClientWithServer(serviceConfig)
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
    const client = await createClientWithServer(serviceConfig)
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
    const dbResult = await postgres.queryOperatorDb('SELECT * FROM permissions WHERE area=$1', [permissionArea])
    expect(dbResult.rowCount).toEqual(1)

    client.server.close(done)
  })

  it('correctly sends CONNECTION_RESPONSE with default WRITE permissions', async (done) => {
    const permissionArea = 'favorite_dogs'
    const serviceConfig = {
      defaultPermissions: [{
        area: permissionArea,
        types: ['WRITE'],
        description: 'The cats you like the most'
      }]
    }
    const client = await createClientWithServer(serviceConfig)
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
    const dbResult = await postgres.queryOperatorDb('SELECT * FROM permissions WHERE area=$1', [permissionArea])
    expect(dbResult.rowCount).toEqual(1)
    // expect(dbResult.rows).toEqual({})

    client.server.close(done)
  })

  it('correctly sends CONNECTION_RESPONSE with default READ and WRITE permissions', async (done) => {
    const permissionArea = 'favorite_dogs'
    const serviceConfig = {
      defaultPermissions: [
        {
          area: permissionArea,
          types: ['WRITE'],
          description: 'The cats you like the most'
        },
        {
          area: permissionArea,
          types: ['READ'],
          purpose: 'To recommend you cats that you\'ll like'
        }
      ]
    }
    const client = await createClientWithServer(serviceConfig)
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
    const dbResult = await postgres.queryOperatorDb('SELECT * FROM permissions WHERE area=$1', [permissionArea])
    expect(dbResult.rowCount).toEqual(2)
    // expect(dbResult.rows).toEqual({})

    client.server.close(done)
  })
})
