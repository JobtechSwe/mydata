import AsyncStorage from '@react-native-community/async-storage'

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

export const getConnections = async () => {
  const connections = await AsyncStorage.getItem('connections')
  return connections || []
}

export const storeConnection = async (connection) => {
  const existingConnections = await getConnections()
  return AsyncStorage.setItem('connections', [ ...existingConnections, connection ])
}
