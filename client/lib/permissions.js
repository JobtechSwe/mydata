const { v4 } = require('uuid')

const createPermissions = async (config, keyProvider) => {
  return config.defaultPermissions
    .reduce(async (permissionsPromise, cp) => {
      const permissions = await permissionsPromise
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
            try {
              permission.jwk = await keyProvider.generateTemporaryKey({ use: 'enc' }).then(keyPair => keyPair.publicKey)
            } catch (error) {
              console.error(error)
              throw Error('Could not generate key for permission')
            }
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
