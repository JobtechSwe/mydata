const client = {
  connect: jest.fn(),
  query: jest.fn(),
  end: jest.fn()
}
function Client () {
  return client
}

function restoreDefaults () {
  client.connect.mockResolvedValue()
  client.query.mockResolvedValue({
    metaData: [],
    rows: [],
    rowCount: 0
  })
  client.end.mockResolvedValue()
}

function clearMocks () {
  client.connect.mockClear()
  client.query.mockClear()
  client.end.mockClear()
}

restoreDefaults()

module.exports = { Client, client, clearMocks, restoreDefaults, connection: client }
