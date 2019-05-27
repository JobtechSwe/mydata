const defaultResponse = { status: 200, data: null }

module.exports = {
  get: jest.fn().mockResolvedValue(defaultResponse),
  post: jest.fn().mockResolvedValue(defaultResponse),
  put: jest.fn().mockResolvedValue(defaultResponse),
  del: jest.fn().mockResolvedValue(defaultResponse)
}
