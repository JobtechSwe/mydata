export function toViewModel(data) {
  const {
    permissions = [],
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
          approved: true,
        },
      }
    } else if (item.type === 'WRITE') {
      group[item.area] = {
        ...current,
        [item.type.toLowerCase()]: {
          ...item,
          approved: true,
        },
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

export function toResponse({ local = [], external = [] }) {
  return [...local, ...external].reduce((map, area) => {
    if (area.read) {
      map.set(area.read.id, area.read.approved)
    }
    if (area.write) {
      map.set(area.write.id, area.write.approved)
    }
    return map
  }, new Map())
}
