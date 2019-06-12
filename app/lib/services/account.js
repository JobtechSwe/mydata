import axios from 'axios'
import Config from 'react-native-config'
import { v4 } from 'uuid'
import { generateKey, toPublicKey } from './crypto'
import { storeAccount, storeKey } from './storage'
import { createAccountRegistration } from './tokens'

export async function save (account) {
  try {
    if (account.id) {
      throw Error('An account already exist on this phone')
    }

    account = { ...account, id: v4() }
    const privateKey = await generateKey({ use: 'sig' })
    const publicKey = toPublicKey(privateKey)
    await storeKey(privateKey)
    account.kid = privateKey.kid

    await storeAccount(account)

    const jwt = await createAccountRegistration(account, { privateKey, publicKey })
    await axios.post(Config.OPERATOR_URL, jwt, { headers: { 'content-type': 'application/jwt' } })

    return account
  } catch (err) {
    console.error(err)
    throw err
  }
}
