const pds = require(`../../lib/adapters/pds`)
const dropbox = require(`../../lib/adapters/pds/dropbox`)
jest.mock(`../../lib/adapters/pds/dropbox`)

describe('adapters/pds', () => {
  describe('#get', () => {
    describe('dropbox', () => {
      let account, pdsCredentials, fs
      beforeEach(() => {
        pdsCredentials = {
          access_token: 'some_weird_string',
          token_type: 'bearer',
          uid: '123456',
          account_id: 'dbid:some_other_weird_string'
        }
        account = {
          pdsProvider: 'dropbox',
          pdsCredentials
        }
        fs = {
          readFile: jest.fn((path, options, cb) => cb()).mockName('readFile'),
          writeFile: jest.fn((path, options, cb) => cb()).mockName('writeFile'),
          mkdir: jest.fn((path, cb) => cb()).mockName('mkdir'),
          stat: jest.fn((path, cb) => cb()).mockName('stat')
        }
        dropbox.getFs.mockReturnValue(fs)
      })
      it('calls provider with credentials', () => {
        pds.get(account)
        expect(dropbox.getFs).toBeCalledWith(pdsCredentials)
      })
      it('wraps fs with promises', () => {
        const pdsFs = pds.get(account)
        const p = pdsFs.readFile('./path', { encoding: 'utf8' })
        expect(fs.readFile).toBeCalledWith('./path', { encoding: 'utf8' }, expect.any(Function))
        expect(p.toString()).toEqual('[object Promise]')
      })
      it('adds mkdirp', async () => {
        const pdsFs = pds.get(account)
        expect(pdsFs.mkdirp).toEqual(expect.any(Function))

        fs.stat.mockImplementation((path, cb) => {
          if (path === '/foo/bar/baz') cb(new Error())
          else if (path === '/foo/bar') cb(new Error())
          else if (path === '/foo') cb(null, {})
        })

        await pdsFs.mkdirp('/foo/bar/baz')

        expect(fs.stat).toHaveBeenNthCalledWith(1, '/foo/bar/baz', expect.any(Function))
        expect(fs.stat).toHaveBeenNthCalledWith(2, '/foo/bar', expect.any(Function))
        expect(fs.stat).toHaveBeenNthCalledWith(3, '/foo', expect.any(Function))

        expect(fs.mkdir).toHaveBeenNthCalledWith(1, '/foo/bar', expect.any(Function))
        expect(fs.mkdir).toHaveBeenNthCalledWith(2, '/foo/bar/baz', expect.any(Function))
      })
      it('adds outputFile (writeFile + mkdirp)', async () => {
        const pdsFs = pds.get(account)
        expect(pdsFs.outputFile).toEqual(expect.any(Function))

        fs.writeFile.mockImplementationOnce((path, data, cb) => cb(new Error()))
        fs.stat.mockImplementation((path, cb) => {
          if (path === '/foo/bar/baz') cb(new Error())
          else if (path === '/foo/bar') cb(new Error())
          else if (path === '/foo') cb(null, {})
        })

        await pdsFs.outputFile('/foo/bar/baz/data.json', '{"foo": "bar"}')

        expect(fs.writeFile).toHaveBeenNthCalledWith(1, '/foo/bar/baz/data.json', '{"foo": "bar"}', expect.any(Function))

        expect(fs.stat).toHaveBeenNthCalledWith(1, '/foo/bar/baz', expect.any(Function))
        expect(fs.stat).toHaveBeenNthCalledWith(2, '/foo/bar', expect.any(Function))
        expect(fs.stat).toHaveBeenNthCalledWith(3, '/foo', expect.any(Function))

        expect(fs.mkdir).toHaveBeenNthCalledWith(1, '/foo/bar', expect.any(Function))
        expect(fs.mkdir).toHaveBeenNthCalledWith(2, '/foo/bar/baz', expect.any(Function))

        expect(fs.writeFile).toHaveBeenNthCalledWith(2, '/foo/bar/baz/data.json', '{"foo": "bar"}', expect.any(Function))
      })
    })
  })
  describe('#providers', () => {
    it('returns a list of supported providers', () => {
      const providers = pds.providers()
      expect(providers).toEqual([
        {
          name: 'Dropbox',
          link: expect.any(String),
          img: expect.any(String)
        },
        {
          name: 'In memory provider'
        }
      ])
    })
  })
})
