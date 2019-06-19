/* View Model */
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

export function toPermissionResult({ local = [], external = [] }) {
  const extractPermissions = (permissions, { read, write }) => [
    ...permissions,
    read,
    write,
  ]

  const notUndefined = value => value !== undefined

  return {
    approved: [
      ...local.reduce(extractPermissions, []).filter(notUndefined),
      ...external.reduce(extractPermissions, []).filter(notUndefined),
    ],
  }
}
