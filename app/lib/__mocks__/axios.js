
const axios = {
  get: jest.fn().mockResolvedValue({ status: 200, data: null }),
  post: jest.fn().mockResolvedValue({ status: 200, data: null }),
  put: jest.fn().mockResolvedValue({ status: 200, data: null }),
  del: jest.fn().mockResolvedValue({ status: 200, data: null }),
}
export default axios
