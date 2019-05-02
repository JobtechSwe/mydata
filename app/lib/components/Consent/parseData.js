export function toViewModel ({ data: { clientId, scope }, clients }) {
  const client = clients[clientId]
  client.areas = scope.filter(scope => scope.domain === clientId)
  
  const externals = scope
    .filter(scope => scope.domain !== clientId)
    .reduce((external, scope) => {
      if (!external[scope.domain]) {
        external[scope.domain] = {
          client: {
            ...clients[scope.domain],
            areas: [],
          },
        }
      }
      external[scope.domain].client.areas.push(scope)
      return external
    }, {})
  return {
    client,
    externals: Object.values(externals),
  }
}
