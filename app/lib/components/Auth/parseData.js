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

    group[item.area] = {
      ...current,
      [item.type.toLowerCase()]: item,
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
