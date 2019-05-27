function accountKeyInsert ({ accountKeyId, accountId, domain, area, readKey }) {

}

function connectionInsert ({ connectionId, accountId, serviceId }) {
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

function permissionInsert ({
  permissionId,
  connectionId,
  domain,
  area,
  type,
  purpose,
  legalBasis,
  readKey
}) {
  return [
    `INSERT INTO permissions(
                  permission_id,
                  connection_id,
                  domain,
                  area,
                  type,
                  purpose,
                  legal_basis,
                  read_key,
                  accepted
                ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      permissionId,
      connectionId,
      domain,
      area,
      type.toUpperCase(),
      purpose,
      legalBasis,
      readKey ? JSON.stringify(readKey) : null,
      'now()'
    ]
  ]
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
  connectionInsert,
  permissionInsert,
  serviceInsert
}
