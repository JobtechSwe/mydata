import AsyncStorage from '@react-native-community/async-storage'
import { toPublicKey } from './crypto'

export async function storeAccount(account) {
  await AsyncStorage.setItem('account', account ? JSON.stringify(account) : '')
}

export const getAccount = async () => {
  const result = await AsyncStorage.getItem('account')
  return result ? JSON.parse(result) : undefined
}

export const getConnections = () =>
  AsyncStorage.getItem('connections').then(res => (res ? JSON.parse(res) : []))

export const storeConnection = async ({ serviceId, connectionId }) => {
  const existingConnections = await getConnections()

  return AsyncStorage.setItem(
    'connections',
    JSON.stringify([...existingConnections, { serviceId, connectionId }])
  )
}

export const storeKey = async key => {
  return AsyncStorage.setItem(`jwks/${key.kid}`, JSON.stringify(key))
}

export const getPrivateKey = async kid => {
  const result = await AsyncStorage.getItem(`jwks/${kid}`)
  return result ? JSON.parse(result) : undefined
}

export const getPublicKey = async kid => {
  const privateKey = await getPrivateKey(kid)
  return privateKey ? toPublicKey(privateKey) : undefined
}

export const getAccountKeys = async () => {
  const { kid } = await getAccount()
  const privateKey = await getPrivateKey(kid)
  const publicKey = toPublicKey(privateKey)

  return { publicKey, privateKey }
}
