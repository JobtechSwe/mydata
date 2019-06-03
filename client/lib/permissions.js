const { v4 } = require('uuid')

const createPermissions = async (config, keyProvider) => {
  return config.defaultPermissions
    .reduce(async (permissions, cp) => {
      for (let type of cp.types) {
        const permission = {
          id: v4(),
          domain: cp.domain || config.clientId,
          lawfulBasis: cp.lawfulBasis || 'CONSENT',
          area: cp.area,
          type
        }
        switch (type) {
          case 'READ':
            permission.purpose = cp.purpose
            permission.jwk = await keyProvider.generateTempKey()
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

module.exports = {
  createPermissions
}
