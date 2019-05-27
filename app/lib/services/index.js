// TODO: Clean up? Is this really necessary?
import * as auth from './auth'
import * as account from './account'
import * as consents from './consents'
import * as crypto from './crypto'
import * as dropbox from './dropbox'
import * as JwksClient from './JwksClient'
import * as rsaUtils from './rsaUtils'
import * as storage from './storage'
import { verify } from './jwt'

export { auth }
export { account }
export { consents }
export { crypto }
export { dropbox }
export { JwksClient }
export { rsaUtils }
export { storage }


const handlers = {
  AUTHENTICATION_REQUEST: auth.authenticationRequestHandler,
}

export const handle = async jwt => {
  const { payload, header } = await verify(jwt)
  if (!handlers[payload.type]) {
    throw Error(`Missing handler for ${payload.type}`)
  }
  return handlers[payload.type]({ payload, header })
}
