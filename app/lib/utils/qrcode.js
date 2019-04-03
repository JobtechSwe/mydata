const rxRegister = /mydata:\/\/(register)\/(\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b)$/
const rxLogin = /^mydata:\/\/(login)\/([-_A-Za-z0-9]*)$/

export const parse = (qr) => {
  const [, type, code] = qr.match(rxRegister) || qr.match(rxLogin)
  if (type && code) {
    return { type, code }
  } else {
    throw new Error('Unidentified code')
  }
}
