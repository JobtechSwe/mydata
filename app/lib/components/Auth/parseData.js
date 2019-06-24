/* import { generateKey } from '../../services/crypto' */

export function toViewModel(data) {
  const {
    permissions,
    displayName,
    description,
    iconURI,
    iss: localDomain,
  } = data

  const localPermissions = permissions.filter(p => p.domain === localDomain)
  const externalPermissions = permissions.filter(p => p.domain !== localDomain)

  const buildAreas = (group, item) => {
    const current = group[item.area] || { area: item.area }

    if (item.description) {
      current.description = item.description
    }

    if (item.type === 'READ') {
      const { jwk, ...details } = item

      group[item.area] = {
        ...current,
        [item.type.toLowerCase()]: {
          ...details,
          kid: jwk.kid,
        },
      }
    } else if (item.type === 'WRITE') {
      group[item.area] = {
        ...current,
        [item.type.toLowerCase()]: item,
      }
    }

    return group
  }

  const normalisedData = {
    displayName,
    description,
    iconURI,
    local: Object.values(localPermissions.reduce(buildAreas, {})),
    external: Object.values(externalPermissions.reduce(buildAreas, {})),
  }

  return normalisedData
}

function mapReadKeys({ permissions }) {
  return permissions
    .filter(p => p.type === 'read')
    .reduce(
      (map, { domain, area, jwk }) => map.set(`${domain}|${area}`, jwk),
      new Map()
    )
}

export function toPermissionResult(
  { local = [], external = [] },
  connectionRequest
) {
  const extractPermissions = (permissions, { read, write }) => [
    ...permissions,
    read,
    write,
  ]

  const notUndefined = value => value !== undefined

  const readKeysByArea = mapReadKeys(connectionRequest)

  return {
    approved: [
      ...local.reduce(extractPermissions, []).filter(notUndefined),
      ...external.reduce(extractPermissions, []).filter(notUndefined),
    ].map(p => {
      if (p.type === 'write') {
        if (!p.jwks) {
          p.jwks = {
            keys: [],
          }
        }
        p.jwks.keys.push(readKeysByArea.get(`${p.domain}|${p.area}`))
      }
      return p
    }),
  }
}
