const { v4 } = require('uuid')

const fromConfig = (clientId, keyProvider) => async (configPermissions) => {
  return configPermissions
    .reduce(async (permissions, cp) => {
      for (let type of cp.types) {
        const permission = {
          id: v4(),
          domain: cp.domain || clientId,
          lawfulBasis: cp.lawfulBasis || 'CONSENT',
          area: cp.area,
          type
        }
        switch (type) {
          case 'READ':
            permission.purpose = cp.purpose
            permission.jwk = await keyProvider.createEncryptionKey()
            break
          case 'WRITE':
            permission.description = cp.description
            break
          default:
            permission.purpose = cp.purpose
            break
        }
        permissions.push(permission)
      }
      return permissions
    }, [])
}

module.exports = ({ clientId, keyProvider }) => ({
  fromConfig: fromConfig(clientId, keyProvider)
})
