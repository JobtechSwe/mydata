import { Base64 } from 'js-base64'

const authenticationUrlRegex = /^mydata:\/\/auth\/(.*)$/

export const parse = (url) => {
  try {
    const [, code] = url.match(authenticationUrlRegex)

    if (code) {
      try {
        const jwt = Base64.decode(decodeURIComponent(code))
        return jwt
      } catch (error) {
        console.error('could not parse jwt from url')
        throw new Error(error)
      }
    } else {
      throw new Error('Unidentified code')
    }
  } catch (error) {
    console.error('could not match url!', error)
  }
}
