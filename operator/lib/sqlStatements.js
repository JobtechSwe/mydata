function accountKeyInsert ({ accountKeyId, accountId, domain, area, readKey }) {

}

function connectionInserts ({ connectionId, accountId, serviceId }) {
  return [
    `INSERT INTO connections(
      connection_id, account_id, service_id
    ) VALUES(
      $1, $2, $3
    )`,
    [connectionId, accountId, serviceId]
  ]
}

function checkConnection ({ accountId, serviceId }) {
  return [
    ['SELECT account_key FROM accounts WHERE account_id = $1', [accountId]],
    ['SELECT events_uri FROM services WHERE service_id = $1', [serviceId]],
    ['SELECT * FROM connections WHERE account_id = $1 AND service_id = $2', [accountId, serviceId]]
  ]
}

function permissionsInserts ({
  iss: accountId
}, {
  sub: connectionId,
  permissions: { approved: permissions }
}, readKeys) {
  const rxAccountKey = /^egendata:\/\//
  const sqlStatements = []

  // account_keys
  const writePermissions = permissions.filter(p => p.type === 'WRITE')
  for (let p of writePermissions) {
    const accountKeys = p.jwks.keys
      .filter(({ kid }) => rxAccountKey.test(kid))

    for (let accountKey of accountKeys) {
      sqlStatements.push([
        `INSERT INTO account_keys(
          account_key_id,
          account_id,
          domain,
          area,
          read_key
        ) VALUES($1, $2, $3, $4, $5)
        ON CONFLICT ON CONSTRAINT
          account_keys_account_id_domain_area_unique_index
        DO NOTHING`,
        [
          accountKey.kid,
          accountId,
          p.domain,
          p.area,
          accountKey
        ]
      ])
    }
  }

  // permissions
  for (let p of permissions) {
    let readKey = null
    if (p.type === 'READ') {
      readKey = readKeys[p.kid]
    }
    sqlStatements.push([
      `INSERT INTO permissions(
        id,
        connection_id,
        domain,
        area,
        type,
        description,
        purpose,
        lawful_basis,
        read_key,
        approved_at
      ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT ON CONSTRAINT
        permissions_connection_id_domain_area_type_accepted_rejected_ex
      DO NOTHING`,
      [
        p.id,
        connectionId,
        p.domain,
        p.area,
        p.type,
        p.description || null,
        p.purpose || null,
        p.lawfulBasis,
        readKey,
        'now()'
      ]
    ])
  }

  return sqlStatements
}

function serviceInsert ({
  serviceId,
  serviceKey,
  displayName,
  description,
  iconURI,
  jwksURI,
  eventsURI
}) {
  return [
    `INSERT INTO services(
      service_id,
      service_key,
      display_name,
      description,
      icon_uri,
      jwks_uri,
      events_uri
    ) VALUES($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (service_id) DO
    UPDATE SET
      service_key = $2,
      display_name = $3,
      description = $4,
      icon_uri = $5,
      jwks_uri = $6,
      events_uri = $7`,
    [
      serviceId,
      serviceKey,
      displayName,
      description,
      iconURI,
      jwksURI,
      eventsURI
    ]
  ]
}

module.exports = {
  accountKeyInsert,
  checkConnection,
  connectionInserts,
  permissionsInserts,
  serviceInsert
}
