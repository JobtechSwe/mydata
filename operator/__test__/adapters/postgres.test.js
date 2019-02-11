const pg = require('../../__mocks__/pg')
const postgres = require('../../lib/adapters/postgres')

describe('adapters/postgres', () => {
  afterEach(() => {
    pg.clearMocks()
    pg.restoreDefaults()
  })
  describe('#query', () => {
    afterEach(() => {
      pg.clearMocks()
      pg.restoreDefaults()
    })
    it('connects', async () => {
      await postgres.query('SQL', [1])
      expect(pg.client.connect).toHaveBeenCalledTimes(1)
    })
    it('calls client.query with the correct arguments', async () => {
      await postgres.query('SQL', [1])
      expect(pg.client.query).toHaveBeenCalledWith('SQL', [1])
    })
    it('returns the results', async () => {
      pg.client.query.mockResolvedValue({ metaData: [], rows: [] })
      const result = await postgres.query('SQL', [1])
      expect(result).toEqual({ metaData: [], rows: [] })
    })
    it('throws errors', async () => {
      pg.client.query.mockRejectedValue(new Error('some error'))
      return expect(postgres.query('SQL', [1])).rejects.toThrow('some error')
    })
    it('closes the connection after result', async () => {
      pg.client.query.mockResolvedValue({ metaData: [], rows: [] })
      await postgres.query('SQL', [1])
      expect(pg.client.end).toBeCalledTimes(1)
    })
    it('closes the connection after error', async () => {
      pg.client.query.mockRejectedValue(new Error('some error'))
      await postgres.query('SQL', [1]).catch(() => {})
      expect(pg.client.end).toBeCalledTimes(1)
    })
  })
  describe('#transaction', () => {
    let queries, empty, results
    beforeEach(() => {
      queries = [
        ['INSERT INTO foo(id, val) VALUES($1, $2)', [1, 2]],
        ['INSERT INTO herp(id, val) VALUES($1, $2)', [1, 2]],
        ['SELECT * FROM bar']
      ]
      empty = { metaData: [], rows: [], rowCount: 0 }
      results = [
        { metaData: [], rows: [], rowCount: 1 },
        { metaData: [], rows: [], rowCount: 2 },
        { metaData: [], rows: [{ id: 1 }], rowCount: 1 }
      ]
    })
    it('connects', async () => {
      await postgres.transaction(queries)
      expect(pg.client.connect).toHaveBeenCalledTimes(1)
    })
    it('sends BEGIN', async () => {
      await postgres.transaction(queries)
      expect(pg.client.query).toHaveBeenNthCalledWith(1, 'BEGIN')
    })
    it('executes all queries', async () => {
      await postgres.transaction(queries)
      expect(pg.client.query).toHaveBeenNthCalledWith(2, ...queries[0])
      expect(pg.client.query).toHaveBeenNthCalledWith(3, ...queries[1])
      expect(pg.client.query).toHaveBeenNthCalledWith(4, ...queries[2])
    })
    it('sends COMMIT if all are succesful', async () => {
      await postgres.transaction(queries)
      expect(pg.client.query).toHaveBeenNthCalledWith(5, 'COMMIT')
    })
    it('returns the results', async () => {
      pg.connection.query.mockResolvedValueOnce(empty)
      pg.connection.query.mockResolvedValueOnce(results[0])
      pg.connection.query.mockResolvedValueOnce(results[1])
      pg.connection.query.mockResolvedValueOnce(results[2])
      pg.connection.query.mockResolvedValueOnce(empty)

      const response = await postgres.transaction(queries)
      expect(response).toEqual(results)
    })
    it('calls ROLLBACK if one query fails', async () => {
      pg.connection.query.mockResolvedValueOnce(empty)
      pg.connection.query.mockResolvedValueOnce(results[0])
      pg.connection.query.mockRejectedValueOnce(new Error())

      try {
        await postgres.transaction(queries)
      } catch (_) {}

      expect(pg.client.query).toHaveBeenNthCalledWith(4, 'ROLLBACK')
    })
    it('throws the error', async () => {
      pg.connection.query.mockResolvedValueOnce(empty)
      pg.connection.query.mockResolvedValueOnce(results[0])
      pg.connection.query.mockRejectedValueOnce(new Error('b0rk'))

      expect(postgres.transaction(queries)).rejects.toThrow('b0rk')
    })
    it('closes the connection on success', async () => {
      pg.client.end.mockClear() // WHY???

      await postgres.transaction(queries)
      expect(pg.client.end).toHaveBeenCalledTimes(1)
    })
    it('closes the connection on failure', async () => {
      pg.connection.query.mockResolvedValueOnce(empty)
      pg.connection.query.mockResolvedValueOnce(results[0])
      pg.connection.query.mockRejectedValueOnce(new Error('b0rk'))
      try {
        await postgres.transaction(queries)
      } catch (_) {}
      expect(pg.client.end).toHaveBeenCalledTimes(1)
    })
  })
})
