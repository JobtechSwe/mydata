import AsyncStorage from '@react-native-community/async-storage'

export async function storeAccount (account) {
  await AsyncStorage.setItem('account', account ? JSON.stringify(account) : '')
}

export const getConnections = () => AsyncStorage
    .getItem('connections')
    .then(res => res ? JSON.parse(res) : [])

export const storeConnection = async ({ serviceId, connectionId }) => {
  const existingConnections = await getConnections()
  return AsyncStorage.setItem('connections', JSON.stringify([ ...existingConnections, { serviceId, connectionId } ]))
}
