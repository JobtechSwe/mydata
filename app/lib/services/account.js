import axios from 'axios'
import Config from 'react-native-config'
import AsyncStorage from '@react-native-community/async-storage'
import { v4 } from 'uuid'
import { createAccountRegistration } from './tokens'

export async function register(account) {
  try {
    // TODO: Use thumbprint of JWK as account id
    const id = v4()
    const jwt = await createAccountRegistration({ ...account, id })
    await axios.post(Config.OPERATOR_URL, jwt, { headers: { 'content-type': 'application/jwt' } })
    return id
  } catch (error) {
    console.error('could not post account to operator', error)
  }
}

export async function save(account) {
  try {
    if (account.id) {
      throw Error('An account already exist on this phone')
    } else {
      account.id = await register(account)
    }

    return account
  } catch (err) {
    throw err
  }
}

export const getAccount = async () => {
  try {
    const result = await AsyncStorage.getItem('account')
    return result ? JSON.parse(result) : undefined
  } catch (error) {
    console.error('Error while getting account-id from AsyncStorage:', error)
    return undefined
  }
}
