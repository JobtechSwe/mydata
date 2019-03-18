import { AsyncStorage } from 'react-native'

export async function getAccount () {
  try {
    const result = await AsyncStorage.getItem('account')
    return result ? JSON.parse(result) : undefined
  } catch (error) {
    console.error('Error while getting account-id from AsyncStorage:', error)
    return undefined
  }
}

export async function storeAccount (account) {
  await AsyncStorage.setItem('account', account ? JSON.stringify(account) : '')
}
