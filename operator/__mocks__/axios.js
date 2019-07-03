module.exports = {
  get: jest.fn().mockResolvedValue({ status: 200, data: {} }),
  post: jest.fn().mockResolvedValue({ status: 200, data: {} }),
  put: jest.fn().mockResolvedValue({ status: 200, data: {} }),
  patch: jest.fn().mockResolvedValue({ status: 200, data: {} }),
  del: jest.fn().mockResolvedValue({ status: 204 })
}
